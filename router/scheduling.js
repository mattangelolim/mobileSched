const express = require("express");
const router = express.Router();
const Schedule = require("../models/schedules");
const { Op } = require("sequelize");
const User = require("../models/user");
const Enroll = require("../models/enrolled");
const Range = require("../models/range");
const nodemailer = require("nodemailer");

router.post("/create/schedule", async (req, res) => {
  try {
    const { start_time, end_time, professor, description } = req.body;
    let day = req.body.day;
    const username = req.cookies.username;

    day = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

    // Find the user's code
    const findUser = await User.findOne({
      where: {
        username: username,
        user_type: "Professor",
      },
      attributes: ["code"],
    });

    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the schedule already exists
    const existingSchedule = await Schedule.findOne({
      where: {
        day: day,
        start_time: start_time,
        end_time: end_time,
        code: findUser.code,
      },
    });

    if (existingSchedule) {
      return res.status(400).json({ message: "Schedule already exists" });
    }

    // Create the new schedule
    await Schedule.create({
      day,
      start_time,
      end_time,
      professor,
      description,
      code: findUser.code,
    });

    res.status(200).json({ message: "Schedule created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/set/schedules", async (req, res) => {
  try {
    const username = req.cookies.username;

    const findUser = await User.findOne({
      where: {
        username: username,
      },
      attributes: ["code"],
    });

    const sched = await Schedule.findAll({
      where: {
        code: findUser.code,
      },
    });

    res.json(sched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});
router.post("/create/status", async (req, res) => {
  try {
    // const username = req.cookies.username;
    const { status, id } = req.body;

    const findSchedule = await Schedule.findOne({
      where: {
        id: id,
      },
      attributes: ["day", "start_time", "end_time", "description", "code"],
    });
    if (findSchedule) {
      await Schedule.update({ status: status }, { where: { id: id } });

      const studentCode = await Enroll.findAll({
        where: {
          code: findSchedule.code,
        },
        attributes: ["student_code"],
      });

      const codes = studentCode.map((enroll) => enroll.student_code);

      const userEmails = await User.findAll({
        where: {
          code: codes,
          user_type: {
            [Op.ne]: "Professor",
          },
        },
        attributes: ["email"],
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "ioeclassmonitoring@gmail.com",
          pass: "pjqf ltkp dtnw hisp",
        },
      });
      const mailOptions = {
        from: "ioeclassmonitoring@gmail.com",
        subject: `ANNOUNCEMENT FOR SCHEDULE ${findSchedule.description} on ${findSchedule.day} from ${findSchedule.start_time} to ${findSchedule.end_time}`,
        text:
          `Dear Students,\n\n` +
          `This is to inform you regarding the status of your class scheduled for ${findSchedule.day} from ${findSchedule.start_time} to ${findSchedule.end_time}.\n\n` +
          `Class Description: ${findSchedule.description}\n` +
          `Class Status: ${status}\n\n` +
          `Please note that this email is generated automatically.\n\n` +
          `Thank you,\nIOE Admin`,
      };

      userEmails.forEach(async (user) => {
        mailOptions.to = user.email;
        try {
          await transporter.sendMail(mailOptions);
          console.log("Email sent to: " + user.email);
        } catch (error) {
          console.error("Error sending email to " + user.email + ": ", error);
        }
      });
    }

    res.status(201).json({
      message: "Announcement sent Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/all/schedules", async (req, res) => {
  try {
    const username = req.cookies.username;
    const currentDate = new Date();
    const UpcomingSchedules = await Schedule.findAll({
      where: {
        createdBy: username,
        date: {
          [Op.gt]: currentDate,
        },
      },
    });

    res.json(UpcomingSchedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/active/schedules", async (req, res) => {
  try {
    const Scheds = await Schedule.findAll({
      where: {
        display: "1",
      },
    });

    res.json(Scheds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/scan/qr", async (req, res) => {
  try {
    const id = req.body.id;

    await Schedule.update({ display: "1" }, { where: { id } });

    res.status(200).json({ message: "Display updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/set/sem/range", async (req, res) => {
  try {
    const username = req.cookies.username;
    const { number } = req.body;

    // Find the user code of the professor
    const professorUserCode = await User.findOne({
      where: {
        username: username,
        user_type: "Professor",
      },
      attributes: ["code"],
    });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + parseInt(number));

    // Create a new record in the Range table
    await Range.create({
      startDate: startDate,
      endDate: endDate,
      code: professorUserCode.code,
    });

    res.status(200).json({ message: "Semester range set successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/check/sem/range", async (req, res) => {
  try {
    const username = req.cookies.username;
    // Find the user code of the professor
    const professorUserCode = await User.findOne({
      where: {
        username: username,
        user_type: "Professor",
      },
      attributes: ["code"],
    });

    const rangeReponse = await Range.findOne({
      where: {
        code: professorUserCode.code,
      },
    });

    if (!rangeReponse) {
      return res.json(null);
    }

    res.json(rangeReponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/check/sem/ranges", async (req, res) => {
  try {
    const code = req.query.code;

    const rangeReponse = await Range.findOne({
      where: {
        code: code,
      },
    });

    if (!rangeReponse) {
      return res.json(null);
    }

    res.json(rangeReponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
