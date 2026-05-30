import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      switch (error.status) {

        case 401:
          // Token expirado o no enviado — redirigir al login
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          router.navigate(['/login']);
          break;

        case 403:
          // Token válido pero sin permisos — redirigir o notificar
          router.navigate(['/pages/dashboard'], {
            state: { errorPermiso: 'No tienes permisos para realizar esta acción.' }
          });
          break;

        case 500:
          console.error('Error interno del servidor:', error);
          break;
      }

      // Reemplazar el mensaje de error antes de propagarlo
      const errorModificado = new HttpErrorResponse({
        error:      { msg: obtenerMensaje(error.status) },
        status:     error.status,
        statusText: error.statusText,
        url:        error.url ?? undefined,
        headers:    error.headers
      });

      return throwError(() => errorModificado);
    })
  );
};

function obtenerMensaje(status: number): string {
  switch (status) {
    case 401: return 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
    case 403: return 'No tienes permisos para realizar esta acción.';
    case 404: return 'El recurso solicitado no existe.';
    case 500: return 'Error interno del servidor. Inténtalo más tarde.';
    default:  return 'Ha ocurrido un error inesperado.';
  }
}
