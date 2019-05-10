const express = require('express');
const router = express.Router();

const jwtAuthenticate = require('./jwtauthenticate');
const sfAuthenticate = require('./sfauthenticate');

router.post('/find', jwtAuthenticate, sfAuthenticate, function(req, res, next) {
	if (res.locals.sfconn === undefined) return next(new Error('No sf connection!'));
	const conn = res.locals.sfconn;
	if(!req.body.sobject || !req.body.conditions || !req.body.fields) {
		return next(new Error('"find" POST request is missing necessary properties'));
	}

	console.log(req.body);
	conn.sobject(req.body.sobject)
		.find(req.body.conditions, req.body.fields)
		.limit(100)
		.execute(function(err,records) {
			console.log('Executed sf "find" request');
			if(err) { return next(err); }
			// console.log('find request executed with out errors. Records returned:');
			// console.log(records);
			res.json(records);
		});
  
});

router.post('/create', jwtAuthenticate, sfAuthenticate, function(req, res, next) {
	if (res.locals.sfconn === undefined) return next(new Error('No sf connection!'));
	const conn = res.locals.sfconn;
	if(!req.body.sobject || !req.body.records ) {
		return next(new Error('"create" POST request is missing necessary properties'));
	}

	for( var i in req.body.records) {
		if(req.body.records[i].Id) {
			return next( new Error('"create" POST includes record with ID!'));
		}
	}

	console.log('/api/create REQUEST:');
	console.log(req.body.records);

	conn.sobject(req.body.sobject)
		.create(req.body.records, function(err,ret) {
			if(err) { return next(err); }
			console.log('Successfully created records: ' + ret);
			res.json(ret);
		});
  
});


router.post('/update', jwtAuthenticate, sfAuthenticate, function(req, res, next) {
	if (res.locals.sfconn === undefined) return next(new Error('No sf connection!'));
	const conn = res.locals.sfconn;
	if(!req.body.sobject || !req.body.records ) {
		console.log('"update" POST request is missing necessary properties');
		return next(new Error('"update" POST request is missing necessary properties'));
	}

	for( var i in req.body.records) {
		if(!req.body.records[i].Id) {
			console.log('"update" POST request includes record without ID');
			return next( new Error('"update" POST request includes record without ID'));
		}
	}

	console.log(req.body);
	conn.sobject(req.body.sobject)
		.update(req.body.records, function(err,ret) {
			if(err) { return next(err); }
			console.log('Successfully updated records: ' + ret);
			res.json(ret);
		});
  
});

router.post('/delete', jwtAuthenticate, sfAuthenticate, function(req, res, next) {
	if (req.body.Id === undefined || 
		req.body.Id === null ||
		req.body.sObject === undefined ||
		req.body.sObject === null
	) return res.json({
		success: false,
		message: 'Missing record Id or object type for destroy operation!',
		data: req.body,
	});

	if (res.locals.sfconn === undefined) return next(new Error('No sf connection!'));
	const conn = res.locals.sfconn;

	console.log(req.body);
	conn.sobject(req.body.sObject)
		.del(req.body.Id, (errSf, resSf) => {
			if(errSf) return res.json({ success: false, message: 'unable to delete record', err: errSf });
			console.log('Successfully deleted record: '+req.body.Id);
			return res.json({success: true, data: resSf})
		});
  
});

module.exports = router;
