require('dotenv').config();
var _ = require('lodash');
const express = require('express');
const cors = require('cors');
const https = require("https");
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const router = express();
router.use(cors({ origin: 'http://localhost:3000' }));

router.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
router.use(express.json()); // Parse JSON bodies

const UserDetail = require('./model/UserDetail');

router.use(session({
    secret: "Thisisoursecrets",
    resave: false,
    saveUninitialized: false
}));


mongoose.connect("mongodb+srv://admin-avinash:Avinash123@cluster0.azuhh.mongodb.net/hitbookDB", { useNewUrlParser: true });
// mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
    username: String,
});

userSchema.plugin(passportLocalMongoose);

// endpoint to add a user
router.post('/user', async (req, res) => {
    try {
        // Create a new user instance with request body
        const newUser = new UserDetail(req.body);

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'User added successfully.',
            data: newUser,
            error: null
        });
    } catch (error) {
        console.error('Error while adding user:', error);
        res.status(500).json({
            success: false,
            message: 'Error while adding user.',
            error: error.message
        });
    }
});

// endpoint to get a all user
router.get('/user', function (req, res) {
    UserDetail.find({}, function (err, Users) {
        if (err) {
            res.status(500).json({
                data: null,
                message: 'Error retrieving users.',
                error: err,
                status: 500,
            });
        } else {
            res.status(200).json({
                data: Users,
                message: 'Users retrieved successfully.',
                error: null,
                status: 200,
            });
        }
    });
});

// endpoint to get a user by id
router.get("/user/:userId", function (req, res) {
    UserDetail.find({ _id: req.params.userId }, function (err, User) {
        if (err) {
            res.status(500).json({
                data: null,
                message: 'Error retrieving user.',
                error: err,
                status: 500,
            });
        } else {
            res.status(200).json({
                data: User,
                message: 'User retrieved successfully.',
                error: null,
                status: 200,
            });
        }
    });

});


// endpoint to update a user
router.put("/user/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const updateFields = req.body;

        // Validate request body to prevent unintended updates
        const allowedUpdates = ['username', 'name', 'email']; // Define allowed fields
        const updates = Object.keys(updateFields);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({
                success: false,
                message: 'Invalid updates!',
                error: null
            });
        }

        // Attempt to update the user
        const user = await UserDetail.findByIdAndUpdate(userId, updateFields, { new: true });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                error: null
            });
        }

        // If the user was successfully updated
        res.status(200).json({
            success: true,
            message: 'User updated successfully.',
            data: user,
            error: null
        });
    } catch (error) {
        // If an error occurs during the update process
        console.error('Error while updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error while updating user.',
            error: error.message
        });
    }
});

router.delete("/user/:userId", function (req, res) {
    UserDetail.deleteOne({ _id: req.params.userId })
        .then(deletedUser => {
            res.status(200).json({
                data: deletedUser,
                message: 'User deleted successfully.',
                error: null,
                status: 200,
            });
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            res.status(500).json({
                data: null,
                message: 'Error deleting user.',
                error: error,
                status: 500,
            });
        });
});


router.listen(process.env.PORT || 5000, function () {
    console.log("Server is running on 5000.");
});