using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_PROJETO.Models
{
    // Representa o sensor físico (hardware)
    public class Sensor
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; } // PK no banco

        [Required]
        public int CodigoSensor { get; set; } // ID único que identifica o sensor no mundo físico

        public string? Localizacao { get; set; } // exemplo: "Veículo 1 - Bateria dianteira"
        
        public string? Descricao { get; set; } // opcional, para informações adicionais

        // Relação 1:N → um sensor pode ter várias leituras
        public ICollection<LeituraSensor> Leituras { get; set; } = new List<LeituraSensor>();
    }

    // Representa cada leitura capturada pelo sensor
    public class LeituraSensor
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [ForeignKey("Sensor")]
        public int SensorId { get; set; }
        public Sensor Sensor { get; set; } = null!;

        public double Voltagem { get; set; }

        public double ResistenciaInterna { get; set; }

        public double Temperatura { get; set; }

        public double Condutancia { get; set; }

        public double Desvio { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}