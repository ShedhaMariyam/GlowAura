const passport = require ('passport');
const GoogleStrategy = require ('passport-google-oauth20').Strategy;
const user = require ("../models/userSchema");
const User = require('../models/userSchema');
const env = require('dotenv').config();




passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:'http://localhost:3000/auth/google/callback'
    },

    async (accessToken, refreshToken, profile, done)=>{
    try {
        const googleId = profile.id;
        const email = profile.emails[0].value;
        const name = profile.displayName;

        let user = await User.findOne({googleId})
        if(user){

            return done(null,user); //user already exist
               
        }

        user = await User.findOne({ email }); //check by email

        //link google account to existing email
        if(user)
        {
            user.googleId = googleId;
            await user.save();
            return done(null, user);
        }

        user = new User({
            name : name,
            email : email,
            googleId : googleId,
            });

        await user.save();
    return done(null,user);
    }
    catch (error) { 

        return done(error,null);

    }
}


));

passport.serializeUser((user,done)=>{
    done(null,user.id)
});

passport.deserializeUser((id,done)=>{
    User.findById(id)
    .then(user=>{ void
            done(null,user)
    }).catch(eer =>{
        done(err,null)
    })
})

module.exports=passport;