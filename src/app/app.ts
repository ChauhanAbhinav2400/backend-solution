import express from "express"
import cors from "cors"
import errorHandler from "../middlewares/error-handler"
import authRoutes from "../routes/auth.route.";
import problemRoutes from "../routes/problem.route";
import { connectToDB } from "../db/connection";

class App {
    public app: express.Application
    constructor() {
        this.app = express()
        this.initMiddlewares()
        this.mountRoutes()

    }
    mountRoutes() {
        this.app.use("/api/auth", authRoutes);
        this.app.use("/api", problemRoutes);
        this.app.use(errorHandler as any)

    }
    initMiddlewares() {
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use(cors())
    }
    start(port: number) {
        this.app.listen(port, () => {
            connectToDB()
            console.log(`Server started at http://localhost:${port}`)
        })
    }


}
export default App;