import React, { Component } from 'react';

import * as styles from './Popup.module.css';

export default class Popup extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Panel 
                outerClass={styles.modalOuter}
                innerClass={styles.modalInner}
            >
                <div className={styles.header}>
                    <h1>{this.props.header}</h1>
                    <div className={styles.closebox} />
                </div>
                <div className={styles.content}>
                    {this.props.children}
                </div>
                <div className={styles.buttonDiv}>
                    {buttons.map(button => 
                        <Button 
                            clickhandler={button.clickHandler}
                        >
                            {button.name}
                        </Button>
                    )}
                    <Button 
                        clickHandler={this.props.close instanceof Function ? this.props.close : this.close}
                    >
                        Cancel
                    </Button>
                </div>


            </Panel>
        );
    }
}
