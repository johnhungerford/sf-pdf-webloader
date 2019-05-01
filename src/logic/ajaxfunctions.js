const $ = require('jquery');
const d = require('../components/state');

const getJSON = function(url, successCallback, failCallback) {
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        async: true,
        beforeSend: setHeader,
    }).done(successCallback).fail(failCallback);
}

const postJSON = function(url, data, successCallback, failCallback) {
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: url,
        dataType: "json",
        async: true,
        beforeSend: setHeader,
        data: JSON.stringify(data),
    }).done(successCallback).fail(failCallback);
}

const setHeader = function(xhr) { xhr.setRequestHeader("Authorization", 'Bearer '+ d.auth.token) };

module.exports.getJSON = getJSON;
module.exports.postJSON = postJSON;
