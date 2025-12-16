using EmojiMapNet9.Data;
using EmojiMapNet9.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Scalar.AspNetCore;
using System.Text;
using Serilog;
using EmojiMapNet9.Middleware;



var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Servers = new List<OpenApiServer>
        {
            new OpenApiServer { Url = "http://localhost:5000" }
        };
        return Task.CompletedTask;
    });
});



builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("UserDatabase")));


//Allow connection to Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});


builder.Services.AddScoped<ICommentService, CommentServices>();
builder.Services.AddScoped<ITagService, TagServices>();
builder.Services.AddScoped<IMarkerService, MarkerServices>();

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["AppSettings:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["AppSettings:Audience"],
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Token"]!)),
            ValidateIssuerSigningKey = true
        };
    });




var app = builder.Build();



//Automatic Migration on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.Migrate();
    await CheckStoredProcedureAndFunctionExistAsync(context);
    await CheckTriggerExistAsync(context);
}



// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();

}

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();


static async Task CheckStoredProcedureAndFunctionExistAsync(AppDbContext context)
{
    try
    {
        var procedureExists = await context.Database
            .SqlQueryRaw<int>("SELECT COUNT(*) AS Value FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetUserActivitySummary]') AND type in (N'P', N'PC')")
            .FirstOrDefaultAsync();

        if (procedureExists == 0)
        {
            Log.Information("Create mising (stored procedure): GetUserActivitySummary");
            await context.Database.ExecuteSqlRawAsync(@"
                CREATE PROCEDURE [dbo].[GetUserActivitySummary]
                    @UserId UNIQUEIDENTIFIER
                AS
                BEGIN
                    SET NOCOUNT ON;
                    
                    SELECT 
                        (SELECT COUNT(*) FROM Markers WHERE UserId = @UserId) AS TotalMarkers,
                        (SELECT COUNT(*) FROM Comments WHERE UserId = @UserId) AS TotalComments,
                        (SELECT MAX(CreatedAt) FROM Markers WHERE UserId = @UserId) AS LastMarkerDate;
                END
            ");
        }

        var trendingExists = await context.Database
            .SqlQueryRaw<int>("SELECT COUNT(*) AS Value FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetTrendingMarkers]') AND type in (N'P', N'PC')")
            .FirstOrDefaultAsync();

        if (trendingExists == 0)
        {
            Log.Information("Create mising (stored procedure): GetTrendingMarkers");
            await context.Database.ExecuteSqlRawAsync(@"
                CREATE PROCEDURE [dbo].[GetTrendingMarkers]
                AS
                BEGIN
                    SET NOCOUNT ON;
                    
                    SELECT TOP 5
                        m.Id,
                        m.Title,
                        m.Emoji,
                        COUNT(c.Id) AS CommentCount
                    FROM Markers m
                    LEFT JOIN Comments c ON m.Id = c.MarkerId
                    GROUP BY m.Id, m.Title, m.Emoji
                    ORDER BY CommentCount DESC;
                END
            ");
        }

        var functionExists = await context.Database
            .SqlQueryRaw<int>("SELECT COUNT(*) AS Value FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetUserReputationFunction]') AND type in (N'FN', N'IF', N'TF', N'FS', N'FT')")
            .FirstOrDefaultAsync();

        if (functionExists == 0)
        {
            Log.Information("Create mising (function): GetUserReputationFunction");
            await context.Database.ExecuteSqlRawAsync(@"
                CREATE FUNCTION [dbo].[GetUserReputationFunction](@UserId UNIQUEIDENTIFIER)
                RETURNS INT
                AS
                BEGIN
                    DECLARE @MarkerCount INT;
                    DECLARE @CommentCount INT;
                    DECLARE @Reputation INT;
                    
                    SELECT @MarkerCount = COUNT(*) FROM Markers WHERE UserId = @UserId;
                    SELECT @CommentCount = COUNT(*) FROM Comments WHERE UserId = @UserId;

                    SET @Reputation = (@MarkerCount * 10) + (@CommentCount * 2);
                    
                    RETURN @Reputation;
                END
            ");
        }
    }

    catch (Exception exception)
    {
        Log.Warning(exception, "Error in create ensuring stored procedures or function");
    }
}



static async Task CheckTriggerExistAsync(AppDbContext context)
{
    try
    {
        // Always drop and recreate to ensure latest logic
        await context.Database.ExecuteSqlRawAsync(@"
            IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'CleanupUnusedTags')
                DROP TRIGGER [dbo].[CleanupUnusedTags];
        ");

        Log.Information("Creating/Updating CleanupUnusedTags trigger...");

        await context.Database.ExecuteSqlRawAsync(@"
            CREATE TRIGGER [dbo].[CleanupUnusedTags]
            ON [dbo].[MarkerTags]
            AFTER DELETE
            AS
            BEGIN
                SET NOCOUNT ON;
                
                DELETE t
                FROM Tags t
                JOIN deleted d ON t.Id = d.TagId
                WHERE NOT EXISTS (
                    SELECT 1 
                    FROM MarkerTags mt 
                    WHERE mt.TagId = d.TagId
                );
            END
        ");
    }
    catch (Exception ex)
    {
        Log.Warning(ex, "Error ensuring trigger exists.");
    }
}


app.Run();
