const $ = require('jquery');
const d = require('../components/state');
const rn = require('../components/render');

const getJSON = function(stateSetter, url, successCallback, failCallback) {
    const data = d.sfconfig.sfconns.selected === null ? null :
    { sfconnid: d.sfconfig.sfconns.list[d.sfconfig.sfconns.selected].id};
    $.ajax({
        type: "GET",
        url: url,
        data: data,
        dataType: "json",
        async: true,
    }).done((data2)=>{
        console.log('getJSON:');
        console.log(data2);
        if (data2.wlreauth) {
            if (d.auth.username === null || d.auth.password === null) {
                d.auth.promptlogin = true;
                d.auth.loggedin = false;
                d.auth.password = null;
                return stateSetter(d);
            }

            return postJSON(
                stateSetter,
                `/login`,
                { username: d.auth.username, password: d.auth.password },
                (result) => {
                    if (result.success) {
                        d.auth.promptlogin = false;
                        d.auth.loggedin = true;
                        return getJSON(stateSetter, url, successCallback, failCallback);
                    }

                    d.auth.promptlogin = true;
                    d.auth.loggedin = false;
                    d.auth.password = null;
                    return stateSetter(d);
                },
                (err) => {
                    d.auth.promptlogin = true;
                    d.auth.loggedin = false;
                    d.auth.password = null;
                    return stateSetter(d);
                }
            );
        }

        if (data2.sfreauth) {
            if (data2.redirect) {
                window.open(data2.redirect, '_blank');
            } else  return failCallback instanceof Function ? failCallback(data2) : null;
            rn.renderAlert(
                stateSetter, 
                'You must reauthorize with Salesforce. Click continue when this is complete.',
                () => {
                    return getJSON(stateSetter, url, successCallback, failCallback);
                }
            )

            return;
        }

        return successCallback instanceof Function ? successCallback(data2) : null;
    }).fail((data3) => {
        console.log('getJSON err:');
        console.log(data3);
        return failCallback instanceof Function ? failCallback(data3) : null;
    });
}

const postJSON = function(stateSetter, url, data, successCallback, failCallback) {
    data.sfconnid = d.sfconfig.sfconns.selected === null ? null :
    d.sfconfig.sfconns.list[d.sfconfig.sfconns.selected].id;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: url,
        dataType: "json",
        async: true,
        data: JSON.stringify(data),
    }).done((data2)=>{
        console.log('postJSON:');
        console.log(data2);
        if (data2.wlreauth) {
            if (d.auth.username === null || d.auth.password === null) {
                d.auth.promptlogin = true;
                d.auth.loggedin = false;
                d.auth.password = null;
                return stateSetter(d);
            }

            return postJSON(
                stateSetter,
                `/login`,
                { username: d.auth.username, password: d.auth.password },
                (result) => {
                    if (result.success) {
                        d.auth.loggedin = true;
                        d.auth.promptlogin = false;
                        return postJSON(url, data, successCallback, failCallback);
                    }

                    d.auth.promptlogin = true;
                    d.auth.loggedin = false;
                    d.auth.password = null;
                    return stateSetter(d);
                },
                (err) => {
                    d.auth.promptlogin = true;
                    d.auth.loggedin = false;
                    d.auth.password = null;
                    return stateSetter(d);
                }
            );
        }

        if (data2.sfreauth) {
            if (data2.redirect) {
                window.open(data2.redirect, '_blank');
            } else  return failCallback instanceof Function ? failCallback(data2) : null;
            rn.renderAlert(
                stateSetter, 
                'You must reauthorize with Salesforce. Click continue when this is complete.',
                () => {
                    return postJSON(stateSetter, url, data, successCallback, failCallback);
                }
            )

            return;
        }

        return successCallback instanceof Function ? successCallback(data2) : null;
    }).fail((data3) => {
        console.log('postJSON err:');
        console.log(data3);
        return failCallback instanceof Function ? failCallback(data3) : null;
    });
}

const postForm = function(stateSetter, url, data, successCallback, failCallback) {
    data.sfconnid = d.sfconfig.sfconns.selected === null ? null :
    d.sfconfig.sfconns.list[d.sfconfig.sfconns.selected].id;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: url,
        dataType: "json",
        async: true,
        data: data,
        cache: false,
        contentType: false,
        processData: false
    }).done((data2) => {
        console.log('postForm:');
        console.log(data2);
        if (data2.wlreauth) {
            if (d.auth.username === null || d.auth.password === null) {
                d.auth.promptlogin = true;
                d.auth.loggedin = false;
                d.auth.password = null;
                return stateSetter(d);
            }

            return postJSON(
                stateSetter,
                `/login`,
                { username: d.auth.username, password: d.auth.password },
                (result) => {
                    if (result.success) {
                        d.auth.loggedin = true;
                        d.auth.promptlogin = false;
                        return postForm(stateSetter, url, data, successCallback, failCallback)
                    }

                    d.auth.promptlogin = true;
                    d.auth.loggedin = false;
                    d.auth.password = null;
                    return stateSetter(d);
                },
                (err) => {
                    d.auth.promptlogin = true;
                    d.auth.loggedin = false;
                    d.auth.password = null;
                    return stateSetter(d);
                }
            );
        }

        if (data2.sfreauth) {
            if (data2.redirect) {
                window.open(data2.redirect, '_blank');
            } else  return failCallback instanceof Function ? failCallback(data2) : null;
            rn.renderAlert(
                stateSetter, 
                'You must reauthorize with Salesforce. Click continue when this is complete.',
                () => {
                    return postForm(stateSetter, url, data, successCallback, failCallback);
                }
            )

            return;
        }

        return successCallback instanceof Function ? successCallback(data2) : null;
    }).fail((data3) => {
        console.log('postForm err:');
        console.log(data3);
        return failCallback instanceof Function ? failCallback(data3) : null;
    });
}

module.exports.getJSON = getJSON;
module.exports.postJSON = postJSON;
module.exports.postForm = postForm;
