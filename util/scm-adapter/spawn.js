var

child_process = require('child_process'),
spawn = child_process.spawn;


module.exports = function(op, args, options, callback){
    args || (args = []);
    options || (options = {});

    var
        
    operation = spawn(op, args, options),
    
    datas = [];
    
    operation.stdout.on('data', function(data){
        datas.push(data);
    });
    
    operation.stdout.on('end', function(){
        callback(datas);
    });
    
    operation.stderr.on('data', function(data){
        console.log('Err:', data);
    });
    
    operation.on('exit', function(code){
        if(code){
            console.log(op, args, "process exited with code:", code)
        } 
    }); 
};

