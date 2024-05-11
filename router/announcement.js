const express = require("express");
const router = express.Router();
const Announcement = require("../models/announcement");
const User = require("../models/user");
const moment = require('moment');
const nodemailer = require('nodemailer');
const { Op } = require("sequelize");

router.post("/create/announcement", async (req, res) => {
    try {
        const { announcement, expiration } = req.body;

        // Calculate expiration date based on current date
        const expirationDate = moment().add(expiration, "days").toDate();

        // Create the announcement
        const newAnnouncement = await Announcement.create({
            announcement: announcement,
            expiration_date: expirationDate
        });

        // Find emails of users who are not admins
        const userEmails = await User.findAll({
            where: {
                user_type: {
                    [Op.ne]: "Admin",
                },
            },
            attributes: ["email"],
        });

        // Create transporter for sending emails
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "ioeclassmonitoring@gmail.com",
                pass: "pjqf ltkp dtnw hisp",
            },
        });

        // Configure mail options
        const mailOptions = {
            from: "ioeclassmonitoring@gmail.com",
            subject: `ANNOUNCEMENT FOR ALL IOE USERS`,
            text:
                `Dear Students and Professors,\n\n` +
                `${announcement}.\n\n` +
                `Please note that this email is generated automatically.\n\n` +
                `Thank you,\nIOE Admin`,
        };

        // Send email to each user
        userEmails.forEach(async (user) => {
            mailOptions.to = user.email;
            try {
                await transporter.sendMail(mailOptions);
                console.log("Email sent to: " + user.email);
            } catch (error) {
                console.error("Error sending email to " + user.email + ": ", error);
            }
        });

        res.status(201).json({ message: "Announcement created successfully", newAnnouncement });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/get/announcements", async (req, res) => {
    try {
        const currentDate = new Date();
        const announcements = await Announcement.findAll({ where: { expiration_date: { [Op.gte]: currentDate } } });
        res.json({ announcements: announcements });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
