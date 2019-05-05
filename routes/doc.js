var express = require('express');
var pdftohtml = require('pdftohtmljs');
var fs = require('fs');
var path = require('path');
var router = express.Router();
var formidable = require('formidable');
var crypto = require('crypto');
const shortid = require('shortid');

const jwtAuthenticate = require('./jwtauthenticate');

const html = path.join(global.appRoot, 'doc', 'doc.html');

router.get('/view', jwtAuthenticate, (req,res,next) => {
	fs.access(html, fs.F_OK, (err) => {
		if (err) {
			console.log('no doc.html');
			res.render('blankdoc');
			return;
		}
		
		console.log('sending doc.html');
		res.sendFile(html);
 	  });
});

/* GET home page. */
router.post('/load', jwtAuthenticate, function(req, res, next) {
	var form = new formidable.IncomingForm();
	form.uploadDir = path.join(global.appRoot, 'doc/');
	form.maxFieldsSize = 100 * 1024*1024;
	form.parse( req, function(err, fields, files) {
		if (err) {
			console.log('FILE UPLOAD ERR:', err);
			res.json({err: err, success: false});
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

		const file = files.file;

		return hashFile(file.path, req, res, next)
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

router.get('/remove', jwtAuthenticate, function(req, res, next) {
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

const hashFile = (inPath, req, res, next) => {
	console.log('hashing file...');
	fs
		.createReadStream(inPath)
		.pipe(crypto.createHash('sha1')
		.setEncoding('hex'))
		.on('finish', function() { 
		queryFile(
			this.read(), 
			inPath,
			req, res, next
		); 
	});
}

const queryFile = (hash, filePath, req, res, next) => {
	console.log('querying file (do we already have it?');
	console.log(`hash: ${hash}`);
	global.mysql.query(
		`SELECT id, html FROM documents WHERE filehash="${hash}"`,
		(err, result) => {
			if (err) return res.json({success: false, message: `Could not execute document query: ${err}`});
			if (result.length > 1) return res.json({success: false, message: 'sql err: file not unique!'});
			if (result.length === 1) return returnFile (result[0].id, result[0].html, req, res, next);
			return convertFile(hash, filePath, req, res, next); 
		}
	);
}

const returnFile = (id, html, req, res, next) => {
	console.log('returning file...');
	return res.json({ 
		success: true,
		html: html,
	});
}

const convertFile = (hash, inPath, req, res, next) => {
	console.log('converting files');
	const outName = `temphtml_${shortid.generate()}_${shortid.generate()}`;
	var converter = new pdftohtml( inPath, outName );
	console.log('prepared for conversion');
	converter.add_options([`--dest-dir ./doc`]);
	converter.convert('default').then(function(){
		return uploadFile(
			inPath, 
			path.join(global.appRoot, 'doc', outName), 
			hash,
			req, res, next);
	}).catch(function(error) {
		fs.unlink(inPath, function(err) {
			if(err) return res.json({success: false, message: `Error deleting file -- ${err.message} -- when cleaning up after err converting: ${error.message}`});
	
			return res.json({message: `Error converting file from pdf: ${error.message}`, success: false});
		});

	});

	converter.progress(function(ret) {
		console.log ((ret.current*100.0)/ret.total + " %");
	});
}

const uploadFile = (pdfPath, htmlPath, hash, req, res, next) => {
	console.log('uploading files');
	fs.open(pdfPath, 'r', (status, fd) => {
		if (status) return res.json({success: false, message: `failed to open pdf for sql upload: ${status}`});
		const fileSize = getFilesizeInBytes(pdfPath);
		const buffer = new Buffer(fileSize);
		fs.read(fd, buffer, 0, fileSize, 0, function (err, num) {
			if (err) return res.json({success: false, message: `failed to read pdf for sql upload: ${err.message}`});
			
			fs.readFile(htmlPath, 'utf8', (err2, data) => {
				console.log(`THIS SHOULD BE HTML: ${data}`);
				if (err2) return res.json({success: false, message: `failed to html for sql upload: ${err2.message}`});
				global.mysql.query(
					"INSERT INTO documents SET ?", 
					{
						fileblob: buffer,
						html: data,
						filehash: hash,
						type: 'pdf',
					}, 
					(err3, result) => {
						if(err3) return res.json({success: false, message: `unable to upload files to database: ${err3.message}`});
						
						fs.unlink(pdfPath, (err4) => {
							if(err4) return res.json({message: 'error deleting uploaded pdf', success: false});
							fs.unlink(htmlPath, (err5) => {
								if (err5) return res.json({message: 'error deleting html from conversion', success: false});
								return res.json({
									success: true,
									html: data,
									mysqlresponse: result,
								});
							});
						});
					}
				);
			});
		});
	});
}

function getFilesizeInBytes(filename) {
    const stats = fs.statSync(filename);
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes;
}
