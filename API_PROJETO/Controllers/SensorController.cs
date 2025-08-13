using API_PROJETO.Data;
using API_PROJETO.Models;
using Microsoft.AspNetCore.Mvc;

namespace API_PROJETO.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SensorsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SensorsController(AppDbContext context)
        {
            _context = context;
        }

        // ENDPOINT 1: Cadastrar um sensor (recebendo o modelo diretamente)
        // POST: api/sensors
        [HttpPost]
        public IActionResult CreateSensor([FromBody] Sensor sensor)
        {
            if (sensor == null)
            {
                return BadRequest("Dados do sensor não podem ser nulos.");
            }
            
            _context.Sensors.Add(sensor);
            _context.SaveChanges(); 

            return CreatedAtAction(nameof(GetSensorById), new { id = sensor.Id }, sensor);
        }

        // ENDPOINT 2: Atualizar os dados de um sensor
        // PUT: api/sensors/{id}
        [HttpPut("{id}")]
        public IActionResult UpdateSensor(int id, [FromBody] Sensor updatedSensor)
        {
            var sensor = _context.Sensors.Find(id);

            if (sensor == null)
            {
                return NotFound();
            }

            // Atualiza os campos diretamente
            sensor.Voltagem = updatedSensor.Voltagem;
            sensor.ResistenciaInterna = updatedSensor.ResistenciaInterna;
            sensor.Temperatura = updatedSensor.Temperatura;
            
            _context.SaveChanges(); // Operação síncrona

            return NoContent();
        }

        // ENDPOINT 3: Ler todos os dados do banco
        // GET: api/sensors
        [HttpGet]
        public ActionResult<IEnumerable<Sensor>> GetAllSensors()
        {
            // .ToList() executa a consulta de forma síncrona
            var sensors = _context.Sensors.ToList(); 
            return Ok(sensors);
        }

        // GET: api/sensors/{id}
        [HttpGet("{id}")]
        public ActionResult<Sensor> GetSensorById(int id)
        {
            // .Find() é síncrono
            var sensor = _context.Sensors.Find(id); 

            if (sensor == null)
            {
                return NotFound();
            }

            return Ok(sensor);
        }
    }
}