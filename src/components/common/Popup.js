import React, { Component } from 'react';

import * as d from '../state';
import * as mf from '../../logic/mapfunctions';

import Button from '../common/Button';

import * as styles from './Popup.module.css';

export default class Popup extends Component {
    constructor(props) {
        super(props);

    }

    closePopup = () => {
        d.popups.pop();
        this.props.stateSetter(d);
    }

    render() {
        const { header, body, fields, buttons, type } = this.props.children;
        const zindStyle = {
            zIndex: this.props.zind,
        };

        const zindBg = {
            zIndex: this.props.zind - 1,
        };

        if (type === 'loading') {
            setTimeout(()=>{
                if (d.popups.length > 0 && d.popups[d.popups.length-1].type === 'loading') {
                    d.popups.pop();
                    this.props.stateSetter(d);
                }
            }, 5000);

            return (
                <div 
                    style={zindBg}
                    className={`${styles.window} ${this.props.top ? styles.dark : styles.transp}`} 
                    key={this.props.keyprop}
                >
                    <div 
                        style={zindStyle}
                        className={`${styles.loadingPopup}`}
                    >
                        {body}
                    </div>
                </div>
            );
        }

        return (
            <div
                style={zindBg}
                className={`${styles.window} ${this.props.top ? styles.dark : styles.transp}`}
                key={this.props.keyprop}
            >

                <div 
                    style={zindStyle}
                    className={`${styles.popup}`}
                >
                    <div 
                        className={styles.closeBox}
                        onClick={this.closePopup}
                    >×</div>
                    <div className={styles.header}>
                        <h3>{header}</h3>
                    </div>
                    <div className={styles.body}>
                        {body}
                    </div>
                    <div className={styles.buttonDiv}>
                        {buttons.map(button => 
                            <Button 
                                clickHandler={button.clickHandler}
                                class={styles.button}
                            >
                                {button.name}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
