using EmojiMapNet9.Entities;
//using EmojiMapNet9.Migrations;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace EmojiMapNet9.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {

        public DbSet<User> Users { get; set; }
        public DbSet<Marker> Markers { get; set; }
        public DbSet<Tag> Tags { get; set; }

        public DbSet<MarkerTag> MarkerTags { get; set; }
        public DbSet<Comment> Comments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Marker)
                .WithMany()
                .HasForeignKey(c => c.MarkerId)
                .OnDelete(DeleteBehavior.Cascade); // Delete comments if marker is deleted

            // Marker <-> Tag many to many
            modelBuilder.Entity<Marker>()
                .HasMany(m => m.Tags)
                .WithMany(t => t.Markers)
                .UsingEntity<MarkerTag>(
                    j => j.HasOne<Tag>().WithMany().HasForeignKey(mt => mt.TagId),
                    j => j.HasOne<Marker>().WithMany().HasForeignKey(mt => mt.MarkerId),
                    j =>
                    {
                        j.HasKey(mt => new { mt.MarkerId, mt.TagId });
                        j.ToTable(tb => tb.HasTrigger("CleanupUnusedTags"));
                    }
                );

            modelBuilder.Entity<Marker>()
                .HasOne(m => m.User)
                .WithMany()
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Deleted user will not delete markers

            //  User -> Tag One to many
            modelBuilder.Entity<Tag>()
                .HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);


            //Example Guid

            var adminId = Guid.Parse("11111111-1111-1111-1111-11111111111a");
            var userId = Guid.Parse("22222222-2222-2222-2222-22222222222a");
            var userId2 = Guid.Parse("33333333-3333-3333-3333-33333333333a");

            var tagId1 = Guid.Parse("33333333-3333-3333-3333-33333333333b");
            var tagId2 = Guid.Parse("44444444-4444-4444-4444-44444444444b");
            var tagId3 = Guid.Parse("55555555-5555-5555-5555-55555555555b");
            var tagId4 = Guid.Parse("66666666-6666-6666-6666-66666666666b");


            var markerId1 = Guid.Parse("55555555-5555-5555-5555-55555555555c");
            var markerId2 = Guid.Parse("66666666-6666-6666-6666-66666666666c");
            var markerId3 = Guid.Parse("77777777-7777-7777-7777-77777777777c");
            var markerId4 = Guid.Parse("88888888-8888-8888-8888-88888888888c");


            var commentId1 = Guid.Parse("77777777-7777-7777-7777-77777777777d");
            var commentId2 = Guid.Parse("88888888-8888-8888-8888-88888888888d");
            var commentId3 = Guid.Parse("99999999-9999-9999-9999-99999999999d");
            var commentId4 = Guid.Parse("00000000-0000-0000-0000-00000000000d");


            modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = adminId,
                Username = "Admin",
                Email = "admin@admin.com",
                Role = "admin",
            },
            new User
            {
                Id = userId,
                Username = "Test",
                Email = "test@test.com",
                Role = "user",
            },
            new User
            {
                Id = userId2,
                Username = "Test2",
                Email = "test2@test.com",
                Role = "user",
            });

            modelBuilder.Entity<Tag>().HasData(
            new Tag
            {
                Id = tagId1,
                UserId = adminId,
                Title = "Natura",
                ColorTag = "#2ecc71",
                Visibility = "public"
            },
            new Tag
            {
                Id = tagId2,
                UserId = userId,
                Title = "Jedzenie",
                ColorTag = "#e74c3c",
                Visibility = "public"
            },
            new Tag
            {
                Id = tagId3,
                UserId = userId2,
                Title = "Sport",
                ColorTag = "#3498db",
                Visibility = "public"
            },
            new Tag
            {
                Id = tagId4,
                UserId = adminId,
                Title = "Kultura",
                ColorTag = "#9b59b6",
                Visibility = "public"
            });

            modelBuilder.Entity<Marker>().HasData(
            new Marker
            {
                Id = markerId1,
                UserId = userId,
                Username = "Test",
                Title = "Zakrzówek",
                Description = "Tutaj jest bardzo cicho.",
                Emoji = "NATURE",
                Latitude = 50.037503,
                Longitude = 19.910569, // Krakow
                Visibility = "public",
                CreatedAt = new DateTime(2025, 1, 1, 12, 0, 0, DateTimeKind.Utc)
            },
            new Marker
            {
                Id = markerId2,
                UserId = adminId,
                Username = "Admin",
                Title = "Dobra Pizza",
                Description = "Najlepsza pizza w mieście.",
                Emoji = "FOOD",
                Latitude = 50.010688,
                Longitude = 19.956641, // Krakow
                Visibility = "public",
                CreatedAt = new DateTime(2025, 1, 1, 12, 0, 0, DateTimeKind.Utc)
            },
            new Marker
            {
                Id = markerId3,
                UserId = userId2,
                Username = "Test2",
                Title = "Basen AGH",
                Description = "Dobre miejsce na trening.",
                Emoji = "GYM",
                Latitude = 50.068504,
                Longitude = 19.900952, // Krakow
                Visibility = "public",
                CreatedAt = new DateTime(2025, 1, 1, 13, 0, 0, DateTimeKind.Utc)
            },
            new Marker
            {
                Id = markerId4,
                UserId = adminId,
                Username = "Admin",
                Title = "Muzeum Narodowe",
                Description = "Wystawa fajna.",
                Emoji = "MUSEUM",
                Latitude = 50.060299,
                Longitude = 19.923599, // Krakow
                Visibility = "public",
                CreatedAt = new DateTime(2025, 1, 1, 14, 0, 0, DateTimeKind.Utc)
            });

            modelBuilder.Entity<MarkerTag>().HasData(
                new MarkerTag { MarkerId = markerId1, TagId = tagId1 },
                new MarkerTag { MarkerId = markerId2, TagId = tagId2 },
                new MarkerTag { MarkerId = markerId3, TagId = tagId3 },
                new MarkerTag { MarkerId = markerId4, TagId = tagId4 }
            );

            modelBuilder.Entity<Comment>().HasData(
                new Comment
                {
                    Id = commentId1,
                    Content = "Ale super miejsce! Muszę tam pojechać.",
                    CreatedAt = new DateTime(2025, 12, 1, 5, 37, 0, DateTimeKind.Utc),
                    UserId = adminId,
                    MarkerId = markerId1,
                },
                new Comment
                {
                    Id = commentId2,
                    Content = "Potwierdzam, pizza rewelacja!",
                    CreatedAt = new DateTime(2025, 12, 2, 11, 34, 0, DateTimeKind.Utc),

                    UserId = userId,
                    MarkerId = markerId2,
                },
                new Comment
                {
                    Id = commentId3,
                    Content = "Świetny sprzęt!",
                    CreatedAt = new DateTime(2025, 12, 1, 7, 37, 0, DateTimeKind.Utc),
                    UserId = userId,
                    MarkerId = markerId3,
                },
                new Comment
                {
                    Id = commentId4,
                    Content = "Bardzo ciekawe.",
                    CreatedAt = new DateTime(2025, 12, 2, 3, 30, 0, DateTimeKind.Utc),
                    UserId = userId2,
                    MarkerId = markerId4,
                }
            );
        }
    }
}
