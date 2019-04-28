console.log('word');
console.log('another')
console.log('results')    //test print statements

const wdk = require('wikidata-sdk');    //include wikidata-sdk into the project
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;  //include xmlhttprequest into the project

const url = wdk.searchEntities('Ingmar Bergman');   //compose a wikidata search for 'Ingmar Bergman' (the url address)
var xmlHttp = new XMLHttpRequest();                 //get the object to make URL http request
xmlHttp.open("GET", url, false);              //make the url request, retrieve results
xmlHttp.send(null);
console.log(url);                             //print the URL searched, and the returned results
console.log(xmlHttp.responseText);
console.log(' ');
