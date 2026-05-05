using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AbhiShop.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailChannelToOtpCodes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Channel",
                table: "OtpCodes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "OtpCodes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Channel",
                table: "OtpCodes");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "OtpCodes");
        }
    }
}
