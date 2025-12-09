const { MONGODB_URL } = require("./config");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("MONGODB connection Success");
    return true;
  } catch (error) {
    if (error.name === "MongooseServerSelectionError") {
      console.log("Check Mongodb Server is running or not");
    } else {
      console.log("Mongodb Connection failed");
    }
    process.exit(1);
    return false;
  }
};

module.exports = connectDB;
