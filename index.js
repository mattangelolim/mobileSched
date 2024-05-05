const express = require("express");
const app = express();
const cors = require("cors");
const port = 9000;
const cookieParser = require("cookie-parser");
const path = require("path");
const multer = require("multer");
const { createReadStream } = require("fs");
const qrCodeReader = require("qrcode-reader"); // library for decoding QR codes
const Jimp = require("jimp");

const User = require("./models/user");
const Enroll = require("./models/enrolled");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.single("qrImage"), async (req, res) => {
  try {
    const username = req.cookies.username;
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    // Load the uploaded image using Jimp
    const image = await Jimp.read(req.file.buffer);
    // console.log(image)

    // Decode QR code from the image
    const value = await new Promise((resolve, reject) => {
      const qr = new qrCodeReader();
      qr.callback = (err, value) => {
        if (err) {
          reject("Error decoding QR code");
        } else {
          resolve(value);
        }
      };
      qr.decode(image.bitmap);
    });

    console.log(value.result);

    const findUser = await User.findOne({
      where: {
        username: username,
        user_type: "Student",
      },
      attributes: ["username", "code"],
    });
    console.log(findUser.code)

    const checkifEnrolled = await Enroll.findOne({
      where: {
        username: username,
        code: value.result,
      },
    });
    
    if (checkifEnrolled) {
      return res.status(400).json({ message: "Already Enrolled" });
    }

    const success = await Enroll.create({
      username: username,
      student_code: findUser.code,
      code: value.result,
    });

    res.send({
      message: "QR code decoded successfully",
      data: success
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return res.status(500).send("Internal Server Error");
  }
});

const UserAuthentication = require("./router/authentication");
const Scheduling = require("./router/scheduling");
const studentRoutes = require("./router/studentRoutes");

app.use("/", UserAuthentication, Scheduling, studentRoutes);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
