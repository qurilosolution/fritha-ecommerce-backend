const AdminModel = require("../models/adminModel");
const { genPassword, comparePassword } = require("../utils/auth");
const jwt=require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY=process.env.SECRET_KEY
console.log(JWT_SECRET_KEY,"jwt secret key");


exports.adminSignup=async(firstName,lastName,email,password)=>{
    try{
    const existingUser = await AdminModel.findOne({ email });
    if (existingUser) {
        throw new Error("User already exists with this email");
    }
    console.log(email,password)
    const hashedPassword = await genPassword(password);
    const newUser = new AdminModel({
        firstName,
        lastName,
        email,
        password: hashedPassword,
    });
    await newUser.save();
    return {
        success: true,
        message: "Admin User  created successfully",
        user: newUser,
    };
  }
    catch (error) {
        throw new Error(`Error during signup: ${error.message}`);

        }
}
exports.adminLogin=async(email,password)=>{
    try{
        const adminUser=await AdminModel.findOne({email});
        if(!adminUser)
            throw new Error('User not Found');
        const isPasswordMatch=await comparePassword(adminUser.password,password);
        if(!isPasswordMatch)
            throw new Error('Password do not match');
        const token=jwt.sign({
            id:adminUser.id,
            name:(adminUser.firstName)+(adminUser.lastName),
            email:adminUser.email,
            role:"admin"
        },JWT_SECRET_KEY,{expiresIn:'24h'})
        return {
            success:true,
            message:"Login Succesfully",
            user:adminUser,
            token:token
        }
    }    
    catch(error){
        throw new Error(`Error in login ${error.message}`)
        }
    }


