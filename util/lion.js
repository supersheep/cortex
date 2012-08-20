function get(key,callback){
	var data = '[["i1.s1.static.dp","i2.s1.static.dp","i3.s1.static.dp"],["i1.s2.static.dp","i2.s2.static.dp","i3.s2.static.dp"],["i1.s3.static.dp","i2.s3.static.dp","i3.s3.static.dp"],["i1.s4.static.dp","i2.s4.static.dp","i3.s4.static.dp"]]';
	var json;

	try{
		json = JSON.parse(data);
	}catch(e){
		callback(e);
	}

	callback(null,json);
}

exports.get = get;
