import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { MESSAGE_KEY } from '../decorators/response-message.decorator';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        message:
          this.reflector.get<string>(
            MESSAGE_KEY,
            context.getHandler(),
          ) || 'Request successful',
        statusCode: context.switchToHttp().getResponse().statusCode,
        data,
      })),
    );
  }
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
