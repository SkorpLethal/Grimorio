using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using AutoMapper;
using Grimorio.BLL.Servicios.Contrato;
using Grimorio.DAL.Repositorios.Contrato;
using Grimorio.DTO;
using Grimorio.Model;
using Microsoft.EntityFrameworkCore;

namespace Grimorio.BLL.Servicios
{
    public class VentaService : IVentaService
    {
        private readonly IVentaRepository _ventaRepositorio;
        private readonly IGenericRepository<DetalleVenta> _detalleVentaRepositorio;
        private readonly IMapper _mapper;

        public VentaService(IVentaRepository ventaRepositorio, 
            IGenericRepository<DetalleVenta> detalleVentaRepositorio, 
            IMapper mapper)
        {
            _ventaRepositorio = ventaRepositorio;
            _detalleVentaRepositorio = detalleVentaRepositorio;
            _mapper = mapper;
        }

        public async Task<VentaDTO> Registrar(VentaDTO modelo)
        {
            try
            {
                var ventaGenerada = await _ventaRepositorio.Registrar(_mapper.Map<Venta>(modelo));

                if (ventaGenerada.IdVenta == 0)
                    throw new TaskCanceledException("No se pudo crear.");

                return _mapper.Map<VentaDTO>(ventaGenerada);
            }
            catch
            {
                throw;
            }
        }

        public async Task<List<VentaDTO>> Historial(string buscarPor, string numeroVenta, string fechaInicio, string fechaFin)
        {
            IQueryable<Venta> query = await _ventaRepositorio.Consultar();
            var listaResultado = new List<Venta>();

            try
            {
                if(buscarPor == "fecha")
                {
                    DateTime fecha_Inicio = DateTime.ParseExact(fechaInicio, "dd/MM/yyyy", new CultureInfo("es-ES"));
                    DateTime fecha_Fin = DateTime.ParseExact(fechaFin, "dd/MM/yyyy", new CultureInfo("es-ES"));

                    listaResultado = await query.Where(v =>
                        v.FechaRegistro.Value.Date >= fecha_Inicio.Date &&
                        v.FechaRegistro.Value.Date <= fecha_Inicio.Date
                    ).Include(dv => dv.DetalleVenta)
                    .ThenInclude(c => c.IdCartaNavigation)
                    .ToListAsync();
                }
                else
                {
                    listaResultado = await query.Where(v => v.NumeroDocumento == numeroVenta                   
                    ).Include(dv => dv.DetalleVenta)
                    .ThenInclude(c => c.IdCartaNavigation)
                    .ToListAsync();
                }
            }
            catch
            {
                throw;
            }

            return _mapper.Map<List<VentaDTO>>(listaResultado);
        }

        public async Task<List<ReporteDTO>> Reporte(string fechaInicio, string fechaFin)
        {
            IQueryable<DetalleVenta> query = await _detalleVentaRepositorio.Consultar();
            var listaResultado = new List<DetalleVenta>();
            
            try
            {
                DateTime fecha_Inicio = DateTime.ParseExact(fechaInicio, "dd/MM/yyyy", new CultureInfo("es-ES"));
                DateTime fecha_Fin = DateTime.ParseExact(fechaFin, "dd/MM/yyyy", new CultureInfo("es-ES"));

                listaResultado = await query
                    .Include(c => c.IdCartaNavigation)
                    .Include(v => v.IdVentaNavigation)
                    .Where(dv => 
                        dv.IdVentaNavigation.FechaRegistro.Value.Date >= fecha_Inicio.Date &&
                        dv.IdVentaNavigation.FechaRegistro.Value.Date <= fecha_Fin.Date 
                    ).ToListAsync();

            }
            catch
            {
                throw;
            }

            return _mapper.Map<List<ReporteDTO>>(listaResultado);
        }
    }
}
