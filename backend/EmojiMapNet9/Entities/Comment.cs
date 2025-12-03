namespace EmojiMapNet9.Entities
{
    public class Comment
    {

    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty; 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  
    public Guid UserId { get; set; } 
    public User? User { get; set; }

    public Guid MarkerId { get; set; } 
    public Marker? Marker { get; set; }

    }
}
