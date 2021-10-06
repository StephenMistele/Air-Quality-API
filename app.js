const express = require('express')
const app = express()
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

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/uploaduser', isAuthorized, (req,res) => {
    uploadData(req);
    res.json([{
      status: 'Upload successful'
    }])
})

app.get('/healthcheck', (req,res) => {
    res.status(200).json([{
      status: 'Still Alive'
    }])
})

function uploadData(req)
{
    return;
}


app.listen(port, () => console.log(`Example app listening on port ${port}!`))