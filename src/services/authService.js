const AdminModel = require("../models/adminModel");
const { genPassword, comparePassword } = require("../utils/auth");
const jwt=require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY=process.env.SECRET_KEY
console.log(JWT_SECRET_KEY,"jwt secret key");
const bcrypt = require("bcrypt");

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
    
    
    exports.updateAdminProfile = async (adminId, updateData) => {
      try {
        const updatedAdmin = await AdminModel.findByIdAndUpdate(adminId, updateData, { new: true });
    
        if (!updatedAdmin) {
          throw new Error("Admin not found");
        }
    
        return {
          success: true,
          message: "Profile updated successfully",
          profile: updatedAdmin,
        };
      } catch (error) {
        throw new Error(`Error updating profile: ${error.message}`);
      }
    };
    
    
    exports.changeAdminPassword = async (adminId, currentPassword, newPassword, confirmPassword) => {
      try {
        const admin = await AdminModel.findById(adminId);
        if (!admin) {
          throw new Error("Admin not found");
        }
    
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
          throw new Error("Current password is incorrect");
        }
    
        // Check if new password matches confirm password
        if (newPassword !== confirmPassword) {
          throw new Error("New password and confirm password do not match");
        }
    
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;
        await admin.save();
    
        return {
          success: true,
          message: "Password changed successfully",
        };
      } catch (error) {
        throw new Error(`Error changing password: ${error.message}`);
      }
    };
    exports.getAdminProfile = async (adminId) => {
      try {
        console.log("dnfsdjngd", adminId);
        const admin = await AdminModel.findById(adminId);
        console.log("fndgndlfd", admin);
    
        if (!admin) {
          return { success: false, message: "Admin not found", profile: null };
        }
    
        return {
          success: true,
          message: "Admin profile fetched successfully",
          profile: admin,
        };
      } catch (error) {
        return { success: false, message: error.message, profile: null };
      }
    };
    
    

