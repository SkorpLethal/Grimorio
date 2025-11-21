using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Grimorio.DTO;

namespace Grimorio.BLL.Servicios.Contrato
{
    public interface ICartaService
    {
        Task<List<CartaDTO>> Lista();
        Task<CartaDTO> Crear(CartaDTO modelo);
        Task<bool> Editar(CartaDTO modelo);
        Task<bool> Eliminar(int id);
    }
}
