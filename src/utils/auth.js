
const bcrypt = require("bcryptjs");

exports.genPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);  
    return await bcrypt.hash(password, salt);  
}

exports.comparePassword = async (hash, oldpass) => {
    return await bcrypt.compare(oldpass, hash);  
}
