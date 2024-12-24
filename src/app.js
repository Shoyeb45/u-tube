import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';

const app = express();
app.use(
    cors({
            origin: process.env.CORS_ORIGIN,
            credentials: true
    })
);

// To limit the size of request object: no need of parser
app.use(express.json({
    limit: "20kb"
}));

// When recieving data through URL, url encodes data in different format, so while receiving it, we need to tell app, the it is url encoded
app.use(express.urlencoded({
    extended: true,
    limit: "20kb" 
}));

// For static pages and files - most of time, we'll use public folder to store the static files
app.use(express.static("public"));

// To perform the CRUD operations on user cookies
app.use(cookieParser());


// routes import
import userRouter from "./routes/user.routes.js";

// Routes declaration
app.use("/api/v1/user", userRouter); // using api and v1 is good practice 

app.get("/", (req, res) => {
    res.send("I'm here!!!!<br>Yayyyy!!!");
});

export default app;