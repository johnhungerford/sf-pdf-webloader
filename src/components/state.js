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
        token: null, 
        loggedin: false, 
    },

    // Modal stack
    modals: [],

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
