using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Grimorio.BLL.Servicios.Contrato;
using Grimorio.DTO;
using Grimorio.API.Utilidad;

namespace Grimorio.API.Controllers
{
    [Route("api/menus")]
    [ApiController]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuServicio;

        public MenuController(IMenuService menuServicio)
        {
            _menuServicio = menuServicio;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista(int idUsuario)
        {
            var response = new Response<List<MenuDTO>>();

            try
            {
                response.status = true;
                response.value = await _menuServicio.Lista(idUsuario);

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
