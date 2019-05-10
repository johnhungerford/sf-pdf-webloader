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
        const dis = this.props.disabled === true ? true : false;
        const className = dis ?
            `${styles.topClosed} ${this.props.class} disabled` :
            `${styles.topClosed} ${this.props.class}`;

        if (this.state.expand && !dis) {
            return (
                <div 
                    className={`${styles.topExpanded} ${this.props.class}`}
                    onClick={this.clickHandler} 
                    ref={(node) => { this.titleRef = node}}
                >
                    <div className={styles.titleBox}>{this.props.title}</div>
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
                <div 
                    className={className} 
                    onClick={dis ? ()=>null : this.clickHandler}
                >
                    <div className={styles.titleBox}>{this.props.title}</div>
                    <div className={styles.downArrowBox} />
                </div>
            </div>
        );
    }
}
