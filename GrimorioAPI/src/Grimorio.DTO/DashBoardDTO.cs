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

        public decimal TotalIngresos { get; set; }

        public int TotalCartas { get; set; }

        public List<VentaSemanaDTO> VentasUltimaSemana { get; set; }
    }
}
