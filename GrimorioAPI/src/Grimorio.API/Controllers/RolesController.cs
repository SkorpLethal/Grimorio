using Grimorio.API.Utilidad;
using Grimorio.BLL.Servicios.Contrato;
using Grimorio.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Grimorio.API.Controllers
{
    [Authorize(Roles = "Administrador")]
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
