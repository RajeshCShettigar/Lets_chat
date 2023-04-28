const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcryptjs');
dotenv.config();
const User = require('../models/user');
const jwtSecret = process.env.JWT_SECRET_KEY;

/*----------------check for cookies and verify token-----------------*/
router.get('/profile', (req, res) => {
    const token = req.cookies?.token;
    //console.log(token);
    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) throw err;
            res.json(userData);
        });
    } else {
        res.status(401).json('no token');
    }
});


/*----------------login-----------------*/
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    //console.log(username, password);
    const foundUser = await User.findOne({ username });
    //console.log(foundUser);
    if (foundUser) {
        const passOk = bcrypt.compareSync(password, foundUser.password);
        if (passOk) {
            jwt.sign({ userId: foundUser._id, username }, jwtSecret, {}, (err, token) => {
                res.cookie('token', token, { sameSite: 'none', secure: true }).json({
                    id: foundUser._id,
                });
            });
        }else{
            res.status(401).json('wrong password');
        }
    }else{
        res.status(403).json('no user found');
    }
});


/*----------------logout-----------------*/
router.post('/logout', (req, res) => {
    res.cookie('token', '', { sameSite: 'none', secure: true }).json('ok');
});

/*----------------register-----------------*/
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    //console.log(username, password);
    try {
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const createdUser = await User.create({
            username: username,
            password: hashedPassword,
        });
        jwt.sign({ userId: createdUser._id, username }, jwtSecret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, { sameSite: 'none', secure: true }).status(201).json({
                id: createdUser._id,
            });
        });
    } catch(err){
        res.status(500)
         .json({success:false,message:"Error occured while registering user",error:err});
    }
});

module.exports = router;