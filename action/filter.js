var 

fs = require("fs"),
lang = require("../util/lang"),
ActionFactory = require("../lib/action-factory"),
path = require("path"),
Filters = ActionFactory.create("filter");


Filters.AVAILIABLE_OPTIONS = {};

function showFileters(action){
    var filter = fs.readdirSync(path.join(__dirname,'..','filter',action));

    filter.forEach(function(filter_name){
        filter_name = path.basename(filter_name,".js")
        var filter_mod_path = path.join(__dirname,'..','filter',action,filter_name),
            filter,describe;

        try{
            filter = require(filter_mod_path);
            describe = filter.DESCRIBE;
            if(describe){
                console.log("\t"+filter_name + new Array(19-filter_name.length).join(" ") + describe);
            }
        }catch(e){

        }
            
    });
}
Filters.prototype.run = function() {
    var action = this.modules[0];
    var filter_actions = fs.readdirSync(path.join(__dirname,'..','filter'));

    if(filter_actions.indexOf(action) != -1){
        process.stdout.write("\n");
        showFileters(action);
        process.stdout.write("\n");
    }else{
        filter_actions.forEach(function(action){
            console.log(action);
            showFileters(action);
            process.stdout.write("\n");
        });
    }
};


Filters.MESSAGE = {
    USAGE: "usage: ctx filter [action]",
    DESCRIBE: "显示可供使用的filter"
};


module.exports = Filters;