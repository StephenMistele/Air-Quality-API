const express = require('express')
const bodyParser = require('body-parser');
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
    let name = body.name;
    let age = body.age;
    let gender = body.gender;
    let weight = body.weight;
    let lat = body.lat;
    let lon = body.lon;
    let phone = body.phone;
    let email = body.email;
    return;
}

app.listen(port, () => console.log(`Listening on port ${port}`))