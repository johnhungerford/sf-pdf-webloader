import React, { Component } from 'react';

import * as styles from './DropDown.module.css';

export default class DropDown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expand: false,
        }
    }

    componentWillMount() {document.addEventListener('mousedown', this.outsideClickHandler, false);}
    componentWillUnmount() {document.removeEventListener('mousedown', this.outsideClickHandler, false);}

    outsideClickHandler = (e) => {
        if (this.state.expand === false) return;
        if (this.titleRef.contains(e.target) || this.contentRef.contains(e.target)) return;
        this.setState({ expand: false });
    }

    clickHandler = () => {
        this.setState(currentState => { return {expand: !currentState.expand};});
    }

    render() {
        if (this.state.expand) {
            return (
                <div 
                    className={`${styles.topExpanded} ${this.props.class}`}
                    onClick={this.clickHandler} 
                    ref={(node) => { this.titleRef = node}}
                >
                    {this.props.title}
                    <div className={styles.downArrowBox} />
                    <div 
                        className={styles.menu} 
                        ref={(node) => { this.contentRef = node}}
                    >
                        {this.props.children}
                    </div>
                </div>
            );
        }

        return (
            <div style={{ display: 'inline-block' }}>
                <div className={`${styles.topClosed} ${this.props.class}`} onClick={this.clickHandler}>
                    {this.props.title}
                    <div className={styles.downArrowBox} />
                </div>
            </div>
        );
    }
}
