const rn = require('./render.js');
const d = require('../components/state');

const addDoc = function(fd, stateSetter) {
	rn.renderLoadingStart('Loading document');

	if( !fd ) { return false; }

	if( !fd.get('file') ) { return false; }

	$.ajax({
            url: '/doc/load',  
            type: 'POST',
            data: fd,
            success:function(data){
            	rn.renderLoadingEnd();
            	if ( data.err) {
            		rn.renderError(stateSetter, data.err);
            		return false;
            	} else {
            		stateSetter(d);
            	}
            },
            cache: false,
            contentType: false,
            processData: false
        });

	return true;

} 

const removeDoc = function(stateSetter) {
	rn.renderLoadingStart(stateSetter, 'Removing Document');
	$.getJSON('/doc/remove', function(data) {
		rn.renderLoadingEnd(stateSetter);
		/*if( data.err ) {
			rn.renderError(data.err);
			return;
		}*/
		stateSetter(d);
	});

}

module.exports.addDoc = addDoc;
module.exports.removeDoc = removeDoc;
