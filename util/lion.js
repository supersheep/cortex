var request = require("request");

function get(opt,callback){
	var key = opt.key,
		env = opt.env,
		url = 'http://lionapi.dp:8080/getconfig?e=' + env + '&k=' + key;


	if(["alpha","qa","pro"].indexOf(env) == -1){
		callback(new Error("环境必须为alpha,qa或pro，请检查config.js"));
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
