import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import validationPipeService from "@pipets/validation-pipes";
import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./core/interceptors/logging.interceptor";

async function bootstrap() {
  try {
    validationPipeService();
    const app = await NestFactory.create(AppModule);
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(5000);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (err) {
    console.log(err);
  }
}

bootstrap();
