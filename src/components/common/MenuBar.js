import React, { Component } from 'react';

import Panel from './Panel.js';
import * as styles from './MenuBar.module.css';

export default class MenuBar extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { sectionLeft, sectionCenter, sectionRight } = this.props.children;
        return (
            <Panel 
                outerClass={`${styles.menu} ${styles.allowOverflow} ${this.props.class}`}
                innerClass={styles.allowOverflow}
            >
                <div className={styles.sectionLeft}>{sectionLeft}</div>
                <div className={styles.sectionRight}>{sectionRight}</div>
                <div className={styles.sectionCenter}>{sectionCenter}</div>
            </Panel>
        );
    }
}
