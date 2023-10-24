import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Token from '../models/token.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

export const signin = async (req, res)=>{

    const {email, password} = req.body;
    try{
        const existingUser = await User.findOne({email:email});
        if(!existingUser) return res.status(404).json({message: "user doesn't exist"});

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if(!isPasswordCorrect) return res.status(400).json({message: "Invalid credentials"})
        if(!existingUser.verified){
            let token = await Token.findOne({userId: existingUser._id});
            if(!token){
                const verify_token = await Token.create({
                    userId : existingUser._id,
                    token : crypto.randomBytes(32).toString('hex')
                })
                const url = `${process.env.BASE_URL}users/${existingUser._id}/verify/${verify_token.token}`;
                await sendEmail(existingUser.email, "Verify Email", url);
                return res.status(200).json({message: 'Please check your email for your verification'})
            }else{
                const url = `${process.env.BASE_URL}users/${existingUser._id}/verify/${token.token}`;
                await sendEmail(existingUser.email, "Verify Email", url);
                return res.status(200).json({message: 'Please check your email for your verification'})
            }
        }

        const token = jwt.sign({email: existingUser.email, id: existingUser._id}, process.env.SECRET,{expiresIn:'1h'});
        res.status(200).json({result: existingUser, token})
    }catch(error){
        res.status(500).json({message: 'Something went wrong...'})
    }
}

export const signup = async (req, res)=>{
    const {email, password, confirmPassword, firstName, lastName} = req.body;

    try{
        const existingUser = await User.findOne({email});

        if(existingUser) return res.status(404).json({message: "user already exist"});

        if(password !== confirmPassword){
            return res.status(400).json({message: 'Passwords does not match'});
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const result = await User.create({email, password:hashedPassword, name: `${firstName} ${lastName}`});

        const verify_token = await Token.create({
            userId : result._id,
            token : crypto.randomBytes(32).toString('hex')
        });

        const url = `${process.env.BASE_URL}users/${result._id}/verify/${verify_token.token}`;
        await sendEmail(result.email, "Verify Email", url);
        res.status(200).json({message: "Please check your email for your verification"})
    }catch(error){
        res.status(500).json({message: 'Something went wrong...'})

    }
}

export const googlesignin = async (req, res) =>{
    const {email, name} = req.body;
    let result = await User.findOne({email});
    if(!result){
        result = await User.create({email, name, verified: true, password:name});
    }
    const token = jwt.sign({email: result.email, id: result._id}, process.env.SECRET,{expiresIn:'1h'});
    res.status(200).json({result, token})
}

export const verify_signup = async (req, res) =>{
    try{
        const user = await User.findOne({_id: req.params.id});

        if(!user) return res.status(400).send({mesage: "Invalid Link"})

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token
        });
        if(!token) return res.status(400).send({message: "Invalid link"})

        await User.updateOne({_id: user._id}, {verified: true})
        await Token.deleteOne({_id:token._id});
        res.status(200).json({"message": "Successfully verified"})

    }catch(error){
        res.status(500).json({message: error})
    }
}

export const forget_password = async (req, res) =>{
    const {email} = req.params;
    try{
        const existingUser = await User.findOne({email});
        
        if(!existingUser) return res.status(404).json({message: "Account doesn't exist Please register"});
        let token = await Token.findOne({userId: existingUser._id});
        if(!token){
            const verify_token = await Token.create({
                userId : existingUser._id,
                token : crypto.randomBytes(32).toString('hex')
            });
            const url = `${process.env.FRONT_END_URL}resetpassword/${existingUser._id}/${verify_token.token}`;
            await sendEmail(existingUser.email, "Verify Email", url);
        }else{
            const url = `${process.env.FRONT_END_URL}resetpassword/${existingUser._id}/${token.token}`;
            await sendEmail(existingUser.email, "Verify Email", url);
        }
        res.status(200).json({message: "Please check your email for your verification"});
    }catch(error){
        res.status(500).send({message: "Internal server error"});
    }
}

export const reset_password = async (req, res) =>{

    try{
        const {id, token, password} = req.body;
        const existingUser = await User.findById({_id:id});
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if(isPasswordCorrect) return res.status(400).json({message: "Old Password is matched"});
        const token_obj = await Token.findOne({
            userId: id,
            token: token
        });
        if(!token_obj) return res.status(400).send({message: "Invalid link"});
        
        const hashedPassword = await bcrypt.hash(password, 12);
        await User.updateOne({_id: id}, { password : hashedPassword, verified : true });
        await Token.deleteOne({_id: token_obj._id});
        res.status(200).json({message: "Password Reset Successfully"});
    }catch(error){
        res.status(500).send({message: "Internal server error"});
    }
}