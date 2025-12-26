const User = require('../models/userSchema');

const userAuth = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.redirect('/signin');
        }

        const user = await User.findById(req.session.user);
        
        if (!user) {
            req.session.destroy();
            return res.redirect('/signin');
        }
        
        if (user.is_Blocked) {
            req.session.destroy();
            return res.redirect('/signin');
        }
        
        res.locals.user = user;
        next();
        
    } catch (error) {
        console.error("Error in user auth middleware:", error);
        res.status(500).send("Internal Server Error");
    }
}

const adminAuth = async (req, res, next) => {
    try {
        if (!req.session.admin) {
            return res.redirect('/admin/login');
        }

        const admin = await User.findById(req.session.admin);
        
        if (!admin || !admin.is_admin) {
            req.session.destroy();
            return res.redirect('/admin/login');
        }
        
        res.locals.admin = admin;
        next();
        
    } catch (error) {
        console.error("Error in adminAuth middleware:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    userAuth,
    adminAuth
}