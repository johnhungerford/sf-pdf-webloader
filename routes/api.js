const express = require('express');
const jsforce = require('jsforce');
const router = express.Router();

const jwtAuthenticate = require('./jwtauthenticate');
const sfAuthenticate = require('./sfauthenticate');


router.post('/find', jwtAuthenticate, sfAuthenticate, function(req, res, next) {

	console.log('Entering "find" router...');

	if (!req.session.accessToken || !req.session.instanceUrl ) { 
		res.json({ err: "authenticate" });
	}

	const conn = new jsforce.Connection({
  		oauth2 : global.oauth2,
  		instanceUrl : req.session.instanceUrl,
  		accessToken : req.session.accessToken,
  		refreshToken : req.session.refreshToken
	});

	if(!req.body.sobject || !req.body.conditions || !req.body.fields) {
		next(new Error('"find" POST request is missing necessary properties'));
	}

	console.log(req.body);


	conn.sobject(req.body.sobject)
		.find(req.body.conditions, req.body.fields)
		.limit(100)
		.execute(function(err,records) {
			console.log('Executed sf "find" request');
			console.log('Error: ');
			console.log(err);
			if(err) { return next(err); }
			console.log('find request executed with out errors. Records returned:');
			// console.log(records);
			res.json(records);
		});
  
});

router.post('/create', jwtAuthenticate, sfAuthenticate, function(req, res, next) {

	console.log('Create router...');

	console.log('Request body:');
	console.log(req.body);

	if (!req.session.accessToken || !req.session.instanceUrl ) { 
		return next( new Error('authentication failure') );
	}

	const conn = new jsforce.Connection({
  		oauth2 : global.oauth2,
  		instanceUrl : req.session.instanceUrl,
  		accessToken : req.session.accessToken,
  		refreshToken : req.session.refreshToken
	});

	if(!req.body.sobject || !req.body.records ) {
		return next(new Error('"create" POST request is missing necessary properties'));
	}

	for( var i in req.body.records) {
		if(req.body.records[i].Id) {
			return next( new Error('"create" POST includes record with ID!'));
		}
	}

	conn.sobject(req.body.sobject)
		.create(req.body.records, function(err,ret) {
			if(err) { return next(err); }
			console.log('Successfully created records: ' + ret);
			res.json(ret);
		});
  
});


router.post('/update', jwtAuthenticate, sfAuthenticate, function(req, res, next) {

	console.log('Update router...');

	console.log('Request object body:');
	console.log(req.body);

	if (!req.session.accessToken || !req.session.instanceUrl ) { 
		console.log('authentication failure')
		return next( new Error('authentication failure') );
	}



	const conn = new jsforce.Connection({
  		oauth2 : global.oauth2,
  		instanceUrl : req.session.instanceUrl,
  		accessToken : req.session.accessToken,
  		refreshToken : req.session.refreshToken
	});

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

module.exports = router;
