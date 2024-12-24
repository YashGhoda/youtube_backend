import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express"

const app = express()
dotenv.config({
    path:'./env'
})

connectDB()

.then(() =>{
    app.listen(process.env.PORT,() =>{
        console.log(`Server running at port:${process.env.PORT}`)
    })
})
.catch((err) =>{
    console.log("MONGODB connection failed:",err)
})
