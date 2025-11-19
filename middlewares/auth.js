const User = require ('../models/userSchema');



const userAuth = (req,res,next)=>{

   if(req.session.user){
        User.findById(req.session.user)
        .then(data=>{
            if(data && !data.is_Blocked)
                next();
            else{
                res.redirect('/signin')
            }
        })
        .catch(error=>{
            console.log("Error in user auth middleware");
            res.status(500).send("Internal Server error");
        })
   } else{
        res.redirect("/signin")
   }
}


const adminAuth = (req,res,next)=>{

    User.findOne({is_admin : true})
    .then(data=>{
        if(data){
            next();
        }else{
            res.redirect('/admin/login')
        }
    })
    .catch(error=>{
        console.log("Error in adminAuth middleware",error);
        res.status(500).send("Internal Server error");
    })
}

module.exports ={
    userAuth,
    adminAuth
}