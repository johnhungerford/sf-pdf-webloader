import React, { Component } from 'react';

import * as rf from '../../logic/recarrayfunctions';
import * as mf from '../../logic/mapfunctions';
import * as sf from '../../logic/searchfunctions';
import * as d from '../state';

import Panel from '../common/Panel.js';
import Button from '../common/Button.js';

import styles from './DataEntry.module.css';

export default class DataEntry extends Component {
    constructor(props) {
        super(props);

        this.inputRef = React.createRef();
    };

    changeHandler = (e) => {
        d.fldentry.value = e.target.value;
        if (e.target.tagName === 'SELECT') {
            this.submit();
            d.fldentry.oldval = e.target.value;
        }
        this.props.stateSetter(d);
    };

    enterHandler = (e) => {
        console.log('hello');
        if (e.key === 'Escape') this.inputRef.blur();
        if (e.key !== 'Enter') return;
        console.log('hello2');
        e.preventDefault();
        this.submit(()=>{
            rf.nextf();
            this.props.stateSetter(d);
        });
    };

    focusHandler = (e) => {
        d.fldentry.focus = true;
    }

    blurHandler = (e) => {
        d.fldentry.focus = false;
    }

    submit = (callback) => {
        if (d.fldentry.value === d.fldentry.oldval) {
            return callback instanceof Function ? callback() : null;
        }

        const rmap = mf.getBorR();
        const rin = d.ri;
        const fin = d.fi;

        if (rmap.fields[fin].type === 'index') {
            if (d.fldentry.value === '') {
                d.r[rin].f[fin].showval = null;
                d.r[rin].f[fin].value = null;
                rf.updateR(this.props.stateSetter);
                rf.setOrder();
                return callback instanceof Function ? callback() : null;;
            }

            d.r[rin].f[fin].showval = d.fldentry.value;
            sf.searchIndexRecord(this.props.stateSetter, rin, fin);
            return;
        }

        if(rmap.fields[fin].type == 'boolean') {
            d.r[rin].f[fin].value = d.fldentry.value;
            rf.updateR(this.props.stateSetter);
            rf.setOrder();
            return callback instanceof Function ? callback() : null;;
        }

        if (rf.setValue(this.props.stateSetter, rin, fin, d.fldentry.value)) {
            rf.updateR(this.props.stateSetter);
            rf.setOrder();
            return callback instanceof Function ? callback() : null;;
        }
    };

    componentDidMount = this.componentDidUpdate = () => {
        if (d.stage === 'off') return;
        if (d.fldentry.focus === true) this.inputRef.current.focus();
        if (d.fldentry.focus === false) this.inputRef.current.blur(); 
    };

    render() {
        console.log(d);
        console.log(`submit? ${d.fldentry.submit}`);
        console.log(`focus on fldentry? ${d.fldentry.focus}`);

        if (d.fldentry.submit) {
            this.submit(() => {
                if (d.fldentry.next) {
                    rf.nextf();
                    d.fldentry.next = false;
                }
            });
            d.fldentry.submit = false;
            this.props.stateSetter(d);
        }

        if (d.stage === 'off') return (
            <Panel 
                outerClass={this.props.class}
                innerClass={styles.outer}
            />
        );

        const buttonLeft = (d.ri != 0 || d.fi != d.r[0].order[0]) ? 
            (
                <Button 
                    class={styles.buttonLeft}
                    clickHandler={()=>{
                        this.submit(()=>{
                            rf.prevf(this.props.stateSetter);
                            this.props.stateSetter(d);
                        });
                    }}
                >
                    {'<'}
                </Button>
            ) : null;
            
        let buttonRight = d.ri < d.r.length - 1 ||
            d.fi != d.r[d.r.length - 1].order[d.r[d.r.length - 1].order.length - 1] ?
            (
                <Button 
                    class={styles.buttonRight}
                    clickHandler={()=>{
                        this.submit(()=>{
                            rf.nextf(this.props.stateSetter);
                            this.props.stateSetter(d);
                        });
                    }}
                >
                    {'>'}
                </Button>
            ) : null;
        
        var rmap = mf.getBorR();

        const dataTitle = <h4>{rmap.fields[d.fi].appname}</h4>;
        const dataInstructions = (rmap.fields[d.fi].instructions) ?
            <p>{rmap.fields[d.fi].instructions}</p> : null;

        let dataInput; 
        switch (rmap.fields[d.fi].type) {
        case 'text':
            if (rmap.fields[d.fi].length > 260) {
                dataInput = <textarea
                    className={`${styles.dataInput} ${styles.noresize}`}
                    rows='5' 
                    cols='45'
                    maxLength={rmap.fields[d.fi].length}
                    value={d.fldentry.value === null ? '' : d.fldentry.value}
                    onKeyPress={this.enterHandler}
                    onChange={this.changeHandler}
                    onFocus={this.focusHandler}
                    onBlur={this.blurHandler}
                    ref={this.inputRef}
                />;
            } else {
                dataInput = <input 
                    className={styles.dataInput}
                    type='text' 
                    size='45' 
                    maxLength={rmap.fields[d.fi].length}
                    value={d.fldentry.value === null ? '' : d.fldentry.value}
                    onKeyPress={this.enterHandler}
                    onChange={this.changeHandler}
                    onFocus={this.focusHandler}
                    onBlur={this.blurHandler}
                    ref={this.inputRef}
                />;
            }
            break;
        case 'phone':
            dataInput = <input 
                className={styles.dataInput} 
                type='text' 
                size='45' 
                maxLength='40' 
                value={d.fldentry.value === null ? '' : d.fldentry.value}
                onKeyPress={this.enterHandler}
                onChange={this.changeHandler}
                onFocus={this.focusHandler}
                onBlur={this.blurHandler}
                ref={this.inputRef}
            />;
            break;
        case 'url':
            dataInput = <input 
                className={styles.dataInput} 
                type="text" 
                size="50" 
                value={d.fldentry.value === null ? '' : d.fldentry.value}
                onKeyPress={this.enterHandler}
                onChange={this.changeHandler}
                onFocus={this.focusHandler}
                onBlur={this.blurHandler}
                ref={this.inputRef}
            />;
            break;
        case 'email':
            dataInput = <input 
                className={styles.dataInput} 
                type='text' 
                size='45' 
                maxLength={rmap.fields[d.fi].length}
                value={d.fldentry.value === null ? '' : d.fldentry.value}
                onKeyPress={this.enterHandler}
                onChange={this.changeHandler}
                onFocus={this.focusHandler}
                onBlur={this.blurHandler}
                ref={this.inputRef}
            />;
            break;
        case 'picklist':
            dataInput = <select 
                className={styles.dataInput}
                onKeyPress={this.enterHandler}
                onChange={this.changeHandler}
                onFocus={this.focusHandler}
                onBlur={this.blurHandler}
                ref={this.inputRef}
                value={d.fldentry.value === null ? '' : d.fldentry.value}
            >
                <option value=''>None</option>
                {rmap.fields[d.fi].values.map((val,ind)=>{
                    return <option 
                        key={`input-picklist-${ind}`}
                        value={val.value ? val.value : val}
                    >{val.label ? val.label : val}</option>;
                })}
            </select>;
            break;
        case 'date':
            dataInput = <input 
                className={styles.dataInput} 
                type='text' 
                maxLength="100" 
                onKeyPress={this.enterHandler}
                onChange={this.changeHandler}
                onFocus={this.focusHandler}
                onBlur={this.blurHandler}
                ref={this.inputRef}
                value={d.fldentry.value === null ? '' : d.fldentry.value}
            />;
            break;
        case 'index':
            dataInput = <input 
                className={styles.dataInput} 
                type="text" 
                size="45" 
                maxLength="255"
                onKeyPress={this.enterHandler}
                onChange={this.changeHandler}
                onFocus={this.focusHandler}
                onBlur={this.blurHandler}
                ref={this.inputRef}
                value={d.fldentry.value === null ? '' : d.fldentry.value}
            />;
            break;
        case 'boolean':
            dataInput = <input 
                className={styles.dataInput} 
                type='checkbox'
                checked={d.fldentry.value}
                onKeyPress={this.enterHandler}
                onChange={this.enterHandler}
                onFocus={this.focusHandler}
                onBlur={this.blurHandler}
                ref={this.inputRef}
            />;
            break;
        default:
            break;       
        }

        return (
            <Panel 
                outerClass={this.props.class}
                innerClass={styles.outer}
            > 
                <div className={styles.divLeft}>
                    {buttonLeft}
                </div>
                <div className={styles.divCenter}>
                    <div className={styles.divDataEntry}>
                        {dataTitle}
                        {dataInput}
                        {dataInstructions}
                    </div>
                </div>
                <div className={styles.divRight}>
                    {buttonRight}
                </div>
            </Panel>
        );
    };
};
