"use strict";
var
lang = require("../../util/lang"),
async = require("async"),
DB = require("../../util/db");


function UpdateDB(options){
    this.options = options;
};


UpdateDB.prototype = {
    setup:function(done){
        this.env.updateList = [];
        done();
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

    run: function(done){

        var self = this,
						table =  this.options.dbversion,
            updatelist = this.env.updatelist,
            db = new DB(this.options),
            tasks = [function(done){
                db.connect(self.options.lion_newdb,function(err,conn,dbconfig){
                    console.log("已连接数据库");
                    done();
                });
            }];


        updatelist.forEach(function(pair){
            var key = pair.URL;
            tasks.push(function(done){
                var qs = db.sqlMaker("select",table,{},{URL:key});
                
                db.query(qs, function(err, rows) {
                    if(err) throw err;
                    var row = rows[0],
                        query = row
                            ? db.sqlMaker("update",table,pair,{
                                URL:key
                            })
                            : db.sqlMaker("insert",table,lang.mix({
                                AddDate:self._getNow()
                            },pair));

                    db.query(query,function(err){
                        if(err) throw err;
                        console.log((row?"更新":"插入") + " " + JSON.stringify(pair));
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
    }
};


exports.create = function(options){
    return new UpdateDB(options);
};

exports.DESCRIBE = "同步新库中表的MD5与FileType值"
