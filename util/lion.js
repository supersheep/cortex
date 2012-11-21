var request = require("request");

function get(opt,callback){
	var key = opt.key,
	env = opt.env,
	host = opt.pattern,
	url = pattern.replace("{env}",env).replace("{key}",key);

	if(["alpha","qa","pro"].indexOf(env) == -1){
		callback(new Error("请传入环境参数，可为alpha,qa或pro"));
	}else if(host){
		callback(new Error("请传入参数指定lionhost"));
	}else{	
		console.log("请求"+url+"获取lion配置");
		request(url, function (error, response, body) {
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
