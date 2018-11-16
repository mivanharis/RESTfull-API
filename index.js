/*
	PRIMARY FILE FOR THE API
*/


//DEPENDENCIES
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

//INSTANTIATE THE HTTP SERVER
var httpServer = http.createServer(function(request,response){
	unifiedServer(request,response);
});

//START THE HTTP SERVER
httpServer.listen(config.httpPort,function(){
	console.log("The server is listening on port "+config.httpPort);
});

//INSTANTIATE THE HTTP SERVER
var httpsServerOptions = {
	'key' : fs.readFileSync('./https/key.pem'),
	'cert' : fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(request,response){
	unifiedServer(request,response);
});

//START THE HTTPS SERVER
httpsServer.listen(config.httpsPort,function(){
	console.log("The server is listening on port "+config.httpsPort);
});

//ALL THE SERVER LOGIC FOR BOTH THE HTTP AND HTTPS SERVER
var unifiedServer = function(request,response){

	//GET THE URL AND PARSE IT
	var parsedUrl = url.parse(request.url,true);

	//GET THE PATH
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');

	//GET THE QUERY STRING AS AN OBJECT
	var queryStringObject = parsedUrl.query;

	//GET THE HTTP METHOD
	var method = request.method.toLowerCase();

	//GET THE HEADERS AS AN OBJECT
	var headers = request.headers;

	//GET THE PAYLOAD, IF ANY
	var decoder = new StringDecoder('utf-8'); 
	var buffer = '';
	request.on('data',function(data){
		buffer += decoder.write(data);
	});
	request.on('end',function () {
		buffer += decoder.end();

		//CHOOSE THE HANDLER THIS REQUEST SHOULD GO TO. IF ONE IS NOT FOUND, USE THE 'notFound' HANDLER
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		//CONSTRUCT THE DATA OBJECT  TO SEND TO THE HANDLER
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : buffer
		};

		//ROUTE THE REQUEST TO THE HANDLER SPECIFIED IN THE ROUTER
		chosenHandler(data,function (statusCode,payload) {
			//USE THE STATUS CODE CALLED BACK BY THE HANDLER, OR DEFAULT TO 200
	        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

			//USE THE PAYLOAD  CALLED BACK BY THE HANDLER, OR DEFAULT TO AN EMPTY OBJECT
			payload = typeof(payload) == 'object'? payload : {};

			//CONVERT THE PAYLOAD TO A STRING
			var payloadString = JSON.stringify(payload);

			//RETURN THE RESPONSE
			response.setHeader('Content-Type','application/json');
			response.writeHead(statusCode);
			response.end(payloadString);

			//LOG THE REQUEST PATH
			console.log('returning this response: ',statusCode,payloadString);

		});
	});
};

// DEFINE THE HANDLERS
var handlers = {};

//PING HANDLER
handlers.ping = function(data,callback){
	callback(200);
};

//DEFINE NOT FOUND HANDLERS
handlers.notFound = function(data,callback){
	callback(404);

};

//DEFINE A REQUEST ROUTER
var router = {
	'ping' : handlers.ping
}