import React, { Component } from 'react';

import * as mf from '../../logic/mapfunctions';
import * as rf from '../../logic/recarrayfunctions';
import * as sf from '../../logic/searchfunctions';
import * as uf from '../../logic/upsertfunctions';
import * as d from '../state';

import Panel from '../common/Panel.js';
import SfHeader from './SfHeader.js';
import SfSearchList from './SfSearchList.js';
import SfRecordList from './SfRecordList.js';

import styles from './SfView.module.css';
import { baseSearchSelected } from '../../logic/searchfunctions.js';

export default class SfView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (d.stage === 'off') return (
            <Panel outerClass={`${styles.outer} ${this.props.class}`}/>
        );

        const map = mf.getBorR();
        if (d.stage === 'init') return (
            <Panel 
                outerClass={`${styles.outer} ${this.props.class}`}
                innerClass={styles.inner}
            >
                <SfHeader stateSetter={this.props.stateSetter}>
                    {{
                        header: `Find or Create ${map.appname}`,
                        buttons: [
                            { 
                                title: 'New ', 
                                clickHandler: () => {
                                    const map = mf.getBorR();
                                    const riloc = d.ri;
                                    d.r[riloc].type = 'base';
                                    rf.setOrder(riloc);
                                    d.fi = d.r[riloc].order[0];
                                    this.props.stateSetter(d);
                                },
                            },
                        ],
                    }}
                </SfHeader>
            </Panel>
        );

        if (d.stage === 'searchbase') return (
            <Panel 
                outerClass={`${styles.outer} ${this.props.class}`}
                innerClass={styles.inner}
            >
                <SfHeader stateSetter={this.props.stateSetter}>
                    {{
                        header: `Find or Create ${map.appname}(${map.sobject})`,
                        buttons: [
                            { 
                                title: 'New', 
                                clickHandler: () => {
                                    const map = mf.getBorR();
                                    const riloc = d.ri;
                                    d.r[riloc].type = 'base';
                                    rf.setOrder(riloc);
                                    d.fi = d.r[riloc].order[0];
                                    this.props.stateSetter(d);
                                },
                            },
                        ],
                    }}
                </SfHeader>
                {d.search === true ? 
                    <SfSearchList  
                        stateSetter={this.props.stateSetter}
                    /> : null}
            </Panel>
        );

        if (d.stage === 'create') return (
            <Panel 
                outerClass={`${styles.outer} ${this.props.class}`}
                innerClass={styles.inner}
            >
                <SfHeader stateSetter={this.props.stateSetter}>
                    {{
                        header: `Add ${map.appname} (${map.sobject}) to Salesforce`,
                        buttons: [
                            { 
                                title: 'Add to Salesforce', 
                                clickHandler: () => {
                                    const riloc = d.ri;
                                    // renderLoadingStart();
                                    uf.updateRecord(this.props.stateSetter, riloc, function(data, rin){
                                        // renderLoadingEnd();
                                        if(data[0]) {
                                            if(data[0].id) {
                                                rf.setValue(this.props.stateSetter, rin, 'Id', data[0].id);
                                                d.r[rin].new = false;
                                                sf.loadAllRecords(this.props.stateSetter);
                                            }
                                        }
                                    });
                                },
                            },
                        ],
                    }}
                </SfHeader>
            </Panel>
        );

        if (d.stage = 'main') return (
            <Panel 
                outerClass={`${styles.outer} ${this.props.class}`}
                innerClass={styles.inner}
            >
                <SfHeader stateSetter={this.props.stateSetter}>
                    {{
                        header: null,
                        buttons: [
                            { 
                                title: 'Save All', 
                                clickHandler: () => {
                                    uf.updateAll(this.props.stateSetter, );
                                },
                            },
                            {
                                title: 'Refresh',
                                clickHandler: ()=> {
                                    sf.loadAllRecords(this.props.stateSetter);
                                },
                            },
                        ],
                    }}
                </SfHeader>
                <SfRecordList 
                    stateSetter={this.props.stateSetter}
                />
            </Panel>
        );
    }
}

var renderBaseSearch = function() {
    var map = mf.getBorR();
  
    var riloc = d.ri;
    var filoc = d.fi;
  
    $(".sfviewmenu").empty();
  
    if ( d.r[d.ri].type == 'search' ) {
      $(".sfviewmenu").append(
        '<button type="button" class="btn btn-primary newbase-button">New</button'
      );
  
      $(".newbase-button").off().click(function() {
        d.r[riloc].type = 'base';
        rf.setOrder(riloc);
        d.fi = d.r[riloc].order[0];
        renderFldEntry();
        renderSfView();
      });
  
      $(".sfviewbody").empty();
      $(".sfviewbody").append(
        "<h4>Find or Create " + map.appname + " (" + map.sobject + ")</h4>"
      );
  
      if (d.sdata.empty) {
        return false;
      }
  
      for (let i = 0; i < d.sdata.records.length; i++) {
        $(".sfviewbody").append(
          '<div class="search-result" data-id="' +
            d.sdata.records[i]["Id"] +
            '" id="sresult' +
            i +
            '"></div>'
        );
        for (var j in d.sdata.layout) {
          $("#sresult" + i).append(
            "<div>" + mf.parseLayout(d.sdata.layout[j], d.sdata.records[i]) + "</div>"
          );
        }
        $("#sresult" + i).off().click(function() {
          $.event.trigger({
            type: "searchSelect",
            Id: d.sdata.records[i]["Id"]
          });
        });
      }
    } else {
      $(".sfviewmenu").append(
        '<button type="button" class="btn btn-primary createbase-button">Add to Salesforce</button'
      );
  
      $(".createbase-button").off().click(function() {
        renderLoadingStart();
        uf.updateRecord(riloc, function(data, rin){
          renderLoadingEnd();
          if(data[0]) {
            if(data[0].id) {
              rf.setValue(rin, 'Id', data[0].id);
              d.r[rin].new = false;
              sf.loadAllRecords();
            }
          }
        });
      });
  
      $(".sfviewbody").empty();
      $(".sfviewbody").append(
        "<h4>Add " + map.appname + " (" + map.sobject + ") to Salesforce</h4>"
      );
    }  
    
  };

var renderSfView = function() {

    if (init) {
      $(".sfviewmenu").empty();
      $(".sfviewbody").empty();
      return;
    }
  
    if (d.search) {
      return renderBaseSearch();
    }
  
    if( d.ri >= d.r.length ) d.ri = d.r.length-1;
    if( d.ri < 0 ) d.ri = 0;
  
    $(".sfviewmenu").empty();
  
    $(".sfviewmenu").append(
      '<button type="button" class="btn btn-primary saveall-button" style="margin-right:5px;">Save All</button'
    );
    $('.saveall-button').off().click(function(){
      uf.updateAll();
    });
  
    $(".sfviewmenu").append(
      '<button type="button" class="btn btn-primary refresh-button">Refresh</button'
    );
    $('.refresh-button').off().click(function(){
      sf.loadAllRecords();
    });
  
    $(".sfviewbody").empty();
  
    for (let i = 0; i < d.dm.b.length; i++) {
      $(".sfviewbody").append(
        '<div class="sfview-header sfview-base-box" id="sfview-hdr-b-' + i + '"></div>'
      );
      $("#sfview-hdr-b-" + i).append("<h4>" + d.dm.b[i].appname + "</h4>");
      for( var j = 0; j < d.dm.b[i].settings.layout.length; j++ ) {
        $("#sfview-hdr-b-" + i).append('<div>'+mf.parseLayout( d.dm.b[i].settings.layout[j], mf.getFieldsForLayout(i) )+'</div>');
      }
      $("#sfview-hdr-b-" + i).attr('style','cursor:pointer');
      $("#sfview-hdr-b-" + i).off().click(function() {
        rf.jumpTo(i);
        renderFldEntry();
        renderSfView();
      });
      if( d.ri == i ) {
        $('#sfview-hdr-b-' + i).attr('style','border:2px solid red;');
      }
    }
  
    for (let i = 0; i < d.dm.r.length; i++) {
      $(".sfviewbody").append(
        '<div class="sfview-header" id="sfview-hdr-r-' + i + '"></div>'
      );
      $("#sfview-hdr-r-" + i).append("<h4>" + d.dm.r[i].appname + "</h4>");
    }
  
    for (let i = d.dm.b.length; i < d.r.length; i++) {
      $("#sfview-hdr-r-" + d.r[i].ri).append('<div class="sfview-record" id="sfview-rec-' + i + '"></div>');
      for ( let j = 0; j < d.dm.r[d.r[i].ri].settings.layout.length; j++ ) {
        $("#sfview-rec-" + i).append('<div>'+mf.parseLayout( d.dm.r[d.r[i].ri].settings.layout[j], mf.getFieldsForLayout(i) )+'</div>');
      }
      $('#sfview-rec-'+i).off().click(function(){
        rf.jumpTo(i);
        renderFldEntry();
        renderSfView();
      });
      if( d.ri == i ) {
        $('#sfview-rec-' + i).attr('style','border: 2px solid red;');
      }
    }
  
    var currentScrollTop = $('.sfviewbody').scrollTop();
  
    if( d.ri < d.dm.b.length ) {
      var selElement = $('#sfview-hdr-b-' + d.ri);
    } else {
      var selElement = $('#sfview-rec-' + d.ri);
    }
  
    var offsettop = selElement.offset().top - $('.sfviewbody').offset().top;
    var offsetbottom = offsettop + selElement.height();
  
    if( offsetbottom > $('.sfviewbody').innerHeight() ) {
      $('.sfviewbody').scrollTop(currentScrollTop + offsetbottom - $('.sfviewbody').innerHeight() + 5);
    } else if ( offsettop < 0 ) {
      $('.sfviewbody').scrollTop(currentScrollTop + offsettop);
    }
    
  
  };