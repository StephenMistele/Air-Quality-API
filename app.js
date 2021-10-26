const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");

const config = require("./config");
const APIFunctions = require("./APIFunctions")
const mongoHelpers = require('./mongoFunctions.js');

const app = express();
const port = 3000;
console.log("Running in node environment: " + process.env.NODE_ENV);

app.set('json spaces', 2)
app.use(cors({ origin: true, credentials: true }));
app.options("*", cors());
app.use(express.json());

app.get('/healthcheck', (req, res) => {
  res.status(200).json([{
    status: 'Still Alive'
  }])
})

app.post('/uploaduser', APIFunctions.isAuthorized, (req, res) => {
  var response;
  try {
    response = APIFunctions.uploadNewUser(req.body);
  }
  catch (err) {
    res.status(400).json([{
      status: 'Failure from Mongo'
    }])
  }
  res.status(200).json([{
    status: 'Uploaded User',
    user: req.body,
    result: response
  }])
})

app.post("/getdata", APIFunctions.isAuthorized, async (req, res) => {
  let temp = await APIFunctions.getAQIData(req.body);
  res.send(temp);
});

app.get("/notifyUsers", APIFunctions.isAuthorized, async (req, res) => {
  APIFunctions.notifyUsers(req);
  res.json([
    {
      status: "Texting users",
    },
  ]);
});

//TEST FUNCTIONS
app.post("/text", APIFunctions.isAuthorized, async (req, res) => {
  APIFunctions.textUser(req.body.content, req.body.phone);
  res.send("texting?");
});

app.listen(port, () => console.log(`Listening on port ${port}`));
