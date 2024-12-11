const { AuthModel } = require('../models/authmodel');

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

module.exports = { getAllSignups };
