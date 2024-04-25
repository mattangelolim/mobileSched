const express = require("express");
const router = express.Router();
const Schedule = require("../models/schedules");
const { Op } = require("sequelize");

router.post("/create/schedule", async (req, res) => {
  try {
    const { status, date, start_time, end_time, professor } = req.body;

    const currentDate = new Date();
    if (new Date(date) < currentDate) {
      return res.status(400).json({ message: "Date cannot be in the past" });
    }

    // Check if there's already a schedule with the same date, start time, and end time
    const existingSchedule = await Schedule.findOne({
      where: {
        [Op.and]: [{ date }, { start_time }, { end_time }],
      },
    });

    // If there's an existing schedule, return a response indicating that the schedule already exists
    if (existingSchedule) {
      return res.status(400).json({ message: "Schedule already exists" });
    }

    await Schedule.create({
      status,
      date,
      start_time,
      end_time,
      professor,
    });

    // Return a success response
    res.status(201).json({ message: "Schedule created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/all/schedules", async (req, res) => {
  try {
    const Scheds = await Schedule.findAll();

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
