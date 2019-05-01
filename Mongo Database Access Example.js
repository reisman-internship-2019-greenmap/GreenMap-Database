const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

//Custom values to connect to a specific MongoDB context, a database therein, and a collection in that database.

const username = "patsy";
const password = "patsy";
const context = "greenmap";
const dbName = "sample_test";
const collectionName = 'hold';
const url = "mongodb+srv://" + username + ":" + password + "@" + context + "-crohe.gcp.mongodb.net/test?retryWrites=true"

//Functions for retrieving/inserting data into a collection in a database given a connected client entity

//The callback argument is a function that is performed at the end of these functions, specified when called

const insertDocuments = function(db, callback){     //Insertion method
  console.log("Begin Insert");
  const collection = db.collection(collectionName);
  collection.insertMany([
    {a: 1, b:3}, {a:2}, {a:3}, {a:8}            //Fixed values, these need to change for our purposes
  ], function(err, result){
    assert.equal(err, null);
    assert.equal(4, result.result.n);
    assert.equal(4, result.ops.length);
    console.log("Inserted three documents to the collection <" + collectionName + ">");
    callback(result);
  });
}

const findDocuments = function(db, callback){     //Retrieval method, all data. Need specification.
  console.log("Begin Find");
  const collection = db.collection(collectionName);
  collection.find({}).toArray(function(err, docs){
    assert.equal(err, null);
    console.log("Found:");
    console.log(docs);
    callback(docs);
  });
}

const findNarrowDocuments = function(db, callback){   //Retrieval method, specified data
  console.log("Begin Narrow Find");
  const collection = db.collection(collectionName);
  collection.find({'a': 2}).toArray(function(err, docs){  //Within the `find({ ___ })` is where specify search terms
    assert.equal(err, null);
    console.log("Found:");
    console.log(docs);
    callback(docs);
  });
}

const updateDocuments = function(db, callback){   //Updates a document in a collection in a database in a context that matches a search term
  console.log("Begin Entry Update");
  const collection = db.collection(collectionName);
  collection.updateMany({a : 2, b : 1}, { $set: { b : 1 }, $set: {c : 4}}, function(err, result){   //{search term}, {$set: {appended term}} to do this, only first found
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Updated document succesfully");
    callback(result);
  })
}

const removeDocument = function(db, callback){    //Removes a document as specified by its fields
  console.log("Begin Document Deletion");
  const collection = db.collection(collectionName);
  collection.deleteOne({a : 3}, function(err, result){    //It's the whole {a : 3} part, can add terms probably.API isn't great.
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Removed document succesfully (containing {a : 3})");
    callback(result);
  })
}

const indexCollection = function(db, callback){   //Select specific field of a collection as that which is checked in queries of the database
  console.log("Begin indexing collection <" + collectionName + ">");
  db.collection(collectionName).createIndex(
    {a : 1},              //Index item {key : value}
    null,                 //Options
    function(err, results){
      console.log(results);
      callback();
    }
  );
};

//All of the deleteOne/updateOne methods also have deleteMany/updateMany.

//Main program begins here; the 'actual' code that is run.

MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){
  assert.equal(null, err);
  console.log("Connected Succesfully");
  const db = client.db(dbName);

  insertDocuments(db, function(){});

  findDocuments(db, function(){});

  findNarrowDocuments(db, function(){});

  updateDocuments(db, function(){});

  removeDocument(db, function(){});

  client.close();
  console.log("Client Closed");   //Important note is that this is asynchronous, so the Client Closed message may appear before previous tasks complete.
});
