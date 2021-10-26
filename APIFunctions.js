const config = require("./config");
const requestify = require("requestify");
const mongoHelpers = require('./mongoFunctions.js');
const { MongoClient } = require('mongodb');
const { ObjectID } = require('bson');

const accountSid = config.cred.accountSid;
const authToken = config.cred.authToken;
const client = require("twilio")(accountSid, authToken);

function isAuthorized(req, res, next) {
    const auth = req.headers.authorization;
    if (auth === config.cred.secretpassword) {
      next();
    } else {
      res.status(401);
      res.send('Not permitted');
    }
}

function uploadNewUser(body) {
    var user = {
      "_id" : new ObjectID(),
      "name":body.name,
      "risk":body.risk,
      "lat":body.lat,
      "lon":body.lon,
      "phone":body.phone,
      "email":body.email
    };
    mongoHelpers.mongoUpload("main", user);
}

async function getAQIData(body) {
    let regularResponse = await getRegularResponse(body);
    let forecastResponse = await getForecastResponse(body);
    return {regularResponse, forecastResponse}
}
  
async function getRegularResponse(body){
    let url =
    "https://api.breezometer.com/air-quality/v2/current-conditions?lang=en&key=496bfcfb6ddd40ef831e29858c8ba7a9&metadata=extended_aqi&features=breezometer_aqi,local_aqi,health_recommendations,sources_and_effects,dominant_pollutant_concentrations,pollutants_concentrations,all_pollutants_concentrations,pollutants_aqi_information&lat=" +
    body.lat +
    "&lon=" +
    body.lon +
    "&all_aqi=true";
  
    return await requestify.get(url).then(async function (response) {
      let res = await response.getBody();
      return res.data;
    });
}
  
async function getForecastResponse(body){
    let url = 
    "https://api.breezometer.com/air-quality/v2/forecast/hourly?lang=en&key=496bfcfb6ddd40ef831e29858c8ba7a9&features=breezometer_aqi,local_aqi&hours=12&lat=" + 
    body.lat +
    "&lon=" +
    body.lon;
  
    try{
      return await requestify.get(url).then(async function (response) {
        let res = await response.getBody();
        return res.data;
      });
    }
    catch{
      console.log("Bad Location")
      return "Bad Location"
    }
}
  
//driver function for notifying users regarding data. Called each morning
async function notifyUsers() {
    const users = await getUsers();
    console.log(users, users.length)
    for (var i = 0; i < users.length; i++) {
      let user = users[i];
      let userLocationInfo = await getForecastResponse(user);
      if (userLocationInfo != "Bad Location"){
        let parsedUserDangerInfo = parseUserDangerInfo(userLocationInfo, 2)//user.risk); //reformat data to usable state
        textUser(parsedUserDangerInfo, user.phone);
      }
    }
    console.log("done")
}
  
//return json array of objects, each element representing a user in the format uploaded -- NICK
async function getUsers() {
    return await mongoHelpers.mongoRead("main","data");
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

exports.isAuthorized = isAuthorized
exports.uploadNewUser = uploadNewUser
exports.getAQIData = getAQIData
exports.getRegularResponse = getRegularResponse
exports.getForecastResponse = getForecastResponse
exports.notifyUsers = notifyUsers
exports.getUsers = getUsers
exports.parseUserDangerInfo = parseUserDangerInfo
exports.textUser = textUser
