using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Grimorio.DTO
{
    public class CartaDTO
    {
        public int IdCarta { get; set; }

        public string? Nombre { get; set; }

        public int? IdSet { get; set; }

        public string? DescripcionSet { get; set; }

        public int? Stock { get; set; }

        public decimal? Precio { get; set; }

        public bool? EsActivo { get; set; }
    }
}
