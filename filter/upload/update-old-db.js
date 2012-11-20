var

path = require('path'),
fsmore = require('../../util/fs-more');


function UpdateDB(options){
    this.options = options;
};


UpdateDB.prototype = {
    run: function(callback){
        
    },
    
    _getFileList: function(){
        var filelist_path = fsmore.stdPath( path.join(this.env.local_dir, ".cortex", "filelist.json") );
        
        if(!fs.existsSync(filelist_path)){
            throw new Error("未包含 .cortex/filelist.json");
        }
        
        this.filelist = require(filelist_path);
        
    },
    
    _updateVersion: function(db, key){
        var where = {URL:key},
            qs = db.sqlMaker("select",table,{},where);

        db.query(qs, function(err, rows) {
            if(err) throw err;
            var row = rows[0],
                new_version = row?(row.Version+1):1,
                pair = {URL:key,Version:new_version,FileType:fileTypeByPath(key)},
                query = row
                    ? db.sqlMaker("update",table,pair,where)
                    : db.sqlMaker("insert",table,pair);

            db.query(query,function(err){
                if(err)throw err;
                console.log((row?"更新":"插入") + " " + JSON.stringify(pair));
                   updateList.push(pair);
                done();
            });
        });
    }
};


tasks.push(function(done){
            updateDataBases(local_dir, function(){
                var lock_path = path.join(opts.dir,".cortex","success.lock");
                fsmore.writeFileSync(lock_path,"");
                process.exit();
                
                done();
            });
        });