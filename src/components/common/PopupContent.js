import React, { Component } from 'react';

import Button from '../common/Button';

import * as styles from './Popup.module.css';

export default class PopupContent extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        const { header, body, buttons } = this.props.children;
        const zindStyle = {
            zIndex: 'auto',
        };

        return (
            <div 
                style={zindStyle}
                className={`${this.props.class === undefined ? styles.popup : this.props.class}`}
                key={`popup-content-${this.props.keyprop}`}
            >
                <div 
                    className={styles.closeBox}
                    onClick={this.props.children.closeHandler}
                >×</div>
                <div className={styles.header}>
                    <h3>{header}</h3>
                </div>
                <div className={styles.body}>
                    {body}
                </div>
                <div className={styles.buttonDiv}>
                    <React.Fragment>
                        {buttons.map((button, ind) => 
                            <Button 
                                disabled={button.disabled === undefined ? false : button.disabled}
                                clickHandler={()=>{
                                    if (this.props.children.closeHandler && button.close && button.clickHandler) {
                                        button.clickHandler(this.props.children.closeHandler);
                                    } else if (this.props.children.closeHandler && button.close) {
                                        this.props.children.closeHandler();
                                    } else if (button.clickHandler) {
                                        button.clickHandler();
                                    }
                                }}
                                class={styles.button}
                            >
                                {button.name}
                            </Button>
                        )}
                    </React.Fragment>
                </div>
            </div>
        );
    }
}
