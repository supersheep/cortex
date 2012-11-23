var 

fsMore = require("../../util/fs-more"),
pathmod = require("path"),
FilterEngine = require("../../lib/filter-engine"),
filterEngine = new FilterEngine('../filter/package/');


// 主流程
// @param {string} root absolute path of working directory of target project
function main(options){
    options.filters = options.filters && options.filters.split(',').map(function(filter){
        return filter.trim();
        
    }).filter(function(filter){
        return !!filter;
        
    }) || [
        'update',
        'publish-imitate',
        'css',
        'yui-compressor',
        'closure',
        'md5',
        'md5-diff'
    ];
    
    console.log("开始应用已配置的滤镜 >>>>>>>>>>", options.filters.join(', '));
    
    options.filters.forEach(function(filter){
        filterEngine.assign(filter, options);
    });
    
    filterEngine.run();
};


module.exports = main;
