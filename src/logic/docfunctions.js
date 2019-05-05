const rn = require('../components/render.js');
const ajax = require('./ajaxfunctions')
const d = require('../components/state');

const addDoc = function(stateSetter, fd) {
	rn.renderLoadingStart('Loading document');

	if( !fd ) { return false; }

	if( !fd.get('file') ) { return false; }

	ajax.postForm(
		stateSetter,
		'/doc/load',  
		fd,
		(data) => {
			console.log(data);
			rn.renderLoadingEnd();
			if ( data.err) {
				rn.renderError(stateSetter, data.err);
				return false;
			}
			
			if ( data.success && data.html ) {
				d.doc.html = data.html;
				d.doc.render = true;
				stateSetter(d);
			}
		},
		(err) => { 
			rn.renderError(stateSetter, `Unable to post data to ${'/doc/load'}: ${err.message}`); 
		}
	);

	return true;

} 

module.exports.addDoc = addDoc;
