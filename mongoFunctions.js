const { MongoClient } = require('mongodb');
const config = require("./config");
const uri = `mongodb+srv://${config.config.db.DB_USER}:${config.config.db.DB_PASS}@${config.config.db.DB_HOST}?retryWrites=true&w=majority`;
const { ObjectID } = require('bson');

const mongoRead = (db,collection_name,res) =>{
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
    const collection = client.db(db).collection(collection_name);
    // perform actions on the collection object
    collection.find({}).toArray(function(err,result){
        if(err){
        res.status(400).json([{
        status: 'Failure from Mongo'
        }])
        throw err;
        }
        client.close();
        console.log("result in func:");
        console.log(result);
        res.status(200).json([{
        status: 'Read from Mongo',
        result: result
        }])
        });
    });
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