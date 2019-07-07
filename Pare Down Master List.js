const request = require('request');
const assert = require("assert");
const fs = require('fs');

var file1 = "Company Master List.txt"
var wikirate_url = "https://wikirate.org/"

var file_data = []

var promise = new Promise(function(resolve, reject){
  fs.readFile(file1, 'utf-8', (err, data) => {
    if(err){
      throw err;
    }
    data = data.split("\r\n")
    var i = 0;

    var total = 0
    var active = 0

    total_comp = data.length
    for(i; i < total_comp; i++){
      company = data[i];
      total++
      active++
      var promise_in = new Promise(function(resolve, reject){
        var in_term = company
        var company_url = in_term.replace(" ", "%20")
        request(wikirate_url + company_url + ".json", function(err, response, body){
          assert.equal(err, null);
          body = JSON.parse(body)
          if(body.hasOwnProperty("error_status")){
            console.log("Reject " + in_term)
            reject()
          }
          else{
            console.log("Accept " + in_term)
            resolve(in_term)
          }
        })
      });

      promise_in.then(function(name){
        file_data.push(name);
        active--;
        if(active == 0 && total == total_comp){
          resolve();
        }
      }).catch(function(){
        active--;
        if(active == 0 && total == total_comp){
          resolve();
        }
      });
    }
  });
});
promise.then(function(){
  data = ""
  var j = 0
  for(j = 0; j < file_data.length; j++){
    data += file_data[j] + "\n";
  }
  fs.writeFile("pared_list.txt", data, (err) => {
    if (err) console.log(err);
    console.log("Success")
  })
}).catch(function(){

});
