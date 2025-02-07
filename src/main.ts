import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());

    const allowedOrigins = ["https://dinogaiaremake.fr", "http://localhost:3001"];

    app.use((req, res, next) => {
        const origin = req.headers.origin;
        if (allowedOrigins.includes(origin)) {
            res.header("Access-Control-Allow-Origin", origin);
            res.header("Access-Control-Allow-Credentials", "true");
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
            res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Cookie, Set-Cookie");
        }
        
        if (req.method === "OPTIONS") {
            res.status(204).end();
        } else {
            next();
        }
    });

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