const express = require ('express');
const app = express();
const path = require ('path')
const env = require ('dotenv').config();
const db = require ('./config/db');
const userRouter = require("./routes/userRouter")
const adminRouter = require ('./routes/adminRouter');
db();


// Parse form data (urlencoded) and JSON payloads
app.use(express.json());
app.use(express.urlencoded({extended :true}))


//view engine and views folder
app.set('view engine','ejs');
app.set('views',[path.join(__dirname,'views/user'),path.join(__dirname,'views/admin')])

app.use(express.static(path.join(__dirname, 'public')))


app.use('/',userRouter);
//app.use('/admin',adminRouter);


const PORT=3000|| process.env.PORT;
app.listen(process.env.PORT, ()=> {
    console.log(" Server Running ");
})

module.exports = app