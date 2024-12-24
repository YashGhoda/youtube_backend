import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";



app.use(cors({
    origin:process.env.COR_ORIGIN,
    credentials:true
}));

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRoutes from "./routes/user.routes.js"

const app = express()

app.use("/api/v1/users",userRoutes)


export { app }