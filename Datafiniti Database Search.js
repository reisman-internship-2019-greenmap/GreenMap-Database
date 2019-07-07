var request = require('request');

// Set your API parameters here.
var API_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc19hZG1pbiI6ZmFsc2UsInN1YiI6IjI0NDEiLCJpc3MiOiJkYXRhZmluaXRpIiwiZW1haWwiOiJzaGVraGFyLmRld2FuQGdtYWlsLmNvbSJ9.4njrD817vaPdrHJbvZqLt7G64yKfIF4u1W4GmSumapg';
var format = 'JSON';
var query = 'upc:064642074768';
var num_records = 1;
var download = false;

var request_options = {
  url: 'https://api.datafiniti.co/v4/products/search',
  method: 'POST',
  json: {
    'query': query,
    'format': format,
    'num_records': num_records,
    'download': download
  },
  headers: {
    'Authorization': 'Bearer ' + API_token,
    'Content-Type': 'application/json'
  }
}

console.log(request_options);

// Make the API call.
request(request_options, function(error, response, body) {
  if (error) {
    console.log(error);
    console.log(response);
  } else {
    console.log(body);
  }
});
