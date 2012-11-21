var mysql = require('mysql');
var lion = require('./lion');
var url = require("url");
var EventProxy = require("./event-proxy");


function DB(){}

DB.prototype = {

sqlMaker: function(type,table,pairs,where){
	var ret = "";

	function stripValue(v){
		return typeof v == "string" ? ("\"" + v + "\"") : v;
	}

	function vals(pairs){
		return Object.keys(pairs).map(function(key){
			var v = pairs[key];
			return stripValue(v)
		});
	}

	function setParam(pairs,joinner){
		var ret = [];
		for(var key in pairs){
			ret.push(key+ "=" + stripValue(pairs[key]) );
		}

		return ret.join(joinner);
	}

	function selectParam(pairs){
		if(!pairs || !Object.keys(pairs).length){
			return "*";
		}else{
			return Object.keys(pairs).join(",");
		}
	}

	function tickKeysInWhere(pairs,where){
		var ret = {};
		for(var key in pairs){
			if(!(key in where)){
				ret[key] = pairs[key]
			}
		}
		return ret;
	}


	if(type == "select"){
		ret = "select " + selectParam(pairs) + " from " + table + " where " + setParam(where," and ");
	}else if(type == "insert"){
		ret = "insert into " + table + " (" + Object.keys(pairs).join(",") + ") values (" + vals(pairs).join(",") + ")";
	}else if(type == "update"){
		ret = "update " + table + " set " + setParam(tickKeysInWhere(pairs,where),",") + " where " + setParam(where," and ");
	}else{
		throw new Error("type must be select, insert or update");
	}

	return ret;

},

connect : function (lion_db_prefix,cb){
	var prefix_map = {
		"old":"avatar-biz.main.master.jdbc.",
		"new":"dp-common-service.common.master.jdbc."
	};
	var prefix = lion_db_prefix;

	//if(connection){
	//	cb(null,connection);
	//}
	var connection = null;

	var dbconfig = {};
	var eventproxy = new EventProxy(function(){
		var conn_opt = {
			host: dbconfig.host,
			user: dbconfig.username,
			password: dbconfig.password,
			port:dbconfig.port,
			database: dbconfig.database
		};
		
		connection = mysql.createConnection(conn_opt);
		connection.on("error",cb);
		connection.connect();
		self.connection = connection;
		cb(null,connection,conn_opt);
	});

	var tasks = ["username","password","url"];
	console.log("正在获取数据库配置...");
	tasks.forEach(function(action){
		eventproxy.assign(action);
	});

	tasks.forEach(function(action){
		lion.get({
			env:config.env,
			key:prefix+action
		},function(err,data){
			if(err){cb(err);return;}
			var parsed;
			if(action === "url"){
				parsed = url.parse(data.split("jdbc:")[1]);
				dbconfig["host"] = parsed.hostname;
				dbconfig["port"] = parsed.port;
				dbconfig["database"] = parsed.pathname.substr(1);
			}else{
				dbconfig[action] = data;
			}
			eventproxy.trigger(action);
		});
	});
},

query:function(){
	var args = arguments;
	var cb;
	var connection = this.connection;
	var itv = setTimeout(function(){
		cb("数据库连接超时");
	},10*1000);

	if(args.length >= 3){
		cb = args[2];
		connection.query(args[0],arg[1],mysqlcb);
	}else{
		cb = args[1];
	}

	function mysqlcb(err,rows,fields){
		clearTimeout(itv);
		if(err){
			cb("数据库查询出错"+err);
		}

		cb(null,rows,fields);
	}

	connection.query(args[0],mysqlcb);
},

end:function(){
	this.connection && this.connection.end();
}

}


module.exports = DB;