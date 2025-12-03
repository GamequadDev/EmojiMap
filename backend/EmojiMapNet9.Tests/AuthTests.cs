
using Microsoft.EntityFrameworkCore;
using Xunit;
using EmojiMapNet9.Data;
using EmojiMapNet9.Models;
using EmojiMapNet9.Services;
using Microsoft.Extensions.Configuration;

namespace EmojiMapNet9.Tests;

public class AuthTests : DbContextManager
{

    private string username = "UnitTestUser";
    private string email = "UnitTestUser@itTestUser.com";
    private string password = "UnitTestUserPassword";

    [Fact]
    public async Task RegisterUserAsyncTest()
    {
        using var context = GetAppDbContext();

        var myConfiguration = new Dictionary<string, string?>
        {
            {"AppSettings:Token", "super_secret_key_for_testing_purposes_only_12345_must_be_very_long_to_satisfy_hmacsha512_requirements_at_least_64_bytes"},
            {"AppSettings:Issuer", "TestIssuer"},
            {"AppSettings:Audience", "TestAudience"}
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(myConfiguration)
            .Build();

        var authService = new AuthService(context, configuration);
        var registerDto = new UserDto
        {
            Username = username,
            Email = email,
            Password = password
        };

        var result = await authService.RegisterAsync(registerDto);

        Assert.NotNull(result);
        Assert.Equal(email, result.Email);
        Assert.NotEmpty(result.PasswordHash);
        var userInDb = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
        Assert.NotNull(userInDb);
    }

    [Fact]
    public async Task LoginUserAsyncTest()
    {
        using var context = GetAppDbContext();

        var myConfiguration = new Dictionary<string, string?>
        {
            {"AppSettings:Token", "super_secret_key_for_testing_purposes_only_12345_must_be_very_long_to_satisfy_hmacsha512_requirements_at_least_64_bytes"},
            {"AppSettings:Issuer", "TestIssuer"},
            {"AppSettings:Audience", "TestAudience"}
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(myConfiguration)
            .Build();

        var authService = new AuthService(context, configuration);
        var loginDto = new UserLoginDto
        {
            Email = email,
            Password = password
        };

        // Register the user first
        await authService.RegisterAsync(new UserDto
        {
            Username = username,
            Email = email,
            Password = password
        });

        var result = await authService.LoginAsync(loginDto);

        Assert.NotNull(result);
        Assert.Equal(email, result.User.Email);
        Assert.NotEmpty(result.AccessToken);
        var userInDb = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
        Assert.NotNull(userInDb);
    }
}
