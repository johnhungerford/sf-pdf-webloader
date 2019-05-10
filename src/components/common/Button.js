import React, { Component } from 'react';

import * as styles from './Button.module.css';

export default class Button extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const dis = this.props.disabled === true ? true : false;

        const className = dis ?
            `${styles.button} ${this.props.class} disabled` :
            `${styles.button} ${this.props.class}`;

        if (this.props.type === 'file' && !dis) {
            return (
                <span className={`${styles.button} ${this.props.class}`}>
                    {this.props.children}
                    <input 
                        className={styles.fileInput}
                        type='file' 
                        onChange={this.props.fileLoadHandler}
                        ref={this.props.setRef}
                        disabled={dis}
                    />
                </span>
            )
        }

        return (
            <button 
                className={className} 
                onClick={dis ? ()=>null : this.props.clickHandler}
                ref={this.props.setRef}
            >
                {this.props.children}
            </button>
        );
    }
}
