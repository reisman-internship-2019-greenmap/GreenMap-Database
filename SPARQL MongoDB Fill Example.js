const MongoClient = require('mongodb').MongoClient;
var request = require('request');
const wdk = require('wikidata-sdk');
const assert = require('assert')
//Custom values to connect to a specific MongoDB context, a database therein, and a collection in that database.

const username = "patsy";
const password = "patsy";
const context = "greenmap";
const dbName = "sample_test";
const collectionName = 'hold';
const url = "mongodb+srv://" + username + ":" + password + "@" + context + "-crohe.gcp.mongodb.net/test?retryWrites=true"

const insertDocuments = function(db, key, value){     //Insertion method
  console.log("Begin Insert");
  const collection = db.collection(collectionName);
  collection.insertOne({
    product: key, manufacturer: value},
    function(err, result){
      assert.equal(err, null)
      console.log("Inserted to the collection <" + collectionName + ">");
  });
}

const findDocuments = function(db, key, callback){     //Retrieval method, all data. Need specification.
  console.log("Begin Find");
  const collection = db.collection(collectionName);
  collection.find({product: key}).toArray(function(err, docs){
    console.log("Found:");
    console.log(docs);
    if(docs === null || docs === undefined || docs.length < 1){
      console.log("Here")
      const SPARQL = `
        SELECT ?manufacturerLabel
        WHERE
        {
          ?product ?label \"` + key + `\"@en.
          ?manufacturer wdt:P1056 ?product.
          SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
        }`
      var url = wdk.sparqlQuery(SPARQL)
      var receive = ''
      request(url, function(err, response, body) {
        receive = wdk.simplify.sparqlResults(body);
        console.log("SPARQL Return");
        console.log(receive);
        var manufacturers = []
        for(var i = 0; i < receive.length; i++){
          manufacturers[i] = receive[i].manufacturerLabel;
        }
        insertDocuments(db, key, manufacturers);
        findDocuments(db, key, callback);
      });
    }
    else{
      console.log("Out: " + docs[0].manufacturer)
      callback(docs[0].manufacturer);
    }
  });
}

const requestManufacturers = function(type){
  MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){
    assert.equal(null, err)
    console.log("Connected Succesfully");
    const db = client.db(dbName);

    findDocuments(db, type, function(docs){
      client.close()
      console.log("Client Closed")
      return docs;
    })
  });
}

console.log("Out:" + requestManufacturers("smartphone"));
