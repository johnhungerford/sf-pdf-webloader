import React, { Component } from 'react';

import Panel from '../common/Panel.js';

import styles from './DocView.module.css';

export default class DocView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.blank) return (
            <Panel 
                outerClass={`${styles.outer} ${this.props.class}`}
            >
                <iframe 
                    className={styles.dociframe}
                    src={this.props.upload ? "/doc/view" : "doc/sample.pdf"}
                />
            </Panel>
        );

        return (
            <Panel 
                outerClass={`${styles.outer} ${this.props.class}`}
                innerClass={styles.centered}
            >
                Click "Upload PDF" or "Load Sample PDF" to view a document for data entry.
            </Panel>
        );
    }
}