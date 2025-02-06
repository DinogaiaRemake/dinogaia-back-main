"use strict";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());

    // Allow specific frontend origins + allow credentials
    const allowedOrigins = ["https://dinogaiaremake.fr", "http://localhost:3001"];

    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, origin); // Allow only the matching origin
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true, // Allows sending cookies
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept", "Cookie", "Set-Cookie"],
        exposedHeaders: ["Set-Cookie"],
    });

    // Handle OPTIONS preflight requests properly
    app.use((req, res, next) => {
        if (req.method === "OPTIONS") {
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
            res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Cookie, Set-Cookie");
            res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
            res.status(204).send();
        } else {
            next();
        }
    });

    await app.listen(3000, "0.0.0.0");
    console.log("✅ Server is running on port 3000 with CORS configured correctly");
}

bootstrap();
