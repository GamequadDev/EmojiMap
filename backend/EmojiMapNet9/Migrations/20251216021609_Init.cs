using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EmojiMapNet9.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RefreshToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefreshTokenExpiryTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Markers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    Emoji = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Visibility = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Markers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Markers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ColorTag = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Visibility = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tags_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Comments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MarkerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comments_Markers_MarkerId",
                        column: x => x.MarkerId,
                        principalTable: "Markers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MarkerTags",
                columns: table => new
                {
                    MarkerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TagId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarkerTags", x => new { x.MarkerId, x.TagId });
                    table.ForeignKey(
                        name: "FK_MarkerTags_Markers_MarkerId",
                        column: x => x.MarkerId,
                        principalTable: "Markers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MarkerTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "PasswordHash", "RefreshToken", "RefreshTokenExpiryTime", "Role", "Username" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-11111111111a"), "admin@admin.com", "", null, null, "admin", "Admin" },
                    { new Guid("22222222-2222-2222-2222-22222222222a"), "test@test.com", "", null, null, "user", "Test" },
                    { new Guid("33333333-3333-3333-3333-33333333333a"), "test2@test.com", "", null, null, "user", "Test2" }
                });

            migrationBuilder.InsertData(
                table: "Markers",
                columns: new[] { "Id", "CreatedAt", "Description", "Emoji", "Latitude", "Longitude", "Title", "UserId", "Username", "Visibility" },
                values: new object[,]
                {
                    { new Guid("55555555-5555-5555-5555-55555555555c"), new DateTime(2025, 1, 1, 12, 0, 0, 0, DateTimeKind.Utc), "Tutaj jest bardzo cicho.", "NATURE", 50.037503000000001, 19.910568999999999, "Zakrzówek", new Guid("22222222-2222-2222-2222-22222222222a"), "Test", "public" },
                    { new Guid("66666666-6666-6666-6666-66666666666c"), new DateTime(2025, 1, 1, 12, 0, 0, 0, DateTimeKind.Utc), "Najlepsza pizza w mieście.", "FOOD", 50.010688000000002, 19.956641000000001, "Dobra Pizza", new Guid("11111111-1111-1111-1111-11111111111a"), "Admin", "public" },
                    { new Guid("77777777-7777-7777-7777-77777777777c"), new DateTime(2025, 1, 1, 13, 0, 0, 0, DateTimeKind.Utc), "Dobre miejsce na trening.", "GYM", 50.068503999999997, 19.900952, "Basen AGH", new Guid("33333333-3333-3333-3333-33333333333a"), "Test2", "public" },
                    { new Guid("88888888-8888-8888-8888-88888888888c"), new DateTime(2025, 1, 1, 14, 0, 0, 0, DateTimeKind.Utc), "Wystawa fajna.", "MUSEUM", 50.060299000000001, 19.923598999999999, "Muzeum Narodowe", new Guid("11111111-1111-1111-1111-11111111111a"), "Admin", "public" }
                });

            migrationBuilder.InsertData(
                table: "Tags",
                columns: new[] { "Id", "ColorTag", "Title", "UserId", "Visibility" },
                values: new object[,]
                {
                    { new Guid("33333333-3333-3333-3333-33333333333b"), "#2ecc71", "Natura", new Guid("11111111-1111-1111-1111-11111111111a"), "public" },
                    { new Guid("44444444-4444-4444-4444-44444444444b"), "#e74c3c", "Jedzenie", new Guid("22222222-2222-2222-2222-22222222222a"), "public" },
                    { new Guid("55555555-5555-5555-5555-55555555555b"), "#3498db", "Sport", new Guid("33333333-3333-3333-3333-33333333333a"), "public" },
                    { new Guid("66666666-6666-6666-6666-66666666666b"), "#9b59b6", "Kultura", new Guid("11111111-1111-1111-1111-11111111111a"), "public" }
                });

            migrationBuilder.InsertData(
                table: "Comments",
                columns: new[] { "Id", "Content", "CreatedAt", "MarkerId", "UserId" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-00000000000d"), "Bardzo ciekawe.", new DateTime(2025, 12, 2, 3, 30, 0, 0, DateTimeKind.Utc), new Guid("88888888-8888-8888-8888-88888888888c"), new Guid("33333333-3333-3333-3333-33333333333a") },
                    { new Guid("77777777-7777-7777-7777-77777777777d"), "Ale super miejsce! Muszę tam pojechać.", new DateTime(2025, 12, 1, 5, 37, 0, 0, DateTimeKind.Utc), new Guid("55555555-5555-5555-5555-55555555555c"), new Guid("11111111-1111-1111-1111-11111111111a") },
                    { new Guid("88888888-8888-8888-8888-88888888888d"), "Potwierdzam, pizza rewelacja!", new DateTime(2025, 12, 2, 11, 34, 0, 0, DateTimeKind.Utc), new Guid("66666666-6666-6666-6666-66666666666c"), new Guid("22222222-2222-2222-2222-22222222222a") },
                    { new Guid("99999999-9999-9999-9999-99999999999d"), "Świetny sprzęt!", new DateTime(2025, 12, 1, 7, 37, 0, 0, DateTimeKind.Utc), new Guid("77777777-7777-7777-7777-77777777777c"), new Guid("22222222-2222-2222-2222-22222222222a") }
                });

            migrationBuilder.InsertData(
                table: "MarkerTags",
                columns: new[] { "MarkerId", "TagId" },
                values: new object[,]
                {
                    { new Guid("55555555-5555-5555-5555-55555555555c"), new Guid("33333333-3333-3333-3333-33333333333b") },
                    { new Guid("66666666-6666-6666-6666-66666666666c"), new Guid("44444444-4444-4444-4444-44444444444b") },
                    { new Guid("77777777-7777-7777-7777-77777777777c"), new Guid("55555555-5555-5555-5555-55555555555b") },
                    { new Guid("88888888-8888-8888-8888-88888888888c"), new Guid("66666666-6666-6666-6666-66666666666b") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Comments_MarkerId",
                table: "Comments",
                column: "MarkerId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_UserId",
                table: "Comments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Markers_UserId",
                table: "Markers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_MarkerTags_TagId",
                table: "MarkerTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_UserId",
                table: "Tags",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Comments");

            migrationBuilder.DropTable(
                name: "MarkerTags");

            migrationBuilder.DropTable(
                name: "Markers");

            migrationBuilder.DropTable(
                name: "Tags");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
