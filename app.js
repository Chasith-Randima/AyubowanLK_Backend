const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");

const userRouter = require("./routes/userRoute");
const articleRouter = require("./routes/articleRoute");
const tagRouter = require("./routes/tagRoute");
const categoryRouter = require("./routes/categoryRoute");
const contactRouter = require("./routes/contactRoute");

const app = express();

app.use(cors());

app.options("*", cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/articles", articleRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/tags", tagRouter);
app.use("/api/v1/contacts", contactRouter);
module.exports = app;
