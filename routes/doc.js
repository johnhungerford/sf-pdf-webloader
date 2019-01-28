var express = require('express');
var pdftohtml = require('pdftohtmljs');
var fs = require('fs');
var path = require('path');
var router = express.Router();
var formidable = require('formidable');

const doc = path.join(global.appRoot, 'public/doc');
const pdf = path.join(global.appRoot, 'public/pdfviewer/web/pdf.pdf');
const pdfviewer = '/pdfviewer/web/viewer.html';


/* GET home page. */
router.get('/view', function(req, res, next) {

	console.log('view (docs) router...');

	fs.readFile(pdf, 'utf8', function( err, buffer ) {
		if(err) {
			res.render('blankdoc', {err: err});
			return;
		}

		res.redirect(pdfviewer);
	});

});


/* GET home page. */
router.post('/load', function(req, res, next) {

	var form = new formidable.IncomingForm();

	var file = null;

	var end = false;

	form.uploadDir = doc;

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
		res.send({success: true, iframeurl: '/pdfviewer/web/viewer.html?file=/doc/'+file.path.split('\\').pop().split('/').pop()});
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

	fs.unlink(pdf, (err) => {
		if(err) {
			console.log(err);
			res.send({err: 'Unable to delete pdf'});
		} else {
			res.send({success: true});
		}
	});


});



module.exports = router;
