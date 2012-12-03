"use strict";
var
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
                            : db.sqlMaker("insert",table,pair);

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
