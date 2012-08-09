var spawn = require('child_process').spawn;



function _rename(oldname,newname,callback){

	var rename = spawn('mv',[oldname,newname]);
	console.log("mv",oldname,newname);


	rename.stderr.on('data',function(data){
		callback(data.toString());
	});

	rename.on('exit',function(code){
		if(code !== 0){
			callback(code.toString());
		}else{
			callback(null);
		}
	})
}

function zip(folder,zip,callback){
	var zip = spawn("zip",["-rq",zip,folder]);
	zip.stdout.on('data',function(data){
		process.stdout.write(data);
	});
	zip.stderr.on('data',function(err){
		callback(err.toString());
	});

	zip.on('exit',function(code){
		if(code !== 0){
			callback(code);
		}else{
			callback(null);
		}
	});

}


function unzip(zip,folder,callback){
	var unzip = spawn('unzip',["-oq",zip]);

	var foldername = zip.split(".zip")[0];


	folder = folder || foldername;


	console.log("unzip -oq",zip);
	unzip.stdout.on('data',function(data){
		process.stdout.write(data);
	});

	unzip.stderr.on('data',function(data){
		callback(data.toString());
	});

	unzip.on('exit',function(code){
		if(code !== 0){
			callback(code.toString());
			process.end("zip exit with code",code);
		}else{
			if(folder !== foldername){
				_rename(foldername,folder,function(err,data){
					callback(err,data);
				});
			}
		}
	});
}


module.exports = {
	zip:zip,
	unzip:unzip

}