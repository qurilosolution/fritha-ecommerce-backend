const express = require('express');
const { AuthMiddleware } = require('../middleware/authmiddleware');
const { getAllSignups } = require('../controller/autcontroller'); // Import the controller

const router = express.Router();

// Define the /signup route with the controller
router.get('/', AuthMiddleware, getAllSignups);

module.exports = router;
