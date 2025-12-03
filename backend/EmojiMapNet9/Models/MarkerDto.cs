using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EmojiMapNet9.Models
{
    public class MarkerDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        [Range(-90, 90)]
        [JsonPropertyName("lat")]
        public double Latitude { get; set; }

        [Range(-180, 180)]
        [JsonPropertyName("lng")]
        public double Longitude { get; set; }

        [Required]
        public string Emoji { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        public List<string> Tags { get; set; } = new();
        public string Username { get; set; } = string.Empty;

        [RegularExpression("^(public|private|unlisted)$")]
        public string Visibility { get; set; } = "public";

        public DateTime CreatedAt { get; set; }
    }
}
