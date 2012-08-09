var zipper = require('./zipper');

zipper.zip("a","a.zip",function(err,data){
	err && console.log(err);
});
