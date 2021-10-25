const { MongoClient } = require('mongodb');
const config = require("./config");
const uri = `mongodb+srv://${config.config.db.DB_USER}:${config.config.db.DB_PASS}@${config.config.db.DB_HOST}?retryWrites=true&w=majority`;
const { ObjectID } = require('bson');
const mongoRead = (db,collection_name,res) =>{
    console.log("running mongoRead");
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
    const collection = client.db(db).collection(collection_name);
    // perform actions on the collection object
    collection.find({}).toArray(function(err,result){
        if(err){
        // res.status(400).json([{
        // status: 'Failure from Mongo'
        // }])
        throw err;
        }
        console.log("success");
        client.close();
        console.log("result: \n");
        console.log("result in func:");
        console.log(result);
        console.log("end");
        //res.send("UPDATED???");
        res.status(200).json([{
        status: 'Read from Mongo',
        result: result
        }])
        res.write("UPDATED???");
        });
    });
  }
  
  const mongoWrite = (db,myobj,res) =>{
        console.log("writing");
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
  exports.mongoWrite = mongoWrite;