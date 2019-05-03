import React, { Component } from 'react';

import MenuBar from '../common/MenuBar.js';
import Button from '../common/Button.js';
import DropDown from '../common/DropDown.js';

import * as cf from '../../logic/configfunctions';
import * as setLogicState from '../../logic/setlogicstate';
import * as rn from '../render';
import * as ajax from '../../logic/ajaxfunctions';
import * as d from '../state';

import * as styles from './TopMenu.module.css';

export default class TopMenu extends Component {
    constructor(props) {
        super(props);
    }

    logout = (e) => {
        ajax.postJSON(
            `/login`,
            { logout: true },
            (data) => {
                if (data.success) {
                    return this.props.stateSetter((currentState)=>{
                        return ({
                            ...currentState,
                            auth: {
                                ...currentState.auth,
                                loggedin: false,
                                promptlogin: true,
                            }
                        });
                    });
                }

                rn.renderError(this.props.stateSetter, `Unable to log out: ${data.message}`);
            },
            (err) => {
                rn.renderError(this.props.stateSetter, `Unable to log out: ${err.message}`);
            }
        );
    }

    connItemHandler = (e) => {
        e.target.id
    }

    render() {
        if(this.props.state.sfconfig.queryconns && this.props.state.auth.loggedin) {
            console.log('need to query for sfconnections');
            setLogicState(this.props.state);
            cf.getSfConns(this.props.stateSetter, (data)=>{
                console.log(`got sfConns: `, data);
                this.props.stateSetter((currentState)=>{
                    return { 
                        ...currentState, 
                        sfconfig: {
                            ...currentState.sfconfig,
                            sfconns: {
                                list: data.list,
                                selected: null,
                            },
                            queryconns: false,
                        }
                    };
                });
            });
        }

        const configMenuContent = this.props.state.sfconfig.sfschemata.list.map((config) => 
            <li key={config.id} data-id={config.id} onClick={config.handler}>{config.title}</li>
        );

        const connMenuContent = this.props.state.sfconfig.sfconns.list.map((conn) => 
            <li key={conn.id} data-id={conn.id} onClick={conn.handler}>{conn.title}</li>
        );

        console.log('selected conn:');
        console.log(this.props.state.sfconfig.sfconns);
        console.log(d.sfconfig.sfconns);

        return (
            <MenuBar class={this.props.class}>
                {{
                    sectionLeft: (
                        <ul className={styles.left}>
                            <li>
                                <DropDown 
                                    class={styles.dropdownLeft}
                                    title={
                                        this.props.state.sfconfig.sfconns.selected === null ||
                                        this.props.state.sfconfig.sfconns.selected < 0 ||
                                        this.props.state.sfconfig.sfconns.selected >= this.props.state.sfconfig.sfconns.list.length ? 
                                        'Select Connection' :
                                        `Connection: ${this.props.state.sfconfig.sfconns.list[this.props.state.sfconfig.sfconns.selected].title}` 
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
                                        this.props.state.sfconfig.sfschemata.selected === null || 
                                        this.props.state.sfconfig.sfschemata.selected >= this.props.state.sfconfig.sfschemata.list.length ||
                                        this.props.state.sfconfig.sfschemata.selected < 0 ? 
                                        'Select Configuration' : 
                                        `Config: ${this.props.state.sfconfig.sfschemata.list[this.props.state.sfconfig.sfschemata.selected].title}`
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
                            <li><Button class={styles.button}>Init Entry</Button></li>
                            <li><Button class={styles.button}>Upload PDF</Button></li>
                            <li><Button class={styles.button}>Load Sample PDF</Button></li>
                            <li><Button class={styles.button}>Remove PDF</Button></li>
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
