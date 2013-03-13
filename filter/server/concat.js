var fs = require("fs");
var path = require("path");
var async = require("async");

/**
 * 分析build.json中的数据，返回[{path:...,data:...}]
 */
function parse(root,data){
    console.log("正在为 " + path.basename(root) + " 建立合并规则");
    return data.map(function(rule){
        return {
            path: rule.output, 
            data: {
                type:path.extname(rule.output),
                files:rule.path.map(function(filename){
                    return path.join(root,rule.folder,filename);
                })
            }
        }
    });
}

function out(req,res,data){
    res.type(data.type);
    
    var tasks = data.files.map(function(file){
        return function(done){
            var readable = fs.createReadStream(file);
            readable.on("end",function(){
                done();
            });
            readable.on("data",function(chunk){
                res.write(chunk);
            });
        }
    });
    async.series(tasks,function(){
        res.end();
    });
}

exports.out = out;
exports.parse = parse;