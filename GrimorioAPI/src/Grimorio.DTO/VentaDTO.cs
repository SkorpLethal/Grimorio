using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Grimorio.DTO
{
    public class VentaDTO
    {
        public int IdVenta { get; set; }

        public string? NumeroDocumento { get; set; }

        public string? TipoPago { get; set; }

        public decimal? Total { get; set; }

        public DateTime? FechaRegistro { get; set; }

        public virtual ICollection<DetalleVentaDTO> DetalleVenta { get; set; }
    }
}
