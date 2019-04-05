const rn = require('./render.js');

const addDoc = function(fd, callback) {
	rn.renderLoadingStart('Loading document');

	if( !fd ) { return false; }

	if( !fd.get('file') ) { return false; }

	$.ajax({
            url: '/doc/load',  
            type: 'POST',
            data: fd,
            success:function(data){
            	rn.renderLoadingEnd();
            	if ( data.err || !data.iframeurl) {
            		rn.renderError(data.err);
            		return false;
            	} else {
            		rn.renderDoc(data.iframeurl);
            	}
            },
            cache: false,
            contentType: false,
            processData: false
        });

	return true;

}

const removeDoc = function(callback) {
	rn.renderLoadingStart('Removing Document');
	$.getJSON('/doc/remove', function(data) {
		rn.renderLoadingEnd();
		/*if( data.err ) {
			rn.renderError(data.err);
			return;
		}*/
		if( callback ) {
			callback();
		} else {
			rn.renderDoc();
		}

	});

}

module.exports.addDoc = addDoc;
module.exports.removeDoc = removeDoc;
