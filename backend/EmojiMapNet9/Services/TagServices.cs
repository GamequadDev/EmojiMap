using EmojiMapNet9.Data;
using EmojiMapNet9.Models;
using EmojiMapNet9.Entities;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace EmojiMapNet9.Services
{
    public class TagServices(AppDbContext context) : ITagService
    {
        public async Task<TagDto?> CreateTagAsync(TagDto tagDto)
        {
            if (await context.Tags.AnyAsync(tag => tag.Title == tagDto.Title))
            {
                return null;
            }

            var tag = new Tag
            {
                Title = tagDto.Title,
                ColorTag = tagDto.ColorTag,
                UserId = tagDto.UserId,
                Visibility = tagDto.Visibility
            };

            context.Tags.Add(tag);
            await context.SaveChangesAsync();

            return new TagDto()
            {
                Id = tag.Id,
                Title = tag.Title,
                ColorTag = tag.ColorTag,
                UserId = tag.UserId,
                Visibility = tag.Visibility
            };
        }

        public async Task<TagDto?> UpdateTagAsync(TagDto tagDto)
        {
            var tag = await context.Tags.FindAsync(tagDto.Id);
            if (tag == null)
            {
                return null;
            }

            tag.Title = tagDto.Title;
            tag.Visibility = tagDto.Visibility;
            tag.ColorTag = tagDto.ColorTag;

            context.Tags.Update(tag);
            await context.SaveChangesAsync();

            return new TagDto
            {
                Id = tag.Id,
                Title = tag.Title,
                ColorTag = tag.ColorTag,
                UserId = tag.UserId,
                Visibility = tag.Visibility
            };
        }

        public async Task<bool> DeleteTagAsync(Guid tagId)
        {
            var tag = await context.Tags.FindAsync(tagId);
            if (tag == null)
            {
                return false;
            }

            context.Tags.Remove(tag);
            await context.SaveChangesAsync();

            return true;
        }

        public async Task<List<TagDto>> GetAllPublicTagsAsync()
        {
            var tags = await context.Tags
                .Where(tag => tag.Visibility == "public")
                .ToListAsync();

            return tags.Select(tag => new TagDto
            {
                Id = tag.Id,
                Title = tag.Title,
                ColorTag = tag.ColorTag,
                UserId = tag.UserId,
                Visibility = tag.Visibility
            }).ToList();
        }

        public async Task<List<TagDto>> GetUserTagsAsync(Guid userId)
        {
            var tags = await context.Tags
                .Where(tag => tag.UserId == userId)
                .ToListAsync();

            return tags.Select(tag => new TagDto
            {
                Id = tag.Id,
                Title = tag.Title,
                ColorTag = tag.ColorTag,
                UserId = tag.UserId,
                Visibility = tag.Visibility
            }).ToList();
        }
    }
}
