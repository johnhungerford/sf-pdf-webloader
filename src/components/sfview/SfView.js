import React, { Component } from 'react';

import Panel from '../common/Panel.js';
import SfHeader from './SfHeader.js';
import SfSearchList from './SfSearchList.js';
import SfRecordList from './SfRecordList.js';

import styles from './SfView.module.css';

export default class SfView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Panel outerClass={`${styles.outer} ${this.props.class}`}
            >
                <SfHeader />
                <SfSearchList />
                <SfRecordList />
            </Panel>
        );
    }
}