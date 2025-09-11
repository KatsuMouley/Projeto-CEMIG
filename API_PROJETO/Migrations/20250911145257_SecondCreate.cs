using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_PROJETO.Migrations
{
    /// <inheritdoc />
    public partial class SecondCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResistenciaInterna",
                table: "Sensors");

            migrationBuilder.DropColumn(
                name: "Temperatura",
                table: "Sensors");

            migrationBuilder.DropColumn(
                name: "Timestamp",
                table: "Sensors");

            migrationBuilder.DropColumn(
                name: "Voltagem",
                table: "Sensors");

            migrationBuilder.AddColumn<int>(
                name: "CodigoSensor",
                table: "Sensors",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Descricao",
                table: "Sensors",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Localizacao",
                table: "Sensors",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Leituras",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    SensorId = table.Column<int>(type: "int", nullable: false),
                    Voltagem = table.Column<double>(type: "double", nullable: false),
                    ResistenciaInterna = table.Column<double>(type: "double", nullable: false),
                    Temperatura = table.Column<double>(type: "double", nullable: false),
                    Condutancia = table.Column<double>(type: "double", nullable: false),
                    Desvio = table.Column<double>(type: "double", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leituras", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Leituras_Sensors_SensorId",
                        column: x => x.SensorId,
                        principalTable: "Sensors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Leituras_SensorId",
                table: "Leituras",
                column: "SensorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Leituras");

            migrationBuilder.DropColumn(
                name: "CodigoSensor",
                table: "Sensors");

            migrationBuilder.DropColumn(
                name: "Descricao",
                table: "Sensors");

            migrationBuilder.DropColumn(
                name: "Localizacao",
                table: "Sensors");

            migrationBuilder.AddColumn<double>(
                name: "ResistenciaInterna",
                table: "Sensors",
                type: "double",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Temperatura",
                table: "Sensors",
                type: "double",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<DateTime>(
                name: "Timestamp",
                table: "Sensors",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<double>(
                name: "Voltagem",
                table: "Sensors",
                type: "double",
                nullable: false,
                defaultValue: 0.0);
        }
    }
}
