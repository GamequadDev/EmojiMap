using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using EmojiMapNet9.Data;
using EmojiMapNet9.Models;

using EmojiMapNet9.Entities;

namespace EmojiMapNet9.Controllers
{
    public class TrendingMarkerDto
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public required string Emoji { get; set; }
        public int CommentCount { get; set; }
    }

    public class UserActivitySummaryDto
    {
        public int TotalMarkers { get; set; }
        public int TotalComments { get; set; }
        public DateTime? LastMarkerDate { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
            QuestPDF.Settings.License = LicenseType.Community;
        }

        [HttpGet("admin-summary")]
        public async Task<IActionResult> GetAdminSummaryReport()
        {
            var users = await _context.Users.ToListAsync();

            // Call Stored Procedure: GetTrendingMarkers
            var trendingMarkers = await _context.Database
                .SqlQueryRaw<TrendingMarkerDto>("EXEC [dbo].[GetTrendingMarkers]")
                .ToListAsync();

            var userSummaries = new List<(User User, int Reputation, UserActivitySummaryDto Activity)>();

            foreach (var user in users)
            {
                // Call Function: GetUserReputationFunction
                // Note: EF Core 9 doesn't support calling scalar functions directly in LINQ yet for all cases, 
                // or requires mapping. For simplicity and raw SQL requirement, we use SqlQueryRaw or ExecuteSqlRaw.
                // Since it's a scalar function, we can select it.
                var reputation = await _context.Database
                    .SqlQueryRaw<int>("SELECT [dbo].[GetUserReputationFunction](@p0) as Value", user.Id)
                    .FirstOrDefaultAsync();

                // Call Stored Procedure: GetUserActivitySummary
                var activityList = await _context.Database
                    .SqlQueryRaw<UserActivitySummaryDto>("EXEC [dbo].[GetUserActivitySummary] @UserId = @p0", user.Id)
                    .ToListAsync();

                var activity = activityList.FirstOrDefault();

                userSummaries.Add((user, reputation, activity ?? new UserActivitySummaryDto()));
            }

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12));

                    page.Header()
                        .Text("EmojiMap Admin Report")
                        .SemiBold().FontSize(24).FontColor(Colors.Blue.Medium);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(x =>
                        {
                            x.Spacing(20);

                            x.Item().Text($"Generated on: {DateTime.Now:yyyy-MM-dd HH:mm}");
                            x.Item().Text($"Total Users: {users.Count}");

                            // Trending Markers Section
                            x.Item().Text("Trending Markers (Top 5 by Comments)").FontSize(18).SemiBold();

                            x.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(2);
                                    columns.RelativeColumn(1);
                                    columns.RelativeColumn(1);
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Element(CellStyle).Text("Title");
                                    header.Cell().Element(CellStyle).Text("Emoji");
                                    header.Cell().Element(CellStyle).Text("Comments");

                                    static IContainer CellStyle(IContainer container)
                                    {
                                        return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                                    }
                                });

                                foreach (var marker in trendingMarkers)
                                {
                                    table.Cell().Element(CellStyle).Text(marker.Title);
                                    table.Cell().Element(CellStyle).Text(marker.Emoji);
                                    table.Cell().Element(CellStyle).Text(marker.CommentCount.ToString());

                                    static IContainer CellStyle(IContainer container)
                                    {
                                        return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
                                    }
                                }
                            });

                            x.Item().PageBreak();

                            x.Item().Text("User Activity & Reputation").FontSize(18).SemiBold();

                            x.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(2);
                                    columns.RelativeColumn(1);
                                    columns.RelativeColumn(1);
                                    columns.RelativeColumn(1);
                                    columns.RelativeColumn(2);
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Element(CellStyle).Text("Username");
                                    header.Cell().Element(CellStyle).Text("Reputation");
                                    header.Cell().Element(CellStyle).Text("Markers");
                                    header.Cell().Element(CellStyle).Text("Comments");
                                    header.Cell().Element(CellStyle).Text("Last Active");

                                    static IContainer CellStyle(IContainer container)
                                    {
                                        return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                                    }
                                });

                                foreach (var summary in userSummaries)
                                {
                                    table.Cell().Element(CellStyle).Text(summary.User.Username);
                                    table.Cell().Element(CellStyle).Text(summary.Reputation.ToString());
                                    table.Cell().Element(CellStyle).Text(summary.Activity.TotalMarkers.ToString());
                                    table.Cell().Element(CellStyle).Text(summary.Activity.TotalComments.ToString());
                                    table.Cell().Element(CellStyle).Text(summary.Activity.LastMarkerDate?.ToString("yyyy-MM-dd") ?? "-");

                                    static IContainer CellStyle(IContainer container)
                                    {
                                        return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
                                    }
                                }
                            });
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Page ");
                            x.CurrentPageNumber();
                        });
                });
            });

            var stream = new MemoryStream();
            document.GeneratePdf(stream);
            stream.Position = 0;

            return File(stream, "application/pdf", $"emojimap_report_{DateTime.Now:yyyyMMdd}.pdf");
        }
    }
}
