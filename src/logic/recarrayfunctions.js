const d = require('../components/state');
const mf = require('./mapfunctions.js');
const sf = require('./searchfunctions.js');
const rn = require('../components/render.js');
const ajax = require('./ajaxfunctions.js');

/** 
/* Resets the global record array and its index tracker, initializing it with base records set to
 * 'search.'
 */
const initR = function(stateSetter) {
  d.r = [];
  d.ri = 0;
  addSearchRecords(stateSetter);
  d.search = false;
  d.sdata = { empty: true };
  d.fi = d.r[d.ri].order[0];
  setFldInput();
  d.stage = 'searchbase';
  stateSetter(d);
}

/**
 * This monster of a function orders all of the records in r. It looks up the order fields in the
 * data map. 
 */
const orderR = function() {
  /** 
   * Function to move an element from one place in an array (from) to another (to). It does not
   * delete the element at to, but shifts it up on place.
   */
  const rMove = function (from, to) {
    if( !from || !to || from === to ) { return; }

    d.r.splice( to, 0, d.r.splice(from, 1)[0] );
  }

  
  // Main iterator loop: goes through each of the record types
  for (let i = 0; i < d.dm.r.length; i++) {
    // j will tell us which element in r is where the records of type r[i] begin
    let j = 0;
    // fmlist will be an array of fieldmaps (taken from dm) for the fields of each level of ordering
    let fmlist = [];
    const map = d.dm.r[i];
    // order is an array of objects that have all necessary information about each level of ordering
    const order = map.settings.listorder;

    // Fill fmlist from the fieldmaps stored in map
    for (let z = 0; z < order.length; z++) {
      fmlist.push(map.fields[order[z].field]);
    }
    
    // Advance j until we get to record type r[i]
    for (j = d.dm.b.length; j < d.r.length && d.r[j].ri < i; j++);

    // If we get to the last field, there is no ordering to do; we're finished
    if (j == d.r.length -1 ) break;

    /** 
     * For each record type, this next loop iterates through every level of ordering, starting with
     * the last and ending with the first, ordering all records.
     */
    for(let m = order.length-1; m >= 0; m--) {
      const type = fmlist[m].type;

      // Climb up the record array dealing with each record until we hit the next record type
      for (let k = j; k < d.r.length && d.r[k].ri === i; k++) {
        // Get the value of the ordering field of the current record in our climb, depending on
        // whether it is an index field, a regular field.
        if (type === 'index') {
          if(d.r[k].f[order[m].field].showval) {
            var value1 = d.r[k].f[order[m].field].showval;
          } else {
            var value1 = '';
          }
        } else {
          var value1 = d.r[k].f[order[m].field].value;
        }

        // Now search back down the record array for the right place to move the current record
        for (let l = k - 1; l >= j; l--) {

          // Get the value of ordering field for the record we are comparing the higher record
          // to, just like we did above
          if (type === 'index') {
            // This time, we make a note of what the type of index field is, storing it in 
            // 'typetmp'
            var typetmp = fmlist[m].indexfields[fmlist[m].indexshow].type;
            if(d.r[l].f[order[m].field].showval) {
              var value2 = d.r[l].f[order[m].field].showval;
            } else {
              var value2 = '';
            }
          } else {
            var typetmp = type;
            var value2 = d.r[l].f[order[m].field].value;
          }

          // For any empty values, we have to consult the 'empty' field in the ordering settings of
          // our data map.
          if (value1 === null || value1 === undefined || value1 === '') {
            // If the bottom value is also empty: easy, just move right above it
            if (value2 === null || value2 === undefined || value2 === '') {
              rMove(k,l+1);
              break;
            // If the bottom value is not empty, decide whether or not to go past current field
            } else if (order[m].empty) {
              // If set to 'last', no need to move -- other fields will be moved past this one.
              if ( order[m].empty == 'last' ) {
                break;
              // If set to 'first', send it past
              } else if ( order[m].empty == 'first' ) {
                // If this element is the last one, just move into its place
                if( l == j ) {
                  rMove(k,l);
                  break;
                // Other wise move on to the next to compare
                } else {
                  continue;
                }
              // If 'empty' setting is set to something else, just default to 'last'
              } else {
                break;
              }
            // If the 'empty' setting is missing, default to 'last'
            } else {
              break;
            }
          }

          // What about if value1 is not empty but value2 is?
          if ( value2 == null || value2 == undefined || value2 == '') {
            if ( order[m].empty ) {
              // If empty fields go last, bring the non-empty record past the empty one
              if ( order[m].empty == 'last' ) {
                continue;
              // If empty fields go first, this is where we end: move the non-empty record just
              // above the empty one
              } else if ( order[m].empty == 'first' ) {
                rMove(k,l+1);
                break;
              // If the 'empty' setting is set to something unrecognized, default to 'last'
              } else {
                rMove(k,l+1);
                break;
              }
            // If 'empty' setting is missing, default to 'last'
            } else {
              continue;
            }
          }

          // For date fields, we need to convert to a number to compare properly. We only need
          // to make this alteration after dealing with empties (which don't require knowing 
          // actual values, but just whether a field is empty or not)
          if(typetmp === 'date') {
            value1 = new Date(value1).getTime();
            value2 = new Date(value2).getTime();
          }

          // Now we compare and decide whether to move. If equal, move just above to preserve order
          // (which would be set by lower-level ordering from last iteration of variable m)
          if (value1 === value2) {
            rMove(k,l+1);
            break;
          } else if (value1 > value2) {
            if ( order[m].order === 'asc' ) {
              rMove(k,l+1);
              break;
            } else {
              if(l === j) { 
                rMove(k,l);
                break; 
              } else {
                continue;
              }
            }
          } else if (value1 < value2) {
            if ( order[m].order === 'desc' ) {
              rMove(k, l+1);
              break;
            } else {
              if(l == j) {
                rMove(k,l);
                break;
              } else {
                continue;
              }
            }
          }
        }
      }
    }
  }
}

// Check whether a record in r at index rin (i.e., r[rin]) is new or not
const isNew = function(rin) {
  if(d.r[rin].new) {
    return true;
  } else {
    return false;
  }
};

// Check whether a record in r at index rin has been changed from the original value pulled
// from salesforce
const isChanged = function(rin) {
  const map = mf.getBorR(rin);

  if (d.r[rin].new || !d.r[rin].f.Id) { 
    for (let i in d.r[rin].f) {
      if(d.r[rin].f[i].changed) {
        return true;
      }
    }

    return false;
  }

  for (let i in d.r[rin].f) {
    if (d.r[rin].f[i].changed) {
      if(d.r[rin].f[i].value != d.r[rin].f[i].origval) {
        return true;
      }
    }
  }

  return false;
};

// Check whether none of the records have been changed from their original values
const allUnchanged = function() {
  for (let i in d.r) {
    if (isChanged(i) || d.r[i].delete) return false;
  }

  return true;
}

const basesUpToDate = function() {
  for (let i in d.dm.b) {
    if(isChanged(i)) return false;
  }

  return true;
}

const setValue = function(stateSetter, rin, fin, value) {
  const fm = mf.getFm(rin, fin);
  let valout;

  switch (fm.type) {
    case "text":
    case "picklist":
    case "index":
    case undefined: {
      valout = value;
      break;
    };

    case "date": {
      if(value == '' || value == ' ') {
        valout = null;
        break;
      }

      const darr = value.split(" ");
      let dt;
      if (darr.length == 1) {
        if (value < 9999 && value > 1000) {
          dt = new Date("Jan. 1, " + value);
        } else {
          dt = new Date(value);
        }
      } else if (darr.length == 2) {
        if (darr[0].toUpperCase() == "SPRING") {
          dt = new Date("May 30, " + darr[1]);
        } else if (darr[0].toUpperCase() == "SUMMER") {
          dt = new Date("July 15, " + darr[1]);
        } else if (darr[0].toUpperCase() == "FALL") {
          dt = new Date("September 1, " + darr[1]);
        } else if (darr[0].toUpperCase() == "WINTER") {
          dt = new Date("December 15, " + darr[1]);
        }
      } else {
        dt = new Date(value);
      }

      if ( !dt || isNaN(dt.getTime())) {
        rn.renderError(stateSetter, "Not a valid date!");
        return false;
      } else {
        valout = dt.toISOString();
      }

      break;
    };

    case "email": {
      const re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
      if (re.test(value)) {
        valout = value;
      } else {
        rn.renderError(stateSetter, "Not a valid email address!");
        return false;
      }

      break;
    };

    default: 
      valout = value;
      break;
  }

  d.r[rin].f[fin].value = valout;
  d.r[rin].f[fin].changed = true;
  setOrder(rin);
  return true;
};

// Cycle to the next ri up the record array (r), but add a new record of type dm.r[rin]
const nextrAndAdd = function(stateSetter, rin) {
  if( rin < 0 || rin >= d.dm.r.length && d.r[d.ri].type == 'record' ) return false;

  addRecord(stateSetter, rin);
  if (isNew(d.ri) && !isChanged(d.ri)) { 
    d.r.splice(d.ri,1); 
  } else {
    d.ri += 1;
  }

  d.fi = d.r[d.ri].order[0];
  setFldInput();
  return true;
}

// Cycle to the next record without adding a new record
const nextrNoAdd = function(stateSetter) {
  if (isNew(d.ri) && !isChanged(d.ri)) { 
    d.r.splice(d.ri, 1); 
  } else {
    d.ri += 1;
  }

  const oldri = d.ri;
  if (d.r[d.ri].delete) {
    console.log('DELETE!!');
    nextr(stateSetter);
    if (d.ri === oldri) return prevr();
    setFldInput();
    return;
  }

  d.fi = d.r[d.ri].order[0];
  setFldInput();
  return true;
}

// Cycle to the next record (called when one presses the 'down' key -- see init.js)
const nextr = function(stateSetter) {
  if (d.ri === d.r.length - 1) {
    if ( d.ri >= d.dm.b.length ) {
      if (!isNew(d.ri) || (isNew(d.ri) && isChanged(d.ri)) ) {
        return nextrAndAdd(stateSetter, d.r[d.ri].ri)
      } else if (d.r[d.ri].ri < d.dm.r.length - 1) {
        return nextrAndAdd(stateSetter, d.r[d.ri].ri + 1);
      } else {
        return false;
      }
    } else if (d.ri < d.dm.b.length - 1) {
      return false;
    } else if (d.ri === d.dm.b.length - 1) {
      if ( isNew(d.ri) ) { 
        return false;
      } else { 
        return nextrAndAdd(stateSetter, 0); 
      }
    }
  } else if (d.ri < d.r.length - 1) {
    if ( d.r[d.ri+1].ri === d.r[d.ri].ri || d.r[d.ri].type === 'base' ) {      
      return nextrNoAdd(stateSetter);
    } else if (!isNew(d.ri) || (isNew(d.ri) && isChanged(d.ri)) ) {
      return nextrAndAdd(stateSetter, d.r[d.ri].ri);
    } else if (d.r[d.ri + 1].ri === d.r[d.ri].ri + 1) {
      return nextrNoAdd(stateSetter); 
    } else {
      return nextrAndAdd(stateSetter, d.r[d.ri].ri + 1);
    }
  }

  return false;
};

// 
const prevrAndAdd = function(stateSetter, rin) {
  if(rin < 0 || rin >= d.dm.r.length) return false;

  addRecord(stateSetter, rin);
  if (isNew(d.ri + 1) && !isChanged(d.ri + 1)) { 
    d.r.splice(d.ri + 1, 1); 
  }

  d.fi = d.r[d.ri].order[0];
  setFldInput();
  return true;
}

//
const prevrNoAdd = function(stateSetter) {
  if (isNew(d.ri) && !isChanged(d.ri) && d.r[d.ri].type === 'record') { 
    d.r.splice(d.ri, 1); 
  }

  d.ri -= 1;
  if (d.r[d.ri].delete) {
    prevr(stateSetter);
    setFldInput();
    return;
  }

  d.fi = d.r[d.ri].order[0];
  setFldInput();
  return true;
}

// 
const prevr = function(stateSetter) {
  if(d.ri === 0) {
    return false;
  } else if ( d.ri < d.dm.b.length ) {
    prevrNoAdd(stateSetter);
  } else {
    if(d.r[d.ri].ri === 0 || d.r[d.ri - 1].ri === d.r[d.ri].ri || (isNew(d.ri - 1) && !isChanged(d.ri - 1))) {
      prevrNoAdd(stateSetter);
    } else {
      prevrAndAdd(stateSetter, d.r[d.ri].ri - 1);
    }
  }

  return true;
};

// 
const nextf = function(stateSetter) {
  if (d.fi === d.r[d.ri].order[d.r[d.ri].order.length - 1]) {
    return nextr(stateSetter);
  } else {
    for (var i = 0; i < d.r[d.ri].order.length; i++) {
      if (d.fi === d.r[d.ri].order[i]) {
        d.fi = d.r[d.ri].order[i + 1];
        break;
      }
    }
  }

  setFldInput();
  return true;
};

const prevf = function(stateSetter) {
  if (d.fi === d.r[d.ri].order[0]) {
    if (!prevr(stateSetter)) {
      return false;
    } else {
      d.fi = d.r[d.ri].order[d.r[d.ri].order.length - 1];
      setFldInput();
      return true;
    }
  } else {
    for (var i = 0; i < d.r[d.ri].order.length; i++) {
      if (d.fi === d.r[d.ri].order[i]) {
        d.fi = d.r[d.ri].order[i - 1];
        break;
      }
    }
  }

  setFldInput();
  return true;
};

const submit = function(stateSetter) {
  setValue(stateSetter, d.ri, d.fi, d.fldentry.value);
  d.fldentry.focus = true;
  nextr;
  stateSetter(d);
}

const jumpTo = function(rin) {
  if(!d.r[rin]) return false;

  d.ri = rin;
  d.fi = d.r[rin].order[0];
  setFldInput();
  console.log(`Setting fldentry:\n \tValue: ${d.fldentry.value}\n\tOld Value: ${d.fldentry.oldval}`);
  return true;
}

const setOrder = function(rInd) {
  if( rInd == undefined ) rInd = d.ri;

  let makeOrderArray = function(om, f) {
    let out = [];
    for (let i = 0; i < om.length; i++) {
      out.push(om[i].field);
      if (om[i].autofill && !f[om[i].field].origval) {
        if (om[i].autofill.condition === "filled") {
          if (f[om[i].autofill.conditionfield].value && om[i].autofill.true) {
            f[om[i].field].value = om[i].autofill.true;
          } else if (
            !f[om[i].autofill.conditionfield].value &&
            om[i].autofill.false
          ) {
            f[om[i].field].value = om[i].autofill.false;
          }
        }
      }
      if (om[i].condition) {
        if (om[i].condition === "filled") {
          if (f[om[i].field].value && om[i].true) {
            out = out.concat(makeOrderArray(om[i].true, f));
          } else if (!f[om[i].field].value && om[i].false) {
            out = out.concat(makeOrderArray(om[i].false, f));
          }
        } else if (om[i].condition === "switch") {
          for (let j = 0; j < om[i].switch.length; j++) {
            for (let k = 0; k < om[i].switch[j].value.length; k++) {
              if (f[om[i].field].value == om[i].switch[j].value[k]) {
                out = out.concat(makeOrderArray(om[i].switch[j].order, f));
                break;
              }
            }
          }
        }
      }
    }

    return out;
  };

  let rec = d.r[rInd];
  let recm;
  let order;
  if (rec.type === "base") {
    recm = d.dm.b[rec.bi];
    orderm = recm.settings.order;
  } else if (rec.type === "search") {
    recm = d.dm.b[rec.bi];
    orderm = recm.settings.searchorder;
  } else if (rec.type === "record") {
    recm = d.dm.r[rec.ri];
    orderm = recm.settings.order;
  }

  rec.order = makeOrderArray(orderm, d.r[rInd].f);
};

const pushNewRec = function(rInd) {
  for (let i = 0; i < d.r.length; i++) {
    if (d.r[i].ri) {
      if (d.r[i].ri > i) {
        d.r.splice(i, 0, {
          type: "record",
          ri: rInd,
          new: true,
          order: [],
          f: {}
        });

        for (let j in d.dm.r[i].fields) {
          d.r[i].f[j] = {
            sfname: d.dm.r[i].fields[j].sfname,
            value: null
          };
        }

        setOrder(i);
        return i;
      }
    }
  }

  d.r.push({
    type: "record",
    ri: rInd,
    new: true,
    order: [],
    f: {}
  });

  for (let j in d.dm.r[rInd].fields) {
    d.r[d.r.length - 1].f[j] = {
      sfname: d.dm.r[d.r.length - 1].fields[j].sfname,
      value: null
    };
  }

  setOrder(d.r.length - 1);
  return d.r.length - 1;
};

const addSearchRecords = function() {
  for (let i = 0; i < d.dm.b.length; i++) {
    d.r.push({
      type: "search",
      bi: i,
      new: true,
      order: [],
      f: {}
    });

    for (let j in d.dm.b[i].fields) {
      d.r[i].f[j] = {
        sfname: d.dm.b[i].fields[j].sfname,
      };
      if(d.dm.b[i].fields[j].value) {
        d.r[i].f[j].value = d.dm.b[i].fields[j].value;
      } else {
        d.r[i].f[j].value = null;
        d.r[i].f[j].origval = null;
      }
    }

    setOrder(i);
  }

  d.ri = 0;
  d.fi = d.r[d.ri].order[0];
  setFldInput();
};

const addBaseRecord = function(stateSetter, bInd, bRec) {
  for (let i = 0; i < d.r.length; i++) {
    if (d.r[i].bi == bInd) {
      // use Array.splice() to replace the base record with one that's filled out
      d.r.splice(i, 1, {
        type: "base",
        bi: i,
        new: false,
        order: [],
        f: {},
      });
      
      for (let j in d.dm.b[i].fields) {
        d.r[i].f[j] = {
          sfname: d.dm.b[i].fields[j].sfname,
        };
        if(bRec) {
          d.r[i].f[j].value = bRec[d.dm.b[i].fields[j].sfname];
          d.r[i].f[j].origval = bRec[d.dm.b[i].fields[j].sfname];
        } else if (d.dm.b[i].fields[j].value) {
          d.r[i].f[j].value = d.dm.b[i].fields[j].value;
        } else {
          d.r[i].f[j].value = null;
          d.r[i].f[j].origval = null;
        }
      };

      setOrder(i);
      for (let j = 0; j < d.r.length; j++) {
        if (d.r[j].type === "search") {
          d.ri = j;
          d.fi = d.r[j].order[0];
          setFldInput();
          return true;
        }
      }

      if(d.search) { 
        sf.clearBaseSearch(stateSetter);
        d.fi = d.r[i].order[0];
        setFldInput();
        sf.loadAllRecords(stateSetter); 
      }

      return true;
    }
  }

  return false;
};

const addRecord = function(stateSetter, rInd, rec) {
  let i = d.dm.b.length;
  // Decide where in the r array we will insert the new record. This loop keeps counting up until
  // a) we exceed the length of the array, b) we reach the next higher record type, or c) we get to
  // a record in the array of the same type and with the same sf Id as the record to be inserted.
  while( i < d.r.length ) {
    if ( !rec ) {
      if (d.r[i].ri <= rInd) {
        i += 1;
      } else {
        break;
      }
    } else if (d.r[i].ri <= rInd && !( d.r[i].ri === rInd && d.r[i].f.Id.value === rec.Id ) ) {
      i++;
    } else {
      break;
    }
  }  

  if ( i === d.r.length ) { 
    d.r.push({
      type: "record",
      ri: rInd,
      order: [],
      f: {},
    }); 
  } else if( d.r[i].ri === rInd && d.r[i].f.Id.value === rec.Id ) {
    d.r.splice(i, 1, { // replace the record, if it has the same id
      type: "record",
      ri: rInd,
      order: [],
      f: {},
    });
  } else {
    d.r.splice(i, 0, { // otherwise, insert without deleting anything
      type: "record",
      ri: rInd,
      order: [],
      f: {},
    });
  }
  

  if (!rec) {
    d.r[i].new = true;
  } else {
    d.r[i].new = false;
  }

  for (let j in d.dm.r[rInd].fields) {
    d.r[i].f[j] = {};

    d.r[i].f[j].sfname = d.dm.r[rInd].fields[j].sfname;

    if (d.r[i].new) {
      if (d.dm.r[rInd].fields[j].inherits) {
        d.r[i].f[j].value = d.r[d.dm.r[rInd].fields[j].inherits.base].f[d.dm.r[rInd].fields[j].inherits.field].value;
      } else if(d.dm.r[rInd].fields[j].autofill) {
        d.r[i].f[j].value = d.r[d.dm.r[rInd].fields[j].autofill.base].f[d.dm.r[rInd].fields[j].autofill.field].value;
      } else if (d.dm.r[rInd].fields[j].value) {
        d.r[i].f[j].value = d.dm.r[rInd].fields[j].value;
      } else if (d.dm.r[rInd].fields[j].default) {
        d.r[i].f[j].value = d.dm.r[rInd].fields[j].default;
      } else {
        d.r[i].f[j].value = null;
      }
    } else {
      d.r[i].f[j].value = rec[d.dm.r[rInd].fields[j].sfname];
      d.r[i].f[j].origval = rec[d.dm.r[rInd].fields[j].sfname];
    }
  }
  
  setOrder(i);
  return true;
};

const updateIndexFields = function (stateSetter, callback, rin) {
  if (!callback || ! callback instanceof Function) return false;

  const popupId = rn.renderLoadingStart(stateSetter, 'Looking up index fields');
  let ctr = 0;
  let total = 0;
  if( rin !== undefined && rin < d.r.length ) {
    let map = mf.getBorR(rin);
    for(let j in d.r[rin].f) {
      if ( map.fields[j].type === 'index' && d.r[rin].f[j].value ) total += 1;
    }

    if (total === 0) { 
      rn.renderLoadingEnd(stateSetter, popupId);
      callback();
      return;
    }

    for(let j in d.r[rin].f) {
      if (map.fields[j].type === 'index' && d.r[rin].f[j].value) {
        let fieldsvar = {};
        fieldsvar[map.fields[j].indexshow] = 1;
        ajax.postJSON(
          stateSetter,
          '/api/find',
          {
            sobject: map.fields[j].indexto,
            conditions: { Id: d.r[rin].f[j].value },
            fields: fieldsvar,
          },
          (data) => {
            ctr += 1;

            if(data[0]) {
              d.r[rin].f[j].showval = data[0][map.fields[j].indexshow];
            }

            if (ctr === total) {
              rn.renderLoadingEnd(stateSetter, popupId);
              callback();
            }
          },
          (err) => {
            rn.renderError(stateSetter, err.message);
          }
        );
      }
    }

    return true;
  }

  total = 0;
  ctr = 0;

  for(let i in d.r) {
    let map = mf.getBorR(i);
    for( let j in d.r[i].f ) {
      if ( map.fields[j].type == 'index' && d.r[i].f[j].value ) total += 1;
    }
  }

  if (total === 0) { 
    rn.renderLoadingEnd(stateSetter, popupId);
    callback();
    return;
  }

  for(let i in d.r) {
    let map = mf.getBorR(i);
    for(let j in d.r[i].f) {
      if ( map.fields[j].type == 'index' && d.r[i].f[j].value ) {
        let fieldsvar = {};
        fieldsvar[map.fields[j].indexshow] = 1;
        ajax.postJSON(
          stateSetter,
          '/api/find',
          {
            sobject: map.fields[j].indexto,
            conditions: { Id: d.r[i].f[j].value },
            fields: fieldsvar,
          },
          (data) => {
            ctr += 1;

            if(data[0]) {
              d.r[i].f[j].showval = data[0][map.fields[j].indexshow];
            }

            if (ctr === total) {
              rn.renderLoadingEnd(stateSetter, popupId);
              callback();
            }
          },
          (err) => rn.renderError(stateSetter, err.message)
        );
      }
    }
  }
}

const updateR = function(stateSetter) {
  fm = mf.getFm();
  if (!d.r[d.ri].f[d.fi].origval || d.r[d.ri].f[d.fi].value != d.r[d.ri].f[d.fi].origval) {
    if (d.r[d.ri].type === "search" && d.r[d.ri].new) {
      return sf.searchBase(stateSetter, d.ri);
    }
  }

  return true;
};

const validateSelection = function(str) {
  str = str.trim();
  const fm = mf.getFm();
  const type = mf.getFm().type;
  let outval = true;

  switch (fm.type) {
    case 'text':
      if (str.length > fm.length) return false;
      if (fm.length <= 40 && str.indexOf('\n') > -1) return false; 
      return true;
    case 'phone':
      if(str.length > 20) return false;
      if(/[\&\@\$\%\^\{\}]/.test(str)) return false;
      if(!/\d/.test(str)) return false;
      return true;
    case 'date':
      if(str.length > 19) return false;
      return true;
    case 'picklist':
      for (let i in fm.values) if (str === fm.values[i]) return true;
      return false;
    case 'email':
      const reEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
      if (!reEmail.test(str)) return false;
    case 'url':
      const reUrl = /[\s\"]+/;
      const reUrl2 = /\.+/;
      if (reUrl.test(str)) return false;
      if (!reUrl2.test(str)) return false;
  }

  return true;
}

const setFldInput = function() {
  const rmap = mf.getBorR();
  let value = null;
  if (d.r[d.ri].f[d.fi].value !== null && d.r[d.ri].f[d.fi].value !== '') {
      if ( rmap.fields[d.fi].type == 'index' ) {
          if (d.r[d.ri].f[d.fi].showval ) {
              value = d.r[d.ri].f[d.fi].showval;
          }
      } else if ( rmap.fields[d.fi].type == 'date' ) {
          value = rn.convertDate(d.r[d.ri].f[d.fi].value);
      } else if(rmap.fields[d.fi].type == 'boolean' ) {
          if ( d.r[d.ri].f[d.fi].value ) { 
              value = true; 
          } else { 
              value = false; 
          }
      } else {
          value = d.r[d.ri].f[d.fi].value;
      }
  }

  d.fldentry = {
    ...d.fldentry,
    value: value,
    oldval: value,
  }
}

const clearState = function() {
  d.auth = {
    promptlogin: false,
    username: null,
    password: null,
    loggedin: false, 
  };

  d.sfconfig = {
    queryconns: true,
    sfschemata: {list:[], selected:null},
    sfconns: {list:[], selected:null},
    sfconnconfig: null,
  };

  // Sf record data
  d.dm = null;

  d.stage = 'off';
  d.search = false;
  d.sdata = { empty: true };

  d.r = [];
  d.ri = 0;
  d.fi = null;

  d.fldentry = {
      value: null,
      focus: null,
      submit: false,
      blockKey: false,
  };

  d.doc = {
      html: null,
      render: false,
      sample: false,
      selectionerr: null,
  };

  // Popup stack
  d.popups = [];

  // Loading
  d.loading = false;
  d.loadmessage = null;

  // Where is the cursor?
  d.mdownpos = [];
}

module.exports.setFldInput = setFldInput;
module.exports.submit = submit;
module.exports.initR = initR;
module.exports.orderR = orderR;
module.exports.isNew = isNew;
module.exports.isChanged = isChanged;
module.exports.allUnchanged = allUnchanged;
module.exports.basesUpToDate = basesUpToDate;
module.exports.setValue = setValue;
module.exports.validateSelection = validateSelection;
module.exports.nextrAndAdd = nextrAndAdd;
module.exports.nextrNoAdd = nextrNoAdd;
module.exports.nextr = nextr;
module.exports.prevrAndAdd = prevrAndAdd;
module.exports.prevrNoAdd = prevrNoAdd;
module.exports.prevr = prevr;
module.exports.nextf = nextf;
module.exports.prevf = prevf;
module.exports.jumpTo = jumpTo;
module.exports.setOrder = setOrder;
module.exports.addSearchRecords = addSearchRecords;
module.exports.addBaseRecord = addBaseRecord;
module.exports.addRecord = addRecord;
module.exports.updateIndexFields = updateIndexFields;
module.exports.updateR = updateR;
module.exports.clearState = clearState;
