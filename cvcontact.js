
const c = require('./constants');

var cvContact = function (sfConnectionInput, contactIdInput) { 

	// define and initialize the private properties of class cvContact

	var that = this;

	var _sfConnection = null; // jsforce connection object: connection to sf database
	var _sfId = null; // Salesforce contact ID of the academic
	var _sfAcctId = null; // Salesforce account ID linked with academic contact

	// Initialize _sfConnection and _sfId from inputs, if those inputs are passed
	if ( sfConnectionInput != undefined) { _sfConnection = sfConnectionInput };
	if ( contactIdInput != undefined ) { _sfId = contactIdInput };

	const _recordType = c.ACADEMICRECORDTYPE; // Salesforce ID for academic type contact
	
	// _isNew is type boolean: true means add to salesforce; false means it's already there
	if ( contactIdInput == undefined ) { var _isNew = true } else { var _isNew = false };
	
	// All properties are an array where their first element is their data, and the second element
	// is a boolean that tells whether this property needs to be updated in the salesforce database.
	// The "isNew" parameter thus tells whether the constructed properties should be set to be updated.
	// If they isNew == false, the constructed properties should be stored, but not set to update Salesforce


	
	// ****************************************************************************************************
	// * Define the rest of the private properties, all of which correspond to Salesforce contact fields. *
	// * We'll use privileged getters and setters to access and control the values, making sure we keep   *
	// * track of whether each property needs to be updated in salesforce. 								  *
	// ****************************************************************************************************

	// Conditional (_isNew)?[null,false]:[null,null] sets the flags as initialized if the cvContact obj is
	// new, and uninitialized if it corresponds to a contact on SF and needs to be initialized.

	// 1-15: Dean, Dr., Hon., Miss, Mr., Mr. and Mrs., Mrs., Ms., Pres., 
	// 		 Prof., Rabbi, Rep., Rev., Sen., The Honorable
	var _prefix = (_isNew) ? [null,false] : [ null, null];
	
	var _firstName = (_isNew) ? [null,false] : [ null, null ];
	var _middleName = (_isNew) ? [null,false] : [ null, null ];
	var _lastName = (_isNew) ? [null,false] : [ null, null ];
	
	var _suffix = (_isNew) ? [null,false] : [ null, null ];
	
	// 1-6: College Academic, High School Teacher, Other, College Administrator,
	//		High School Administrator, Think Tank/Other
	var _academicType = (_isNew) ? [null,false] : [ null, null ];
	
	// 1-6: Fellow, Prospect, Partner, Occasional Partner, Close Partner, 
	// 		Fellow of Interest
	var _relationshipStatus = (_isNew) ? [null,false] : [ null, null ]; 
	
	// Account ID of institution
	var _primaryAffiliation = (_isNew) ? [null,false] : [ null, null ]; 
	
	var _workPhone = (_isNew) ? [null,false] : [ null, null ];
	var _workEmail = (_isNew) ? [null,false] : [ null, null ];
	var _personalPhone = (_isNew) ? [null,false] : [ null, null ];
	var _personalEmail = (_isNew) ? [null,false] : [ null, null ];
	
	// type boolean: true means work
	var _preferredPhone = (_isNew) ? [null,false] : [ null, null ];
	var _preferredEmail = (_isNew) ? [null,false] : [ null, null ];	
	
	var _notes = (_isNew) ? [null,false] : [ null, null ];
	var _bio = (_isNew) ? [null,false] : [ null, null ];
	var _researchInterests = (_isNew) ? [null,false] : [ null, null ];
	
	// 1-8: American Political Science/Political Thought; Other Political Science/Political Thought
	// American History; Other History; Economics; Law; Other; Not Applicable
	var _primarySubject = (_isNew) ? [null,false] : [ null, null ];	
	var _secondarySubject = (_isNew) ? [null,false] : [ null, null ];
	
	// type boolean: yes means has a tenure track position
	var _tenureTrack = (_isNew) ? [null,false] : [ null, null ];		
	
	var _ttrYear = (_isNew) ? [null,false] : [ null, null ];
	
	// type boolean: yes means has tenure
	var _tenure = (_isNew) ? [null,false] : [ null, null ];				
	
	var _tYear = (_isNew) ? [null,false] : [ null, null ];
	
	// use this for academic's school address	
	var _primaryAddrStreet1 = (_isNew) ? [null,false] : [ null, null ];
	var _primaryAddrStreet2 = (_isNew) ? [null,false] : [ null, null ];
	var _primaryAddrStreet3 = (_isNew) ? [null,false] : [ null, null ];
	var _primaryAddrCity = (_isNew) ? [null,false] : [ null, null ];
	var _primaryAddrState = (_isNew) ? [null,false] : [ null, null ];
	var _primaryAddrZip = (_isNew) ? [null,false] : [ null, null ];
	var _primaryAddrCountry = (_isNew) ? [null,false] : [ null, null ]; // default
	
	// use this for academic's home address
	var _secondaryAddrStreet1 = (_isNew) ? [null,false] : [ null, null ];		
	var _secondaryAddrStreet2 = (_isNew) ? [null,false] : [ null, null ];
	var _secondaryAddrStreet3 = (_isNew) ? [null,false] : [ null, null ];
	var _secondaryAddrCity = (_isNew) ? [null,false] : [ null, null ];
	var _secondaryAddrState = (_isNew) ? [null,false] : [ null, null ];
	var _secondaryAddrZip = (_isNew) ? [null,false] : [ null, null ];
	var _secondaryAddrCountry = (_isNew) ? [null,false] : [ null, null ]; // default
	
	var _receivesAcademicMail = (_isNew) ? [null,false] : [ null, null ];	// type boolean: yes means we send them academic mail
	var _receivesGeneralMail = (_isNew) ? [null,false] : [ null, null ];	// type boolean: yes means we send them general mail
	var _emailOptOut = (_isNew) ? [null,false] : [ null, null ];			// type boolean: yes means we *do not send* them email updates
	
	// **************************************
	// * Below are all the private methods. *
	// **************************************
	
	// Changes the second element in the field array from null (uninitialized) to false (initialized, but
	// don't update) to true (update).
	var _increment = function(flagobj) { // mark a field as either initialized or updated
		if (flagobj == null) {flagobj = false} else if (flagobj == false) {flagobj = true};
		return flagobj;
	}

	// Return an object with each field that is flagged for update, with appropriate Salesforce identifiers
	var _generateContactRecords = function() {
		
		// Record object
		var record = {};
		
		// For each field, if it is flagged for update (i.e., _field[1] = true), create a new element in
		// the record object with an identifier recognized by Salesforce and the field value stored in
		// the cvContact object.
		if (_sfId != null ) record.Id = _sfId;
		if(_prefix[1]) record.Salutation = that.prefix;
		if(_firstName[1]) record.FirstName = that.firstName;
		if(_middleName[1]) record.MiddleName = that.middleName;
		if(_lastName[1]) record.LastName = that.lastName;
		if(_suffix[1]) record.Suffix = that.suffix;
		if(_academicType[1]) record.Academic_Type__c = that.academicType;
		if(_relationshipStatus[1]) record.Relationship_Status__c = that.relationshipStatus;
		if(_primaryAffiliation[1]) record.npsp__Primary_Affiliation__c = that.primaryAffiliation;
		if(_workPhone[1]) record.npe01__WorkPhone__c = that.workPhone;
		if(_workEmail[1]) record.npe01__WorkEmail__c = that.workEmail;
		if(_personalEmail[1]) record.npe01__HomeEmail__c = that.personalEmail;
		if(_preferredEmail[1]) record.npe01__Preferred_Email__c = that.preferredEmail;
		if(_notes[1]) record.Contact_Notes__c = that.notes;
		if(_primarySubject[1]) record.Primary_Subject__c = that.primarySubject;
		if(_secondarySubject[1]) record.Secondary_Subject__c = that.secondarySubject;
		if(_researchInterests[1]) record.Research_Interests__c = that.researchInterests;
		if(_tenureTrack[1])	record.Secured_tenure_track_position__c = that.tenureTrack;
		if(_tenure[1]) record.Received_Tenure__c = that.tenureTrack;
		if(_ttrYear[1]) record.Tenure_Track_R__c = that.ttrYear;
		if(_tYear[1]) Tenure_Received_Year__c = that.tYear;
		if(_primaryAddrStreet1[1]) record.Primary_Street_1__c = that.getAddrStreet1(1);
		if(_primaryAddrStreet2[1]) record.Primary_Street_2__c = that.getAddrStreet2(1);
		if(_primaryAddrStreet3[1]) record.Primary_Street_3__c = that.getAddrStreet3(1);
		if(_primaryAddrCity[1]) record.Primary_City__c = that.getAddrCity(1);
		if(_primaryAddrState[1]) record.Primary_State__c = that.getAddrState(1);
		if(_primaryAddrZip[1]) record.Primary_Postal_Code__c = that.getAddrZip(1);
		if(_primaryAddrCountry[1]) record.Primary_Country__c = that.getAddrCountry(1);
		if(_secondaryAddrStreet1[1]) record.Secondary_Street_1__c = that.getAddrStreet1(2);
		if(_secondaryAddrStreet2[1]) record.Secondary_Street_2__c = that.getAddrStreet2(2);
		if(_secondaryAddrStreet3[1]) record.Secondary_Street_3__c = that.getAddrStreet3(2);
		if(_secondaryAddrCity[1]) record.Secondary_City__c = that.getAddrCity(2);
		if(_secondaryAddrState[1]) record.Secondary_State__c = that.getAddrState(2);
		if(_secondaryAddrZip[1]) record.Secondary_Postal_Code__c = that.getAddrZip(2);
		if(_secondaryAddrCountry[1]) record.Secondary_Country__c = that.getAddrCountry(2);
		if(_receivesAcademicMail[1]) record.Receives_Academic_Mailings__c = that.receivesAcademicMail;
		if(_receivesGeneralMail[1]) record.Receives_General_Mailings__c = that.receivesGeneralMail;
		if(_emailOptOut[1]) record.HasOptedOutOfEmail = that.emailOptOut;

		// Return the object, filled with whatever records can be created or updated
		return record;
	}

	// Does same as above, but for the contact's linked account: only generates the name fields used
	// in the SF Account object
	var _generateAccountRecords = function() {

		// Record object to be filled with updateable account records
		var record = {};

		// if initialized, load account id
		if(_sfAcctId != null) record.Id = idInput;
		// Load any of the four name fields used by the account sf object into the acctrecords object,
		// which should be preloaded with the account Id. 
		if(_prefix[1]) record.Prefix__c = that.prefix;
		if(_firstName[1]) record.First_Name__c = that.firstName;
		if(_lastName[1]) record.Last_Name__c = that.lastName;
		if(_suffix[1]) record.Suffix__c = that.suffix;

		return record; 
	}

	// Updates a salesforce contact based on the records passed in the argument
	var _updateContactRecords = function(record) {

		// Update contact with the fields stored in record object
		_sfConnection.sobject("Contact").update( record, function(err, ret) {
  			if (err || !ret.success) { 
  				console.error(err, ret);
  				console.log("Error updating contact") 
  				return false;
  			}
 			 console.log('Contact Updated Successfully');
		});

	}

	// Updates a salesforce account based on the records passed in the argument
	var _updateAccountRecords = function(acctrecords) {
		
		// Update the account, identified by acctrecords.Id (preloaded), with the fields loaded above
		// in acctrecords
		_sfConnection.sobject("Account").update( acctrecords, function(err, ret) {
  			if (err || !ret.success) { 
  				console.error(err, ret); 
  				return false;
  			} else {
 			 	console.log("Account Updated Successfully.");
  			}
  			// ...
		});
	}

	// Create a new account with records passed in the argument.
	var _createNewContact = function(record) {

		// Exit with error if there is no last name or academic type (required fields for academic contact)
		if ( record.LastName == undefined || record.LastName == null ) return false;
		if ( record.Academic_Type__c == undefined || record.Academic_Type__c == null ) return false;

		if ( record.RecordTypeId == undefined || record.RecordTypeId == null ) { 
			record.RecordTypeId = c.ACADEMICRECORDTYPE;
		}

		// Update contact with the fields stored in record object
		_sfConnection.sobject("Contact").create( record, function(err, ret) {
  			if (err || !ret.success) { 
  				console.error(err, ret);
  				console.log("Error creating contact") 
  				return false;
  			}
  				_sfId = ret.id;
  				_isNew = false;
 				console.log('Contact Created Successfully: Id = ' + ret.id );
		});

	}

	// _fillFromRecords() takes fields from a record object passed as an argument, and updates all of the cvContact
	// fields with them. This process has to be in a separate function because it needs to be called by
	// a callback function passed to .sobject.find().execute() in order for it to run only after all the
	// records have been found.
	var _fillFromRecords = function(record) {

			// If the type of contact is not academic (_recordType is initialized to the Academic Network
			// record type id) we won't load it: this app is currently designed for academic contacts only.
			if( record.RecordTypeId != _recordType ) { return false };
			
			// Load all of the cvContact fields from the SF fields contained in the "record" argument
			_sfAcctId = record["Account.Id"];
			that.prefix = record.Salutation;
			that.firstName = record.FirstName;
			that.middleName = record.MiddleName;
			that.lastName = record.LastName;
			that.suffix = record.Suffix;
			that.academicType = record.Academic_Type__c;
			that.relationshipStatus = record.Relationship_Status__c;
			that.primaryAffiliation = record.npsp__Primary_Affiliation__c;
			that.workPhone = record.npe01__WorkPhone__c;
			that.workEmail = record.npe01__WorkEmail__c;
			that.personalEmail = record.npe01__HomeEmail__c;
			that.preferredEmail = record.npe01__Preferred_Email__c;
			that.notes = record.Contact_Notes__c;
			that.primarySubject = record.Primary_Subject__c;
			that.secondarySubject =	record.Secondary_Subject__c;
			that.researchInterests = record.Research_Interests__c;
			that.tenureTrack = record.Secured_tenure_track_position__c;
			that.ttrYear = record.Tenure_Track_R__c;
			that.tenure = record.Received_Tenure__c;
			that.tYear = record.Tenure_Received_Year__c;
			that.setAddrStreet1(1, record.Primary_Street_1__c);
			that.setAddrStreet2(1, record.Primary_Street_2__c);
			that.setAddrStreet3(1, record.Primary_Street_3__c);
			that.setAddrCity(1, record.Primary_City__c);
			that.setAddrState(1, record.Primary_State__c);
			that.setAddrZip(1, record.Primary_Postal_Code__c);
			that.setAddrCountry(1, record.Primary_Country__c);
			that.setAddrStreet1(2, record.Secondary_Street_1__c);
			that.setAddrStreet2(2, record.Secondary_Street_2__c);
			that.setAddrStreet3(2, record.Secondary_Street_3__c);
			that.setAddrCity(2, record.Secondary_City__c);
			that.setAddrState(2, record.Secondary_State__c);
			that.setAddrZip(2, record.Secondary_Postal_Code__c);
			that.setAddrCountry(2, record.Secondary_Country__c);
			that.receivesAcademicMail = record.Receives_Academic_Mailings__c;
			that.receivesGeneralMail = record.Receives_General_Mailings__c;
			that.emailOptOut = record.HasOptedOutOfEmail;
		
			return true;
	}

	// _fillFromSf is used to initialize the cvContact object, if it is constructed with a SF contact Id as an
	// argument. It calls sobject.find() to look up the contact on SF and get all the fields we need in a
	// record object. It then enters the fields in that record object and initializes each of the cvContact
	// fields with them. In order for this to work correctly, it should be called before any changes have
	// been made to any of the cvContact fields. This way, their flags will be incremented from null to
	// false, and they will not be passed to SF if this.update() or _updateAll() are called.
	var _fillFromSf = function() {

		// SELECT {all cvContact fields} FROM Contact WHERE Id = _sfId}
		_sfConnection.sobject("Contact").find(
			{ Id : _sfId },
			{	RecordTypeId : 1,
				"Account.Id" : 1,
				Salutation : 1,
				FirstName : 1,
				MiddleName : 1,
				LastName : 1,
				Suffix : 1,
				Academic_Type__c : 1,
				Relationship_Status__c : 1,
				npsp__Primary_Affiliation__c : 1,
				npe01__WorkPhone__c : 1,
				npe01__WorkEmail__c : 1,
				npe01__HomeEmail__c : 1,
				npe01__Preferred_Email__c : 1,
				Contact_Notes__c : 1,
				Primary_Subject__c : 1,
				Secondary_Subject__c : 1,
				Research_Interests__c : 1,
				Secured_tenure_track_position__c : 1,
				Tenure_Track_R__c : 1,
				Tenure_Received_Year__c : 1,
				Primary_Street_1__c : 1,
				Primary_Street_2__c : 1,
				Primary_Street_3__c : 1,
				Primary_City__c : 1,
				Primary_State__c : 1,
				Primary_Postal_Code__c : 1,
				Primary_Country__c : 1,
				Secondary_Street_1__c : 1,
				Secondary_Street_2__c : 1,
				Secondary_Street_3__c : 1,
				Secondary_City__c : 1,
				Secondary_State__c : 1,
				Secondary_Postal_Code__c : 1,
				Secondary_Country__c : 1,
				Receives_Academic_Mailings__c : 1,
				Receives_General_Mailings__c : 1,
				HasOptedOutOfEmail : 1
			}
		)
		// The .execute() function allows us to pass a callback function that handles errors and, on success, 
		// calls the function _fillFromRecords() (see above), which enters the records found by sobject.find() 
		// into the cvContact object.
		.execute( function(err, records) {
			if(err) { 
				console.log(console.error(err));
				return false;
			} else if (records.length == 0) {
				console.log("Error in _fillFromSf: No records found");
				return false;
			} else if (records.length > 1) {
				console.log("Error in _fillFromSf: Multiple contact records with Id: " + _sfId);
				return false;
			} else {
				return _fillFromRecords(records[0]);
			}
		});
	}
	
	
	// ****************************************************************************************************
	// * Below are all the privileged functions, most of which will be used to read and set the private   *
	// * properties which can't be accessed by public methods. With the exception of address fields,      *
	// * this will be done by getters and setters. 	    												  *
	// ****************************************************************************************************

	this.setConnection = function (connectionInput) {
		_sfConnection = connectionInput;
	}

	// Make sure we can update everything from the global environment. 
	this.update = function() { 

		if (_sfId == null ) {return false};

		var contactRecords = _generateContactRecords();
		var accountRecords = _generateAccountRecords();

		var acctTest = true;
		var contTest = _updateContactRecords(contactRecords);

		if (_sfAcctId != null) { acctTest = _updateAccountRecords };

		if (acctTest && contTest) { return true } else { return false };

	};

	// Create a new contact on Salesforce from a cvContact object. _isNew must be *true*, and _sfId must
	// be uninitialized (null).
	this.create = function() {

		if ( _sfId != null || _isNew == false ) { return false };

		console.log("Got here");

		var contactRecords = _generateContactRecords();

		console.log(contactRecords);

		return _createNewContact(contactRecords);

	}

	// We don't use getters and setters for addresses because we want to be able to use one function to get
	// and set address elements for both primary and secondary addresses.
	// **** Each setter increments the field's flag whenever a value is successfully passed, using ****
	// **** the private function _increment() (see above). This changes the flag from null, to     ****
	// **** false, to true. Fields are only updated if their flag is set to true. 				   ****
	this.getAddrStreet1 = function(which) {
			if (which == 1) { return _primaryAddrStreet1[0] };
			if (which == 2) { return _secondaryAddrStreet1[0] };
			return null;
		},
	this.setAddrStreet1 = function(which, Addr) {
			if (which == 1) { 
				_primaryAddrStreet1[1]=_increment(_primaryAddrStreet1[1]);
				_primaryAddrStreet1[0] = Addr; 
				return true;
			}
			if (which == 2) { 
				_secondaryAddrStreet1[1] =_increment( _secondaryAddrStreet1[1]);
				_secondaryAddrStreet1[0] = Addr;
				return true;
			}
			return false;
		},
	this.getAddrStreet2 = function(which) {
			if (which == 1) { return _primaryAddrStreet2[0] };
			if (which == 2) { return _secondaryAddrStreet2[0] };
			return null;
		},
	this.setAddrStreet2 = function(which, Addr) {
			if (which == 1) { 
				_primaryAddrStreet2[1] = _increment(_primaryAddrStreet2[1]);
				_primaryAddrStreet2[0] = Addr; 
			}
			if (which == 2) { 
				_secondaryAddrStreet2[1] = _increment(_secondaryAddrStreet2[1]);
				_secondaryAddrStreet2[0] = Addr;
			}
			return false;
		},
	this.getAddrStreet3 = function(which) {
			if (which == 1) { return _primaryAddrStreet3[0] };
			if (which == 2) { return _secondaryAddrStreet3[0] };
			return null;
		},
	this.setAddrStreet3 = function(which, Addr) {
			if (which == 1) { 
				_primaryAddrStreet3[1] = _increment(_primaryAddrStreet3[1]);
				_primaryAddrStreet3[0] = Addr; 
			}
			if (which == 2) { 
				_secondaryAddrStreet3[1] = _increment(_secondaryAddrStreet3[1]);
				_secondaryAddrStreet3[0] = Addr;
			}
			return false;
		},
	this.getAddrCity = function(which) {
			if (which == 1) { return _primaryAddrCity[0] };
			if (which == 2) { return _secondaryAddrCity[0] };
			return null;
		},
	this.setAddrCity = function(which, Addr) {
			if (which == 1) { 
				_primaryAddrCity[1] = _increment(_primaryAddrCity[1]);
				_primaryAddrCity[0] = Addr; 
			}
			if (which == 2) { 
				_secondaryAddrCity[1] = _increment(_secondaryAddrCity[1]);
				_secondaryAddrCity[0] = Addr;
			}
			return false;
		},
	this.getAddrState = function(which) {
			if (which == 1) { return _primaryAddrState[0] };
			if (which == 2) { return _secondaryAddrState[0] };
			return null;
		},
	this.setAddrState = function(which, Addr) {
			if (which == 1) { 
				_primaryAddrState[1] = _increment(_primaryAddrState[1]);
				_primaryAddrState[0] = Addr; 
			}
			if (which == 2) { 
				_secondaryAddrState[1] = _increment(_secondaryAddrState[1]);
				_secondaryAddrState[0] = Addr;
			}
			return false;
		},
	this.getAddrZip = function(which) {
			if (which == 1) { return _primaryAddrZip[0] };
			if (which == 2) { return _secondaryAddrZip[0] };
			return null;
		},
	this.setAddrZip = function(which, Addr) {
			if (which == 1) { 
				_primaryAddrZip[1] = _increment(_primaryAddrZip[1]);
				_primaryAddrZip[0] = Addr; 
			}
			if (which == 2) { 
				_secondaryAddrZip[1] = _increment(_secondaryAddrZip[1]);
				_secondaryAddrZip[0] = Addr;
			}
			return false;
		},
	this.getAddrCountry = function(which) {
			if (which == 1) { return _primaryAddrCountry[0] };
			if (which == 2) { return _secondaryAddrCountry[0] };
			return null;
		},
	this.setAddrCountry = function(which, Addr) {
			if (which == 1) { 
				_primaryAddrCountry[1] = _increment(_primaryAddrCountry[1]);
				_primaryAddrCountry[0] = Addr; 
			}
			if (which == 2) { 
				_secondaryAddrCountry[1] = _increment(_secondaryAddrCountry[1]);
				_secondaryAddrCountry[0] = Addr;
			}
			return false;
		}

	// This returns a string containing a formatted address. Formatting depends on how much information
	// is there. 
	this.getFullAddr = function(which) {
		if (which != 1 && which != 2) {return null}; 
		var address = '';
		if (that.getAddrStreet1(which) != null && that.getAddrStreet1(which) != '') { address += that.getAddrStreet1(which) };
		if (that.getAddrStreet2(which) != null && that.getAddrStreet2(which) != '') { 
			if (address != '') { address += "\n" };
			address += that.getAddrStreet2(which) 
		}
		if (that.getAddrStreet3(which) != null && that.getAddrStreet3(which) != '') { 
			if (address != '') { address += "\n" };
			address += that.getAddrStreet3(which) 
		}
		if (that.getAddrCity(which) != null && that.getAddrCity(which) != '') { 
			if (address != '') { address += "\n" };
			address += that.getAddrCity(which) 
		}
		if (that.getAddrState(which) != null && that.getAddrState(which) != '') { 
			if (that.getAddrCity(which) != null && that.getAddrCity(which) != '') {
				address += ", ";
			} else if (address != '') { address += "\n" };
			address += that.getAddrState(which) 
		}
		if (that.getAddrZip(which) != null && that.getAddrZip(which) != '') { 
			if ((that.getAddrCity(which) != null && that.getAddrCity(which) != '') || (that.getAddrState(which) != null && that.getAddrState(which) != '')) {
				address += " ";
			} else if (address != '') { address += "\n" };
			address += that.getAddrZip(which) 
		}
		if (that.getAddrCountry(which) != null && that.getAddrCountry(which) != '') { 
			if (address != '') { address += "\n" };
			address += that.getAddrCountry(which) 
		}
		
		return address; 
	}
	
	// Use Object.defineProperties to define getters and setters. They will return and update each field
	// value as though you are dealing with the field variable itself, only it will handle all the flag
	// incrementing and in some cases, formatting.
	Object.defineProperties(this, {
		"prefix": { 
			"get": function () {
				if (_prefix[0] != null && typeof _prefix[0] == "number") {
					// For "pulldown" fields, fields are stored as numbers. The getter looks up the value
					// corresponding to each number (the values permitted by the dropdown list) and returns
					// that
					if (_prefix[0].toFixed(0) >= 0 && _prefix[0].toFixed(0) <= c.PREFIX.length - 1) {
						return c.PREFIX[_prefix[0].toFixed(0)];
					}
				}
				return null;
            }, 
			"set": function(prefixInput) {
			
				// if the input is a number, it will just store that number as an index for the permitted
				// values. Note that it is stored as an index beginning with zero, and that the input is
				// assumed to begin with 1, which makes it easier to count your way to right value.
				if ( typeof prefixInput == "number" )
				{
					for (var i = 0; i < c.PREFIX.length; i++ ) {
						if ( prefixInput == i+1 ) {
							// unless this set is initializing this property, set it to be updated in SF
							_prefix[1] = _increment(_prefix[1]);
	
							_prefix[0] = i;
							return true;
						}
					}
					return false; // if none of the numbers matches an acceptable integer, failure
				} else if ( typeof prefixInput == "string" ) {// if the input is a string
					for (var i = 0; i < c.PREFIX.length; i++ ) {
						// By converting both the input and the acceptable values to uppercase, we can do
						// a comparison that is not case-sensitive. It doesn't matter what case you use.
						if ( prefixInput.toUpperCase() == c.PREFIX[i].toUpperCase() ) {
							// unless this set is initializing this property, set it to be updated in SF
							_prefix[1] = _increment(_prefix[1]);
		
							_prefix[0] = i;
							return true;
						}
					}
				// Make sure you are able to change a field back to null, which is how SF interprets an
				// empty field.
				} else if ( prefixInput == null ) {
					_prefix[1] = _increment(_prefix[1]);
					_prefix[0] = null;
					return true;
				}			
				
				return false; // if none of the numbers matches an acceptable integer, failure
			}
		},
		// For fields that are not picklist/dropdown, getters and setters are really simple.
		"firstName": {
			"get": function() {
				return _firstName[0];
			},
			"set": function(name) {
				_firstName[1] = _increment(_firstName[1]);
				_firstName[0] = name;
			}
		},
		"middleName": {
			"get": function() {
				return _middleName[0];
			},
			"set": function(name) {
				_middleName[1] = _increment(_middleName[1]);
				_middleName[0] = name;
			}
		},
		"lastName": {
			"get": function() {
				return _lastName[0];
			},
			"set": function(name) {
				_lastName[1] = _increment(_lastName[1]);
				_lastName[0] = name;
			}
		},
		"suffix": {
			"get": function() {
				return _suffix[0];
			},
			"set": function(name) {
				_suffix[1] = _increment(_suffix[1]);
				_suffix[0] = name;
			}
		},
		// the getter/setter "fullName" does not correspond to a particular field. The getter returns
		// a formatted combination of whatever name fields are filled, and the setter parses a
		// string of words and sets each name field accordingly
		"fullName": {
			"get": function() {
				var name = "";
				if ( _firstName[0] != null && _firstName[0] != "") { name += that.firstName };
				if ( _middleName[0] != null && _middleName[0] != "" ) { 
					if (name != "") { name += " " };
					name += _middleName[0];
					console.log(name + "END");
				}
				if ( _lastName[0] != null && _lastName[0] != "" ) { 
					if (name != "") { name += " " };
					name += _lastName[0] ;
				}
				return name;
			},
			"set": function(name) {
				var nameArray = name.split(" ", 3);
				switch (nameArray.length) {
					case 3:
						that.firstName = nameArray[0];
						that.middleName = nameArray[1];
						that.lastName = nameArray[2];
						return;
					case 2:
						that.firstName = nameArray[0];
						that.middleName = "";
						that.lastName = nameArray[1];
						return;
					case 1:
						that.firstName = "";
						that.middleName = "";
						that.lastName = nameArray[0];
						return;
				}
			}
		},
		// fullTitle does exactly what fullName does above, but with the prefix and suffix as well.
		"fullTitle": {
			"get": function() {
				var name = "";
				if ( _prefix[0] != null && _prefix[0] != "" ) { name += that.prefix };
				if ( _firstName[0] != null && _firstName[0] != "" ) { 
					if (name != "") { name += " " };
					name += _firstName[0];
				}
				if ( _middleName[0] != null && _middleName[0] != "" ) { 
					if (name != "") { name += " " };
					name += _middleName[0] };
				if ( _lastName[0] != null && _lastName[0] != "" ) { 
					if (name != "") { name += " " };
					name += _lastName[0] ;
				}
				if ( _suffix[0] != null && _suffix[0] != "" ) { 
					if (name != "") { name += " " };
					name += _suffix[0];
				}
				return name;
			},
			"set": function(name) {
				var nameArray = name.split(" ", 5);
				switch (nameArray.length) {
					case 5:
						that.prefix = nameArray[0];
						that.firstName = nameArray[1];
						that.middleName = nameArray[2];
						that.lastName = nameArray[3];
						that.suffix = nameArray[4];
						return;
					case 4:
						that.prefix = nameArray[0];
						that.firstName = nameArray[1];
						that.middleName = nameArray[2];
						that.lastName = nameArray[3];
						that.suffix = "";
						return;
					case 3:
						that.prefix = nameArray[0];
						that.firstName = nameArray[1];
						that.middleName = "";
						that.lastName = nameArray[2];
						that.suffix = "";
						return;
					case 2:
						that.prefix = nameArray[0];
						that.firstName = "";
						that.middleName = "";
						that.lastName = nameArray[1];
						that.suffix = "";
						return;
					case 1:
						that.prefix = "";
						that.firstName = "";
						that.middleName = "";
						that.lastName = nameArray[0]
						that.suffix = "";
						return;
				}
			}
		},
        "academicType": {
    		"get": function () {
				if (_academicType[0] != null && typeof _academicType[0] == "number") {
					if (_academicType[0].toFixed(0) >= 0 && _academicType[0].toFixed(0) <= c.ACADEMICTYPE.length - 1) {
						return c.ACADEMICTYPE[_academicType[0].toFixed(0)];
					}
				}
				return null;
            	},  
			"set": function(academicTypeInput) {
			
				// if the input is a number
				if ( typeof academicTypeInput == "number" )
				{
					for (var i = 0; i < c.ACADEMICTYPE.length; i++ ) {
						if ( academicTypeInput == i+1 ) {
							// unless this set is initializing this property, set it to be updated in SF
							_academicType[1] = _increment(_academicType[1]);
	
							_academicType[0] = i;
							return true;
						}
					}
					return false; // if none of the numbers matches an acceptable integer, failure
				} else if ( typeof academicTypeInput == "string" ) { // if the input is a string

					for (var i = 0; i < c.ACADEMICTYPE.length; i++ ) {
						if ( academicTypeInput.toUpperCase() == c.ACADEMICTYPE[i].toUpperCase() ) {
							// unless this set is initializing this property, set it to be updated in SF
							_academicType[1] = _increment(_academicType[1]);
		
							_academicType[0] = i;
							return true;
						}
					}

				} else if ( academicTypeInput == null ) {
					_academicType[1] = _increment(_academicType[1]);
					_academicType[0] = null;
					return true;
				}
				
				return false; // if none of the numbers matches an acceptable integer, failure
			}        
		},
		"relationshipStatus": {
			"get": function () {
				if (_relationshipStatus[0] != null && typeof _relationshipStatus[0] == "number") {
					if (_relationshipStatus[0].toFixed(0) >= 0 && _relationshipStatus[0].toFixed(0) <= c.RELATIONSHIPSTATUS.length - 1) {
						return c.RELATIONSHIPSTATUS[_relationshipStatus[0].toFixed(0)];
					}
				}


				return null;
            	},
			"set": function(relationshipStatusInput) {
				
				// if the input is a number
				if ( typeof relationshipStatusInput == "number" )
				{
					for (var i = 0; i < c.RELATIONSHIPSTATUS.length; i++ ) {
						if ( relationshipStatusInput == i+1 ) {
							// unless this set is initializing this property, set it to be updated in SF
							_relationshipStatus[1] = _increment(_relationshipStatus[1]);
	
							_relationshipStatus[0] = i;
							return true;
						}
					}
					return false; // if none of the numbers matches an acceptable integer, failure
				} else if ( typeof relationshipStatusInput == "string" ) { // if the input is a string
					for (var i = 0; i < c.RELATIONSHIPSTATUS.length; i++ ) {
						if ( relationshipStatusInput.toUpperCase() == c.RELATIONSHIPSTATUS[i].toUpperCase() ) {
							// unless this set is initializing this property, set it to be updated in SF
							 _relationshipStatus[1] = _increment(_relationshipStatus[1]);
		
							_relationshipStatus[0] = i;
							return true;
						}
					}
				} else if ( relationshipStatusInput == null ) {
					// unless this set is initializing this property, set it to be updated in SF
					_relationshipStatus[1] = _increment(_relationshipStatus[1]);
					_relationshipStatus[0] = null;
					return true;
				}			
				
				return false; // if none of the numbers matches an acceptable integer, failure
			}
		},
		"primaryAffiliation": {
			"get": function() {
				return _primaryAffiliation[0];
			},
			"set": function(affil) {
				_primaryAffiliation[1] = _increment(_primaryAffiliation[1]);
				_primaryAffiliation[0] = affil;
			}
		},
		// workPhone/personalPhone are like simple field getter/setters, except that they make sure their 
		// values are strings that contain only numbers, they format their output as phone numbers (though they
		// store as simple numbers), and if _preferredPhone is not set, it sets them to workPhone or 
		// personalPhone (i.e., whichever is filled first).
		"workPhone": {
			"get": function() {
				if ( _workPhone[0] != null ) {
					// If number is 10 digits and doesn't begin with 1, it's probably a domestic phone number
					// with area code and should be formatted (xxx) xxx-xxxx.
					if ( _workPhone[0].length == 10 && _workPhone[0][0] != '1' ) {
						return "(" + _workPhone[0].slice(0,3) + ") " + _workPhone[0].slice(3,6) + "-" + _workPhone[0].slice(6,10);
					// If number is 7 digits and doesn't begin with 1, it's probably a domestic phone number
					// without area code and should be formatted xxx-xxxx.
					} else if ( _workPhone[0].length == 7 && _workPhone[0][0] != '1' ) {
						return _workPhone[0].slice(0,3) + "-" + _workPhone[0].slice(3,7);
					}
				}
				return ( _workPhone[0] );
			},
			"set": function(workPhoneInput) {
				if ( workPhoneInput == null ) { 
					_workPhone[1] = _increment(_workPhone[1]);
					_workPhone[0] = null
					return true;
				}
				if ( typeof workPhoneInput == "number" ) { workPhoneInput = workPhoneInput.toString() };
				if ( typeof workPhoneInput != "string" ) { return false };
				_workPhone[1] = _increment(_workPhone[1])
				// Get rid of any non-digit characters, using a regex pattern.
				_workPhone[0] = workPhoneInput.replace(/\D/g,'');
				if ( _preferredPhone[0] == null && _preferredPhone[1] == false ) { that.preferredPhone = 1 };
				return true;
			}
		},
		// The workEmail/personalEmail getter/setters work like the phone ones, but don't do any formatting.
		"workEmail": {
			"get": function() {
				return _workEmail[0];
			},
			"set": function(emailInput) {
				if ( emailInput == null ) { 
					_workEmail[1] = _increment(_workEmail[1]);
					_workEmail[0] = null
					return true;
				}
				if(typeof emailInput != "string") {return false};
				_workEmail[1] = _increment(_workEmail[1]);
				_workEmail[0] = emailInput;
				if ( _preferredEmail[0] == null ) { that.preferredEmail = 2 };
				return true;
			}
		},
		"personalPhone": {
			"get": function() {
				if ( _personalPhone[0] != null ) {
					if ( _personalPhone[0].length == 10 && _personalPhone[0][0] != '1' ) {
						return "(" + _personalPhone[0].slice(0,3) + ") " + _personalPhone[0].slice(3,6) + "-" + _personalPhone[0].slice(6,10);
					} else if ( _personalPhone[0].length == 7 && _personalPhone[0][0] != '1' ) {
						return _personalPhone[0].slice(0,3) + "-" + _personalPhone[0].slice(3,7);
					}
				}
				return ( _personalPhone[0] );
			},
			"set": function(personalPhoneInput) {
				if (personalPhoneInput != null && typeof personalPhoneInput != "string" && typeof personalPhoneInput != "number" ) {
					return false;
				} else if ( _personalPhone[0] != null ) {
					_personalPhone[1] = _increment(_personalPhone[1]);
				}
				if ( personalPhoneInput == null ) { 
					_personalPhone[1] = _increment(_personalPhone[1]);
					_personalPhone[0] = null
					return true;
				}
				if ( typeof personalPhoneInput == "number" ) { personalPhoneInput = personalPhoneInput.toString() };
				if ( typeof personalPhoneInput != "string" ) { return false };
				_personalPhone[1] = _increment(_personalPhone[1])
				_personalPhone[0] = personalPhoneInput.replace(/\D/g,'');
				if ( _preferredPhone[0] == null && _preferredPhone[1] == false ) { that.preferredPhone = 2 };
				return true;
			}
		},
		"personalEmail": {
			"get": function() {
				return _personalEmail[0];
			},
			"set": function(emailInput) {
				_personalEmail[1] = _increment(_personalEmail[1]);
				if ( emailInput == null ) { 
					_personalEmail[1] = _increment(_personalEmail[1]);
					_personalEmail[0] = null
					return true;
				}
				if(typeof emailInput != "string") {return false};
				_personalEmail[1] = _increment(_personalEmail[1]);
				_personalEmail[0] = emailInput;
				if ( _preferredEmail[0] == null && _preferredEmail[1] == false ) { that.preferredEmail = 1 };
				return true;
			}
		},
		"preferredPhone": {
			"get": function () {
				if (_preferredPhone[0] != null && typeof _preferredPhone[0] == "number" ) {
					if( _preferredPhone[0].toFixed(0) >= 0 && _preferredPhone[0].toFixed(0) <= c.PREFERREDPHONE.length - 1) {
						return c.PREFERREDPHONE[_preferredPhone[0].toFixed(0)];
					}
				}
				return null;
            	}, 
			"set": function(preferredPhoneInput) {
			
				// if the input is a number
				if ( typeof preferredPhoneInput == "number" )
				{
					for (var i = 0; i < c.PREFERREDPHONE.length; i++ ) {
						if ( preferredPhoneInput == i+1 ) {
							// unless this set is initializing this property, set it to be updated in SF
							_preferredPhone[1] = _increment(_preferredPhone[1]);
	
							_preferredPhone[0] = i;
							return true;
						}
					}
					return false; // if none of the numbers matches an acceptable integer, failure
				} else if ( typeof preferredPhoneInput == "string") { // if the input is a string
					for (var i = 0; i < c.PREFERREDPHONE.length; i++ ) {
						if ( preferredPhoneInput.toUpperCase() == c.PREFERREDPHONE[i].toUpperCase() ) {
							// unless this set is initializing this property, set it to be updated in SF
							_preferredPhone[1] = _increment(_preferredPhone[1]);
		
							_preferredPhone[0] = i;
							return true;
						}
					}
				} else if ( preferredPhoneInput == null ) {
					// unless this set is initializing this property, set it to be updated in SF
					_preferredPhone[1] = _increment(_preferredPhone[1]);
	
					_preferredPhone[0] = null;
					return true;
				}
				
				return false; // if none of the numbers matches an acceptable integer, failure
			}
		
		},
		"preferredEmail": {
			"get": function () {
				if (_preferredEmail[0] != null && typeof _preferredEmail[0] == "number" ) {
					if ( _preferredEmail[0].toFixed(0) >= 0 && _preferredEmail[0].toFixed(0) <= c.PREFERREDEMAIL.length - 1) {
						return c.PREFERREDEMAIL[_preferredEmail[0].toFixed(0)];
					}
				}
				return null;
            	}, 
			"set": function(preferredEmailInput) {
			
				// if the input is a number
				if ( typeof preferredEmailInput == "number" )
				{
					for (var i = 0; i < c.PREFERREDEMAIL.length; i++ ) {
						if ( preferredEmailInput == i+1 ) {
							// unless this set is initializing this property, set it to be updated in SF
							_preferredEmail[1] = _increment(_preferredEmail[1]);
	
							_preferredEmail[0] = i;
							return true;
						}
					}
					return false; // if none of the numbers matches an acceptable integer, failure
				} else if ( typeof preferredEmailInput == "string" ) { // if the input is a string
					for (var i = 0; i < c.PREFERREDEMAIL.length; i++ ) {
						if ( preferredEmailInput.toUpperCase() == c.PREFERREDEMAIL[i].toUpperCase() ) {
							// unless this set is initializing this property, set it to be updated in SF
							_preferredEmail[1] = _increment(_preferredEmail[1]);
			
							_preferredEmail[0] = i;
							return true;
						}
					}
				} else if ( preferredEmailInput == null ) {
					// unless this set is initializing this property, set it to be updated in SF
					_preferredEmail[1] = _increment(_preferredEmail[1]);
	
					_preferredEmail[0] = null;
					return true;
				}	
				
				return false; // if none of the numbers matches an acceptable integer, failure
			}

		},
		// This gets and sets whichever the preferred email is. Returns false if the getter is
		// used without a preferred email. Does nothing if setter is used without a preferred email.
		"email": { // returns or sets preferred email
			"get": function() {
				if ( _preferredEmail[0] == null ) { return false };
				if ( _preferredEmail[0] == 1 ) { return that.workEmail };
				if ( _preferredEmail[0] == 0 ) { return that.personalEmail };
				return false;
			},
			"set": function(emailInput) {
				if ( _preferredEmail[0] == null ) { return false };
				if ( _preferredEmail[0] == 1 ) { that.workEmail = emailInput };
				if ( _preferredEmail[0] == 0 ) { that.personalEmail = emailInput };
				return;
			}		
		},
		// Same as email, but for preferred phone
		"phone": { // returns or sets preferred phone number
			"get": function() {
				if ( _preferredPhone[0] == null ) { return false };
				if ( _preferredPhone[0] == 0 ) { return that.workPhone };
				if ( _preferredPhone[0] == 1 ) { return that.personalPhone };
				return false;
			},
			"set": function(phoneInput) {
				if ( _preferredPhone[0] == null ) { return false };
				if ( _preferredPhone[0] == 0 ) { that.workPhone = phoneInput };
				if ( _preferredPhone[0] == 1 ) { that.personalPhone = phoneInput };
				return;
			}		
		},
		"notes": {
			"get": function() {
				return _notes[0];
			},
			"set": function(notesin) {
				_notes[1] = _increment(_notes[1]);
				_notes[0] = notesin;
			}

		},
		"bio": {
			"get": function() {
				return _bio[0];
			},
			"set": function(bioin) {
				_bio = _increment(_bio[1]);
				_bio[0] = bioin;
			}

		},
		"researchInterests": {
			"get": function() {
				return _researchInterests[0];
			},
			"set": function(interests) {
				_researchInterests[1] = _increment(_researchInterests[1]);
				_researchInterests[0] = interests;
			}
		},
		"primarySubject": {
			"get": function () {
				if (_primarySubject[0] != null && typeof _primarySubject[0] == "number") {
					if (_primarySubject[0].toFixed(0) >= 0 && _primarySubject[0].toFixed(0) <= c.CONTACTSUBJECT.length - 1) {
						return c.CONTACTSUBJECT[_primarySubject[0].toFixed(0)];
					}
				}
				return null;
            	},
			"set": function(primarySubjectInput) {
			

				// if the input is a number
				if ( typeof primarySubjectInput == "number" )
				{
					for (var i = 0; i < c.CONTACTSUBJECT.length; i++ ) {
						if ( primarySubjectInput == i+1 ) {
							// unless this set is initializing this property, set it to be updated in SF
							_primarySubject[1] = _increment(_primarySubject[1]);
	
							_primarySubject[0] = i;
							return true;
						}
					}
					return false; // if none of the numbers matches an acceptable integer, failure
				} else if ( typeof primarySubjectInput == "string" ) { // if the input is a string
					for (var i = 0; i < c.CONTACTSUBJECT.length; i++ ) {
						if ( primarySubjectInput.toUpperCase() == c.CONTACTSUBJECT[i].toUpperCase() ) {
							// unless this set is initializing this property, set it to be updated in SF
							_primarySubject[1] = _increment(_primarySubject[1]);
			
							_primarySubject[0] = i;
							return true;
						}
					}
					return false; // if none of the numbers matches an acceptable integer, failure
				} else if( primarySubjectInput == null ) {
					_primarySubject[1] = _increment(_primarySubject[1]);
	
					_primarySubject[0] = null;
					return true;
				}
			}
		},
		"secondarySubject": {
			"get": function () {
				if (_secondarySubject[0] != null && typeof _secondarySubject[0] == "number") {
					if (_secondarySubject[0].toFixed(0) >= 0 && _secondarySubject[0].toFixed(0) <= c.CONTACTSUBJECT.length - 1) {
						return c.CONTACTSUBJECT[_secondarySubject[0].toFixed(0)];
					}
				}
				return null;
            	},
			"set": function(secondarySubjectInput) {

				// if the input is a number
				if ( typeof secondarySubjectInput == "number" )
				{
					for (var i = 0; i < c.CONTACTSUBJECT.length; i++ ) {
						if ( secondarySubjectInput == i+1 ) {
							// unless this set is initializing this property, set it to be updated in SF
							_secondarySubject[1] = _increment(_secondarySubject[1]);
	
							_secondarySubject[0] = i;
							return true;
						}
					}
					return false; // if none of the numbers matches an acceptable integer, failure
				} else if ( typeof secondarySubjectInput == "string" ) { // if the input is a string
					for (var i = 0; i < c.CONTACTSUBJECT.length; i++ ) {
						if ( secondarySubjectInput.toUpperCase() == c.CONTACTSUBJECT[i].toUpperCase() ) {
							// unless this set is initializing this property, set it to be updated in SF
							 _secondarySubject[1] = _increment(_secondarySubject[1]);
			
							_secondarySubject[0] = i;
							return true;
						}
					}
				} else if( secondarySubjectInput == null ) {
					_secondarySubject[1] = _increment(_secondarySubject[1]);
	
					_secondarySubject[0] = null;
					return true;
				}
				
				return false; // if none of the numbers matches an acceptable integer, failure
			}
		},
		// Simple getter/setter, but it makes sure that the values to be set are boolean
		"tenureTrack": {
			"get": function() {
				return _tenureTrack[0];
			},
			"set": function(interests) {
				if (typeof interests != "boolean" ) { return false };
				_tenureTrack[1] = _increment(_tenureTrack[1]);
				_tenureTrack[0] = interests;
			}
		},
		// ttrYear and tYear get/set years from a dropdown list, but also set tenure and tenureTrack
		// to true if they are called successfully. If you have a year you got tenure, you must have
		// tenure. Likewise for tenure track.
		"ttrYear": {
			"get": function() {
				return _ttrYear[0];
			},
			"set": function(yearInput) {
				if ( typeof yearInput == "string" && yearInput.length == 4 ) {
					yearInput = parseInt(yearInput);
				}
				if ( typeof yearInput == "number" ) {
				yearInput = parseInt(yearInput);
					if ( yearInput <= c.TYBLIMIT ) { 
						 _ttrYear[1] = _increment(_ttrYear[1]);
						_ttrYear[0] = c.TYBOUTPUT;
						that.tenureTrack = true; 
					} else if ( yearInput > c.TYBLIMIT && yearInput <= c.TYTLIMIT ) { 
						_ttrYear[1] = _increment(_ttrYear[1]);
						_ttrYear[0] = yearInput.toString();
						that.tenureTrack = true;
					} else { return false };
				}
			}
		},
		"tenure": {
			"get": function() {
				return _tenure[0];
			},
			"set": function(interests) {
				if (typeof interests != "boolean" ) { return false };
				_tenure[1] = _increment(_tenure[1]);
				_tenure[0] = interests;
			}
		},
		"tYear": {
			"get": function() {
				return _tYear[0];
			},
			"set": function(yearInput) {
			yearInput = parseInt(yearInput);
				if ( typeof yearInput == "string" && yearInput.length == 4 ) {
					yearInput = parseInt(yearInput);
				} else if ( typeof yearInput == "number" ) {
					if ( yearInput <= c.TYBLIMIT ) { 
						_tYear[1] = _increment(_tYear[1]);
						_tYear[0] = c.TYBOUTPUT;
						that.tenure = true;
					} else if ( yearInput > c.TYBLIMIT && yearInput <= c.TYTLIMIT ) { 
						_tYear[1] = _increment(_tYear[1]);
						_tYear[0] = yearInput.toString();
						that.tenure = true;
					} else { return false };
				} else if ( typeof yearInput == null ) {
					_tYear[1] = _increment(_tYear[1]);
					_tenure[0] = interests;
					return true;
				}
				return false;
			}
		},
		"receivesAcademicMail": {
			"get": function() {
				return _receivesAcademicMail[0];
			},
			"set": function(interests) {
				if (typeof interests != "boolean" && interests != null ) { return false };
				_receivesAcademicMail[1] = _increment(_receivesAcademicMail[1]);
				_receivesAcademicMail[0] = interests;
			}
		},
		"receivesGeneralMail": {
			"get": function() {
				return _receivesGeneralMail[0];
			},
			"set": function(interests) {
				if (typeof interests != "boolean" && interests != null) { return false };
				_receivesGeneralMail[1] = _increment(_receivesGeneralMail[1]);
				_receivesGeneralMail[0] = interests;
			}
		},
		"emailOptOut": {
			"get": function() {
				return _emailOptOut[0];
			},
			"set": function(interests) {
				if (typeof interests != "boolean" && interests != null ) { return false };
				_emailOptOut[1] = _increment(_emailOptOut[1]);
				_emailOptOut[0] = interests;
			}
		},
		// Can't set the id from the global environment. This is to make sure you don't accidentally
		// write one contact's information over another contact, which you should never have to do. If
		// we need to duplicate a contact for some reason, we can create a routine to do so.
		"sfId": {
			"get": function() {
				return _sfId;
			}
		},
		"isNew" : {
			"get" : function () {
				return _isNew;
			}
		}

    });

	// *****************************************************************************************************
	// * Below is the code to initialize the object. It is executed when the object constructor is called. *
	// * When var newcontact = new cvContact(sfConnectionInput, contactIdInput) is called, the connection  *
	// * is put into _sfConnection, the id is put into _sfId (see top), and _fillFromSf (see private       *
	// * methods) is used to get all the contact information from Salesforce. If either of the inputs are  *
	// * missing, cvContact is not filled through Salesforce.											   *
	// *****************************************************************************************************

	if ( _sfConnection != null && _sfId != null ) _fillFromSf();

	
}

module.exports.cvContact = cvContact;
