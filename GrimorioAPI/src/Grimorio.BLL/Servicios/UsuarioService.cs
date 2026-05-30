using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using AutoMapper;
using Grimorio.BLL.Servicios.Contrato;
using Grimorio.DAL.Repositorios.Contrato;
using Grimorio.DTO;
using Grimorio.Model;
using Microsoft.EntityFrameworkCore;

namespace Grimorio.BLL.Servicios
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IConfiguration _configuracion;
        private readonly IGenericRepository<Usuario> _usuarioRepositorio;
        private readonly IMapper _mapper;

        public UsuarioService(IGenericRepository<Usuario> usuarioRepositorio, IMapper mapper, IConfiguration configuracion)
        {
            _usuarioRepositorio = usuarioRepositorio;
            _mapper = mapper;
            _configuracion = configuracion;
        }

        public async Task<List<UsuarioDTO>> Lista()
        {
            try
            {
                var queryUsuario = await _usuarioRepositorio.Consultar();
                var listaUsuarios = queryUsuario.Include(rol => rol.IdRolNavigation).ToList();

                return _mapper.Map<List<UsuarioDTO>>(listaUsuarios);
            }
            catch
            {
                throw;
            }
        }

        public async Task<SesionDTO> ValidarCredenciales(string correo, string clave)
        {
            try
            {
                var queryUsuario = await _usuarioRepositorio.Consultar(u =>
                u.Correo == correo &&
                u.Clave == clave
                );

                if (queryUsuario.FirstOrDefault() == null)
                    throw new TaskCanceledException("El usuario no existe.");

                Usuario devolverUsuario = queryUsuario.Include(rol => rol.IdRolNavigation).First();

                var sesion = _mapper.Map<SesionDTO>(devolverUsuario);
                sesion.Token = GenerarToken(devolverUsuario);
                return sesion;

            }
            catch
            {
                throw;
            }
        }

        public async Task<UsuarioDTO> Crear(UsuarioDTO modelo)
        {
            try
            {
                var usuarioCreado = await _usuarioRepositorio.Crear(_mapper.Map<Usuario>(modelo));

                if (usuarioCreado.IdUsuario == 0)
                    throw new TaskCanceledException("No se puedo crear.");
                var query = await _usuarioRepositorio.Consultar(u => u.IdUsuario == usuarioCreado.IdUsuario);

                usuarioCreado = query.Include(rol => rol.IdRolNavigation).First();

                return _mapper.Map<UsuarioDTO>(usuarioCreado);
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Editar(UsuarioDTO modelo)
        {
            try
            {
                var usuarioModelo = _mapper.Map<Usuario>(modelo);

                var usuarioEncontrado = await _usuarioRepositorio.Obtener(u => u.IdUsuario == usuarioModelo.IdUsuario);

                if (usuarioEncontrado == null)
                    throw new TaskCanceledException("El usuario no existe.");

                usuarioEncontrado.NombreCompleto = usuarioModelo.NombreCompleto;
                usuarioEncontrado.Correo = usuarioModelo.Correo;
                usuarioEncontrado.IdRol = usuarioModelo.IdRol;
                usuarioEncontrado.Clave = usuarioModelo.Clave;
                usuarioEncontrado.EsActivo = usuarioModelo.EsActivo;

                bool respuesta = await _usuarioRepositorio.Editar(usuarioEncontrado);

                if (!respuesta)
                    throw new TaskCanceledException("No se pudo editar.");
                return respuesta;
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Eliminar(int id)
        {
            try
            {
                var usuarioEncontrado = await _usuarioRepositorio.Obtener(u => u.IdUsuario == id);

                if (usuarioEncontrado == null)
                    throw new TaskCanceledException("El usuario no existe");

                bool respuesta = await _usuarioRepositorio.Eliminar(usuarioEncontrado);

                if (!respuesta)
                    throw new TaskCanceledException("No se pudo eliminar.");

                return respuesta;
            }
            catch
            {
                throw;
            }
        }
        private string GenerarToken(Usuario usuario)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuracion["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
                new Claim(ClaimTypes.Name,           usuario.NombreCompleto ?? ""),
                new Claim(ClaimTypes.Email,          usuario.Correo ?? ""),
                new Claim(ClaimTypes.Role,           usuario.IdRolNavigation?.Nombre ?? "")
            };

            var token = new JwtSecurityToken(
                issuer: _configuracion["Jwt:Issuer"],
                audience: _configuracion["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                                        int.Parse(_configuracion["Jwt:ExpiresInMinutes"]!)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

