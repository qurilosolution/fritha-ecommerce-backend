const express = require('express');
const { AuthMiddleware } = require('../middleware/authmiddleware'); // Assuming this is your authentication middleware
const { getAllSignups, updatePassword } = require('../controller/autcontroller'); // Import the controller

const router = express.Router();

// Define the /signup route with the controller and middleware for authentication
router.get('/signup', AuthMiddleware, getAllSignups);  // Apply AuthMiddleware here to protect this route
router.post('/update-password', AuthMiddleware, updatePassword);  // Apply AuthMiddleware here to protect this route

module.exports = router;
