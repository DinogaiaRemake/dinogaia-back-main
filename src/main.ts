import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());

    const allowedOrigins = ["https://dinogaiaremake.fr", "http://localhost:3001"];

    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept", "Cookie", "Set-Cookie"],
        exposedHeaders: ["Set-Cookie"]
    });

    await app.listen(3000, "0.0.0.0");
}

bootstrap();