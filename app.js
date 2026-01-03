import express from "express";
import path from "path";
import "dotenv/config";
import session from "express-session";
import nocache from "nocache";
import passport from "./config/passport.js";
import { fileURLToPath } from "url";

// Local imports
import connectDB from "./config/db.js";
import userRouter from "./routes/userRouter.js";
import adminRouter from "./routes/adminRouter.js";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App init
const app = express();

// View engine
app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views/user"),
  path.join(__dirname, "views/admin")
]);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(nocache());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session config
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set true only in HTTPS
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000
    }
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", userRouter);
app.use("/admin", adminRouter);

// DB connection
connectDB();

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`--------------------Server running on port ${PORT}--------------------`);
});

export default app;
