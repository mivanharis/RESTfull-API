/*
* HELPERS FOR VARIOUS TASK
*
*/

//DEPENDENCIES
var crypto = require('crypto');
var config = require('./config');

//CONTAINER FOR ALL THE HELPERS
var helpers = {};

//CREATE SHA256 HASH
helpers.hash = function (str){
    if(typeof(str) == 'string' && str.length > 0){
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

//PARSE A JSON STRING TO AN OBJECT IN ALL CASES, WITHOUT THROWING
helpers.parseJsonToObject = function(str){
    try{
        var obj = JSON.parse(str);
        return obj;
    } catch(e){
        return {};
    }
};

//EXPORT THE MODULE
module.exports = helpers;