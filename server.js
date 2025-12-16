const express = require("express");
const cors = require("cors");
const connectDB = require("./Utls/connectDB");
const port = 5000;
const app = express();
require("./Utls/cloudinary.config");
const fs = require('fs');
const userroutes = require("./Routes/userroutes");
const shoproutes = require("./Routes/shoproutes");
const itemroutes = require("./Routes/itemroutes");



app.use(cors());
app.use(express.json());
app.use("/user", userroutes);
app.use("/shop", shoproutes);
app.use("/item",itemroutes);

const startServer = async () =>{
    try{
        const dbstatus = await connectDB();
        if(dbstatus){
            app.listen(port, ()=>{
                const now = new Date();
                console.log(`server is running on port ${port} at ${now.toLocaleString()}`);
            })
        }else{
            console.log("Error in stating Server");
        }
    }catch(error){
        console.error("Error in stating server:", error);
    }
}

startServer();