const path = require("path");
const logger = require("morgan");
const express = require("express");
const createError = require("http-errors");
const app = express();
const indexRouter = require("./routes/index");
const queryRouter = require("./routes/query");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("json spaces", 5);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/routes", queryRouter);

// page not found
app.get("*", (req, res) => {
  res.render("page_not_found", { user: req.user });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

module.exports = app;
