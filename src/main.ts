import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

  /*// >>> CORS
  
  app.enableCors({
    origin: 'http://localhost:3001',   // domaine du front
    credentials: true,                 // autorise les cookies
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });
  // <<<*/

    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    await app.listen(3000, "0.0.0.0");
}

bootstrap();

/*import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    await app.listen(3000, "0.0.0.0");
}

bootstrap();*/
