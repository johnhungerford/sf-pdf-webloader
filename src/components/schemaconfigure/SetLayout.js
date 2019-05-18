import React, { Component } from 'react';

import * as d from '../state';

import * as styles from './SchemaConfigure.module.css';

export default class SetLayout extends Component {
    constructor(props) {
        super(props);
    }

    getAllFields = () => {

    }

    getFieldsRecursive = (objIn, pathIn) => {
        const path = [...pathIn];
        const before = typeof(objIn.before) === 'string' ?
            (
                <React.Fragment>
                    <input key={`layout-field-before-${path.join('-')}`} type='text' value={this.getVal([...path, 'b'])}/>
                    <span>{this.editConditionBtnElem([...path, 'b'])}</span>
                </React.Fragment>
            ) : this.getFieldsRecursive(objIn.before, [...pathIn, 'b']);

        if (objIn.condition === undefined) {
            return (
                <React.Fragment>
                    {before}
                </React.Fragment>
            );
        }

        const after = tyepeof(objIn.after) === 'string' ?
            (
                <React.Fragment>
                    <input key={`layout-field-after-${path.join('-')}`} type='text' value={this.getVal([...path, 'a'])}/>
                    <span>{this.editConditionBtnElem([...path, 'a'])}</span>
                </React.Fragment>
            ) : this.getFieldsRecursive(objIn.before, [...pathIn, 'a']);

        const condition = null;
        const trueElem = null;
        const falseEelm = null;
        const conditionDiv = null;

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
