var pairs = {
	"dp-common-web.imgResourceServer":'[["i1.s1.static.dp","i2.s1.static.dp","i3.s1.static.dp"],["i1.s2.static.dp","i2.s2.static.dp","i3.s2.static.dp"],["i1.s3.static.dp","i2.s3.static.dp","i3.s3.static.dp"],["i1.s4.static.dp","i2.s4.static.dp","i3.s4.static.dp"]]',
	"dbhost":"192.168.8.44",
	"dp-common-service.common.master.jdbc.username":"dpcom_comm",
	"dp-common-service.common.master.jdbc.password":"dp!@C5NsYGTPg",
	"dp-common-service.common.master.jdbc.url":"jdbc:mysql://192.168.8.44:3306/DianPingCOMM?characterEncoding=UTF8"
}

function get(key,callback){

	callback(null,pairs[key]);
}

exports.get = get;
