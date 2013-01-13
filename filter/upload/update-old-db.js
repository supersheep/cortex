"use strict";
var
lang = require("../../util/lang"),
async = require("async"),
fs = require("fs"),
DB = require("../../util/db"),
path = require('path'),
fsmore = require('../../util/fs-more');


function UpdateDB(options){
    this.options = options;
};


UpdateDB.prototype = {
    setup:function(done){
        this.env.updatelist = [];
        done();
    },
    run: function(done){
        var self = this,
            db = new DB(this.options),
            tasks = [];
            
        self._getFileList();

        tasks = [function(done){
            db.connect(self.options.lion_olddb,function(err,conn,dbconfig){
                console.log("已连接数据库");
                done();
            });
        }];

        for(var key in this.filelist){
            (function(key){
                tasks.push(function(done) {
                    self._updateVersion(db,key,function(){
                        done();
                    });
                });
            })(key);
        }

        // update /x_x/version.js 及 /x_x/version.min.js
        ["/x_x/version.js","/x_x/version.min.js"].forEach(function(url){
            tasks.push(function(done){
                var table = self.options.dbversion,
                    where = {"URL":url},
                    q =  db.sqlMaker("select",table,{},where);

                db.query(q,function(err,rows){
                    if(err)throw err;
                    var row = rows[0],
                        new_version = row?(row.Version+1):1,
                        pair = {URL:url,Version:new_version,MD5:"v"+new_version,FileType:0},
                        query = row
                        ? db.sqlMaker("update",table,pair,where)
                        : db.sqlMaker("insert",table,pair);

                    
                    db.query(query,function(err){
                        if(err)throw err;
                        console.log((row?"更新":"插入") + " " + JSON.stringify(pair));
                        self.env.updatelist.push(pair);
                        done();
                    });
                });
            });
        });




        async.series(tasks,function(err){
            if(err){throw err;}else{
                console.log("更新完成");
                db.end();
                done(null);
            }
        });
    },

    _fileTypeByPath: function(p){

        function prefixWith(arr,p){
            return arr.some(function(prefix){
                return p.indexOf(prefix) == 1;
            });
        }

        function isJs(p){
            return path.extname(p) == ".js"
        }

        // file as fx/core.js 
        // the regexp to test will be /fx\/.+\.js/
        function inPackage(p){
            return packageList.some(function(pkgname){
                return new RegExp(pkgname+ "\\\/.+\\\.js").test(p);
            });
        }

        function inNeuron(p){
            return /neuron/.test(p);
        }

        var packageList = ['switch','io','util','fx','event'];

        var map = {
            "1":["lib/1.0"],
            "2":["s/j/app"],
            "3":["t/jsnew/app/"],
            "4":["b/js/app"]
        };


        for(var key in map){
            if(
                prefixWith(map[key],p)
                && isJs(p)
                && !inPackage(p)
                && !inNeuron(p)
            ){
                return key
            }
        }    
        return 0;
    },
    _getFileList: function(){
        var filelist_path = fsmore.stdPath( path.join(this.env.local_dir, ".cortex", "md5.json") );
        
        if(!fs.existsSync(filelist_path)){
            throw new Error("未包含 .cortex/md5.json");
        }
        
        this.filelist = require(filelist_path);
    },
    
    _getNow:function(){
        var now = new Date();
        function addZero(number){
            var ret = number > 9 ? number : "0" + number;
            return ""+ret;
        }
        return lang.sub("{0}-{1}-{2} {3}:{4}:{5}",[now.getFullYear(),now.getMonth()+1,now.getDate(),now.getHours(),now.getMinutes(),now.getSeconds()].map(function(number){
            return addZero(number);
        }));
    },

    _updateVersion: function(db, key,done){
        var self = this,
            table = this.options.dbversion,
            where = {URL:key},
            qs = db.sqlMaker("select",table,{},where);

        db.query(qs, function(err, rows) {
            if(err) throw err;
            var row = rows[0],
                new_version = row?(row.Version+1):1,
                md5code = self.filelist[key],
                now = self._getNow(),
                pair = {URL:key,Version:new_version,MD5:md5code,FileType:self._fileTypeByPath(key)},
                query = row
                    ? db.sqlMaker("update",table,pair,where)
                    : db.sqlMaker("insert",table,lang.mix({AddDate:now},pair));

            db.query(query,function(err){
                if(err)throw err;
                console.log((row?"更新":"插入") + " " + JSON.stringify(pair));
                self.env.updatelist.push(pair);
                done();
            });
        });
    }
};


exports.create = function(options){
    return new UpdateDB(options);
};
exports.DESCRIBE = "更新DianPing库中表的MD5与FileType值"