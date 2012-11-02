var config = require("../config");

var pairs = {
	"dp-common-web.imgResourceServer":'[["i1.s1.static.dp","i2.s1.static.dp","i3.s1.static.dp"],["i1.s2.static.dp","i2.s2.static.dp","i3.s2.static.dp"],["i1.s3.static.dp","i2.s3.static.dp","i3.s3.static.dp"],["i1.s4.static.dp","i2.s4.static.dp","i3.s4.static.dp"]]',
	"avatar-biz.main.master.jdbc.url":"jdbc:mysql://192.168.8.44:3306/DianPing?characterEncoding=UTF8",
	"avatar-biz.main.master.jdbc.username":"aspnet_user",
	"avatar-biz.main.master.jdbc.password":"dp!@78()-=",
	"dp-common-service.common.master.jdbc.url":"jdbc:mysql://192.168.8.44:3306/DianPingCOMM?characterEncoding=UTF8",
	"dp-common-service.common.master.jdbc.username":"dpcom_comm",
	"dp-common-service.common.master.jdbc.password":"dp!@C5NsYGTPg"
}

function get(opt,callback){
	var key = opt.key,
		env = opt.env;

	if(["dev","alpha","beta","pro"].indexOf(env) == -1){
		callback(new Error("invalid env",env));
	}

	callback(null,pairs[key]);
}

exports.get = get;
