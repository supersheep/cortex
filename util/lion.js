var request = require("request");
var config = require("../config");

function get(opt,callback){
	var key = opt.key,
		env = opt.env;

	if(["alpha","qa","pro"].indexOf(env) == -1){
		callback(new Error("环境必须为alpha,qa或pro，请检查config.js"));
	}else{
		request('http://lionapi.dp:8080/getconfig?e=' + env + '&k=' + key, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	callback(null,body);
		  }else if(error){
		  	throw new Error(error);
		  }else{
		  	throw new Error("statusCode "+response.statusCode);
		  }
		})
	}
}

exports.get = get;
