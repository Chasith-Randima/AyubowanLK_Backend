const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const app = require("./app");
const DB = process.env.DATABASE;

// mongodb connection
mongoose.connect(DB, {}).then(() => {
  console.log("DB connection successful....");
});

const PORT = process.env.PORT || 3000;
const LOCAL_ADDRESS = "0.0.0.0";

const server = app.listen(PORT, LOCAL_ADDRESS, () => {
  console.log(`Server running in port ${PORT}`);
});
