const wdk = require('wikidata-sdk');
const request = require('request');

const authorQid = 'Q535';
const sparql = `
SELECT ?item ?itemLabel ?pic ?linkTo
WHERE
{
  wd:Q50102300 wdt:P176* ?item
  OPTIONAL { ?item wdt:P176 ?linkTo }
  OPTIONAL { ?item wdt:P18 ?pic }
  SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
}
`
const url = wdk.sparqlQuery(sparql);

request(url, function(err, response, body) {
  simplifiedResults = wdk.simplify.sparqlResults(body);
  console.log(simplifiedResults);
});