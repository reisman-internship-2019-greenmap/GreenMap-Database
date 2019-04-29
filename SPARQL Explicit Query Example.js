console.log('word');
console.log('another')
console.log('results')

const wdk = require('wikidata-sdk');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const url = wdk.searchEntities({    //Can further define search parameters explicitly
  search: "Ingmar Bergman",
  format: "json",
  language: "en",
  limit: 10,
  continue: 10
});

var xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", url, false);
xmlHttp.send(null);
console.log(url);
console.log(xmlHttp.responseText);
console.log(' ');                       //All of this is the same as Wikidata Access Example.js
                                        //Here we can define a SPARQL query
var SPARQL = `
  SELECT ?child WHERE{
    ?child wdt:P178 wd:Q312.
  }`

var url2 = wdk.sparqlQuery(SPARQL);   //Generate the URL from an explicit SPARQL query
xmlHttp.open("GET", url2, false);     //Send the http request
xmlHttp.send(null);
console.log(url2);                    //Print the URL and results, both simplified and not.
console.log(xmlHttp.responseText);
console.log(wdk.simplify.sparqlResults(xmlHttp.responseText));
console.log(' ');
