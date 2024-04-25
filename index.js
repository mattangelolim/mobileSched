const express = require("express");
const app = express();
const cors = require("cors");
const port = 9000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const UserAuthentication = require("./router/authentication");
const Scheduling = require("./router/scheduling");

app.use("/", UserAuthentication, Scheduling);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
