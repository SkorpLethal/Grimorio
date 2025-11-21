using Grimorio.BLL.Servicios.Contrato;
using Microsoft.AspNetCore.Mvc;

namespace Grimorio.API.Controllers
{
    [Route("api/roles")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly IRolService _servicio;

        public RolesController(IRolService servicio)
        {
            _servicio = servicio;
        }
    [HttpGet]
    public async Task<IActionResult> Lista()
        {
           var roles = await _servicio.Lista();
            return Ok(roles);
        }
    }
}
