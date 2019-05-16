import React, { Component } from 'react';

import * as d from '../state';
import * as mf from '../../logic/mapfunctions';

import Button from '../common/Button';

import * as styles from './Popup.module.css';

export default class Popup extends Component {
    constructor(props) {
        super(props);

    }

    closePopup = () => {
        d.popups.pop();
        this.props.stateSetter(d);
    }

    render() {
        return (
            <div className={`${styles.loadingPopup}`} key={`loading-popup-${this.props.keyprop}`}>
                {this.props.children}
            </div>
        );
    }
}
