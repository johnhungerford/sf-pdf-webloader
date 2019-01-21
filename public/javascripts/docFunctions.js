var d = [];
var di = 0;

/** 
 * Generates function to be passed to getDocs() as callback for most occasions: makes sure that di 
 * is within the bounds of document array and either initialize the record array (if changedoc is 
 * true) or just rerender everything (if changedoc is false).
 */
const updateDocCallback = function(changedoc) {
	return () => {
		if (di >= d.length) di = d.length-1;
		if ( di < 0 ) { di = 0; }
		renderDoc();
		renderTMenu();
		if(changedoc) {
			initR();
		} else {
			renderSfView();
			renderFldEntry();
		}
		renderLoadingEnd();
		return;
	}
}

const getDocs = function(callback, array) {

	if( array ) {
		if( array.constructor = Array ) {
			d = array;
			callback();
		}
	}

	renderLoadingStart('Getting documents list');
	
	$.getJSON('/doc/get', function(data) {
		if( data.err ) {
			renderLoadingEnd();
			renderError(data.err);
			return;
		} else if (data.constructor != Array) {
			d = [];
		} else {
			d = data;
		}
		if ( di >= d.length ) { di = d.length-1; }
		if ( di < 0 ) { di = 0; }
		if(init) {
			init = false;
			search = true;
			addSearchRecords();
			renderDoc();
			renderTMenu();
			renderSfView();
			renderFldEntry();
		} else {
			renderDoc();
			renderTMenu();
			renderSfView();
			renderFldEntry();
		}
		renderLoadingEnd();
		
	});

}

var addDoc = function(option, fd, callback) {

	renderLoadingStart('Adding a document');


	if( !option ) { return false; }

	if( option != 'top' && option != 'bottom' && option != 'next') { return false; }

	if( !fd ) { return false; }

	if( !fd.get('file') ) { return false; }

	fd.append('di',di);

	$.ajax({
            url: '/doc/add/'+option,  
            type: 'POST',
            data: fd,
            success:function(data){
            	renderLoadingEnd();
            	if ( data.err ) {
            		renderError(data.err);
            		return false;
            	} else if ( !data ) {
            		renderError('No document Id returned...');
            		return false;
            	} else {
            		if( option == 'top' ) {
            			if(di > 0) di++;
            		}
            		getDocs(data.docArray);
            		if(callback) { 
            			callback(); 
            		} 
            	}
            },
            cache: false,
            contentType: false,
            processData: false
        });

	return true;

}

var removeDocFromD = function(id) {

	for( var i = 0; i < d.length; i++ ) {
		if ( d[i] == id ) { 
			if ( di > i ) { di--; }
			d.splice( i, 1 );
			return true; 
		}
	}

	return false;

}

var removeDoc = function(id, callback) {

	if( d.length < 1 ) { return; }

	renderLoadingStart('Removing Document');
	$.getJSON('/doc/remove/'+id, function(data) {
		if( data.err ) {
			renderError(data.err);
			return;
		} else if (!data) {
			renderLoadingEnd();
			getDocs();
		} else {
			renderLoadingEnd();
			getDocs(data);
		}
		if( callback ) {
			callback();
		}

	});

}