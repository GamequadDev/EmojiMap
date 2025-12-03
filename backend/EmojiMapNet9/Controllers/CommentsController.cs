using EmojiMapNet9.Models;
using EmojiMapNet9.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EmojiMapNet9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController(ICommentService commentService) : ControllerBase
    {
        private readonly ICommentService _commentService = commentService;

        [HttpGet("marker/{markerId}")]
        public async Task<IActionResult> GetComments(Guid markerId)
        {
            var comments = await _commentService.GetCommentsByMarkerIdAsync(markerId);
            return Ok(comments);
        }

        [HttpPost]
        public async Task<IActionResult> AddComment([FromBody] CreateCommentDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var comment = await _commentService.AddCommentAsync(dto, userId);
            if (comment == null)
            {
                return BadRequest("Could not add comment. Marker or User not found.");
            }

            return Ok(comment);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var isAdmin = role == "admin";

            var success = await _commentService.DeleteCommentAsync(id, userId, isAdmin);
            if (!success)
            {
                return BadRequest("Could not delete comment. Not authorized or comment not found.");
            }

            return Ok(new { message = "Comment deleted" });
        }
    }
}
