var

child_process = require('child_process'),
spawn = child_process.spawn;


module.exports = function(op, args, options, callback){
    args || (args = []);
    options || (options = {});

    var
        
    datas = [],
    operation = spawn(op, args, options);
    
    operation.stdout.on('data', function(data){
        data.toString().split('\n').filter(function(line){
            return !!line.trim();
            
        }).forEach(function(line){
            datas.push(line.trim());
        });
    });
    
    operation.stdout.on('end', function(){
        callback(datas);
    });
    
    operation.stderr.on('data', function(data){
        console.log('Err:', data);
    });
    
    operation.on('exit', function(code){
        if(code){
            console.log(op, args, "process exited with code:", code);
        }
    }); 
};

