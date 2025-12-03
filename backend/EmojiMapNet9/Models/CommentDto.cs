using System.ComponentModel.DataAnnotations;

namespace EmojiMapNet9.Models
{
    public class CommentDto
    {
        public Guid Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public Guid MarkerId { get; set; }
    }

    public class CreateCommentDto
    {
        [Required]
        [StringLength(1000, MinimumLength = 1)]
        public string Content { get; set; } = string.Empty;

        [Required]
        public Guid MarkerId { get; set; }
    }
}
