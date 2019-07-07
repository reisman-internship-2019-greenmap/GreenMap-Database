const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

/*
In the current format, you would want to call relatedProductSearch() to get the results to be printed to the console;
needs to have the final returned value used to do something in the actual implementation.
*/

//So these are the verification to access the specified MongoDB thing kept in 'context', will need to be changed for your implementation
const username = "patsy";
const password = "patsy";
const context = "greenmap";
//This describes the database in the context we want to access
const dbName = "sample_test";
//This specifies the collection we want to access
const collectionName = "hold"
//This url is necessary for connecting to the database/our collection, should just need to substitute username/password/context to use a different MongoDB case
const url = "mongodb+srv://" + username + ":" + password + "@" + context + "-crohe.gcp.mongodb.net/test?retryWrites=true"

//Final output of the function is put in here; asynchronous wonkiness
var output = null

/*

So this function was made very flexible according to the given arguments, can probably be replaced with hardcoded stuff if you wanna do that.
Not sure how exactly this will be implemented on the server as the structure of the server code confuses me as to where this goes.

database_name: Different from the context in the url, the name of your MongoDB database
collection_name: Name of the collection we want to search through (can have multiple in MongoDB)
item_id: The identifying feature for the first thing we want to find in our database (barcode, item descriptor, etc.)
category_one: The category for which the item_id corresponds (what are we searching the documents -for-)
category_two: The category for which the similar items should share in value with the first document we search for
compare_category: The category for which we sort the results of the second search we performed for similar items to the first document.
callback_success: A function that tells the encompassing promise to move forward with its .then(function(...)) stuff
callback_failure: A function that tells the encompassing promise to move forward with its .catch(function(...)) stuff

*/

const getSimilarItems = function(database_name, collection_name, item_id, category_one, category_two, compare_category, callback_success, callback_failure){
  MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){
    assert.equal(null, err);
    console.log("Connected Succesfully");
    const db = client.db(database_name);
    const collection = db.collection(collection_name);  //get collection once connected
    var results = null
    var related_items = null                            //just some interim variables

    var promise = new Promise(function(resolve, reject) { //first promise to find single item in the database
      collection.find({[category_one] : item_id}).toArray(function(err, docs){
        assert.equal(err, null);
        console.log("First Item: ")     //This searches the collection for entities that, for the variable category_one
        console.log(docs)               //have the value item_id.
        results = docs[0];              //Should only get one hit, but is returned as an array so nab it.
        if(results === null || results === undefined || results.length < 1){
          reject();
        }
        else{
          resolve();
        }
      });
    });

    promise.then(function(){
      item_category = results[category_two];    //get the value at category_two for which we want all entities sharing that value
      var promise_two = new Promise(function(resolve, reject){    //Make a promise to get results from collection
        collection.find({[category_two] : item_category}).toArray(function(err, docs){
          assert.equal(err, null);          //Searches for documents that, for category_two, have the value item_category
          console.log("Second Item: ")
          console.log(docs)
          related_items = docs        //Get array of results to later sort out
          if(related_items === null || related_items === undefined || related_items.length < 1){
            reject();
          }
          else {
            resolve();
          }
        });
      });
      promise_two.then(function(){
        output = []
        related_items.sort(function(a, b){  //Sort array of documents by specified categorical term
          var x = a[compare_category]
          var y = b[compare_category]
          if(x < y){
            return -1
          }
          else if(x > y){
            return 1
          }
          else{
            return 0
          }
        });
        output = related_items.slice(0, 3)    //Slice sorted results for top 3 results
        client.close();
        console.log("Client Closed");
        callback_success()                    //Call resolve() on promise that called getSimilarItems forever ago
      }).catch(function(){
        console.log("No Documents found in same category as searched term")
        client.close();
        console.log("Client Closed");
        callback_failure()                  //Call reject() on promise that called getSimilarItems forever ago
      });
    }).catch(function(){
      console.log("No Document found for given item_id")
      client.close();
      console.log("Client Closed");
      callback_failure()                    //Call reject() on promise that called getSimilarItems forever ago
    });
  });
}

//Encompassing the promise, gotta return it somehow still? Not as familiar with javascript for this funkiness.

const relatedProductSearch  = function(database_name, collection_name, item_id, category_one, category_two, compare_category){
  //To keep asynchronous stuff in order, runs getSimilarItems in a promise whose resolve is given thereto
  var promise_final = new Promise(function(resolve, reject){
    getSimilarItems(database_name, collection_name, item_id, category_one, category_two, compare_category, resolve, reject);
  });

  //Once getSimilarItems is done, it does something with the result; integrate this however you like.
  promise_final.then(function(){
    console.log(output)
  }).catch(function(){
    console.log("Nope")
  });
}

//Make sure to remove the below

relatedProductSearch(dbName, collectionName, 1, "a", "b", "b");
