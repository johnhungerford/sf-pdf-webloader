module.exports = {
    // Authentification information
    auth: {
        promptlogin: false,
        username: null,
        password: null,
        loggedin: false,
        register: false, 
    },

    sfconfig: {
        queryconns: true,
        sfschemata: {list:[], selected:null},
        sfconns: {list:[], selected:null},
        sfconnconfig: null,
    },

    // Sf record data
    dm: null,

    stage: 'off',
    search: false,
    sdata: { empty: true },

    r: [],
    ri: 0,
    fi: null,

    fldentry: {
        value: null,
        focus: null,
        submit: false,
        blockKey: false,
    },

    doc: {
        html: null,
        render: false,
        sample: false,
        selectionerr: null,
    },

    // Popup stack
    popups: [],

    // Loading
    loading: false,
    loadmessage: null,

    // Where is the cursor?
    mdownpos: [],

    datalibrary: {},
}
