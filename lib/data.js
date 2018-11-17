/*
* LIBRARY FOR STORING AND EDITING DATA
*
*/

//DEPENDENCIES
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

//CONTAINER FOR THE MODULE (TO BE EXPORTED)
var lib = {};

//BASE DIRECTORY OF THE DATA FOLDER
lib.baseDir = path.join(__dirname,'/../.data/');

//WRITE DATA TO A FILE
lib.create = function(dir, file, data, callback){
	//OPEN THE FILE FOR WRITING
	fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err,fileDescriptor) {
		if(!err && fileDescriptor){
			//CONVERT DATA TO STRING
			var stringData = JSON.stringify(data);

			//WRITE TO FILE AND CLOSE IT
			fs.writeFile(fileDescriptor,stringData,function(err) {
				if (!err) {
					fs.close(fileDescriptor,function(err){
						if (!err) {
							callback(false);
						} else {
							callback('Error writing to new file');
						}
					})
				} else {
					callback('Error writing to new file');
				}
			});
		} else {
			callback('Could not create new file, it may already exist');
		}
	});
};

//READ DATA FROM A FILE
lib.read = function(dir,file,callback){
	fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf-8',function(err,data){
		if(!err && data){
			var parsedData = helpers.parseJsonToObject(data);
			callback(false,parsedData);
		} else {
		callback(err,data);
		}
	});
};

//UPDATE DATA INSIDE A FILE
lib.update = function(dir,file,data,callback){
	//OPEN THE FILE FOR Writing
	fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescriptor){
		if(!err && fileDescriptor){
			//CONVERT DATA TO STRING
			var stringData = JSON.stringify(data);

			//TRUNCATE THE FILE
			fs.ftruncate(fileDescriptor,function(err){
				if (!err) {
					//WRITE TO THE FILE AND CLOSE IT
					fs.writeFile(fileDescriptor,stringData,function(err){
						if (!err) {
							fs.close(fileDescriptor,function(err){
								if (!err) {
									callback(false);
								} else {
									callback('Error closing the file');
								}
							});
						} else {
							callback('Error writing existing file');
						}
					});
				} else {
					callback('Error truncating file');
				}
			});
		} else {
			callback('Could not open the file for updating, it ay not exist yet');
		}
	});
};

// DELETE A FILE
lib.delete = function(dir,file,callback){
	// UNLINK THE FILE
	fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
		if (!err) {
			callback(false);
		} else {
			callback('Error Deleting File');
		}
	});
};
//EXPORT THE MODULE
module.exports = lib;