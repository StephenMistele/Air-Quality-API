const { MongoClient } = require('mongodb');
const config = require("./config");
const uri = `mongodb+srv://${config.config.db.DB_USER}:${config.config.db.DB_PASS}@${config.config.db.DB_HOST}?retryWrites=true&w=majority`;

async function mongoRead(db, collection_name) {
    let client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    var response;
    try {
        response = await client.db(db).collection(collection_name).find({}).toArray();
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.close();
    }
    return response;
}

async function mongoWrite(db, myobj) {
    let client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    var response;
    try {
        response = await client.db(db).collection("data").insertOne(myobj);
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.close();
    }
    return response;
}

exports.mongoRead = mongoRead;
exports.mongoUpload = mongoWrite;