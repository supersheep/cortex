var fs = require("fs");



function filelist_txt(file,callback){
	fs.readFile(file,'utf-8',function(err,data){
		if(err){
			callback(err);
		}else{
			callback(null,data.split("\n").filter(function(e){
				return e.trim()!=="";
			}));
		}
	});
}

function filelist_zip(file,callback){
	// not implemented 
}


function filelist(type,file,callback){
	if(type==="txt"){
		filelist_txt(file,callback);
	}else if(type==="zip"){
		filelist_zip(file,callback); 
	}
}


module.exports = filelist;