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

const insertDocuments = function(db, key, value){     //Takes produced SPARQL results from not finding product in MongoDB to insert new data
  console.log("Begin Insert");
  const collection = db.collection(collectionName);
  collection.insertOne({
    product: key, manufacturer: value},
    function(err, result){
      assert.equal(err, null)
      console.log("Inserted to the collection <" + collectionName + ">");
  });
}

const findDocuments = function(db, key, callback){    //Makes requset to MongoDB for the given search term
  console.log("Begin Find");
  const collection = db.collection(collectionName);         //Grabs the collection
  collection.find({product: key}).toArray(function(err, docs){    //Gets all documents matching the given 'key' term
    console.log("Found:");
    console.log(docs);
    if(docs === null || docs === undefined || docs.length < 1){   //If no results or empty array results, query wikidata for the data
      console.log("Here")                         //SPARQL request gets the specified product, then finds all manufacturers who make that product
      const SPARQL = `
        SELECT ?manufacturerLabel
        WHERE
        {
          ?product ?label \"` + key + `\"@en.
          ?manufacturer wdt:P1056 ?product.
          SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
        }`    //P1056: 'product or material produced', ?label gets the wikidata page for the product matching 'key'
      var url = wdk.sparqlQuery(SPARQL)   //Makes the url for this query
      var receive = ''
      request(url, function(err, response, body) {    //Gets the result of the SPARQL query, turns into array of desired information
        receive = wdk.simplify.sparqlResults(body);
        console.log("SPARQL Return");
        console.log(receive);
        var manufacturers = []
        for(var i = 0; i < receive.length; i++){      //Yeah
          manufacturers[i] = receive[i].manufacturerLabel;
        }
        insertDocuments(db, key, manufacturers);    //Insert newly found data from SPARQL, then request data again
        findDocuments(db, key, callback);
      });
    }
    else{         //If data already present, just return the relevant data immediately
      console.log("Out: " + docs[0].manufacturer)
      callback(docs[0].manufacturer);
    }
  });
}

const requestManufacturers = function(type){      //main function that can be run elsewhere, takes product type name (ex. 'smart phone')
  MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){    //connect to MongoDB with const url containing username/password
    assert.equal(null, err)                       //Check for error
    console.log("Connected Succesfully");
    const db = client.db(dbName);                 //Get the database from MongoDB

    findDocuments(db, type, function(docs){       //Seek out the documents specified by input
      client.close()                           //callback function: once done, close client and return the result
      console.log("Client Closed")
      return docs;
    })
  });
}

console.log("Out:" + requestManufacturers("marker"));   //example usage; pretty easy.
