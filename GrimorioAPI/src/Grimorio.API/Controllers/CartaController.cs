using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Grimorio.BLL.Servicios.Contrato;
using Grimorio.DTO;
using Grimorio.API.Utilidad;

namespace Grimorio.API.Controllers
{
    [Route("api/cartas")]
    [ApiController]
    public class CartaController : ControllerBase
    {
        private readonly ICartaService _cartaServicio;

        public CartaController(ICartaService cartaServicio)
        {
            _cartaServicio = cartaServicio;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            var response = new Response<List<CartaDTO>>();

            try
            {
                response.status = true;
                response.value = await _cartaServicio.Lista();

            }
            catch (Exception ex)
            {
                response.status = false;
                response.msg = ex.Message;
            }
            return Ok(response);
        }

        [HttpPost]
        [Route("Guardar")]
        public async Task<IActionResult> Guardar([FromBody] CartaDTO carta)
        {
            var response = new Response<CartaDTO>();

            try
            {
                response.status = true;
                response.value = await _cartaServicio.Crear(carta);

            }
            catch (Exception ex)
            {
                response.status = false;
                response.msg = ex.Message;
            }
            return Ok(response);
        }

        [HttpPut]
        [Route("Editar")]
        public async Task<IActionResult> Editar([FromBody] CartaDTO carta)
        {
            var response = new Response<bool>();

            try
            {
                response.status = true;
                response.value = await _cartaServicio.Editar(carta);

            }
            catch (Exception ex)
            {
                response.status = false;
                response.msg = ex.Message;
            }
            return Ok(response);
        }

        [HttpDelete]
        [Route("Eliminar/{id:int}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var response = new Response<bool>();

            try
            {
                response.status = true;
                response.value = await _cartaServicio.Eliminar(id);

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
