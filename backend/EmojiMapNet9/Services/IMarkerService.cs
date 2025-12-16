using EmojiMapNet9.Entities;
using EmojiMapNet9.Models;


namespace EmojiMapNet9.Services
{
    public interface IMarkerService
    {

        Task<List<MarkerDto>> GetAllMarkersAsync();
        Task<List<MarkerDto>?> GetMarkersByUserIdAsync(Guid userId);
        Task<List<MarkerDto>> GetPublicMarkersAsync();
        Task<MarkerDto?> UpdateMarkerAsync(MarkerDto markerDto);
        Task<MarkerDto?> CreateMarkerAsync(MarkerDto markerDto);
        Task<bool> DeleteMarkerAsync(Guid markerId);

    }
}
