const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('./model/user')

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    const user = await User.findOne({ email }).lean()
    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }


  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
}

module.exports = initialize