const { MongoClient } = require('mongodb');
const config = require("./config");
const uri = `mongodb+srv://${config.config.db.DB_USER}:${config.config.db.DB_PASS}@${config.config.db.DB_HOST}?retryWrites=true&w=majority`;
const { ObjectID } = require('bson');

async function mongoRead (db,collection_name){
    console.log("a");
    let client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology : true });
    console.log("b");
    var response;
    try {
    response = await client.db(db).collection(collection_name).find({}).toArray();
    console.log("d");
    }
    catch(err){
        console.log(err);
    }
    finally {
       client.close();
    }
    return response;
  }

  const mongoWrite = (db,myobj,res) =>{
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        client.connect(err=> {
        client.db(db).collection("data").insertOne(myobj, function(err, result){
            if(err){
                res.status(400).json([{
                status: 'Failure from Mongo'
                }])
                throw err;
                }
          console.log("1 document inserted");
          res.status(200).json([{
            status: 'Wrote into Mongo',
            result: result
            }])
        })
        });
  }
  exports.mongoRead = mongoRead;
  exports.mongoUpload = mongoWrite;