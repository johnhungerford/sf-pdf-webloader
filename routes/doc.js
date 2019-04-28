var express = require('express');
var pdftohtml = require('pdftohtmljs');
var fs = require('fs');
var path = require('path');
var router = express.Router();
var formidable = require('formidable');

const html = path.join(global.appRoot, 'public/doc.html');

/* GET home page. */
router.post('/load', function(req, res, next) {
	var form = new formidable.IncomingForm();
	form.uploadDir = path.join(global.appRoot, 'doc/');
	form.maxFieldsSize = 100 * 1024*1024;
	form.parse( req, function(err, fields, files) {
		if (err) {
			res.json({err: error, success: false});
			return;
		}

		console.log('Form Parser. "files" data: ');
		console.log(files);
		console.log('Form Parser. "fields" data: ');
		console.log(fields);
		if ( !files.file ) { 
			res.json({err: 'No file uploaded!', success: false }); 
			return;
		}

		var file = files.file;
		var converter = new pdftohtml( file.path, 'doc.html' );
		console.log('prepared for conversion');
		converter.add_options(['--dest-dir ./public']);
		converter.convert('default').then(function(){
			fs.unlink(file.path, function(err) {
				if(err) {
					console.log('Error trying to delete uploaded pdf: '+err);
					res.json({err: new Error('error deleting uploaded pdf'), success: false});
				}
		
				res.json({success: true});
				return;
			});
		}).catch(function(error) {
			console.error(JSON.stringify(error));
			fs.unlink(file.path, function(err) {
				if(err) {
					console.log('Error trying to delete uploaded pdf: '+err);
					res.json({err: error, success: false});
				}
		
				res.json({err: error, success: false});
				return;
			});

		});

		converter.progress(function(ret) {
			console.log ((ret.current*100.0)/ret.total + " %");
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

router.get('/remove', function(req, res, next) {
	console.log('remove (docs) router...');
	fs.unlink(html, function(err) {
		if(err) {
			console.log('Error trying to delete pdf file cached in session cookie: '+err);
			res.json({err: 'error deleting pdf file cached in session cookie'});
			return;
		}

		res.json({success: true});
		return;
	});

});

module.exports = router;
