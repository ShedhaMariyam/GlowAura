import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userSchema.js";

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const name = profile.displayName;

        // Find by Google ID
        let user = await User.findOne({ googleId });

        if (user) {
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Find by email (link Google account)
        if (email) {
          user = await User.findOne({ email });

          if (user) {
            user.googleId = googleId;
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }
        }

        //  Create new user
        const newUser = new User({
          name,
          email,
          googleId,
          lastLogin: new Date()
        });

        await newUser.save();
        return done(null, newUser);

      } catch (error) {
        console.error("GoogleStrategy error:", error);
        return done(error, null);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || null);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
