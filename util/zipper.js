var tracer = require("tracer").colorConsole();
var spawn = require('child_process').spawn;
var mod_path = require("path");


// function _rename(oldname,newname,callback){

// 	var rename = spawn('mv',[oldname,newname]);
// 	console.log("mv",oldname,newname);


// 	rename.stderr.on('data',function(data){
// 		callback(data.toString());
// 	});

// 	rename.on('exit',function(code){
// 		if(code !== 0){
// 			callback(code.toString());
// 		}else{
// 			callback(null);
// 		}
// 	})
// }

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
	var zip = zip.indexOf(".zip") === -1 ? zip+".zip" : zip;
	var foldername = mod_path.basename(zip,".zip");
	folder = folder || foldername;

	var unzip = spawn('unzip',["-o","../"+zip],{
		cwd:folder
	});


	console.log("解压 ",zip);
	unzip.stdout.on('data',function(data){
		process.stdout.write(data);
	});

	unzip.stderr.on('data',function(data){
		console.log(data.toString());
	});

	unzip.stdout.on('end',function(data){
		callback(null,"unzip done");
	});
	unzip.on('exit',function(code){
		if(code !== 0){
			process.exit("zip exit with code",code);
			callback(code.toString());
		}
	});
}


module.exports = {
	zip:zip,
	unzip:unzip

}
