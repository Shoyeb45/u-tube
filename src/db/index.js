import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try {

        let uri = `${process.env.MONGODB_URI}/${DB_NAME}`;
        // console.log("uri", uri);  it was for debug
        
        const connectionInstance = await mongoose.connect(uri);
        // console.log(`----------- MongoDB connected successfully -----------\nDatabase host: ${connectionInstance.connection.host}\n------------------------ Happy -----------------------`);
        
    } catch (error) {
        console.log("MongoDB Connection failed");
        console.log(error);
        process.exit(1);
    }
};

export default connectDB;