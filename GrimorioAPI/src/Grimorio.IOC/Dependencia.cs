using Grimorio.DAL.DBContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Grimorio.IOC
{
    public static class Dependencia
    {
        public static void InyectarDependencias(this IServiceCollection servicios,IConfiguration configuracion)
        {
            servicios.AddDbContext<GrimorioDbContext>(options => {
                options.UseSqlServer(configuracion.GetConnectionString("GrimorioDiablillo"));
            });
        }
    }
}
