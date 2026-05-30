using Grimorio.API.Utilidad;
using Grimorio.BLL.Servicios.Contrato;
using Grimorio.BLL.Servicios.Contrato;
using Grimorio.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Grimorio.API.Controllers
{
    
    [Route("api/ventas")]
    [ApiController]
    public class VentaController : ControllerBase
    {
        IVentaService _ventaServicio;

        public VentaController(IVentaService ventaServicio)
        {
            _ventaServicio = ventaServicio;
        }
        [Authorize(Roles = "Administrador, Supervisor, Empleado")]
        [HttpPost]
        [Route("Registrar")]
        public async Task<IActionResult> Registrar([FromBody] VentaDTO venta)
        {
            var response = new Response<VentaDTO>();

            try
            {
                response.status = true;
                response.value = await _ventaServicio.Registrar(venta);

            }
            catch (Exception ex)
            {
                response.status = false;
                response.msg = ex.Message;
            }
            return Ok(response);
        }
        [Authorize(Roles = "Administrador, Supervisor, Empleado")]
        [HttpGet]
        [Route("Historial")]
        public async Task<IActionResult> Historial(string buscarPor, string? numeroVenta, string? fechaInicio, string? fechaFin)
        {
            var response = new Response<List<VentaDTO>>();
            numeroVenta = numeroVenta is null ? "" : numeroVenta;
            fechaInicio = fechaInicio is null ? "" : fechaInicio;
            fechaFin = fechaFin is null ? "" : fechaFin;

            try
            {
                response.status = true;
                response.value = await _ventaServicio.Historial(buscarPor, numeroVenta, fechaInicio, fechaFin);

            }
            catch (Exception ex)
            {
                response.status = false;
                response.msg = ex.Message;
            }
            return Ok(response);
        }
        [Authorize(Roles = "Administrador, Supervisor")]
        [HttpGet]
        [Route("Reporte")]
        public async Task<IActionResult> Reporte(string? fechaInicio, string? fechaFin)
        {
            var response = new Response<List<ReporteDTO>>();

            try
            {
                response.status = true;
                response.value = await _ventaServicio.Reporte(fechaInicio, fechaFin);

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
