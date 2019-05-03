import React, { Component } from 'react';

import Panel from '../common/Panel.js';
import Button from '../common/Button.js';

import * as rn from '../render';
import * as ajax from '../../logic/ajaxfunctions';

import styles from './Login.module.css';
import { runInNewContext } from 'vm';

export default class DataEntry extends Component {
    constructor(props) {
        super(props);
    }

    nameChange = (e) => {
        const value = e.target.value;
        this.props.stateSetter((currentState) => {
            return { 
                ...currentState, 
                auth: {
                    ...currentState.auth, 
                    username: value
                }
            };
        });
    }
    
    pwdChange = (e) => {
        const value = e.target.value;
        this.props.stateSetter((currentState) => {
            return { 
                ...currentState, 
                auth: {
                    ...currentState.auth, 
                    password: value
                }
            };
        });
    }

    submit = () => {
        console.log('submitted!');
        console.log(`username: ${this.props.auth.username} password: ${this.props.auth.password}`)
        ajax.postJSON(
            '/login',
            { 
                username: this.props.auth.username,
                password: this.props.auth.password,
            },
            (result) => {
                console.log('hello?');
                console.log(result);
                if (result.success) {
                    this.props.stateSetter((currentState)=>{
                        return { 
                            ...currentState, 
                            auth: {
                                username: result.username,
                                loggedin: true,
                            }
                        };
                    });

                    return;
                }

                return rn.renderErr(this.props.stateSetter, result.message);
            },
            (err) => { return rn.renderErr(this.props.stateSetter, err.message) }
        );
    }

    keyDownHandler = (e) => {
        if(e.keyCode === 13) this.submit();
    }

    render() {
        return (
            <div 
                className={styles.outerDiv}
                tabIndex='0'
                onKeyDown={this.keyDownHandler}
            >
                <Panel 
                    outerClass={styles.panelOuter}
                    innerClass={styles.panelInner}
                >
                    <div className={styles.container}>
                        <h1>Login</h1>
                        <div className={styles.textinputs}>
                            <div className={styles.userName}>
                                Username: <input 
                                    id='username' 
                                    type='text' 
                                    onChange={this.nameChange}
                                />
                            </div>
                            <div className={styles.password}>
                                Password: <input 
                                    id='password' 
                                    type='password' 
                                    onChange={this.pwdChange}
                                />
                            </div>
                        </div>
                        <div className={styles.submit}>
                            <Button 
                                class={styles.login}
                                clickHandler={this.submit}
                            >Login</Button>
                            <Button class={styles.register}>Register</Button>
                        </div>
                    </div>
                </Panel>
            </div>
        );
    }
}