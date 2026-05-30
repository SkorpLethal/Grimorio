using Grimorio.BLL.Servicios;
using Grimorio.BLL.Servicios.Contrato;
using Grimorio.DAL.DBContext;
using Grimorio.DAL.Repositorios;
using Grimorio.DAL.Repositorios.Contrato;
using Grimorio.Utility;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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

            var jwtKey = configuracion["Jwt:Key"]!;

            servicios.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuracion["Jwt:Issuer"],
                    ValidAudience = configuracion["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
                };
            });

            servicios.AddAuthorization();
        }
    }
}
