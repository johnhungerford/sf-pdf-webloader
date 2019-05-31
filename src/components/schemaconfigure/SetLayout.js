import React, { Component } from 'react';

import * as d from '../state';

import * as styles from './SchemaConfigure.module.css';

export default class SetLayout extends Component {
    constructor(props) {
        super(props);
    }

    getAllFields = () => {
        return getFieldsRecursive(this.props.layout, []);
    }

    getFieldsRecursive = (objIn, pathIn) => {
        const getFragment = (field, pathIn, type) => {
            if (typeof(field) === 'string') return (
                <React.Fragment>
                    <input key={`layout-field-before-${path.join('-')}`} type='text' value={this.getVal([...pathIn, 'b'])}/>
                    <span>{this.editConditionBtnElem([...pathIn, 'b'])}</span>
                </React.Fragment>
            );

            return this.getFieldsRecursive(field, [...pathIn, type]);
        };

        const before = getFragment(pathIn.before, pathIn, 'b');

        if (objIn.condition === undefined) {
            return (
                <React.Fragment>
                    {before}
                </React.Fragment>
            );
        }

        const after = getFragment(pathIn.after, pathIn, 'a');

        const condition = <span>{objIn.condition === 'filled' ? `${objIn.conditionField} has vallue` : `${objIn.conditionField} equals ${objIn.equals}`}</span>;
        const trueElem = getFragment(objIn.true, pathIn, 't');
        const falseEelm = getFragment(objIn.false, pathIn, 'f');
        const conditionDiv = (
            <div>
                {condition}
                <div className={styles.inlineBlock}>
                    <div>{trueElem}</div>
                    <div>{falseElem}</div>
                </div>
            </div>
        );

        return (
            <React.Fragment>
                {before}
                {conditionDiv}
                {after}
            </React.Fragment>
        );
    }

    render = () => {
        console.log('SetLayout state');
        console.log(this.state);
        const header = null;
        const body = null;
        const buttons = null;

        return (
            <PopupContent
                keyprop={d.popups.length}
            >
                {{
                    header: header,
                    body: body,
                    buttons: buttons,
                }}
            </PopupContent>
        );
    }
}
