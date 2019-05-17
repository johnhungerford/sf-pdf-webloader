import React, { Component } from 'react';

import * as d from '../state';

import * as styles from './SchemaConfigure.module.css';

export default class SetLayout extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sObjects: [],
        };
    }

    render = () => {
        console.log('SetLayout state');
        console.log(this.state);
        const header = null;
        const body = null;
        const buttons = null;

        return (
            <PopupContent
                keyprop={d.popups.length}
            >
                {{
                    header: header,
                    body: body,
                    buttons: buttons,
                }}
            </PopupContent>
        );
    }
}
