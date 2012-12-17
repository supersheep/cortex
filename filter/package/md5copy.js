var fsMore = require("../../util/fs-more"),
	fs = require("fs"),
	path = require("path");

function generateMd5Path(fullpath,md5code){
    var extname = path.extname(fullpath),
        dirname = path.dirname(fullpath),
        basename = path.basename(fullpath,extname);

    var md5path = dirname+path.sep+basename+"."+md5code+extname;

    return md5path;
}

module.exports = {

    setup:function(done){
        this.root = this.env.build_dir;
        done();
    },

	run:function(done){

		var md5 = JSON.parse(fs.readFileSync(path.join(this.root,".cortex","md5.json")));
		var md5code,fullpath;

		for(var key in md5){
			fullpath = path.join(this.root,key);
			md5code = md5[key];
			md5path = generateMd5Path(fullpath,md5code);
			fsMore.copyFileSync(fullpath,md5path,{encoding:"binary"});
		}
		done()
	},
	tearDown:function(done){
		console.log("拷贝md5文件完毕");
		done()
	}
}