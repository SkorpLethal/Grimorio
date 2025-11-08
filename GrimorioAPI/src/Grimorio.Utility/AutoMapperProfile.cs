using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using AutoMapper;
using Grimorio.DTO;
using Grimorio.Model;

namespace Grimorio.Utility
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            #region Rol
            CreateMap<Rol, RolDTO>().ReverseMap();
            #endregion Rol

            #region Menu
            CreateMap<Menu, MenuDTO>().ReverseMap();
            #endregion Menu

            #region Usuario
            CreateMap<Usuario, UsuarioDTO>()
                .ForMember(destino =>
                destino.DescripcionRol,
                opt => opt.MapFrom(origen => origen.IdRolNavigation.Nombre)
            );

            CreateMap<UsuarioDTO, Usuario>()
               .ForMember(destino =>
               destino.IdRolNavigation,
               opt => opt.Ignore()
           );

            CreateMap<Usuario, SesionDTO>()
                .ForMember(destino =>
                destino.DescripcionRol,
                opt => opt.MapFrom(origen => origen.IdRolNavigation.Nombre)
            );

            #endregion Usuario

            #region Set
            CreateMap<Set, SetDTO>().ReverseMap();
            #endregion Set

            #region Carta
            CreateMap<Carta, CartaDTO>()
                .ForMember(destino =>
                destino.DescripcionSet,
                opt => opt.MapFrom(origen => origen.IdSetNavigation.Nombre)
                );
            CreateMap<CartaDTO, Carta>()
               .ForMember(destino =>
               destino.IdSetNavigation,
               opt => opt.Ignore()
            );
            #endregion Carta

            #region Venta
            CreateMap<Venta, VentaDTO>()
                .ForMember(destino =>
                    destino.FechaRegistro,
                    opt => opt.MapFrom(origen => origen.FechaRegistro.Value.ToString(Culture.FormatoFecha))
               );

            CreateMap<VentaDTO, Venta>();
            #endregion Venta

            #region DetalleVenta
            CreateMap<DetalleVenta, DetalleVentaDTO>()
                .ForMember(destino =>
                destino.DescripcionCarta,
                opt => opt.MapFrom(origen => origen.IdCartaNavigation.Nombre)
                );

            CreateMap<DetalleVentaDTO, DetalleVenta>();
            #endregion DetalleVenta

            #region Reporte
            CreateMap<DetalleVenta, ReporteDTO>()
                .ForMember(destino =>
                    destino.FechaRegistro,
                    opt => opt.MapFrom(origen => origen.IdVentaNavigation.FechaRegistro.Value.ToString(Culture.FormatoFecha))
                )
                .ForMember(destino =>
                    destino.Carta,
                    opt => opt.MapFrom(origen => origen.IdCartaNavigation.Nombre)
                )
                .ForMember(destino =>
                    destino.NumeroDocumento,
                    opt => opt.MapFrom(origen => origen.IdVentaNavigation.NumeroDocumento)
                )
                .ForMember(destino =>
                    destino.TipoPago,
                    opt => opt.MapFrom(origen => origen.IdVentaNavigation.TipoPago)
                )
                .ForMember(destino =>
                    destino.TotalVenta,
                    opt => opt.MapFrom(origen => origen.IdVentaNavigation.Total)
                );
            #endregion Reporte
        }
    }

    public static class Culture
    {
        public static string FormatoFecha => "dd/MM/yyyy";
    }
}
