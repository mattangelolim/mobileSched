const express = require("express");
const router = express.Router();
const Schedule = require("../models/schedules");
const Enroll = require("../models/enrolled");
const { Op } = require("sequelize");
const User = require("../models/user");

router.post("/enroll/sched", async (req, res) => {
  try {
    const username = req.cookies.username;
    const { code } = req.body;

    const findStudent = await User.findOne({
      where: {
        username: username,
        user_type: "Student",
      },
      attributes: ["code"],
    });
    if (!findStudent) {
      return res.status(400).json({ message: "Not a student " });
    }

    const checkIfEnrolled = await Enroll.findOne({
      where: {
        username: username,
        code: code,
      },
    });
    if (checkIfEnrolled) {
      return res.status(400).json({ message: "Already enrolled" });
    }
    await Enroll.create({
      username,
      student_code: findStudent.code,
      code,
    });
    res.status(200).json({ message: "Successfully Enrolled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/get/enrolled", async (req, res) => {
  try {
    const username = req.cookies.username;

    const EnrolledScheds = await Enroll.findAll({
      where: {
        username: username,
      },
      attributes: ["code"],
    });

    res.json(EnrolledScheds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/show/schedules", async (req, res) => {
  try {
    const { code } = req.body;

    const sched = await Schedule.findAll({
      where: {
        code: code,
      },
    });

    res.json(sched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
