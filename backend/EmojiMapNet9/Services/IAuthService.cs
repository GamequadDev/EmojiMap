using EmojiMapNet9.Entities;
using EmojiMapNet9.Models;

namespace EmojiMapNet9.Services
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(UserDto user);
        Task<TokenResponseDto?> LoginAsync(UserLoginDto request);
        Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request);
    }
}
