import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let statusCode = 500;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
    }

    response.status(statusCode).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      statusCode,
    });
  }
}
