console.log('word');
console.log('another')
console.log('results')

const wdk = require('wikidata-sdk');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var request = require('request');

const url = wdk.searchEntities({
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
console.log(' ');

var SPARQL = `
  SELECT ?child WHERE{
    ?child wdt:P178 wd:Q312.
  }`

var url2 = wdk.sparqlQuery(SPARQL);
xmlHttp.open("GET", url2, false);
xmlHttp.send(null);
console.log(url2);
console.log(xmlHttp.responseText);
console.log(wdk.simplify.sparqlResults(xmlHttp.responseText));
console.log(' ');
