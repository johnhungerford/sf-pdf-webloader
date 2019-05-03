const $ = require('jquery');

const getJSON = function(url, successCallback, failCallback) {
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        async: true,
    }).done(successCallback).fail(failCallback);
}

const postJSON = function(url, data, successCallback, failCallback) {
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: url,
        dataType: "json",
        async: true,
        data: JSON.stringify(data),
    }).done(successCallback).fail(failCallback);
}

module.exports.getJSON = getJSON;
module.exports.postJSON = postJSON;
