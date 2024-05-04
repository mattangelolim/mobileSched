const express = require("express");
const app = express();
const cors = require("cors");
const port = 9000;
const cookieParser = require('cookie-parser');
const multer = require('multer');
const jsQR = require('jsqr');
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser())

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

app.post('/decode', upload.single('image'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    const imageData = fs.readFileSync(file.path);

    const qrCode = jsQR(imageData, file.size.width, file.size.height);

    if (qrCode) {
      res.json({ qrData: qrCode.data });
    } else {
      res.status(404).send('QR code not found in the image.');
    }
  } catch (error) {
    console.error('Error decoding QR code:', error);
    res.status(500).send('Internal server error.');
  }
});

const UserAuthentication = require("./router/authentication");
const Scheduling = require("./router/scheduling");
const studentRoutes = require("./router/studentRoutes")

app.use("/", UserAuthentication, Scheduling, studentRoutes);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
