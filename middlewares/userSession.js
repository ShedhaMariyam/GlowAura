import User from '../models/userSchema.js';

const userSession = async (req, res, next) => {
  try {
    if (req.session.user) {
      const user = await User.findById(req.session.user);
      if (user && !user.is_Blocked) {
        res.locals.user = user;
      } else {
        req.session.destroy();
      }
    }
    next();
  } catch (err) {
    console.error(err);
    next();
  }
};

export default userSession;
