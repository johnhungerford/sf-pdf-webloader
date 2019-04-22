import React, { Component } from 'react';

import styles from './Panel.module.css';

export default class Panel extends Component {
    constructor(props) {
        super(props);
    }    

    render() {
        const outerClass = this.props.outerClass === undefined ? {} : this.props.outerClass;
        const innerClass = this.props.innerClass === undefined ? {} : this.props.innerClass;

        return (
            <div className={`${styles.outer} ${outerClass}`}>
                <div className={`${styles.inner} ${innerClass}`}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}