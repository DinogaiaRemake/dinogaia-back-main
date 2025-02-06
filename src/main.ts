"use strict";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());

    // Allow all origins
    app.enableCors({
        origin: "*", // Allows requests from any origin
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Accept",
            "Cookie",
            "Set-Cookie"
        ],
        exposedHeaders: ["Set-Cookie"],
    });

    await app.listen(3000, "0.0.0.0");
    console.log("✅ Server is running on port 3000 with CORS enabled for all origins");
}

bootstrap();
