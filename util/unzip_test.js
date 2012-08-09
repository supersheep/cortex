var zipper = require('./zipper');


zipper.unzip("b.zip","b",function(err){
	err && console.log("err",err);
});