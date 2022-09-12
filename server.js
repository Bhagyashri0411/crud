if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// const LocalStrategy = require('passport-local').Strategy
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const User = require('./model/user')

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => User.find(email),
  id => User.find(id)
)

mongoose.connect('mongodb://localhost:27017/login');
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
// app.use(passport.initialize())

app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', {  name: req.user.name })
})

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const response = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
    console.log("User Succefully:", response);
  } catch {
    res.redirect('/register')
  }
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

// app.delete("/logout", function (req, res, next) {
//   // req.logout(function (err) {
//   //   if (err) { return next(err); }
//   //   res.redirect('/login')
//   // });
//   User.deleteOne({_id: req.body.name}, function(err){
//     res.status(200).json(err)
//     // if (err) { return next(err); }
//     // res.redirect('/')
//   }).catch((err)=>{console.warn(err)})
// });

app.delete('/logout', (req, res) =>{
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.status(400).send('Unable to log out')
      } else {
        res.send('Logout successful')
      }
    });
  } else {
    res.end()
  }
  // User.deleteOne({_id: req.body.name};
  // req.logout()
  // res.redirect('/login')
})



function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3800)