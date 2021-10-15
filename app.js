const bodyParser = require("body-parser");
const { json } = require("express");
const express = require("express");
const request = require('request');
const app = express();
app.use(bodyParser.json());
const port = 3000

const accountSid = "ACb7936c6e692c39dcbc6619762a0e3050";
const authToken = "4e9196ca16458ce98ae4fd1c80b0ba68";
const client = require('twilio')(accountSid, authToken); 


app.get('/healthcheck', (req,res) => {
    res.status(200).json([{
      status: 'Still Alive'
    }])
})

app.post('/uploaduser', isAuthorized, (req,res) => {
    uploadData(req.body);
    res.json([{
      status: 'Upload successful'
    }])
})

app.post('/text', isAuthorized, (req,res) => {
  textUser(req.body.content, req.body.phone);
  res.json([{
    status: 'Upload successful'
  }])
})

app.post('/getdata', isAuthorized, async (req,res) => {
  let temp = await getAQIData(req.body);
  res.send(temp);
})

function isAuthorized(req, res, next) {
    const auth = req.headers.authorization;
    if (auth === 'secretpassword') {
      next();
    } else {
      res.status(401);
      res.send('Not permitted');
    }
}

function uploadData(body)
{
  /*formatting*/
  let name = body.name;
  let age = body.age;
  /*let weight = body.weight;
  let lat = body.lat;
  let lon = body.lon;
  let phone = body.phone;
  let email = body.email;*/
  console.log(name, age)
  return;
}

async function getAQIData(body)
{
  let url = "https://api.breezometer.com/air-quality/v2/current-conditions?lang=en&key=496bfcfb6ddd40ef831e29858c8ba7a9&metadata=extended_aqi&features=breezometer_aqi,local_aqi,health_recommendations,sources_and_effects,dominant_pollutant_concentrations,pollutants_concentrations,all_pollutants_concentrations,pollutants_aqi_information&lat=" + body.lat + "&lon=" + body.lon + "&all_aqi=true";
  try {
    let response = await request(url, function (error, response, body) {
      console.error('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    }).body;
    let res = JSON.parse(response);
    delete res.metadata;
    console.log(res);
    return res; 
  }
  catch {
    return "failed to query breezometer API";
  }
  
}

//driver function for notifying users regarding data. Called each morning
function notifyUsers(body){
  const users = getUsers();
  for(var i = 0; i < users.length; i++) {
    let user = body//users[i];
    let userLocationInfo = getAQIData(user);
    let parsedUserDangerInfo = parseUserDangerInfo(userLocationInfo, user.age, user.weight);//reformat data to usable state
    textUser(parsedUserDangerInfo, user.phone);
  }
}

//return json array of objects, each element representing a user in the format uploaded -- NICK
function getUsers(){
  return;
}

//parse breezeometer response for relevant data
function parseUserDangerInfo(userLocationInfo, age, weight){
  return;
}

function textUser(parsedUserDangerInfo, phone){
  console.log(phone);
  client.messages
    .create({
      body: parsedUserDangerInfo,
      from: '+12184132230',
      to: phone
    })
    .then(message => console.log(message));
  return;
}

app.listen(port, () => console.log(`Listening on port ${port}`))