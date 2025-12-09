const express = require("express");
const cors = require("cors");
const connectDB = require("./Utls/connectDB");
const port = 5000;
const app = express();
const userrouter = require("./Routes/userroutes");



app.use(cors());
app.use(express.json());
app.use("/user", userrouter);

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