using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Grimorio.DTO
{
    public class ReporteDTO
    {
        public string? NumeroDocumento { get; set; }

        public string? TipoPago { get; set; }

        public DateTime? FechaRegistro { get; set; }

        public decimal? TotalVenta {  get; set; }

        public string? Carta { get; set; }

        public int? Cantidad { get; set; }

        public decimal? Precio { get; set; }

        public decimal? Total { get; set; }
    }
}
