
const express = require ('express');
const app = express();
const path = require ('path');
const dotenv = require ('dotenv');
const session = require ('express-session')
const connectDB = require('./config/db');
const nocache = require ('nocache');
const passport = require ("./config/passport");

//import route files
const userRouter = require("./routes/userRouter")
const adminRouter = require ('./routes/adminRouter');



//view engine and views folder
app.set('view engine','ejs');
app.set('views',[path.join(__dirname,'views/user'),path.join(__dirname,'views/admin')])

//serve static files
app.use(express.static(path.join(__dirname, 'public')))

//Middleware
app.use(nocache())//Disable caching so that back button doesn't show old pages
app.use(express.json());// Parse form data (urlencoded) and JSON payloads
app.use(express.urlencoded({extended :true}))




// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false ,
              httpOnly :true,
              maxAge : 72*60*60*1000
            } 
  })
);


app.use(passport.initialize());
app.use(passport.session());


//Routers
app.use('/',userRouter);
app.use('/admin',adminRouter);



//connect MongoDB
connectDB();

const PORT=3000|| process.env.PORT;
app.listen(process.env.PORT, ()=> {
    console.log(" Server Running ");
})

module.exports = app