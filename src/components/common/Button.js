import React, { Component } from 'react';

import * as styles from './Button.module.css';

export default class Button extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.type === 'file') {
            return (
                <span className={`${styles.button} ${this.props.class}`}>
                    {this.props.children}
                    <input 
                        className={styles.fileInput}
                        type='file' 
                        onChange={this.props.fileLoadHandler} 
                    />
                </span>
            )
        }

        return (
            <button className={`${styles.button} ${this.props.class}`} onClick={this.props.clickHandler}>
                {this.props.children}
            </button>
        );
    }
}
