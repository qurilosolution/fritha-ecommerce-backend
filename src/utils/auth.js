// const bcrypt = require("bcryptjs")
// exports.genPassword = (password)=>{
//     const salt = bcrypt.genSaltSync(6);
//     return bcrypt.hashSync(password,salt)
// }


// exports.comparePassword = (hash,oldpass)=>{
//     return bcrypt.compareSync(oldpass,hash)
// }

const bcrypt = require("bcryptjs");

exports.genPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);  // Async salt generation with 10 rounds
    return await bcrypt.hash(password, salt);  // Async password hashing
}

exports.comparePassword = async (hash, oldpass) => {
    return await bcrypt.compare(oldpass, hash);  // Async password comparison
}
