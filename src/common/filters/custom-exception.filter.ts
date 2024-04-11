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
    let errorMessage=exception.message;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus()
      const exceptionResp: any = exception.getResponse()
      errorMessage = exceptionResp.message
    }

    response.status(statusCode).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorMessage,
      statusCode,
    });
  }
}
