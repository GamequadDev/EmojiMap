using EmojiMapNet9.Data;
using EmojiMapNet9.Entities;
using EmojiMapNet9.Models;
using Microsoft.EntityFrameworkCore;

namespace EmojiMapNet9.Services
{
    public class CommentServices(AppDbContext context) : ICommentService
    {
        private readonly AppDbContext _context = context;

        public async Task<List<CommentDto>> GetCommentsByMarkerIdAsync(Guid markerId)
        {
            return await _context.Comments
                .Include(c => c.User)
                .Where(c => c.MarkerId == markerId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CommentDto
                {
                    Id = c.Id,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt,
                    UserId = c.UserId,
                    Username = c.User != null ? c.User.Username : "Unknown",
                    MarkerId = c.MarkerId
                })
                .ToListAsync();
        }

        public async Task<CommentDto?> AddCommentAsync(CreateCommentDto dto, Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            var marker = await _context.Markers.FindAsync(dto.MarkerId);
            if (marker == null) return null;

            var comment = new Comment
            {
                Id = Guid.NewGuid(),
                Content = dto.Content,
                UserId = userId,
                MarkerId = dto.MarkerId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return new CommentDto
            {
                Id = comment.Id,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                UserId = comment.UserId,
                Username = user.Username,
                MarkerId = comment.MarkerId
            };
        }

        public async Task<bool> DeleteCommentAsync(Guid commentId, Guid userId, bool isAdmin)
        {
            var comment = await _context.Comments.FindAsync(commentId);
            if (comment == null) return false;

            if (!isAdmin && comment.UserId != userId)
            {
                return false; // Not authorized
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
