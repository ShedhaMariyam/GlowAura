
const User = require ("../../models/userSchema");
const mongoose = require ("mongoose");
const bcrypt = require("bcrypt");


const pageerror = (req,res)=>{
   try {
    res.render('admin-error');
  } catch (error) {
    res.redirect('/pageerror');
  }
}

const loadLogin = (req,res)=>{
    if(req.session.admin){
        return res.redirect('/admin/dashBoard');

    }
    res.render('admin-login',{message : null})
}



const login = async (req,res)=>{
  try {
        console.log("admin login")
        const {email,password} = req.body;
        const admin = await User.findOne({email ,is_admin:true})
        if (!admin) {
        return res.status(401).render('admin-login', { message: "Invalid credentials — Admin access denied" });
         }

    // compare password properly
    const passwordMatch =  await bcrypt.compare(password, admin.password);
    console.log("passwordMatch:", passwordMatch);

    if (!passwordMatch) {
      return res.status(401).render("admin-login", { message: "Invalid credentials — Admin access denied" });
    }

    // success: set admin session flag and redirect to dashboard
    req.session.admin = true;
   
    return res.redirect("/admin/dashboard");  

  } catch (error) {
    console.log("login error",error)
    return res.redirect('/pageerror');
  }
}


const loadDashboard = async (req,res)=>{
 if(req.session.admin){
    try {
        
        res.render('dashboard', { user: req.session.user || { name: 'Admin User' }, active: 'dashboard' });
    } catch (error) {
        console.log("load dashboard error",error)
        res.redirect('/pageerror');
    }
 }
}

const logout = async (req,res)=>{
    try {

        req.session.destroy(err =>{
          if(err){
            console.log("Error destroying session",err);
            return res.redirect('/pageerror');
            
          }
          res.redirect("/admin/login");
        })

    } catch (error) {
        console.log("unexpected error during logout",error);
        res.redirect("/pageerror");
    }
};


module.exports ={
    loadLogin,
    login,
    loadDashboard,
    pageerror,
    logout
}