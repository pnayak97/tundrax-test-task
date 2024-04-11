import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log("Before...");

    const request = context.switchToHttp().getRequest();
    const { url, method, params, query, body } = request;
    // Filter out sensitive information like password from the request body
    const filteredBody = { ...body };
    if (filteredBody.password) {
      filteredBody.password = "[FILTERED]";
    }
    console.log("Request:", { url, method, params, query, body: filteredBody });

    const now = Date.now();
    return next.handle().pipe(
      tap((data) => {
        console.log("Response:", {
          statusCode: context.switchToHttp().getResponse().statusCode,
        });
        console.log(`After... ${Date.now() - now}ms`);
      }),
    );
  }
}
