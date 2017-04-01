const passport = require('passport');
const config = require('../config');
const User = require('../models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

//Create local strategy
const localLogin = new LocalStrategy({usernameField:'email'},function(email,password,done){
    //Verify username and password
    User.findOne({email:email},function(err,user){
        if (err) return done(err);
        if(!user) return done(null,false);

        user.comparePassword(password, function(err, isMatch){
            if(err) return done(err)
            if(!isMatch) return done(null, false);

            return done(null, user);
        });
    });
});


//setup options for jwt strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
};

//create jwt strategy
const jwtLogin = new JwtStrategy(jwtOptions,function(payload, done){
    //check payload to see if the userID is in the database
    //if it is call 'done' with that user
    //otherwise call done without the user object

    User.findById(payload.sub, function(err, user){
        if(err) return done(err,false);
        if(user) {
            done(null,user);
        } else {
            done(null,false);
        }
    });
});

//tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);