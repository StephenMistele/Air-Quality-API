const bodyParser = require("body-parser");
var cors = require("cors");
const express = require("express");
//config
const config = require("./config");
console.log("Running in node environment: "+process.env.NODE_ENV);
//
const requestify = require("requestify");
const app = express();
const port = 3000;
app.use(cors({ origin: true, credentials: true }));
app.options("*", cors());
app.use(express.json());
app.use(bodyParser.json());
const mongoHelpers = require('./mongoFunctions.js');
//monogo *deline
const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${config.config.db.DB_USER}:${config.config.db.DB_PASS}@${config.config.db.DB_HOST}?retryWrites=true&w=majority`;
const { ObjectID } = require('bson');
//mongo end *deline
app.set('json spaces',2)
app.use(cors())

const accountSid = "ACb7936c6e692c39dcbc6619762a0e3050";
const authToken = "ae3fbad708551624b1356406985f30ea";
const client = require("twilio")(accountSid, authToken);

app.get('/healthcheck', (req,res) => {
  res.status(200).json([{
    status: 'Still Alive'
  }])
})

app.get('/mongoread', (req, res) => {
  console.log("startofMain");
  res.setHeader("status","Attempting Read");
  console.log(res.getHeader("status"));
  console.log("header^");
  var result = mongoHelpers.mongoRead("sample_weatherdata",res);
  console.log("result in main: ");
  console.log(result);
})

app.get('/mongowrite', (req, res) => {
  console.log("startofMain");
  res.setHeader("status","Attempting write");
  console.log(res.getHeader("status"));
  console.log("header^");
  var myobj = {
    "_id" : new ObjectID(),
    "position":{
      "type":"Point",
      "coordinates":[-47.9,47.6]
    } ,
    "elevation":420,
    "callLetters":"KEVN",
    "type":"DUMB"
  };
  var result = mongoHelpers.mongoWrite("sample_weatherdata",myobj,res);
  console.log("result in main: ");
  console.log(result);
})
app.post('/uploaduser', isAuthorized, (req,res) => {
  uploadNewUser(req.body);
  res.json([{
    status: 'Upload successful'
  }])
})

app.post('/text', isAuthorized, (req,res) => {
  textUser(req.body.content, req.body.phone);
  res.json([
    {
      status: "Upload successful",
    },
  ]);
});

app.post("/getdata", isAuthorized, async (req, res) => {
  let temp = await notifyUsers(req.body);
  res.send(temp);
});

function isAuthorized(req, res, next) {
  const auth = req.headers.authorization;
  if (auth === 'secretpassword') {
    next();
  } else {
    res.status(401);
    res.send('Not permitted');
  }
}

function uploadNewUser(body) {
  /*DB entries should be formatted as such*/
  let name = body.name;
  let age = body.age;
  let weight = body.weight;
  let lat = body.lat;
  let lon = body.lon;
  let phone = body.phone;
  let email = body.email;
  console.log(name, age);
  return;
}

async function getAQIData(body) {
  let regularResponse = getRegularResponse(body);
  let forecastResponse = getForecastResponse(body);
  return {regularResponse, forecastResponse}
}

async function getRegularResponse(body){
  let regularUrl =
  "https://api.breezometer.com/air-quality/v2/current-conditions?lang=en&key=496bfcfb6ddd40ef831e29858c8ba7a9&metadata=extended_aqi&features=breezometer_aqi,local_aqi,health_recommendations,sources_and_effects,dominant_pollutant_concentrations,pollutants_concentrations,all_pollutants_concentrations,pollutants_aqi_information&lat=" +
  body.lat +
  "&lon=" +
  body.lon +
  "&all_aqi=true";

  return await requestify.get(regularUrl).then(function (response) {
    let res = response.getBody();
    return res.data;
  });
}

async function getForecastResponse(body){
  let forecastUrl = 
  "https://api.breezometer.com/air-quality/v2/forecast/hourly?lang=en&key=496bfcfb6ddd40ef831e29858c8ba7a9&features=breezometer_aqi,local_aqi&hours=12&lat=" + 
  body.lat +
  "&lon=" +
  body.lon;

  return await requestify.get(forecastUrl).then(function (response) {
    let res = response.getBody();
    return res.data;
  });
}

//driver function for notifying users regarding data. Called each morning
async function notifyUsers(body) {
  const users = getUsers();
  //for (var i = 0; i < users.length; i++) {
    let user = body; //users[i];
    let userLocationInfo = await getForecastResponse(user);
    let parsedUserDangerInfo = parseUserDangerInfo(
      userLocationInfo,
      user.risk,
    ); //reformat data to usable state
    textUser(parsedUserDangerInfo, user.phone);
  //}
}

//return json array of objects, each element representing a user in the format uploaded -- NICK
function getUsers() {
  return;
}

//parse breezeometer response for relevant data
function parseUserDangerInfo(userLocationInfo, risk) {
  let prediction = new Array();
  let max = 0;
  let avg = 0;
  for(let i = 0; i < userLocationInfo.length; i++){
    prediction.push(userLocationInfo[i].indexes.usa_epa_nowcast.aqi)
    avg+=prediction[i];
    if (prediction[i] > max)
      max = prediction[i];
  }
  avg = avg/userLocationInfo.length;
  let s = "The AIR quality index is currently " + prediction[0] + ", rising to " + max + " at its max and finishing the day at " + prediction[prediction.length-1] + ". ";
  let strEnd = "\n Given your risk demographics, there is nothing to worry about. Go enjoy the outdoors!";
  if (avg > 50 && avg <= 100 && risk > 2)
    strEnd = "\n Given your risk demographics, you might experience discomfort as a result of the air quality today. Try limiting outdoor activity if you start to feel affected.";
  else if (avg > 100 && avg <= 150 && risk == 1)
    strEnd = "\n Given your risk demographics, strenuous outdoor activity may cause health effects. If you start to feel sick, limit outdoor activity."
  else if (avg > 100 && avg <= 150 && risk > 1)
    strEnd = "\n Given your risk demographics, outdoor activity could cause negative health effects. Try to limit outdoor activity."
  else if (avg > 150)
    strEnd = "\nWARNING: Very poor air quality. Stay inside as much as possible to limit negative health effects."
  return s+strEnd;
}

function textUser(parsedUserDangerInfo, phone) {
  console.log("texting: ", phone, parsedUserDangerInfo);
  client.messages
    .create({
      body: parsedUserDangerInfo,
      from: "+12184132230",
      to: phone,
    })
    .then((message) => console.log(message));
  return;
}

app.listen(port, () => console.log(`Listening on port ${port}`));
