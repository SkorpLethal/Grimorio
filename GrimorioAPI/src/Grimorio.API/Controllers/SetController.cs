using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Grimorio.BLL.Servicios.Contrato;
using Grimorio.DTO;
using Grimorio.API.Utilidad;

namespace Grimorio.API.Controllers
{
    [Route("api/sets")]
    [ApiController]
    public class SetController : ControllerBase
    {
        private readonly ISetService _setServicio;

        public SetController(ISetService setServicio)
        {
            _setServicio = setServicio;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            var response = new Response<List<SetDTO>>();

            try
            {
                response.status = true;
                response.value = await _setServicio.Lista();

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
