const express = require("express");
const User = require("../models/user");
const Enroll = require("../models/enrolled");
const router = express.Router()

router.get("/get/profesors", async (req, res) => {
    try {
        const profs = await User.findAll({
            where: {
                user_type: "Professor"
            }
        })
        res.json(profs)

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})

router.post("/delete/user", async (req, res) => {
    try {
        const { code } = req.query
        const deleteUser = await User.destroy({
            where: {
                code: code
            }
        })
        await Enroll.destroy({
            where:{
                code:code
            }
        })
        res.json(deleteUser)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})

router.get("/get/students", async (req, res) => {
    try {
        const students = await User.findAll({
            where: {
                user_type: "Student"
            }
        })
        res.json(students)

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})

module.exports = router