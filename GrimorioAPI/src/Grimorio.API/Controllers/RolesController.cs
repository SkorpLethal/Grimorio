using Grimorio.BLL.Servicios.Contrato;
using Grimorio.DTO;
using Microsoft.AspNetCore.Mvc;
using Grimorio.API.Utilidad;

namespace Grimorio.API.Controllers
{
    [Route("api/roles")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly IRolService _rolServicio;

        public RolesController(IRolService servicio)
        {
            _rolServicio = servicio;
        }
    [HttpGet]
    public async Task<IActionResult> Lista()
        {
            var response = new Response<List<RolDTO>>();

            try
            {
                response.status = true;
                response.value = await _rolServicio.Lista();

            }
            catch (Exception ex) { 
                response.status = false;
                response.msg = ex.Message;
            }
            return Ok(response);
        }
    }
}
