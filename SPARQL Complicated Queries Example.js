const wdk = require('wikidata-sdk');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var request = require('request');

/*
const url = wdk.searchEntities({
  search: "Ingmar Bergman",
  format: "json",
  language: "en",
  limit: 10,
  continue: 10
});
*/
var xmlHttp = new XMLHttpRequest();
/*
xmlHttp.open("GET", url, false);
xmlHttp.send(null);
console.log(url);
console.log(xmlHttp.responseText);
console.log(' ');
*/
var SPARQL = `SELECT ?element ?elementLabel ?symbol ?number ?mass
WHERE
{
  ?element wdt:P31 wd:Q11344;
           wdt:P246 ?symbol;
           wdt:P1086 ?number;
           wdt:P2067 ?mass.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
}
ORDER BY ?mass`

var url2 = wdk.sparqlQuery(SPARQL);
console.log(url2)
xmlHttp.open("GET", url2, false);
xmlHttp.send(null);
console.log(url2);
//console.log(xmlHttp.responseText);
console.log(wdk.simplify.sparqlResults(xmlHttp.responseText));
console.log(' ');

request(url2, function(err, response, body) {
  simplifiedResults = wdk.simplify.sparqlResults(body);
  console.log('Second');
  console.log(simplifiedResults); //returned data is a String of json; simplifiedResults[0].symbol for example
});

const authorQid = 'Q535';
const sparql = `
SELECT ?item ?itemLabel ?pic ?linkTo
WHERE
{
  wd:Q50102300 wdt:P176* ?item.
  OPTIONAL { ?item wdt:P176 ?linkTo }
  OPTIONAL { ?item wdt:P18 ?pic }
  SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
}`
const url3 = wdk.sparqlQuery(sparql);

request(url3, function(err, response, body) {
  simplifiedResults = wdk.simplify.sparqlResults(body);
  console.log('Third');
  console.log(simplifiedResults);
});

const sparql2 = `
SELECT ?itemLabel
WHERE
{
  wd:Q22645 wdt:P279 ?item.
  SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
}`
const url4 = wdk.sparqlQuery(sparql2);

request(url4, function(err, response, body) {
  simplifiedResults = wdk.simplify.sparqlResults(body);
  console.log('Fourth');
  console.log(simplifiedResults);
});

var SPARQL3 = `
  SELECT ?superclassLabel
  WHERE
  {
    ?product ?label \"` + "smartphone" + `\"@en.
    ?prod ?code ?product.
    ?prod wdt:P279 ?superclass.
    SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
  }
  group by ?superclassLabel`

  const url5 = wdk.sparqlQuery(SPARQL3);

  request(url5, function(err, response, body) {
    simplifiedResults = wdk.simplify.sparqlResults(body);
    console.log('Fifth');
    console.log(simplifiedResults);
  });
