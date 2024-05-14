const express = require("express");
const router = express.Router();
const Schedule = require("../models/schedules");
const Enroll = require("../models/enrolled");
const { Op } = require("sequelize");
const User = require("../models/user");
const Range = require("../models/range");

router.post("/enroll/sched", async (req, res) => {
  try {
    const username = req.cookies.username;
    const { code } = req.body;
    //

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

    // Fetch enrolled schedules for the user
    const enrolledScheds = await Enroll.findAll({
      where: {
        username: username,
      },
      attributes: ["code"],
    });

    // Extract codes from enrolled schedules
    const codes = enrolledScheds.map(enroll => enroll.code);

    // Fetch corresponding names for the codes
    const enrolledSchedNames = await User.findAll({
      where: {
        code: codes
      },
      attributes: ["code", "name"]
    });

    // Create a map of code to name
    const codeToNameMap = {};
    enrolledSchedNames.forEach(enroll => {
      codeToNameMap[enroll.code] = enroll.name;
    });

    // Prepare response object with code and corresponding name
    const response = enrolledScheds.map(enroll => ({
      code: enroll.code,
      name: codeToNameMap[enroll.code] 
    }));

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/show/schedules", async (req, res) => {
  try {
    const { code } = req.query;

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

router.get("/range/sched", async (req, res) => {
  try {
    const { code } = req.query;

    const sched = await Range.findOne({
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
