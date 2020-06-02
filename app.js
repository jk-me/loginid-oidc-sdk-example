var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2').Strategy
const base64url = require('base64url')
const cookieSession = require('cookie-session')
const util = require('util');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieSession({
    name: 'tuto-session',
    keys: ['key1', 'key2']
  }))



passport.use(new OAuth2Strategy(
    {
        clientID: process.env.LOGINID_CLIENT_ID, // The client ID
        clientSecret: process.env.LOGINID_CLIENT_SECRET, // The shared secret, but keep in config!
        callbackURL: `https://localhost:3000/callback`,
        authorizationURL: `https://sandbox-apse1.api.loginid.io/hydra/oauth2/auth`,
        tokenURL: `https://sandbox-apse1.api.loginid.io/hydra/oauth2/token`,
        scope: `openid`,
        state: base64url(JSON.stringify({blah: 'This is a test value'}))
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log("Access token is: ", accessToken);
        console.log(util.inspect(accessToken, false, null));
        console.log('refresh', refreshToken, 'profile', profile)

        if (profile) {
            user = profile;
            return cb(null, user);
        } else {
            return cb(null, false);
        }
    }
));

passport.serializeUser(function(user, done) {
  console.log('serializing', user)
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    console.log('deserializing', user)
    done(null, user);
});

// Auth middleware that checks if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.status(401).render('error',
          {error: {status: '401', stack: 'You must sign in to do that!'} , message: "Unauthorized"}
        );
    }
}

app.get('/fail', (req, res) => res.send("Failed"))
app.get('/dashboard', isLoggedIn, (req, res) => {
  res.status(200).render('dashboard', {user: req.user})
})


app.get('/login', passport.authenticate('oauth2'));

app.get('/callback',
    passport.authenticate('oauth2', { failureRedirect: '/fail' }),
    function(req, res) {
        // Before this code, the strategy's callback is called
        console.log('user', req.user)
        console.log("Returning home...");
        res.redirect('/dashboard');
    }
);

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
