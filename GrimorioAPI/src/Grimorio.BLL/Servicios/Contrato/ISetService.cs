using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Grimorio.DTO;

namespace Grimorio.BLL.Servicios.Contrato
{
    public interface ISetService
    {
        Task<List<SetDTO>> Lista();
    }
}
