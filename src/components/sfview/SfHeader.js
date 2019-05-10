import React, { Component } from 'react';

import Button from '../common/Button';

import styles from './SfHeader.module.css';

export default class SfHeader extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { header, buttons } = this.props.children;
        if (header === null) return (
            <div>
                <ul className={styles.buttonList}>
                    {buttons.map((val,ind)=>(
                        <li key={`header-button-${ind}`}>
                            <Button class={styles.button} clickHandler={val.clickHandler}>
                                {val.title}
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        );

        return (
            <div>
                <ul className={styles.buttonList}>
                    {buttons.map((val,ind)=>(
                        <li key={`header-button-${ind}`}>
                            <Button class={styles.button} clickHandler={val.clickHandler}>
                                {val.title}
                            </Button>
                        </li>
                    ))}
                </ul>
                <h3 className={styles.wrap}>{header}</h3>
            </div>
        );
    }
}
