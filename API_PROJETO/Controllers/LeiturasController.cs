using API_PROJETO.Data;
using API_PROJETO.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

//Controller Responsável pela leitura dos sensores
namespace API_PROJETO.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeiturasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LeiturasController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/leituras
        [HttpPost]
        public IActionResult CreateLeitura([FromBody] LeituraSensor leitura)
        {
            if (leitura == null)
            {
                return BadRequest("Dados da leitura não podem ser nulos.");
            }

            if (!_context.Sensors.Any(s => s.Id == leitura.SensorId))
                return BadRequest("Sensor não encontrado para associar a leitura.");

            _context.Leituras.Add(leitura);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetLeituraById), new { id = leitura.Id }, leitura);
        }

        // GET: api/leituras/{id}
        [HttpGet("{id}")]
        public ActionResult<LeituraSensor> GetLeituraById(int id)
        {
            var leitura = _context.Leituras.Find(id);
            if (leitura == null) return NotFound();

            return Ok(leitura);
        }

        // GET: api/leituras/sensor/{sensorId}
        [HttpGet("sensor/{sensorId}")]
        public ActionResult<IEnumerable<LeituraSensor>> GetLeiturasBySensor(int sensorId)
        {
            var leituras = _context.Leituras.Where(l => l.SensorId == sensorId).ToList();
            
            if (leituras == null || !leituras.Any())
            {
                return NotFound("Nenhuma leitura encontrada para este sensor.");
            }

            return Ok(leituras);
        }

        // DELETE: api/leituras/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteLeitura(int id)
        {
            var leitura = _context.Leituras.Find(id);
            if (leitura == null) return NotFound();

            _context.Leituras.Remove(leitura);
            _context.SaveChanges();

            // ALTERAÇÃO: Retorna a leitura que foi deletada como confirmação.
            return Ok(leitura);
        }
    }
}