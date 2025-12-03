using EmojiMapNet9.Entities;
using EmojiMapNet9.Models;

namespace EmojiMapNet9.Services
{
    public interface ITagService
    {
        Task<List<TagDto>> GetAllPublicTagsAsync();
        Task<List<TagDto>> GetUserTagsAsync(Guid userId);

        // Task<List<MarkerDto?>> GetMarkersByUserIdAsync(Guid userId);
        // Task<MarkerDto?> UpdateMarkerAsync(MarkerDto markerDto);
        Task<TagDto?> CreateTagAsync(TagDto tagDto);
        Task<TagDto?> UpdateTagAsync(TagDto tagDto);
        Task<bool> DeleteTagAsync(Guid tagId);
    }
}
