import fetch from "node-fetch";
import express from "express";
import bodyParser from "body-parser";
const app = express()
app.use(bodyParser.json());
const port = 3000

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
  /*formatting
  name = body.name;
  age = body.age;
  weight = body.weight;
  lat = body.lat;
  lon = body.lon;
  phone = body.phone;
  email = body.email;
  */
  return;
}

async function getAQIData(body)
{
  const response = await fetch("https://api.breezometer.com/air-quality/v2/current-conditions?lang=en&key=496bfcfb6ddd40ef831e29858c8ba7a9&metadata=extended_aqi&features=breezometer_aqi,local_aqi,health_recommendations,sources_and_effects,dominant_pollutant_concentrations,pollutants_concentrations,all_pollutants_concentrations,pollutants_aqi_information&lat=" + body.lat + "&lon=" + body.lon + "&all_aqi=true");
  const res = await response.json();
  delete res.metadata;
  return res;
}

//driver function for notifying users regarding data. Called each morning
function notifyUsers(){
  const users = getUsers();
  for(var i = 0; i < users.length; i++) {
    let user = users[i];
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
function parseUserDangerInfo(userLocationInfom, age, weight){
  return;
}

function textUser(parsedUserDangerInfo, phone){
  return;
}

app.listen(port, () => console.log(`Listening on port ${port}`))