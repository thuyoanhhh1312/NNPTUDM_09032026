var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
let mongoose = require("mongoose");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(
  "mongodb://admin:admin123@localhost:27017/NNPTUD-C2?authSource=admin",
);
mongoose.connection.on("connected", async () => {
  console.log("connected");

  // Khởi tạo roles mặc định
  try {
    let roleModel = require("./schemas/roles");

    // Kiểm tra và tạo role Admin
    let adminRole = await roleModel.findOne({ name: "admin" });
    if (!adminRole) {
      adminRole = new roleModel({
        name: "admin",
        description: "Administrator with full permissions",
      });
      await adminRole.save();
      console.log("Created admin role");
    }

    // Kiểm tra và tạo role User
    let userRole = await roleModel.findOne({ name: "user" });
    if (!userRole) {
      userRole = new roleModel({
        name: "user",
        description: "Regular user with limited permissions",
      });
      await userRole.save();
      console.log("Created user role");
    }

    // Kiểm tra và tạo role Mod (nếu cần)
    let modRole = await roleModel.findOne({ name: "mod" });
    if (!modRole) {
      modRole = new roleModel({
        name: "mod",
        description: "Moderator with read and create/update permissions",
      });
      await modRole.save();
      console.log("Created mod role");
    }

    console.log("Roles initialized successfully");

    // Khởi tạo admin user mặc định
    let userModel = require("./schemas/users");
    let adminUser = await userModel.findOne({ username: "admin" });

    if (!adminUser) {
      adminUser = new userModel({
        username: "admin",
        password: "admin123",
        email: "admin@example.com",
        fullName: "Administrator",
        role: adminRole._id,
        status: true,
      });
      await adminUser.save();
      console.log("Created admin user: username='admin', password='admin123'");
    }

    // Tạo thêm mod user để test
    let modUser = await userModel.findOne({ username: "mod" });
    if (!modUser) {
      modUser = new userModel({
        username: "mod",
        password: "mod123",
        email: "mod@example.com",
        fullName: "Moderator",
        role: modRole._id,
        status: true,
      });
      await modUser.save();
      console.log("Created mod user: username='mod', password='mod123'");
    }

    console.log("Admin and Mod users initialized successfully");
  } catch (error) {
    console.error("Error initializing roles and users:", error);
  }
});

app.use("/api/v1/", require("./routes/index"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/roles", require("./routes/roles"));
app.use("/api/v1/products", require("./routes/products"));
app.use("/api/v1/categories", require("./routes/categories"));
app.use("/api/v1/auth", require("./routes/auth"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
