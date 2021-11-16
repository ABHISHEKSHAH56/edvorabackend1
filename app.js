const express = require("express");
const session = require("express-session");
const connectRedis=require("connect-redis")
const dotenv = require("dotenv");
const appController = require("./controllers/appController");
const isAuth = require("./middleware/is-auth");
const mongoose = require("mongoose");
const client = require("./middleware/initredis");
dotenv.config();

const app = express();
// app.set('trust proxy',1)
const Redisstore=connectRedis(session)
//configure our redis







var CONNECTION_URL = process.env.DB_CONNECT;
const port = process.env.PORT || 4000; //Getting Free Port On Server If 4000 Is Not Available
mongoose.connect(
  CONNECTION_URL,
  {
    //Connecting To Mongo DB Database Before Starting Node Server
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  (err) => {
    if (err) console.log("Error Connecting DB", err);
    else console.log("DB Connected Succesfully");
  }
);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: new Redisstore({client:client}),
    cookie:{
      secure:false, //if true :only transit cokkie over http
      httpOnly:true, //if true prevents client side js from reading cookies
      maxAge:1000*60*60
    }
  })
);

//=================== Routes
// Landing Page
app.get("/", appController.landing_page);

// Login Page
app.get("/login", appController.login_get);
app.post("/login", appController.login_post);

// Register Page
app.get("/register", appController.register_get);
app.post("/register", appController.register_post);

// Dashboard Page
app.get("/dashboard", isAuth, appController.dashboard_get);

//user check 
app.get("/check",appController.check)
app.post("/checkemail",appController.checkemail)
//forget  password
app.get("/forgetui/:userId",appController.forgetUI)
app.post("/forgetpassword",appController.forgetpassword)

//forget  password
app.get("/changeui",appController.changepassUI)
app.post("/changepassword",appController.changepassword)

app.post("/logout", appController.logout_post);


app.listen(port, () => console.log(`Server is running on PORT ${port}`));

