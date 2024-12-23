import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import app from "./app.js";
dotenv.config({
    path: './.env'
});

// As connectDB is asynchronus so it returns promise
connectDB()
.then(
    () => {

        // Error handling for app:
        app.on("error", (error) => {
            console.log("App error", error);
            throw error;
        });

        // Listening at server side 
        app.listen(process.env.PORT || 8000,
            () => {
                console.log(`Server is running at : http://localhost:${process.env.PORT}`);   
            }
        );
        
    }
)
.catch((error) => {
    console.log("MongoDB connection failed!!\n",error);
});