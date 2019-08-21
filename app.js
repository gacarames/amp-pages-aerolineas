/*
Copyright 2017 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var fs = require('fs');
var express = require('express');
var formidable = require('formidable');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');

var credentials = {
  key: privateKey, 
  cert: certificate
};

var app = express();

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

var skuToSizeAndPrice;
var data;
// Sync
// data.citys = JSON.parse(fs.readFileSync('./database/data.json', 'utf8'));

// Async
fs.readFile('./database/data.json', 'utf8', function (err, response) {
  if (err) throw err;
    data = JSON.parse(response);
});

app.get('/api/citys/', function(req, res) {
  
  var query = req.query.q;
  
  var results = searchForArray(data.citys, query)

  var response = {
    items: [
      {
        query: query,
        results: results
      }
    ]
  };

  setTimeout(() => res.json(response), 100); // Simulate network delay.
});

app.use('/', express.static('static'));

httpServer.listen(8080, function () {
  console.log('Server for "Advanced Interactivity in AMP" listening http on port 8080!');
});

httpsServer.listen(8443, function () {
  console.log('Server for "Advanced Interactivity in AMP" listening https on port 8443!');
});

function searchForArray(array, toSearch) {
  var result = [];

  for (var i in array) {
    if (array[i].indexOf(toSearch) != -1)
      result.push(array[i]);
  }

  return result;
}

function trimString(s) {
  var l=0, r=s.length -1;
  while(l < s.length && s[l] == ' ') l++;
  while(r > l && s[r] == ' ') r-=1;
  return s.substring(l, r+1);
}

function compareObjects(o1, o2) {
  var k = '';
  for(k in o1) if(o1[k] != o2[k]) return false;
  for(k in o2) if(o1[k] != o2[k]) return false;
  return true;
}

function itemExists(haystack, needle) {
  for(var i=0; i<haystack.length; i++) if(compareObjects(haystack[i], needle)) return true;
  return false;
}

function searchForObjects(objects, toSearch) {
  var results = [];
  toSearch = trimString(toSearch); // trim it
  for(var i=0; i<objects.length; i++) {
    for(var key in objects[i]) {
      if(objects[i][key].indexOf(toSearch)!=-1) {
        if(!itemExists(results, objects[i])) results.push(objects[i]);
      }
    }
  }
  return results;
}



/*app.get('/shirts/sizesAndPrices', function(req, res) {
  var sku = req.query.sku;
  var response = {};
  response[sku] = skuToSizeAndPrice[sku];
  setTimeout(() => res.json(response), 1000); // Simulate network delay.
});*/

/*app.post('/shirts/addToCart', function(req, res) {
  // Necessary for AMP CORS security protocol.
  // @see https://github.com/ampproject/amphtml/blob/master/spec/amp-cors-requests.md
  res.setHeader('AMP-Access-Control-Allow-Source-Origin',
      'https://localhost:8443');

  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields) {
    if (fields.color && fields.size && fields.quantity) {
      res.status(200).json(fields);
    } else {
      res.status(400).json({error: 'Please select a size.'});
    }
  });
});*/
