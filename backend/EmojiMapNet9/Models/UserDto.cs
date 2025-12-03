using System.ComponentModel.DataAnnotations;

namespace EmojiMapNet9.Models
{
    public class UserDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(3)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string Username { get; set; } = string.Empty;
    }

    public class UserLoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(3)]
        public string Password { get; set; } = string.Empty;
    }
}
