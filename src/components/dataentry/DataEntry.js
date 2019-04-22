import React, { Component } from 'react';

import Panel from '../common/Panel.js';
import Button from '../common/Button.js';

import styles from './DataEntry.module.css';

export default class DataEntry extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let buttonLeft = <Button class={styles.buttonLeft}>{'<'}</Button>
        let buttonRight = <Button class={styles.buttonRight}>{'>'}</Button>
        let dataInput = <input type='text' className={styles.dataInput}/>
        let dataTitle = <h3></h3>
        let dataInstructions = <span></span>

        return (
            <Panel 
                outerClass={this.props.class}
                innerClass={styles.outer}
            > 
                <div className={styles.divLeft}>
                    {buttonLeft}
                </div>
                <div className={styles.divCenter}>
                    {dataTitle}
                    {dataInput}
                    {dataInstructions}
                </div>
                <div className={styles.divRight}>
                    {buttonRight}
                </div>
            </Panel>
        );
    }
}