/** 
/* Resets the global record array and its index tracker, initializing it with base records set to
 * 'search.'
 */
const initR = function() {
  r = [];
  ri = 0;
  addSearchRecords();
  search = true;
  sdata = { empty: true };
  fi = r[ri].order[0];
  renderSfView();
  renderFldEntry();
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

    r.splice( to, 0, r.splice(from, 1)[0] );
  }

  
  // Main iterator loop: goes through each of the record types
  for (let i = 0; i < dm.r.length; i++) {
    // j will tell us which element in r is where the records of type r[i] begin
    let j = 0;
    // fmlist will be an array of fieldmaps (taken from dm) for the fields of each level of ordering
    let fmlist = [];
    const map = dm.r[i];
    // order is an array of objects that have all necessary information about each level of ordering
    const order = map.settings.listorder;

    // Fill fmlist from the fieldmaps stored in map
    for (let z = 0; z < order.length; z++) {
      fmlist.push(map.fields[order[z].field]);
    }
    
    // Advance j until we get to record type r[i]
    for (j = dm.b.length; j < r.length && r[j].ri < i; j++);

    // If we get to the last field, there is no ordering to do; we're finished
    if (j == r.length -1 ) break;

    /** 
     * For each record type, this next loop iterates through every level of ordering, starting with
     * the last and ending with the first, ordering all records.
     */
    for(let m = order.length-1; m >= 0; m--) {
      const type = fmlist[m].type;

      // Climb up the record array dealing with each record until we hit the next record type
      for (let k = j; k < r.length && r[k].ri === i; k++) {
        // Get the value of the ordering field of the current record in our climb, depending on
        // whether it is an index field, a regular field.
        if (type === 'index') {
          if(r[k].f[order[m].field].showval) {
            var value1 = r[k].f[order[m].field].showval;
          } else {
            var value1 = '';
          }
        } else {
          var value1 = r[k].f[order[m].field].value;
        }

        // Now search back down the record array for the right place to move the current record
        for (let l = k - 1; l >= j; l--) {

          // Get the value of ordering field for the record we are comparing the higher record
          // to, just like we did above
          if (type === 'index') {
            // This time, we make a note of what the type of index field is, storing it in 
            // 'typetmp'
            var typetmp = fmlist[m].indexfields[fmlist[m].indexshow].type;
            if(r[l].f[order[m].field].showval) {
              var value2 = r[l].f[order[m].field].showval;
            } else {
              var value2 = '';
            }
          } else {
            var typetmp = type;
            var value2 = r[l].f[order[m].field].value;
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
  if(r[rin].new) {
    return true;
  } else {
    return false;
  }
};

// Check whether a record in r at index rin has been changed from the original value pulled
// from salesforce
const isChanged = function(rin) {
  const map = getBorR(rin);

  if (r[rin].new || !r[rin].f.Id) { 
    for (let i in r[rin].f) {
      if(r[rin].f[i].changed) {
        return true;
      }
    }

    return false;
  }

  for (let i in r[rin].f) {
    if (r[rin].f[i].changed) {
      if(r[rin].f[i].value != r[rin].f[i].origval) {
        return true;
      }
    }
  }

  return false;
};

// Check whether none of the records have been changed from their original values
const allUnchanged = function() {
  for (let i in r) {
    if (isChanged(i)) return false;
  }

  return true;
}

const basesUpToDate = function() {
  for (let i in dm.b) {
    if(isChanged(i)) return false;
  }

  return true;
}

const setValue = function(rin, fin, value) {
  const fm = getFm(rin, fin);
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
      let d;
      if (darr.length == 1) {
        if (value < 9999 && value > 1000) {
          d = new Date("Jan. 1, " + value);
        } else {
          d = new Date(value);
        }
      } else if (darr.length == 2) {
        if (darr[0].toUpperCase() == "SPRING") {
          d = new Date("May 30, " + darr[1]);
        } else if (darr[0].toUpperCase() == "SUMMER") {
          d = new Date("July 15, " + darr[1]);
        } else if (darr[0].toUpperCase() == "FALL") {
          d = new Date("September 1, " + darr[1]);
        } else if (darr[0].toUpperCase() == "WINTER") {
          d = new Date("December 15, " + darr[1]);
        }
      } else {
        d = new Date(value);
      }

      if ( !d || isNaN(d.getTime())) {
        renderError("Not a valid date!");
        return false;
      } else {
        valout = d.toISOString();
      }

      break;
    };

    case "email": {
      const re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
      if (re.test(value)) {
        valout = value;
      } else {
        renderError("Not a valid email address!");
        return false;
      }

      break;
    };

    default: 
      valout = value;
      break;
  }

  r[rin].f[fin].value = valout;
  r[rin].f[fin].changed = true;
  setOrder(rin);
  return true;
};

const validateSelection = function(str) {
  const $fldinput = $('.fldinput');
  const type = getFm().type;
  let outval = true;

  // If fldinput is an <input> tag
  if($fldinput.prop('nodeName') === 'INPUT') {
    // If fldinput is of type "text"
    if($fldinput.attr('type') === 'text') {
      // Reject if there are any line breaks
      if(txt.indexOf('\n') > -1) outval = false;
      // Reject if it is longer than the 'size' attribute of the input
      if(txt.length > $fldinput.attr('size')) outval = false;
    } 

  // If fldinput is a <select> tag
  } else if($fldinput.prop('nodeName') === 'SELECT') {
    outval = false;
    $('$fldinput option').each(function(){
      if (this.value == str) {
        outval = true;
      }
    });
  } 
  1 (758) 758 8162 
  if(type === 'phone') {
    if(txt.length > 20) outval = false;
  } else if(type === 'date') {
    if(txt.length > 19) outval = false;
  }

  if(!outval) {
    renderAlert('Invalid selection for field type');
  }

  return outval;
}

// Cycle to the next ri up the record array (r), but add a new record of type dm.r[rin]
const nextrAndAdd = function(rin) {
  if( rin < 0 || rin >= dm.r.length && r[ri].type == 'record' ) return false;

  addRecord(rin);
  if (isNew(ri) && !isChanged(ri)) { 
    r.splice(ri,1); 
  } else {
    ri += 1;
  }

  fi = r[ri].order[0];
  return true;
}

// Cycle to the next record without adding a new record
const nextrNoAdd = function() {
  if (isNew(ri) && !isChanged(ri)) { 
    r.splice(ri, 1); 
  } else {
    ri += 1;
  }

  fi = r[ri].order[0];
  return true;
}

// Cycle to the next record (called when one presses the 'down' key -- see init.js)
const nextr = function() {
  if (ri === r.length - 1) {
    if ( ri >= dm.b.length ) {
      if (!isNew(ri) || (isNew(ri) && isChanged(ri)) ) {
        return nextrAndAdd(r[ri].ri)
      } else if (r[ri].ri < dm.r.length - 1) {
        return nextrAndAdd(r[ri].ri + 1);
      } else {
        return false;
      }
    } else if (ri < dm.b.length - 1) {
      return false;
    } else if (ri === dm.b.length - 1) {
      if ( isNew(ri) ) { 
        return false;
      } else { 
        return nextrAndAdd(0); 
      }
    }
  } else if (ri < r.length - 1) {
    if ( r[ri+1].ri === r[ri].ri || r[ri].type === 'base' ) {      
      return nextrNoAdd();
    } else if (!isNew(ri) || (isNew(ri) && isChanged(ri)) ) {
      return nextrAndAdd(r[ri].ri);
    } else if (r[ri + 1].ri === r[ri].ri + 1) {
      return nextrNoAdd(); 
    } else {
      return nextrAndAdd(r[ri].ri + 1);
    }
  }

  return false;
};

// 
const prevrAndAdd = function(rin) {
  if(rin < 0 || rin >= dm.r.length) return false;

  addRecord(rin);
  if (isNew(ri + 1) && !isChanged(ri + 1)) { 
    r.splice(ri + 1, 1); 
  }

  fi = r[ri].order[0];
  return true;
}

//
const prevrNoAdd = function() {
  if (isNew(ri) && !isChanged(ri) && r[ri].type === 'record') { 
    r.splice(ri, 1); 
  }

  ri -= 1;
  fi = r[ri].order[0];
  return true;
}

// 
const prevr = function() {
  if(ri === 0) {
    return false;
  } else if ( ri < dm.b.length ) {
    prevrNoAdd();
  } else {
    if(r[ri].ri === 0 || r[ri - 1].ri === r[ri].ri || (isNew(ri - 1) && !isChanged(ri - 1))) {
      prevrNoAdd();
    } else {
      prevrAndAdd(r[ri].ri - 1);
    }
  }

  return true;
};

// 
const nextf = function() {
  if (fi === r[ri].order[r[ri].order.length - 1]) {
    return nextr();
  } else {
    for (var i = 0; i < r[ri].order.length; i++) {
      if (fi === r[ri].order[i]) {
        fi = r[ri].order[i + 1];
        break;
      }
    }
  }

  return true;
};

const prevf = function() {
  if (fi === r[ri].order[0]) {
    if (!prevr()) {
      return false;
    } else {
      fi = r[ri].order[r[ri].order.length - 1];
      return true;
    }
  } else {
    for (var i = 0; i < r[ri].order.length; i++) {
      if (fi === r[ri].order[i]) {
        fi = r[ri].order[i - 1];
        break;
      }
    }
  }

  return true;
};

const jumpTo = function(rin) {
  if(!r[rin]) return false;

  ri = rin;
  fi = r[rin].order[0];
  return true;
}

const setOrder = function(rInd) {
  if( rInd == undefined ) rInd = ri;

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

  let rec = r[rInd];
  let recm;
  let order;
  if (rec.type === "base") {
    recm = dm.b[rec.bi];
    orderm = recm.settings.order;
  } else if (rec.type === "search") {
    recm = dm.b[rec.bi];
    orderm = recm.settings.searchorder;
  } else if (rec.type === "record") {
    recm = dm.r[rec.ri];
    orderm = recm.settings.order;
  }

  rec.order = makeOrderArray(orderm, r[rInd].f);
};

const pushNewRec = function(rInd) {
  for (let i = 0; i < r.length; i++) {
    if (r[i].ri) {
      if (r[i].ri > i) {
        r.splice(i, 0, {
          type: "record",
          ri: rInd,
          new: true,
          order: [],
          f: {}
        });

        for (let j in dm.r[i].fields) {
          r[i].f[j] = {
            sfname: dm.r[i].fields[j].sfname,
            value: null
          };
        }

        setOrder(i);
        return i;
      }
    }
  }

  r.push({
    type: "record",
    ri: rInd,
    new: true,
    order: [],
    f: {}
  });

  for (let j in dm.r[rInd].fields) {
    r[r.length - 1].f[j] = {
      sfname: dm.r[r.length - 1].fields[j].sfname,
      value: null
    };
  }

  setOrder(r.length - 1);
  return r.length - 1;
};

const addSearchRecords = function() {
  for (let i = 0; i < dm.b.length; i++) {
    r.push({
      type: "search",
      bi: i,
      new: true,
      order: [],
      f: {}
    });

    for (let j in dm.b[i].fields) {
      r[i].f[j] = {
        sfname: dm.b[i].fields[j].sfname,
      };
      if(dm.b[i].fields[j].value) {
        r[i].f[j].value = dm.b[i].fields[j].value;
      } else {
        r[i].f[j].value = null;
        r[i].f[j].origval = null;
      }
    }

    setOrder(i);
  }

  ri = 0;
  fi = r[ri].order[0];
};

const addBaseRecord = function(bInd, bRec) {
  for (let i = 0; i < r.length; i++) {
    if (r[i].bi == bInd) {
      // use Array.splice() to replace the base record with one that's filled out
      r.splice(i, 1, {
        type: "base",
        bi: i,
        new: false,
        order: [],
        f: {},
      });
      
      for (let j in dm.b[i].fields) {
        r[i].f[j] = {
          sfname: dm.b[i].fields[j].sfname,
        };
        if(bRec) {
          r[i].f[j].value = bRec[dm.b[i].fields[j].sfname];
          r[i].f[j].origval = bRec[dm.b[i].fields[j].sfname];
        } else if (dm.b[i].fields[j].value) {
          r[i].f[j].value = dm.b[i].fields[j].value;
        } else {
          r[i].f[j].value = null;
          r[i].f[j].origval = null;
        }
      };

      setOrder(i);
      for (let j = 0; j < r.length; j++) {
        if (r[j].type === "search") {
          ri = j;
          fi = r[j].order[0];

          return true;
        }
      }

      if(search) { 
        clearBaseSearch();
        fi = r[i].order[0];
        loadAllRecords(); 
      }

      return true;
    }
  }

  return false;
};

const addRecord = function(rInd, rec) {
  let i = dm.b.length;
  // Decide where in the r array we will insert the new record. This loop keeps counting up until
  // a) we exceed the length of the array, b) we reach the next higher record type, or c) we get to
  // a record in the array of the same type and with the same sf Id as the record to be inserted.
  while( i < r.length ) {
    if ( !rec ) {
      if (r[i].ri <= rInd) {
        i += 1;
      } else {
        break;
      }
    } else if (r[i].ri <= rInd && !( r[i].ri === rInd && r[i].f.Id.value === rec.Id ) ) {
      i++;
    } else {
      break;
    }
  }  

  if ( i === r.length ) { 
    r.push({
      type: "record",
      ri: rInd,
      order: [],
      f: {},
    }); 
  } else if( r[i].ri === rInd && r[i].f.Id.value === rec.Id ) {
    r.splice(i, 1, { // replace the record, if it has the same id
      type: "record",
      ri: rInd,
      order: [],
      f: {},
    });
  } else {
    r.splice(i, 0, { // otherwise, insert without deleting anything
      type: "record",
      ri: rInd,
      order: [],
      f: {},
    });
  }
  

  if (!rec) {
    r[i].new = true;
  } else {
    r[i].new = false;
  }

  for (let j in dm.r[rInd].fields) {
    r[i].f[j] = {};

    r[i].f[j].sfname = dm.r[rInd].fields[j].sfname;

    if (r[i].new) {
      if (dm.r[rInd].fields[j].inherits) {
        r[i].f[j].value = r[dm.r[rInd].fields[j].inherits.base].f[dm.r[rInd].fields[j].inherits.field].value;
      } else if(dm.r[rInd].fields[j].autofill) {
        r[i].f[j].value = r[dm.r[rInd].fields[j].autofill.base].f[dm.r[rInd].fields[j].autofill.field].value;
      } else if (dm.r[rInd].fields[j].value) {
        r[i].f[j].value = dm.r[rInd].fields[j].value;
      } else if (dm.r[rInd].fields[j].default) {
        r[i].f[j].value = dm.r[rInd].fields[j].default;
      } else {
        r[i].f[j].value = null;
      }
    } else {
      r[i].f[j].value = rec[dm.r[rInd].fields[j].sfname];
      r[i].f[j].origval = rec[dm.r[rInd].fields[j].sfname];
    }
  }
  
  setOrder(i);
  return true;
};

const updateIndexFields = function (callback, rin) {
  if (!callback || typeof(callback) !== 'function') return false;

  renderLoadingStart('Looking up index fields');
  let ctr = 0;
  let total = 0;
  if( rin !== undefined && rin < r.length ) {
    let map = getBorR(rin);
    for(let j in r[rin].f) {
      if ( map.fields[j].type === 'index' && r[rin].f[j].value ) total += 1;
    }

    if (total === 0) { 
      renderLoadingEnd();
      callback();
      return;
    }

    for(let j in r[rin].f) {
      if (map.fields[j].type === 'index' && r[rin].f[j].value) {
        let fieldsvar = {};
        let callback;
        fieldsvar[map.fields[j].indexshow] = 1;
        $.ajax({
          type: "POST",
          contentType: "application/json",
          url: "/api/find",
          dataType: "json",
          async: true,
          //json object to sent to the authentication url
          data: JSON.stringify({
            sobject: map.fields[j].indexto,
            conditions: { Id: r[i].f[j].value },
            fields: fieldsvar,
          }),
          success: (data) => {
            ctr += 1;

            if(data[0]) {
              r[i].f[j].showval = data[0][map.fields[j].indexshow];
            }

            if (ctr === total) {
              renderLoadingEnd();
              callback();
            }
          },
        });
      }
    }

    return true;
  }

  total = 0;
  ctr = 0;

  for(let i in r) {
    let map = getBorR(i);
    for( let j in r[i].f ) {
      if ( map.fields[j].type == 'index' && r[i].f[j].value ) total += 1;
    }
  }

  if (total === 0) { 
    renderLoadingEnd();
    callback();
    return;
  }

  for(let i in r) {
    let map = getBorR(i);
    for(let j in r[i].f) {
      if ( map.fields[j].type == 'index' && r[i].f[j].value ) {
        let fieldsvar = {};
        fieldsvar[map.fields[j].indexshow] = 1;
        $.ajax({
          type: "POST",
          contentType: "application/json",
          url: "/api/find",
          dataType: "json",
          async: true,
          //json object to sent to the authentication url
          data: JSON.stringify({
            sobject: map.fields[j].indexto,
            conditions: { Id: r[i].f[j].value },
            fields: fieldsvar,
          }),
          success: (data) => {
            ctr += 1;

            if(data[0]) {
              r[i].f[j].showval = data[0][map.fields[j].indexshow];
            }

            if (ctr === total) {
              renderLoadingEnd();
              callback();
            }
          }
        });
      
      }
    
    }
  
  }
}

const updateR = function() {
  fm = getFm();
  if (!r[ri].f[fi].origval || r[ri].f[fi].value != r[ri].f[fi].origval) {
    if (r[ri].type === "search" && r[ri].new) {
      return searchBase(ri);
    }
  }

  return true;
};
