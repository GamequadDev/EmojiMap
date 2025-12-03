using EmojiMapNet9.Entities;
using EmojiMapNet9.Models;
using EmojiMapNet9.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EmojiMapNet9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthService authService) : ControllerBase
    {

        public static User user = new();


        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(UserDto request)
        {
            var user = await authService.RegisterAsync(request);
            if (user == null)
            {
                return BadRequest("Email already exists ");
            }
            return Ok(user);
        }


        [HttpPost("login")]
        public async Task<ActionResult<TokenResponseDto>> Login(UserLoginDto request)
        {
            var result = await authService.LoginAsync(request);
            if (result == null)
            {
                return BadRequest("Invalid email or password ");
            }
            return Ok(result);
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<TokenResponseDto>> RefreshToken(RefreshTokenRequestDto request)
        {
            var result = await authService.RefreshTokenAsync(request);
            if (result is null || result.AccessToken is null || result.RefreshToken is null)
            {
                return Unauthorized("Invalid refresh token");
            }
            return Ok(result);
        }



        [Authorize]
        [HttpGet]
        public IActionResult AuthenticatiedOnlyEndpoint()
        {
            return Ok("You are authenticated");
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin-only")]
        public IActionResult AdminOnlyEndpoint()
        {
            return Ok("You are admin");
        }

    }
}
