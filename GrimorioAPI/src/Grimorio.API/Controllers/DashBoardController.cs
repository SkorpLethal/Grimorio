using Grimorio.API.Utilidad;
using Grimorio.BLL.Servicios.Contrato;
using Grimorio.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Grimorio.API.Controllers
{
    [Authorize(Roles = "Administrador, Supervisor, Empleado")]
    [Route("api/dashboards")]
    [ApiController]
    public class DashBoardController : ControllerBase
    {
        private readonly IDashBoardService _dashboardServicio;

        public DashBoardController(IDashBoardService dashboardServicio)
        {
            _dashboardServicio = dashboardServicio;
        }

        [HttpGet]
        [Route("Resumen")]
        public async Task<IActionResult> Resumen()
        {
            var response = new Response<DashBoardDTO>();

            try
            {
                response.status = true;
                response.value = await _dashboardServicio.Resumen();

            }
            catch (Exception ex)
            {
                response.status = false;
                response.msg = ex.Message;
            }
            return Ok(response);
        }
    }
}
