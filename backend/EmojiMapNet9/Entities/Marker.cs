namespace EmojiMapNet9.Entities
{
    public class Marker
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;

        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public string Emoji { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Visibility: "public", "private", "unlisted"
        public string Visibility { get; set; } = "public";


        public User? User { get; set; }
        public List<Tag> Tags { get; set; } = [];
    }
}
