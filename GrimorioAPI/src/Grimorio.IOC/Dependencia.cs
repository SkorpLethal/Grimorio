using Grimorio.BLL.Servicios;
using Grimorio.BLL.Servicios.Contrato;
using Grimorio.DAL.DBContext;
using Grimorio.DAL.Repositorios;
using Grimorio.DAL.Repositorios.Contrato;
using Grimorio.Utility;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Grimorio.IOC
{
    public static class Dependencia
    {
        public static void InyectarDependencias(this IServiceCollection servicios,IConfiguration configuracion)
        {
            servicios.AddDbContext<GrimorioDbContext>(options => {
                options.UseSqlServer(configuracion.GetConnectionString("GrimorioDiablillo"));
            });

            servicios.AddTransient(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            servicios.AddScoped<IVentaRepository, VentaRepository>();

            servicios.AddAutoMapper(typeof(AutoMapperProfile));

            servicios.AddScoped<ICartaService, CartaService>();
            servicios.AddScoped<IDashBoardService, DashBoardService>();
            servicios.AddScoped<IMenuService, MenuService>();
            servicios.AddScoped<IRolService, RolService>();
            servicios.AddScoped<ISetService, SetService>();
            servicios.AddScoped<IUsuarioService, UsuarioService>();
            servicios.AddScoped<IVentaService, VentaService>();         
        }
    }
}
