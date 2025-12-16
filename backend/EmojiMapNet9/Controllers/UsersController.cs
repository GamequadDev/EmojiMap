using EmojiMapNet9.Data;
using EmojiMapNet9.Models;
using EmojiMapNet9.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmojiMapNet9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new UserResponseDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<User>> UpdateUser(Guid id, UserUpdateDto request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("admin");

            if (currentUserId != id.ToString() && !isAdmin)
            {
                return Forbid();
            }

            if (!string.IsNullOrEmpty(request.Username))
            {
                user.Username = request.Username;
                // If we were using Identity, we'd update normalized name too
            }

            if (!string.IsNullOrEmpty(request.Email))
            {
                // Optional: Check if email is taken
                if (await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != id))
                {
                    return BadRequest("Email is already taken.");
                }
                user.Email = request.Email;
            }

            await _context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("admin");

            if (currentUserId != id.ToString() && !isAdmin)
            {
                return Forbid();
            }

            // Manually delete comments to handle Restrict behavior
            var userComments = await _context.Comments.Where(c => c.UserId == id).ToListAsync();
            _context.Comments.RemoveRange(userComments);

            // Manually delete tags to handle Restrict behavior
            var userTags = await _context.Tags.Where(t => t.UserId == id).ToListAsync();
            _context.Tags.RemoveRange(userTags);

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
