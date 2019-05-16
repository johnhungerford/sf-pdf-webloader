import React, { Component } from 'react';

import * as styles from './Popup.module.css';

export default class Popup extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        const zindBg = {
            zIndex: this.props.zind,
        };

        return (
            <div
                style={zindBg}
                className={`${styles.window} ${this.props.top ? styles.dark : styles.transp}`}
                key={`popup-${this.props.keyprop}`}
            >
                {this.props.children}
            </div>
        );
    }
}
