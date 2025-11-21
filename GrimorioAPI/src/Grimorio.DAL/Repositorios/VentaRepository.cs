using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Grimorio.DAL.DBContext;
using Grimorio.DAL.Repositorios.Contrato;
using Grimorio.Model;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace Grimorio.DAL.Repositorios
{
    public class VentaRepository : GenericRepository<Venta>, IVentaRepository
    {

        private readonly GrimorioDbContext _dbcontext;

        public VentaRepository(GrimorioDbContext dbcontext) : base(dbcontext) 
        {
            _dbcontext = dbcontext;
        }

        public async Task<Venta> Registrar(Venta modelo)
        {      
            Venta ventaGenerada = new Venta();

            using (var transaction = _dbcontext.Database.BeginTransaction())
            {
                try {
                
                    foreach(DetalleVenta dv in modelo.DetalleVenta){
                        Carta carta_encontrada = _dbcontext.Cartas.Where(c => c.IdCarta == dv.IdCarta).First();

                        carta_encontrada.Stock = carta_encontrada.Stock - dv.Cantidad;
                        _dbcontext.Cartas.Update(carta_encontrada);
                    }
                    await _dbcontext.SaveChangesAsync();

                    modelo.NumeroDocumento = await GenerarNumeroDocumento();

                    await _dbcontext.Venta.AddAsync(modelo);
                    await _dbcontext.SaveChangesAsync();

                    ventaGenerada = modelo;

                    transaction.Commit();
 
                } catch { 

                    transaction.Rollback();
                    throw;
                }

                return ventaGenerada;
            }

        } 
        private async Task<string> GenerarNumeroDocumento()
        {
            NumeroDocumento correlativo = _dbcontext.NumeroDocumentos.First();

            correlativo.UltimoNumero = correlativo.UltimoNumero + 1;
            correlativo.FechaRegistro = DateTime.Now;

            _dbcontext.NumeroDocumentos.Update(correlativo);
            await _dbcontext.SaveChangesAsync();

            int CantidadDigitos = 4;
            string ceros = string.Concat(Enumerable.Repeat("0", CantidadDigitos));
            string numeroVenta = ceros + correlativo.UltimoNumero.ToString();

            numeroVenta = numeroVenta.Substring(numeroVenta.Length - CantidadDigitos, CantidadDigitos);

            return numeroVenta;
        }
    }
}
