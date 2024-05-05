const express = require("express");
const app = express();
const cors = require("cors");
const port = 9000;
const cookieParser = require("cookie-parser");
const path = require("path");
const multer = require('multer'); 
const { createReadStream } = require('fs');
const qrCodeReader = require('qrcode-reader'); // library for decoding QR codes
const Jimp = require('jimp'); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('qrImage'), (req, res) => {
  if (!req.file) {
      return res.status(400).send('No file uploaded');
  }

  // Load the uploaded image using Jimp
  Jimp.read(req.file.buffer, (err, image) => {
      if (err) {
          return res.status(500).send('Error reading image');
      }

      // Decode QR code from the image
      const qr = new qrCodeReader();
      qr.callback = (err, value) => {
          if (err) {
              return res.status(400).send('Error decoding QR code');
          }
          res.send({
              message: 'QR code decoded successfully',
              data: value.result,
          });
      };
      qr.decode(image.bitmap);
  });
});

const UserAuthentication = require("./router/authentication");
const Scheduling = require("./router/scheduling");
const studentRoutes = require("./router/studentRoutes");

app.use("/", UserAuthentication, Scheduling, studentRoutes);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
