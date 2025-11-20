const passport = require ('passport');
const GoogleStrategy = require ('passport-google-oauth20').Strategy;
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
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const name = profile.displayName;

        // find by google id 

        let user = await User.findOne({googleId})

        if(user){
         // update lastLogin 
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);       
        }


        //Try to find by email
        if(email){
        user = await User.findOne({ email }); 
        //link google account to existing email
            if(user)
            {
                user.googleId = googleId;
                user.lastLogin = new Date();
                await user.save();
                return done(null, user);
            }
        }

        const newUser = new User({
            name : name,
            email : email,
            googleId : googleId,
            lastLogin: new Date()
            });

        await newUser.save();
    return done(null, newUser);
    }
    catch (error) { 
        console.error('GoogleStrategy error:', err);
        return done(error,null);

    }
}


));

passport.serializeUser((user,done)=>{
    done(null,user.id) //store user id in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || null);
  } catch (err) {
    done(err, null);
  }
});

module.exports=passport;