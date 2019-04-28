console.log('word');
console.log('another')
console.log('results')

const wdk = require('wikidata-sdk');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const url = wdk.searchEntities('Ingmar Bergman');
var xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", url, false);
xmlHttp.send(null);
console.log(url);
console.log(xmlHttp.responseText);
console.log(' ');
