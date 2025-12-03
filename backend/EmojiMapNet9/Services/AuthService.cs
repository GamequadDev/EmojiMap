using Azure.Core;
using EmojiMapNet9.Data;
using EmojiMapNet9.Entities;
using EmojiMapNet9.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace EmojiMapNet9.Services
{
    public class AuthService(AppDbContext context, IConfiguration configuration) : IAuthService
    {
        public async Task<TokenResponseDto?> LoginAsync(UserLoginDto request)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user is null)
            {
                return null;
            }

            if (new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.Password)
                == PasswordVerificationResult.Failed)
            {

                //For user without password, set new password as username

                var user_special = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Username == request.Password && u.PasswordHash == "");
                if (user_special is not null)
                {
                    var hashedPassword = new PasswordHasher<User>()
                    .HashPassword(user, request.Password);

                    user_special.PasswordHash = hashedPassword;

                    context.Users.Update(user_special);
                    await context.SaveChangesAsync();

                    return await CreateTokenResponse(user_special);
                }

                return null;
            }

            return await CreateTokenResponse(user);
        }

        private async Task<TokenResponseDto> CreateTokenResponse(User user)
        {
            return new TokenResponseDto
            {
                AccessToken = CreateToken(user),
                RefreshToken = await GenerateAndSaveRefreshTokenAsync(user),
                User = new UserResponseDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role
                }
            };
        }

        public async Task<User?> RegisterAsync(UserDto request)
        {
            if (await context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return null;
            }

            var user = new User();


            var hashedPassword = new PasswordHasher<User>()
                .HashPassword(user, request.Password);

            user.Email = request.Email;
            user.PasswordHash = hashedPassword;
            user.Username = request.Username;

            context.Users.Add(user);
            await context.SaveChangesAsync();

            return user;
        }


        public async Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request)
        {
            var user = await ValidateRefreshTokenAsync(request.UserId, request.RefreshToken);
            if (user is null)
            {
                return null;
            }
            return await CreateTokenResponse(user);
        }



        private async Task<User?> ValidateRefreshTokenAsync(Guid userId, string refreshToken)
        {
            var user = await context.Users.FindAsync(userId);
            if (user == null || user.RefreshToken != refreshToken
                || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return null;
            }

            return user;
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
        {
            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await context.SaveChangesAsync();
            return refreshToken;
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:Token")!));

            var credts = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: configuration.GetValue<string>("AppSettings:Issuer"),
                audience: configuration.GetValue<string>("AppSettings:Audience"),
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: credts
                );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }

    }
}
