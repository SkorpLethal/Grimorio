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

namespace Grimorio.BLL.Servicios
{
    public class SetService : ISetService
    {
        private readonly IGenericRepository<Set> _setRepositorio;
        private readonly IMapper _mapper;

        public SetService(IGenericRepository<Set> setRepositorio, IMapper mapper)
        {
            _setRepositorio = setRepositorio;
            _mapper = mapper;
        }

        public async Task<List<SetDTO>> Lista()
        {
            try
            {
                var listaCategorias = await _setRepositorio.Consultar();
                return _mapper.Map<List<SetDTO>>(listaCategorias).ToList();
            }
            catch
            {
                throw;
            }
        }
    }
}
