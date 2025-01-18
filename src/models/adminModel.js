const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    
});

const AdminModel = mongoose.model("Admin", adminSchema);
module.exports=AdminModel
   