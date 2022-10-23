import express, { Application } from "express";
import mongoose from "mongoose";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import Controller from "@/utils/interfaces/controller.interface";
import errorMiddleware from "@/middleware/error.middleware";

class App {
    public express: Application;
    public port: number;

    constructor(controllers: Controller[], port: number) {
        this.express = express();
        this.port = port;

        this.initDatabseConnection();
        this.initMiddleware();
        this.initControllers(controllers);
        this.initErrorHanding();
    }
    private initErrorHanding(): void {
        this.express.use(errorMiddleware);
    }
    private initControllers(controllers: Controller[]): void {
        controllers.forEach((controller: Controller) => {
            this.express.use("/api", controller.router);
        });
    }
    private initMiddleware(): void {
        this.express.use(helmet());
        this.express.use(cors());
        this.express.use(morgan("dev"));
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: false }));
        this.express.use(compression());
    }
    private async initDatabseConnection(): Promise<void> {
        const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
        await mongoose
            .connect(
                `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_PATH}/?retryWrites=true&w=majority`
            )
            .then(function () {
                console.log(`Database connection succeeded.`);
            })
            .catch(function (e) {
                console.log(`Database connection failed. ${e}`);
            });
    }

    public listen() {
        this.express.listen(this.port, () => {
            console.log(`App running on port ${this.port}`);
        });
    }
}

export default App;
