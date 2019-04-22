import React, { Component } from 'react';

import Panel from './Panel.js';
import * as styles from './MenuBar.module.css';

export default class MenuBar extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Panel 
                outerClass={`${styles.menu} ${styles.allowOverflow} ${this.props.class}`}
                innerClass={styles.allowOverflow}
            >
                {this.props.children}
            </Panel>
        );
    }
}
