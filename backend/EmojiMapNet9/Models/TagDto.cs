using EmojiMapNet9.Entities;
using System.ComponentModel.DataAnnotations;

namespace EmojiMapNet9.Models
{
    public class TagDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        [Required]
        [StringLength(50)]
        public string Title { get; set; } = string.Empty;

        [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Invalid Hex Color Code")]
        public string ColorTag { get; set; } = "#136f41";

        // Visibility: "public", "private", "unlisted"
        [RegularExpression("^(public|private|unlisted)$")]
        public string Visibility { get; set; } = "public";

        public List<Marker> Markers { get; } = [];
    }
}
