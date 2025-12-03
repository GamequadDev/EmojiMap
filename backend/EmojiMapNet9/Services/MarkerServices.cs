using EmojiMapNet9.Models;
using EmojiMapNet9.Data;
using System.Text.Json;
using EmojiMapNet9.Entities;
using Microsoft.EntityFrameworkCore;
using Azure.Core;
using System.Linq;

namespace EmojiMapNet9.Services
{
    public class MarkerServices(AppDbContext context) : IMarkerService
    {
        public async Task<MarkerDto?> CreateMarkerAsync(MarkerDto markerDto)
        {
            var marker = new Marker
            {
                Latitude = markerDto.Latitude,
                Longitude = markerDto.Longitude,
                Emoji = markerDto.Emoji,
                Title = markerDto.Title,
                Description = markerDto.Description,
                UserId = markerDto.UserId,
                Username = markerDto.Username,
                CreatedAt = DateTime.UtcNow,
                Visibility = markerDto.Visibility
            };

            foreach (var tagName in markerDto.Tags)
            {
                var tag = await context.Tags.FirstOrDefaultAsync(t => t.Title == tagName);
                if (tag == null)
                {
                    tag = new Tag
                    {
                        Title = tagName,
                        UserId = markerDto.UserId,
                        Visibility = "public"
                    };
                    context.Tags.Add(tag);
                }
                marker.Tags.Add(tag);
            }

            context.Markers.Add(marker);
            await context.SaveChangesAsync();

            return new MarkerDto()
            {
                Id = marker.Id,
                Latitude = marker.Latitude,
                Longitude = marker.Longitude,
                Emoji = marker.Emoji,
                Title = marker.Title,
                Description = marker.Description,
                Tags = marker.Tags.Select(t => t.Title).ToList(),
                UserId = marker.UserId,
                Username = marker.Username,
                Visibility = marker.Visibility,
                CreatedAt = marker.CreatedAt
            };
        }

        public async Task<bool> DeleteMarkerAsync(Guid markerId)
        {
            var rowsAffected = await context.Markers
                .Where(m => m.Id == markerId)
                .ExecuteDeleteAsync();

            return rowsAffected > 0;
        }

        public async Task<List<MarkerDto>?> GetMarkersByUserIdAsync(Guid userId)
        {
            var markers = await context.Markers
                .Include(m => m.Tags)
                .Where(marker => marker.UserId == userId)
                .ToListAsync();

            if (markers == null || !markers.Any())
            {
                return null;
            }

            return markers.Select(marker => new MarkerDto
            {
                Id = marker.Id,
                Latitude = marker.Latitude,
                Longitude = marker.Longitude,
                Emoji = marker.Emoji,
                Title = marker.Title,
                Description = marker.Description,
                Tags = marker.Tags.Select(t => t.Title).ToList(),
                UserId = marker.UserId,
                Username = marker.Username,
                Visibility = marker.Visibility
            }).ToList();
        }

        public async Task<List<MarkerDto>> GetPublicMarkersAsync()
        {
            var markers = await context.Markers
                .Include(m => m.Tags)
                .Where(marker => marker.Visibility == "public")
                .ToListAsync();

            return markers.Select(marker => new MarkerDto
            {
                Id = marker.Id,
                Latitude = marker.Latitude,
                Longitude = marker.Longitude,
                Emoji = marker.Emoji,
                Title = marker.Title,
                Description = marker.Description,
                Tags = marker.Tags.Select(t => t.Title).ToList(),
                UserId = marker.UserId,
                Username = marker.Username,
                Visibility = marker.Visibility
            }).ToList();
        }

        public async Task<MarkerDto?> UpdateMarkerAsync(MarkerDto markerDto)
        {
            var marker = await context.Markers
                .Include(m => m.Tags)
                .FirstOrDefaultAsync(m => m.Id == markerDto.Id);

            if (marker == null)
            {
                return null;
            }

            marker.Latitude = markerDto.Latitude;
            marker.Longitude = markerDto.Longitude;
            marker.Emoji = markerDto.Emoji;
            marker.Title = markerDto.Title;
            marker.Description = markerDto.Description;

            // Update tags
            marker.Tags.Clear();
            foreach (var tagName in markerDto.Tags)
            {
                var tag = await context.Tags.FirstOrDefaultAsync(t => t.Title == tagName);
                if (tag == null)
                {
                    tag = new Tag
                    {
                        Title = tagName,
                        UserId = markerDto.UserId,
                        Visibility = "public"
                    };
                    context.Tags.Add(tag);
                }
                marker.Tags.Add(tag);
            }

            marker.UserId = markerDto.UserId;
            marker.Username = markerDto.Username;
            marker.CreatedAt = DateTime.UtcNow;
            marker.Visibility = markerDto.Visibility;

            context.Markers.Update(marker);
            await context.SaveChangesAsync();

            return new MarkerDto
            {
                Id = marker.Id,
                Latitude = marker.Latitude,
                Longitude = marker.Longitude,
                Emoji = marker.Emoji,
                Title = marker.Title,
                Description = marker.Description,
                Tags = marker.Tags.Select(t => t.Title).ToList(),
                UserId = marker.UserId,
                Username = marker.Username,
                Visibility = marker.Visibility
            };
        }
    }
}
