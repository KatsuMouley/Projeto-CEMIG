using API_PROJETO.Data;
using API_PROJETO.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

//CONTROLLER RESPONSÁVEL PELA CONEXÃO COM O HARDWARE FÍSICO
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

        // POST: api/sensors
        [HttpPost]
        public IActionResult CreateSensor([FromBody] Sensor sensor)
        {
            if (sensor == null)
                return BadRequest("Dados do sensor não podem ser nulos.");

            _context.Sensors.Add(sensor);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetSensorById), new { id = sensor.Id }, sensor);
        }

        // PUT: api/sensors/{id}
        [HttpPut("{id}")]
        public IActionResult UpdateSensor(int id, [FromBody] Sensor updatedSensor)
        {
            var sensor = _context.Sensors.Find(id);
            if (sensor == null) return NotFound();

            sensor.CodigoSensor = updatedSensor.CodigoSensor;
            sensor.Localizacao = updatedSensor.Localizacao;
            sensor.Descricao = updatedSensor.Descricao;
            
            _context.SaveChanges();

            // ALTERAÇÃO: Retorna o objeto atualizado em vez de NoContent.
            return Ok(sensor);
        }

        // DELETE: api/sensors/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteSensor(int id)
        {
            var sensor = _context.Sensors.Include(s => s.Leituras).FirstOrDefault(s => s.Id == id);
            if (sensor == null) return NotFound();

            // Remove as leituras associadas ao sensor
            _context.Leituras.RemoveRange(sensor.Leituras);
            // Remove o sensor
            _context.Sensors.Remove(sensor);
            
            _context.SaveChanges();

            // ALTERAÇÃO: Retorna o objeto que foi deletado como confirmação.
            return Ok(sensor);
        }

        // GET: api/sensors
        [HttpGet]
        public ActionResult<IEnumerable<Sensor>> GetAllSensors()
        {
            var sensors = _context.Sensors.Include(s => s.Leituras).ToList();
            return Ok(sensors);
        }

        // GET: api/sensors/{id}
        [HttpGet("{id}")]
        public ActionResult<Sensor> GetSensorById(int id)
        {
            var sensor = _context.Sensors.Include(s => s.Leituras).FirstOrDefault(s => s.Id == id);
            if (sensor == null) return NotFound();

            return Ok(sensor);
        }
    }
}