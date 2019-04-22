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
        this.state = { 
            docUrl: null,
            modals: [],
            dm = {},
            r = [],
            ri = 0,
            fi = null,
            search = true,
            sdata = { empty: true },
            init = true,
            mdownpos = [],
            config: [],
        };
    }

    render() {
        const configObj = { 
            list: [
                { title: 'one', handler: ()=>{} },
                { title: 'two', handler: ()=>{} },
                { title: 'three', handler: ()=>{} },
                { title: 'four', handler: ()=>{} },
            ],
            selected: null, 
        }

        return (
            <div>
                <div>
                    <TopMenu
                        class={styles.menu} 
                        config={configObj}
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
