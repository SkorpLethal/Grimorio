using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Grimorio.DTO
{
    public class DetalleVentaDTO
    {
        public int? IdCarta { get; set; }

        public string? DescripcionCarta { get; set; }

        public int? Cantidad { get; set; }

        public decimal? Precio { get; set; }

        public decimal? Total { get; set; }
    }
}
