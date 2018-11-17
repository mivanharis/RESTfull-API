/*
* REQUEST HANDLERS
*
*/

//DEPENDENCIES
var _data = require('./data');
var helpers = require('./helpers');

// DEFINE THE HANDLERS
var handlers = {};

//USERS
handlers.users = function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data,callback);
    } else {
        callback(405);
    };
};

//CONTAINER FOR THE USERS SUBMETHODS
handlers._users = {};

// USERS-POST
//REQUIRED DATA: firstName, lastName, phone, password, tosAgreement
//OPTIONAL DATA: none
handlers._users.post = function(data,callback){
    //CHECK THAT ALL REQUIRED FIELDS ARE FILLED OUT
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement){
        //MAKE SURE THAT THE USER DOESNT ALREADY EXIST
        _data.read('users',phone,function(err,data){
            if (err){
                //HASH THE PASSWORD
                var hashedPassword = helpers.hash(password);
                //CREATE USER OBJECT
                if(hashedPassword){
                    var userObject = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'phone' : phone,
                        'hashedPassword' : hashedPassword,
                        'tosAgreement' : true 
                    };

                    //STORE THE USER
                    _data.create('users',phone,userObject,function(err){
                        if(!err){
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500,{'error' : 'Could not create the new user'});
                        }
                    });                    
                } else {
                    callback(500,{'error' : 'Could not has the user\'s password'});
                }

            } else {
                //USER ALREADY EXIST
                callback(400,{'error' :'A user with that phone number already exist'});
            }
        });
    } else {
        callback(400,{'error' :'Missing required fields'});
    };
};

// USERS-GET
//REQUIRED DATA: phone
//OPTIONAL DATA: none
// @TODO ONLY LET AN AUTHENTICATED USER ACCESS THEIR OBJECT. DON'T LET THEM ACCESS ANYONE
handlers._users.get = function(data,callback){
    //CHECK THE phone NUMBER
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        //LOOKUP THE USER
        _data.read('users',phone,function(err,data){
            if(!err && data) {
                //REMOVE THE HASHED PASSWORD FROM THE USER OBJECT BEFORE RETURNINGN IT TO THE REQUESTER
                delete data.hashedPassword;
                callback(200,data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400,{'Error' : 'Missing required field'});
    }
};

// USERS-PUT
//REQUIRED DATA : phone
//OPTIONAL DATA : firstName, lastName, password (AT LEAST OE MUST BE SPECIFIED)
// @TODO ONLY LET AN AUTHENTICATED USER UPDATE THEIR OWN OBJECT. DONT LET THEM UPDATE ANYONE ELSE
handlers._users.put = function(data,callback){
    //CHECK THE REQUIRED FIELD
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    
    //CHECK FOR THE OPTIONAL FIELD
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    //ERROR IF THE phone IS INVALID
    if(phone){
        //ERROR IF NOTHING IS SENT TO UPDATE
        if(firstName || lastName || password){
            //LOOKUP THE USER
            _data.read('users',phone,function(err,userData){
                if(!err && userData){
                    //UPDATE THE FIELDS NECESSARY
                    if(firstName){
                        userData.firstName = firstName;
                    }
                    if(lastName){
                        userData.lastName = lastName;
                    }
                    if(password){
                        userData.hashedPassword = helpers.hash(password);
                    }
                    //STORE THE NEW UPDATES
                    _data.update('users',phone,userData,function(err){
                        if(!err){
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500,{'Error' : 'Could not update the user'});
                        }
                    });
                } else {
                    callback(400,{'Error' : 'The specified user does not exist'});
                }
            });
        } else {
            callback(400,{'Error' : 'Missing field to update'});
        }
    } else {
        callback(400,{'Error' : 'Missing required field'});
    }
};

// USERS-DELETE
handlers._users.delete = function(data,callback){

};

//PING HANDLER
handlers.ping = function(data,callback){
	callback(200);
};

//DEFINE NOT FOUND HANDLERS
handlers.notFound = function(data,callback){
	callback(404);

};


module.exports = handlers