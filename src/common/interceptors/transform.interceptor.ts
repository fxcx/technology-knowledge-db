import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map(data => ({
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}

// next.handle() continúa el flujo de la solicitud y devuelve un 
// observable que emite los datos de la respuesta del controlador.
// pipe(map(...)) intercepta esos datos y los modifica:
// Empaqueta data en la propiedad data.
// Añade timestamp, que registra la fecha y hora de la respuesta.
// Añade path, que contiene la URL de la solicitud.
