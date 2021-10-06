const express = require('express')
const bodyParser = require('body-parser');
const app = express()
app.use(bodyParser.json());
const port = 3000

function isAuthorized(req, res, next) {
    const auth = req.headers.authorization;
    if (auth === 'secretpassword') {
      next();
    } else {
      res.status(401);
      res.send('Not permitted');
    }
}

app.post('/uploaduser', isAuthorized, (req,res) => {
    uploadData(req.body);
    res.json([{
      status: 'Upload successful'
    }])
})

app.get('/healthcheck', (req,res) => {
    res.status(200).json([{
      status: 'Still Alive'
    }])
})

function uploadData(body)
{
    let name = body.name;
    let age = body.age;
    let lat = body.lat;
    let lon = body.lon;
    let phone = body.phone;
    let email = body.email;
    return;
}

app.listen(port, () => console.log(`Listening on port ${port}`))