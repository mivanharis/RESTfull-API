/*
	PRIMARY FILE FOR THE API
*/


//DEPENDENCIES
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

//THE SERVER SHOULD RESPOND TO ALL REQUEST WITH A STRING
var server = http.createServer(function(request,response){

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
			response.writeHead(statusCode);
			response.end(payloadString);

			//LOG THE REQUEST PATH
			console.log('returning this response: ',statusCode,payloadString);

		});

		// //SEND THE RESPONSE
		// response.end('Hello World!\n');

		//LOG THE REQUEST PATH
		// console.log('Request received on path: '+trimmedPath+ ' With this method : '+method+' and with these querys string parameters',queryStringObject);
		// console.log('Request received on this headers :', headers);
		// console.log('Request received on this payload :', buffer);
	});

	

});

// START THE SERVERM AND HAVE IT LISTEN ON POT 3000
server.listen(3000,function(){
	console.log("The server is listening on port 3000 now");
});

// DEFINE THE HANDLERS
var handlers = {};

// SAMPLE HANDLERS
handlers.sample = function(data,callback){
	// CALLBACK A HTTP SATATUS CODE, AND A PAYLOAD OBJECT
	callback(406, {'name' : 'sample handler'});

};

//DEFINE NOT FOUND HANDLERS
handlers.notFound = function(data,callback){
	callback(404);

};

//DEFINE A REQUEST ROUTER
var router = {
	'sample' : handlers.sample
}