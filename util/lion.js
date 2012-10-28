var config = require("../config");

var pairs = {
	"dp-common-web.imgResourceServer":'[["i1.s1.static.dp","i2.s1.static.dp","i3.s1.static.dp"],["i1.s2.static.dp","i2.s2.static.dp","i3.s2.static.dp"],["i1.s3.static.dp","i2.s3.static.dp","i3.s3.static.dp"],["i1.s4.static.dp","i2.s4.static.dp","i3.s4.static.dp"]]',
	"dbhost":config.dbhost,
	"dp-common-service.common.master.jdbc.username":config.dbuser,
	"dp-common-service.common.master.jdbc.password":config.dbpassword,
	"dp-common-service.common.master.jdbc.url":"jdbc:mysql://"+config.dbhost+":3306/"+config.dbdatabase+"?characterEncoding=UTF8"
}

function get(key,callback){

	callback(null,pairs[key]);
}

exports.get = get;
