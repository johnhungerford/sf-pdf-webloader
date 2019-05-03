module.exports = {
    // Sf record data
    dm: {},
    r: [],
    ri: 0,
    fi: null,

    // State of webloader
    search: true,
    sdata: { empty: true },
    init: true,

    // Where is the cursor?
    mdownpos: [],

    // Authentification information
    auth: {
        promptlogin: false,
        username: null,
        loggedin: false, 
    },

    // Popup stack
    popups: [],

    // Loading
    loading: false,
    loadmessage: null,

    sfconfig: {
        queryconns: true,
        sfschemata: {list:[], selected:null},
        sfconns: {list:[], selected:null},
        sfconnconfig: null,
    },

    // temporary aspects
    config: {
        list: [{ title: 'one', handler: null },{ title: 'two', handler: null },{ title: 'three', handler: null },{ title: 'four', handler: null }],
        selected: 1,
    },
    conn: {
        list: [{ title: 'one', handler: null },{ title: 'two', handler: null },{ title: 'three', handler: null },{ title: 'four', handler: null }],
        selected: null,
    },
}
