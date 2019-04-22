import React, { Component } from 'react';

import MenuBar from '../common/MenuBar.js';
import Button from '../common/Button.js';
import DropDown from '../common/DropDown.js';

import * as styles from './TopMenu.module.css';

export default class TopMenu extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const menuContent = this.props.config.list.map((config) => 
            <li key={config.title.slice(0,5).replace(' ','-')} onClick={config.handler}>{config.title}</li>
        );

        return (
            <MenuBar class={this.props.class}>
                <ul className={styles.centered}>
                    <li>
                        <DropDown title={
                            this.props.config.selected === null ? 'Select Configuration' : this.props.config.list[this.props.config.selected] 
                        }>
                            <ul>
                                {menuContent}
                            </ul>
                        </DropDown>
                    </li>
                    <li><div className={styles.spaceHolder} /></li>
                    <li><Button class={styles.button}>Init Entry</Button></li>
                    <li><Button class={styles.button}>Upload PDF</Button></li>
                    <li><Button class={styles.button}>Load Sample PDF</Button></li>
                    <li><Button class={styles.button}>Remove PDF</Button></li>
                    <li><div className={styles.spaceHolder} /></li>
                </ul>
            </MenuBar>
        );
    }
}
