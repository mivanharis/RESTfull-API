/*
	CREATE AND EXPORT CONFIGURATION VARIABLES
*/

// CONTAINER FOR ALL ENVIRONMENTS
var environments = {};


//STAGING (DEFAULT) ENVIRONMENT
environments.staging = {
	'httpPort' : 3000,
	'httpsPort' : 3001,
	'envName' : 'staging'
}


//PRODUCTION ENVIRONMENT
environments.production = {
	'httpPort' : 5000,
	'httpsPort' : 5001,
	'envName' : 'production'
}


//DETERMINE WHICH ENVIRONMENT WAS PASSED AS A COMAND-LINE ARGUMENT
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//CHECK THAT THE CURRENT ENVIRONMENT IS ONE OF THE ENVIRONMENTS ABOVE, IF NOT DEFAULT TO STAGING
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//EPORT THE MODULE
module.exports = environmentToExport;