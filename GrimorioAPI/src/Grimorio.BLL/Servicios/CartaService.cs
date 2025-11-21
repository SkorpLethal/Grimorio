using System;
using System.Collections.Generic;
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
    public class CartaService : ICartaService
    {
        private readonly IGenericRepository<Carta> _cartaRepositorio;
        private readonly IMapper _mapper;

        public CartaService(IGenericRepository<Carta> cartaRepository, IMapper mapper)
        {
            _cartaRepositorio = cartaRepository;
            _mapper = mapper;
        }

        public async Task<List<CartaDTO>> Lista()
        {
            try
            {
                var queryCarta = await _cartaRepositorio.Consultar();

                var listaCartas = queryCarta.Include(set => set.IdSetNavigation).ToList();

                return _mapper.Map<List<CartaDTO>>(listaCartas.ToList());
            }
            catch
            {
                throw;
            }
        }

        public async Task<CartaDTO> Crear(CartaDTO modelo)
        {
            try
            {
                var cartaCreada = await _cartaRepositorio.Crear(_mapper.Map<Carta>(modelo));

                if(cartaCreada.IdCarta == 0)
                    throw new TaskCanceledException("No se pudo crear.");

                return _mapper.Map<CartaDTO>(cartaCreada);
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Editar(CartaDTO modelo)
        {
            try
            {
                var cartaModelo = _mapper.Map<Carta>(modelo);
                var cartaEncontrada = await _cartaRepositorio.Obtener(u =>
                u.IdCarta == cartaModelo.IdCarta
                );

                if (cartaEncontrada == null)
                    throw new TaskCanceledException("La carta no existe.");

                cartaEncontrada.Nombre = cartaModelo.Nombre;
                cartaEncontrada.IdSet = cartaModelo.IdSet;
                cartaEncontrada.Stock = cartaModelo.Stock;
                cartaEncontrada.Precio = cartaModelo.Precio;
                cartaEncontrada.EsActivo = cartaModelo.EsActivo;

                bool respuesta = await _cartaRepositorio.Editar(cartaEncontrada);

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
                var cartaEncontrada = await _cartaRepositorio.Obtener(c => c.IdCarta == id);

                if (cartaEncontrada == null)
                    throw new TaskCanceledException("El producto no existe.");

                bool respuesta = await _cartaRepositorio.Eliminar(cartaEncontrada);

                if (!respuesta)
                    throw new TaskCanceledException("No se pudo eliminar");

                return respuesta;
            }
            catch
            {
                throw;
            }
        }
    }
}
