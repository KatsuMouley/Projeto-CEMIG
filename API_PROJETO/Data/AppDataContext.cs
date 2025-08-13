using Microsoft.EntityFrameworkCore;
using API_PROJETO.Models;

namespace API_PROJETO.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Sensor> Sensors { get; set; }
    }
}