using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_PROJETO.Models
{
    public class Sensor
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public double Voltagem { get; set; }
        public double ResistenciaInterna { get; set; }
        public double Temperatura { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}