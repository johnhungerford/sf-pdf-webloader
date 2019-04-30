import React, { Component } from 'react';

import TopMenu from './topmenu/TopMenu.js';
import SfView from './sfview/SfView.js';
import DataEntry from './dataentry/DataEntry.js';
import DocView from './docview/DocView.js';
import PopupStack from './common/PopupStack.js';

import styles from './App.module.css';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = require('./state.js');
    }

    render() {
        if (!this.state.auth.loggedin) return (<div><Login /></div>)

        return (
            <div>
                <div>
                    <TopMenu
                        class={styles.menu} 
                        config={this.state.config}
                        conn={this.state.conn}
                    />
                    <div className={styles.outerDiv}>
                        <SfView class={styles.sfView}>
                            This is the Salesforce viewer...
                        </SfView>
                        <div className={styles.innerDiv}>
                            <DataEntry 
                                class={styles.dataEntry}
                            />
                            <DocView 
                                class={styles.docView} 
                                url={this.state.docUrl}
                            />
                        </div>
                    </div>
                </div>
                <PopupStack stack={this.state.modals} />
            </div>
        );
    }
}
