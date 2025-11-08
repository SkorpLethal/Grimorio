using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Grimorio.DTO
{
    public class DashBoardDTO
    {
        public decimal TotalVentas { get; set; }

        public decimal TotalIngreos { get; set; }

        public List<VentaSemanaDTO> Ventas { get; set; }
    }
}
