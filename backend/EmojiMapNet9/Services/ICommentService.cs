using EmojiMapNet9.Models;

namespace EmojiMapNet9.Services
{
    public interface ICommentService
    {
        Task<List<CommentDto>> GetCommentsByMarkerIdAsync(Guid markerId);
        Task<CommentDto?> AddCommentAsync(CreateCommentDto dto, Guid userId);
        Task<bool> DeleteCommentAsync(Guid commentId, Guid userId, bool isAdmin);
    }
}
