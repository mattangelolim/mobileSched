const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post("/register/user", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    const checkUser = await User.findOne({
      where: {
        username: username,
        email: email,
      },
    });

    if (checkUser) {
      return res
        .status(400)
        .json({ message: "There is an existing user with this creds" });
    }

    await User.create({
      name,
      email,
      username,
      password,
    });

    res.status(200).json({ message: "user created success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/login/user", async (req, res) => {
  try {
    const { username, password } = req.body;

    const loginUser = await User.findOne({
      where: {
        username: username,
        password: password,
      },
    });
    if (!loginUser) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    res.cookie('username', username, { maxAge: 900000, httpOnly: true });
    
    res.status(200).json({ message: "User Login Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/logout/user", async (req, res) => {
  try {
    res.cookie('username', '', { expires: new Date(0), httpOnly: true });
    
    res.status(200).json({ message: "User Logout Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/get/user", async (req,res) =>{
  try {
    const username = req.cookies.username;

    const user = await User.findOne({
      where:{
        username:username
      },
      attributes:["name"]
    })

    res.json(user)
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
})

module.exports = router;
