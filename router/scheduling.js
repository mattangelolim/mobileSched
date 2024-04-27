const express = require("express");
const router = express.Router();
const Schedule = require("../models/schedules");
const { Op } = require("sequelize");

router.post("/create/schedule", async (req, res) => {
  try {
    const { date, start_time, end_time, professor } = req.body;
    const status = req.body.status.toUpperCase();
    const username = req.cookies.username;

    // // Use the username as needed
    // console.log("Username:", username);

    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);
    if (new Date(date) < currentDate) {
      return res.status(400).json({ message: "Date cannot be in the past" });
    }

    const existingSchedule = await Schedule.findOne({
      where: {
        [Op.and]: [
          { date },
          { start_time },
          { end_time },
          { createdBy: username },
        ],
      },
    });

    // If there's an existing schedule, return a response indicating that the schedule already exists
    if (existingSchedule) {
      return res.status(400).json({ message: "Schedule already exists" });
    }

    if (status === "WORK FROM HOME") {
      await Schedule.create({
        status,
        date,
        start_time,
        end_time,
        professor,
        display: "1",
        createdBy: username,
      });
    } else {
      await Schedule.create({
        status,
        date,
        start_time,
        end_time,
        professor,
        createdBy: username,
      });
    }

    // Return a success response
    res.status(201).json({ message: "Schedule created successfully" });
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

module.exports = router;
