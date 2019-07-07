const MongoClient = require('mongodb').MongoClient;
var request = require('request');
const wdk = require('wikidata-sdk');
const assert = require('assert')
//Custom values to connect to a specific MongoDB context, a database therein, and a collection in that database.

const username = "patsy";
const password = "patsy";
const context = "greenmap";
const dbName = "sample_test";
const collectionHold = 'hold';
const collectionManufacturer = 'manufacturers'
const collectionProducts = 'products'
const url = "mongodb+srv://" + username + ":" + password + "@" + context + "-crohe.gcp.mongodb.net/test?retryWrites=true"

const requestManufacturers = function(type, callback){      //main function that can be run elsewhere, takes product type name (ex. 'smart phone')
  MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){    //connect to MongoDB with const url containing username/password
    assert.equal(null, err)                       //Check for error
    console.log("Connected Succesfully");
    const db = client.db(dbName);                 //Get the database from MongoDB
    acquirePreferredType(db, type, function(prefType){
      findManufacturers(db, prefType, function(docs){       //Seek out the documents specified by input
        attachESG(db, docs, function(final){
          client.close()                           //callback function: once done, close client and return the result
          console.log("Client Closed")
          console.log(final)
          callback(final)
        })
      })
    })
  });
}

const acquirePreferredType = function(db, type, callback){
    console.log("Begin Getting Preferred Product Type");
    const collection = db.collection(collectionProducts);
    collection.find({product: type}).toArray(function(err, docs){
      console.log(docs)
      if(docs === null || docs === undefined || docs.length < 1){
        SPARQLQueryProduct(db, type, function(documents){
          insertProduct(db, type, documents, function(){
            acquirePreferredType(db, type, callback)
          })
        })
      }
      else{
        //do the valid tag, parent check, then expansive exploration if not valid
        callback(type); //condition on valid tag
    }
    });
}

const insertProduct = function(db, type, superclasses, callback){
  console.log("Begin Insert into collection <products>")
  const collection = db.collection(collectionProducts);
  var valid = existenceProduct(type)
  collection.insertOne({
    product: type, valid: valid, superclass: superclasses},
    function(err, result){
      assert.equal(err, null)
      console.log("Inserted to the collection <products>")
      callback()
  });
}

const existenceProduct = function(term){
  var SPARQL = `
    SELECT ?productLabel
    WHERE
    {
      ?product ?label \"` + term + `\"@en.
      SERVICE wikibase:label {bd:serviceParam wikibase:language "en"}
    }`
  var url = wdk.sparqlQuery(SPARQL)
  request(url, function(err, response, body){
    console.log(wdk.simplify.sparqlResults(body))
    return (wdk.simplify.sparqlResults(body).length > 0);
  })
}

const SPARQLQueryProduct = function(db, key, callback){
  var SPARQL = `
    SELECT ?superclassLabel
    WHERE
    {
      ?product ?label \"` + key + `\"@en.
      ?prod ?code ?product.
      ?product wdt:P279 ?superclass.
      SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
    }
    group by ?superclassLabel`    //P1056: 'product or material produced', ?label gets the wikidata page for the product matching 'key'
  var url = wdk.sparqlQuery(SPARQL)   //Makes the url for this query
  var receive = ''
  request(url, function(err, response, body) {
    processSPARQLProduct(err, response, body, db, key, callback);
  })
}

const processSPARQLProduct = function(err, response, body, db, key, callback){
  receive = wdk.simplify.sparqlResults(body);
  console.log("SPARQL Return");
  console.log(receive)
  var productParents = []
  for(var i = 0; i < receive.length; i++){
    productParents[i] = receive[i].superclassLabel
  }
  callback(productParents);
}

const findManufacturers = function(db, key, callback){    //Makes request to MongoDB for the manufacturers of the given search term
  console.log("Begin Finding Manufacturers");
  //pass given product through products collection: synonyms, valid tag (is there a wikidata entry for it?)
  const collection = db.collection(collectionHold);         //Grabs the collection
  //get manufacturers from that proffered term
  //pack manufacturers with their esg scores
  collection.find({product: key}).toArray(function(err, docs){
    getManufacturers(db, key, docs, callback)
  });
}

const getManufacturers = function(db, key, docs, callback){    //Gets all documents matching the given 'key' term
  console.log("Found:");
  console.log(docs);
  if(docs === null || docs === undefined || docs.length < 1){   //If no results or empty array results, query wikidata for the data
    SPARQLQueryManufacturer(db, key, callback) //SPARQL request gets the specified product, then finds all manufacturers who make that product
  }
  else{         //If data already present, just return the relevant data immediately
    callback(docs[0].manufacturer);
  }
}

const SPARQLQueryManufacturer = function(db, key, callback) {
  var SPARQL = `
    SELECT ?manufacturerLabel
    WHERE
    {
      ?product ?label \"` + key + `\"@en.
      ?manufacturer wdt:P1056 ?product.
      SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
    }
    group by ?manufacturerLabel`    //P1056: 'product or material produced', ?label gets the wikidata page for the product matching 'key'
  var url = wdk.sparqlQuery(SPARQL)   //Makes the url for this query
  var receive = ''
  request(url, function(err, response, body){
    processSPARQLManufacturer(err, response, body, db, key, callback);
  })
}

const processSPARQLManufacturer = function(err, response, body, db, key, callback) {    //Gets the result of the SPARQL query, turns into array of desired information
  receive = wdk.simplify.sparqlResults(body);
  console.log("SPARQL Return");
  console.log(receive);
  var manufacturers = []
  for(var i = 0; i < receive.length; i++){      //Yeah
    manufacturers[i] = receive[i].manufacturerLabel;
  }
  insertHold(db, key, manufacturers);    //Insert newly found data from SPARQL, then request data again
  findManufacturers(db, key, callback);
}

const insertHold = function(db, key, value){     //Takes produced SPARQL results from not finding product in MongoDB to insert new data
  console.log("Begin Insert into collection <hold>");
  const collection = db.collection(collectionHold);
  collection.insertOne({
    product: key, manufacturer: value},
    function(err, result){
      assert.equal(err, null)
      console.log("Inserted to the collection <hold>");
  });
}

const attachESG = function(db, manufacturers, callback){
  console.log("Begin Attaching ESG to Manufacturers");
  const collection = db.collection(collectionManufacturer);
  var final = []
  attachManufacturer(collection, 0, manufacturers, final, callback)
}

const attachManufacturer = function(collection, place, manufacturers, final, callback){
  if(place === manufacturers.length){
    callback(final);
    return
  }
  collection.find({manufacturer: manufacturers[place]}).toArray(function(err, docs){
    assert.equal(err, null);
    if(docs.length < 1){
      var score = getESGScore(manufacturer)
      collection.insertOne({manufacturer: manufacturers[place], esg: score}, function(err, result){
        assert.equal(err, null)
        attachManufacturer(collection, place, manufacturers, final, callback);
      });
    }
    else{
      final[place] = docs
      attachManufacturer(collection, place + 1, manufacturers, final, callback);
    }
  })
}

const getESGScore = function(manufacturer){  //so we can easily replace this with real data
  return Math.floor((Math.random() * 80 + 20));
}

//How to use: as follows

var searchTerm = "smartphone"   //Your search term

var response = function(results){   //A callback function using the results
  console.log("Out:")
  console.log(results)
}

requestManufacturers(searchTerm, response); //The function call
