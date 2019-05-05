import React, { Component } from 'react';

import MenuBar from '../common/MenuBar.js';
import Button from '../common/Button.js';
import DropDown from '../common/DropDown.js';

import * as cf from '../../logic/configfunctions';
import * as rn from '../render';
import * as df from '../../logic/docfunctions';
import * as ajax from '../../logic/ajaxfunctions';
import * as d from '../state';

import * as styles from './TopMenu.module.css';

export default class TopMenu extends Component {
    constructor(props) {
        super(props);
    }

    logout = (e) => {
        ajax.postJSON(
            this.props.stateSetter,
            `/login`,
            { logout: true },
            (data) => {
                if (data.success) {
                    d.auth.loggedin = false;
                    d.auth.promptlogin = true;
                    this.props.stateSetter(d);
                }

                rn.renderError(this.props.stateSetter, `Unable to log out: ${data.message}`);
            },
            (err) => {
                rn.renderError(this.props.stateSetter, `Unable to log out: ${err.message}`);
            }
        );
    }

    initEntry = () => {
        console.log('hello...');
    }

    loadSamplePdf = () => {
        d.doc = {
            html: null,
            render: true,
            sample: true,
        };
        this.props.stateSetter(d);
    }

    removePdf = (e) => {
        d.doc = {
            html: null,
            render: false,
            sample: false,
        };
        this.props.stateSetter(d);
    }

    uploadPdf = (e) => {
        const fd = new FormData();
        fd.append('file', e.target.files[0]);
        d.doc.render = false;
        d.doc.sample = false;
        return df.addDoc(this.props.stateSetter, fd);
    }

    render() {
        if(d.sfconfig.queryconns && d.auth.loggedin) {
            cf.getSfConns(
                this.props.stateSetter, 
                (data)=>{
                    d.sfconfig.sfconns.list = data.list;
                    d.sfconfig.sfconns.selected = null;
                    d.sfconfig.queryconns = false;
                    this.props.stateSetter(d);
                }
            );
        }

        const configMenuContent = d.sfconfig.sfschemata.list.map((config) => 
            <li key={config.id} data-id={config.id} onClick={config.handler}>{config.title}</li>
        );

        const connMenuContent = d.sfconfig.sfconns.list.map((conn) => 
            <li key={conn.id} data-id={conn.id} onClick={conn.handler}>{conn.title}</li>
        );

        return (
            <MenuBar class={this.props.class}>
                {{
                    sectionLeft: (
                        <ul className={styles.left}>
                            <li>
                                <DropDown 
                                    class={styles.dropdownLeft}
                                    title={
                                        d.sfconfig.sfconns.selected === null ||
                                        d.sfconfig.sfconns.selected < 0 ||
                                        d.sfconfig.sfconns.selected >= d.sfconfig.sfconns.list.length ? 
                                        'Select Connection' :
                                        `Connection: ${d.sfconfig.sfconns.list[d.sfconfig.sfconns.selected].title}` 
                                    }
                                >
                                    <ul>
                                        {connMenuContent}
                                    </ul>
                                </DropDown>
                            </li>
                            <li>
                                <DropDown
                                    title={
                                        d.sfconfig.sfschemata.selected === null || 
                                        d.sfconfig.sfschemata.selected >= d.sfconfig.sfschemata.list.length ||
                                        d.sfconfig.sfschemata.selected < 0 ? 
                                        'Select Configuration' :
                                        `Config: ${d.sfconfig.sfschemata.list[d.sfconfig.sfschemata.selected].title}`
                                    }
                                >
                                    <ul>
                                        {configMenuContent}
                                    </ul>
                                </DropDown>
                            </li>
                        </ul>
                    ),
                    sectionCenter: (
                        <ul className={styles.center}>
                            <li>
                                <Button class={styles.button} clickHandler={this.initEntry}>
                                    Init Entry
                                </Button>
                            </li>
                            <li>
                                <Button class={styles.button} type='file' fileLoadHandler={this.uploadPdf}>
                                    Upload PDF
                                </Button>
                            </li>
                            <li>
                                <Button class={styles.button} clickHandler={this.loadSamplePdf}>
                                    Load Sample PDF
                                </Button>
                            </li>
                            <li>
                                <Button class={styles.button} clickHandler={this.removePdf}>
                                    Remove PDF
                                </Button>
                            </li>
                        </ul>
                    ),
                    sectionRight: (
                        <Button 
                            class={styles.logout}
                            clickHandler={this.logout}
                        >
                            Logout
                         </Button>
                    ),
                }}
            </MenuBar>
        );
    }
}
