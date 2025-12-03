namespace EmojiMapNet9.Entities
{
    public class Tag
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string ColorTag { get; set; } = "#136f41";

        // Visibility: "public", "private", "unlisted"
        public string Visibility { get; set; } = "public";


        public User? User { get; set; }
        public List<Marker> Markers { get; } = [];
    }
    public class MarkerTag
    {
        public Guid MarkerId { get; set; }
        public Guid TagId { get; set; }
    }
}
