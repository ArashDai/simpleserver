const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');

function tokenGen(user){
    const timestamp = new Date().getTime();
    return jwt.encode({ sub:user.id, iat:timestamp }, config.secret);
}

exports.signin = function(req, res, next){
    res.send({ token:tokenGen(req.user) });
}

exports.signup = function(req,res,next){
    const email = req.body.email;
    const password = req.body.password;

    if(!email || !password){
        return res.status(422).send({error:'You must provide both Username and Password'});
    }
    // Check if user with given username exists
    User.findOne({email: email}, function(err,existingUser){
        if (err) return next(err); 
        //if a user with this email does exist return an error
        if(existingUser) {
            return res.status(422).send({error:'Email in use'}); //unprocessable entitiy you gave us bad data
        }
        //if a user with this email does not exist, create record and save user
        const user = new User({
            email:email,
            password:password
        });
        user.save(function(err){
            if(err) return next(err);
            res.json({ token:tokenGen(user) });
        });
    });
}