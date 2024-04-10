import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import validationPipeService from "@pipets/validation-pipes";
import { AppModule } from "./app.module";

async function bootstrap() {
  try {
    validationPipeService();
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(5000);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (err) {}
}

bootstrap();
