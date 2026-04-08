require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
//this validating incoming request data
const { body, validationResult } = require("express-validator");
const jsonwebtoken = require("jsonwebtoken");
//so i can use the google auth 
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const User = require("../models/userModel");
const sendEmail = require("../../utils/sendEmail");


//here i register new user
router.post('/register', [
    body('first_name').notEmpty().withMessage('Le prénom est requis'),
    body('last_name').notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide'),//this checkes a valid emain before going further
    body('phone').notEmpty().withMessage('Le téléphone est requis'),
    body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court (min 6 caractères)'),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    //now here we get the data holded in the request body
    const { first_name, last_name, email, phone, password, role } = req.body;

    try {
        const existing = await User.findOne({ email });
        if (existing) {
            res.status(409).json({ message: 'Un compte avec cet email existe déjà.' });
            return;
        }

        //i hashed the password (12 selt means so strong but slow too)
        const hashed = await bcrypt.hash(password, 12);
        //we do await here because we use the creat method that creat a user and save it in the db
        const user = await User.create({
            first_name,
            last_name,
            email,
            phone,
            password: hashed,
            role: 'customer', // Always customer to prevent  creating an other owner
        });

        const token = jsonwebtoken.sign({ id: user._id/* i not sur about this one here */, role: user.role, is_subscribed: user.is_subscribed }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                is_subscribed: user.is_subscribed,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Erreur serveur .' });
    }
});


//log in 
router.post('/login', [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis'),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    //here we verify the email and the password
    const { email, password } = req.body;
    try {

        const user = await User.findOne({ email });

        if (!user) {
            res.status(401).json({ massage: 'Email incorrect.' });
            return;
        }
        // here we verify the scanedf password with the hashed one
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Mot de passe incorrect.' });
            return;
        }
        //here we generate the token 
        const token = jsonwebtoken.sign(
            {
                id: user._id,
                role: user.role,
                is_subscribed: user.is_subscribed,
            }, process.env.JWT_SECRET, {
                expiresIn: '7d'
        });

        res.json({
            token,
            user: {
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                is_subscribed: user.is_subscribed,
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur.' });
        console.log(err);
    }

});

//google auth

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
router.post("/google", [body('credential').notEmpty().withMessage('Token Google manquant')],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { credential } = req.body;
        try {
            let email, name, googleId, picture;

            // Determine if the token is a JWT (ID Token) or an Access Token
            // JWTs have 3 parts separated by dots
            if (credential.split('.').length === 3) {
                console.log("[AUTH] Processing as ID Token (JWT)");
                const ticket = await client.verifyIdToken({
                    idToken: credential,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();
                email = payload.email;
                name = payload.name;
                googleId = payload.sub;
                picture = payload.picture;
            } else {
                console.log("[AUTH] Processing as Access Token");
                // Fetch info from Google UserInfo API
                const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${credential}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch user info from Google");
                }
                const payload = await response.json();
                email = payload.email;
                name = payload.name;
                googleId = payload.sub;
                picture = payload.picture;
            }

            // Create the user in the database or find it
            let user = await User.findOne({ email });
            if (!user) {
                const nameParts = (name || "").split(" ");
                const firstName = nameParts[0] || "User";
                const lastName = nameParts.slice(1).join(" ") || "Google";
                
                user = await User.create({
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    phone: "N/A",
                    googleId,
                    picture,
                    role: 'customer'
                });
            }
            // Generate the jwt
            const jwtToken = jsonwebtoken.sign(
                { 
                    id: user._id, 
                    email: user.email,
                    role: user.role,
                    is_subscribed: user.is_subscribed
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            res.status(200).json({
                success: true,
                token: jwtToken,
                user: {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    is_subscribed: user.is_subscribed,
                }
            });
        } catch (err) {
            console.error('[AUTH] Google Auth Error:', err);
            res.status(500).json({ message: 'Erreur lors de la connexion avec Google.' });
        }
    });

//forgot-password
router.post('/forgot-password',
    [body('email').isEmail().withMessage('Email invalide')],

    async (req, res) => {
        const { email } = req.body;
        console.log(`[AUTH] REQUÊTE REÇUE pour: ${email}`);

        try {
            const user = await User.findOne({ email });
            console.log(`[AUTH] Forgot password request for: ${email}`);

            if (!user) {
                console.log(`[AUTH] User not found: ${email}`);
                // For security, don't reveal if user exists or not
                res.json({ message: 'Si cet email est enregistré, un code de vérification a été envoyé.' });
                return;
            }
            //this creat the code we will send to the user's email
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            user.reset_password_code = code;
            //we set the code expires withing 15 min
            user.reset_password_expires = new Date(Date.now() + 15 * 60 * 1000);
            await user.save();

            try {
                //this sends the code to the email
                sendEmail.sendVerification(email, code);
                console.log('\x1b[32m%s\x1b[0m', `[AUTH] Email envoyé à ${email}`);
            } catch (mailError) {

                console.error('\x1b[31m%s\x1b[0m', `[AUTH-ERROR] Échec de l'envoi à ${email}:`, mailError.message);
                console.log('\x1b[33m%s\x1b[0m', `[AUTH-FALLBACK] Utilisez ce code pour tester: ${code}`);
            }

            res.json({ message: 'Si cet email est enregistré, un code de vérification a été envoyé.' });

        } catch (err) {
            res.status(500).json({ message: 'Erreur' });
        }
    });

//reset the password
router.post('/reset-password', [
    body('email').isEmail().withMessage('Email invalide'),
    body('code').notEmpty().withMessage('Code requis'),
    body('newPassword').isLength({ min: 6 }).withMessage('Nouveau mot de passe trop court'),
], async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const user = await User.findOne({
            email,
            reset_password_code: code,//the code sent by the email
            reset_password_expires: { $gt: new Date() },//this means greater that it exist grather or equal
        });

        if (!user) {
            res.status(400).json({ message: 'Code invalide ou expiré.' });
            return;
        }
        user.password = await bcrypt.hash(newPassword, 12);
        user.reset_password_code = undefined;
        user.reset_password_expires = undefined;
        await user.save();

        res.json({ message: 'Mot de passe mis à jour avec succès.' });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});


exports.default = router;