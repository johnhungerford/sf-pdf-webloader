var express = require('express');
var pdftohtml = require('pdftohtmljs');
var fs = require('fs');
var path = require('path');
var router = express.Router();
var formidable = require('formidable');

const docs = path.join(global.appRoot, 'docs');


var getDocArray = function( callback ) {

	let docArray = [];

	fs.readdir(docs, function( err, files ) {

		if(err) {
			console.log(err);
			next(err);
			return;
		}

		if( files.length == 0 ) {
			callback(docArray);
			return;
		}

		var ctr = 0;
		for ( let i = 0; i < files.length; i++ ) {

			fs.stat(path.join(docs,files[i]), function(err, stats) {
				let id = files[i];
				if( !err && stats.isFile() && !stats.isDirectory() && files[i] != '.DS_Store') {

					if( parseInt(id) > parseInt(docArray[docArray.length-1]) || docArray.length == 0 ) {
						docArray.push(id);
					} else {
						for( let j = docArray.length-1; j >= 0; j++ ) {
							if( parseInt(id) < parseInt(docArray[j]) ) {
								docArray.splice(j,0,id);
								break;
							}
						}
					}

				}

				if( ctr == files.length-1 ) { 
					callback(docArray);
					return;
				}
				ctr++;
			});
		}

	});

}

var shiftUp = function( idin, callback ) {

	console.log('Shifting up... idin: '+idin);

	getDocArray(function(docArray) {

		if ( idin < 0 || idin >= docArray.length ) { 
			console.log('idin is out of bounds of docArray');
			return; 
		}

		for( i = docArray.length-1 ; i > idin; i-- ) {

			console.log('Looking at i = '+i);
			num = parseInt(docArray[i]) + 1;

			fs.rename(path.join(docs, docArray[i]), path.join(docs, num.toString()), function() {
				if ( i == idin+1 ) {
					callback();
					return;
				}
			});

		}

		callback();

	});

};

router.get('/get', function(req, res, next) {

	if(!req.params.id) {
		getDocArray(function(docArray) {
			console.log(docArray);
			res.json(docArray);
		});
		return;
	}

});

/* GET home page. */
router.get('/get/:id', function(req, res, next) {

	console.log('get (docs) router...');

	console.log('get id: '+req.params.id);

	var idin = req.params.id;

	fs.readdir(docs, function( err, files ) {

		for ( let i = 0; i < files.length; i++ ) {

			let id = files[i];
			if( id == idin ) {

				var html = fs.readFileSync(path.join(docs, id), 'utf8');
    			res.send(html);
				
				//res.sendFile(path.join(docs, id));

				return;

			}
		}

		res.json({ err: new Error('No document with id: '+idin), success: false });

	});

});


/* GET home page. */
router.post('/add/:option', function(req, res, next) {

	if( req.params.option ) {
		if( req.params.option == 'top' || req.params.option == 'bottom' || req.params.option == 'next' ) {
			var option = req.params.option;
		} else {
			var option = 'next';
		} 
	} else {
		var option = 'next';
	}

	var form = new formidable.IncomingForm();

	var file = null;

	var end = false;

	form.uploadDir = path.join(global.appRoot, 'processdoc');

	form.maxFieldsSize = 100 * 1024*1024;

	form.parse( req, function(err, fields, files) {

		console.log('Form Parser. "files" data: ');
		console.log(files);
		console.log('Form Parser. "fields" data: ');
		console.log(fields);

		if ( !files.file ) { 
			res.json({err: 'No file uploaded!', success: false }); 
			return;
		}

		var file = files.file;

		if( option == 'next' && !fields.di ) { option == 'bottom'; }

    	getDocArray(function(docArray){

    		console.log('addDoc Callback function within getDocArray()');
    		console.log('docArray = ');
    		console.log(docArray);

    		console.log('PATH1: '+file.path);

    		if(docArray.length < 1) { 
    			var num = 10000000;
    			console.log('PATH2: '+ path.join(docs, num.toString()));
    			var converter = new pdftohtml( file.path, num.toString() );
    		} else { 
    			if (option == 'top') {
    				var num = parseInt(docArray[0]) - 1;
    				console.log('PATH2: '+ path.join(docs, num.toString()));
    				var converter = new pdftohtml( file.path, num.toString() );
    			} else if (option == 'bottom') {
    				var num = parseInt(docArray[docArray.length-1]) + 1;
    				console.log('PATH2: '+ path.join(docs, num.toString()));
    				var converter = new pdftohtml( file.path, num.toString() );
    			} else {
    				if ( fields.di >= docArray.length ) {
    					var num = parseInt(docArray[docArray.length-1]) + 1;
    					console.log('PATH2: '+ path.join(docs, num.toString()));
    					var converter = new pdftohtml( file.path, num.toString() );
    				} else {
    					var num = parseInt(docArray[fields.di]) + 1 ;
    					console.log('PATH2: '+ path.join(docs, num.toString()));
    					var converter = new pdftohtml( file.path,num.toString() );
    				}    			
    			}
    		}

    		console.log('prepared for conversion');
    		converter.add_options(['--dest-dir ./docs']);

    		if( option == 'next' && fields.di < docArray.length-1 ) { 
    			shiftUp(fields.di, function() {
					console.log('Shifted up, now converting...');
					converter.convert('default').then(function(){
		    			getDocArray(function(docArray) {
		    				res.json({Id: num.toString(), docArray: docArray});
		    			});
		    		}).catch(function(error) {
		    			console.error(JSON.stringify(error));
		    			res.json({err: error, success: false});
		    		});
    			});
    		} else {
	    		converter.convert('default').then(function(){
	    			getDocArray(function(docArray) {
	    				res.json({Id: num.toString(), docArray: docArray});
	    			});
	    		}).catch(function(error) {
	    			console.error(JSON.stringify(error));
	    			res.json({err: error, success: false});
	    		});
    		}

    		converter.progress(function(ret) {
  				console.log ((ret.current*100.0)/ret.total + " %");
			});


    	});
    });


	form
	    .on('fileBegin',function(name,file){
	        console.log('fileBegin-' + name + ':' + JSON.stringify(file));
	    })
	    .on('progress',function(bytesReceived,bytesExpected){
	        console.log('progress-' + bytesReceived +'/' + bytesExpected);
	    })
	    .on('aborted', function(){
	        console.log('aborted');
	    })
	    .on('error', function(){
	        console.log('error');
	    })
	    .on('end', function(){
	        console.log('Form data uploaded and parsed');
	    })
	   	.on('file', function(name, file){
	    	console.log('file uploaded: '+file.name);
	    });


});



router.get('/remove/:id', function(req, res, next) {

	console.log('remove (docs) router...');


	if(!req.params.id) {
		console.log('No document id to remove!');
		next(new Error('No document id to remove!'));
		return;
	} 

	var fn = path.join(docs,req.params.id);

	console.log('removing: '+fn);

	path.join(docs,req.params.id);

	fs.access(fn, accessErr => {
	    if (accessErr) {
	    	console.log('File access error:');
	    	console.log(accessErr);
	    	next(accessErr);
	    	return;
	    } else {
	        fs.unlink(fn,function(delErr){
	            if( delErr ) {
	            	console.log('Delete error:');
			    	console.log(delErr);
			    	next(delErr);
			    	return;
	            } else {
	            	console.log('Removal succeeded...');
  					getDocArray(function(docArray) {
						res.json(docArray);
						return;
					});
	            }
	        });
    	}
	});


});



module.exports = router;
