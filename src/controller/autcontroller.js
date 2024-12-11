// const { AuthModel } = require('../models/authmodel');

// // Controller function to get all signup data
// const getAllSignups = async (req, res) => {
//   try {
//     // Fetch all signup data from the database
//     const users = await AuthModel.find(); // Fetch all user data
//     res.json({ message: 'Signup data accessed successfully!', users });
//   } catch (err) {
//     res.status(500).json({ status: 'failed', message: 'Error fetching data', error: err.message });
//   }
// };

// module.exports = { getAllSignups };


const { AuthModel } = require('../models/authmodel');
const { comparePassword, genPassword } = require('../utils/auth'); // Assuming these utility functions are already created

// Controller function to get all signup data
const getAllSignups = async (req, res) => {
  try {
    // Fetch all signup data from the database
    const users = await AuthModel.find(); // Fetch all user data
    res.json({ message: 'Signup data accessed successfully!', users });
  } catch (err) {
    res.status(500).json({ status: 'failed', message: 'Error fetching data', error: err.message });
  }
};







// Controller function to update the password
const updatePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  // Check if the required fields are provided
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "Please provide email, old password, and new password" });
  }

  try {
    // Find the user by email
    const user = await AuthModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the old password with the stored password
    const isMatch = await comparePassword(user.password, oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Hash the new password and update it
    const hashedNewPassword = await genPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error updating password", error: err.message });
  }
};

module.exports = { getAllSignups, updatePassword };
