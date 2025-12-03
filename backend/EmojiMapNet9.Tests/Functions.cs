using EmojiMapNet9.Data;
using EmojiMapNet9.Models;
using Microsoft.EntityFrameworkCore;
using EmojiMapNet9.Entities;

namespace EmojiMapNet9.Tests
{
    public abstract class DbContextManager
    {
        public AppDbContext GetAppDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var context = new AppDbContext(options)
            {
                Users = null!,
            };

            context.Users = context.Set<User>();
            context.Database.EnsureCreated();
            return context;
        }
    }
}