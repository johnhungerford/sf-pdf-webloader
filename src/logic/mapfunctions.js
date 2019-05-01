const d = require('./state.js');

const getFieldsForLayout = function(rin) {
  let fout = {};
  let map = getBorR(rin);
  for (let i in d.r[rin].f) {
    if (map.fields[i].type === 'index' && d.r[rin].f[i].showval) {
      fout[i] = d.r[rin].f[i].showval;
    } else {
      fout[i] = d.r[rin].f[i].value;
    }
  }

  return fout;
};

const convRecSA = function(type, index, records) {
  const conv = function (record) {
    let fm = type === 'record' ? d.dm.r[index].fields : d.dm.b[index].fields;
    let recout = {};
    for (let j in record) {
      for (let k in fm) {
        if (fm[k].sfname === j) {
          recout[k] = record[j];
        }
      }
    }

    return recout;
  }

  let recsout = [];
  if (Array.isArray(records)) {
    for (let i = 0; i < records.length; i++) {
      recsout.push(conv(records[i]));
    }
  }

  return recsout;
};

const getBorR = function(rin) {
  if (rin === undefined) rin = d.ri;

  if (d.r[rin].type == 'record') {
    return d.dm.r[d.r[rin].ri];
  } else if (d.r[rin].type == 'base') {
    return d.dm.b[d.r[rin].bi];
  } else if (d.r[rin].type == 'search') {
    return d.dm.b[d.r[rin].bi];
  } else {
    return false;
  }
};

const getFm = function(rin, fin) {
  if (fin == undefined) {
    rin = d.ri;
    fin = d.fi;
  }

  if (d.r[rin].type == 'record') {
    return d.dm.r[d.r[rin].ri].fields[fin];
  } else if (d.r[rin].type == 'base') {
    return d.dm.b[d.r[rin].bi].fields[fin];
  } else if (d.r[rin].type == 'search') {
    return d.dm.b[d.r[rin].bi].fields[fin];
  } else {
    return false;
  }
};


const parseLayout = function (layStr, fieldsArray) {
  const parseLayoutIf = function (condition, trueresult, falseresult) {
    let conditionArray = $.trim(condition).split('=');
    if (!fieldsArray[conditionArray[0]]) {
      return parseLayout(falseresult, fieldsArray);
    }

    if (conditionArray.length == 1) {
      if ( fieldsArray[conditionArray[0]] ) {
        return parseLayout(trueresult, fieldsArray);
      } else {
        return parseLayout(falseresult, fieldsArray);
      }
    } else if (conditionArray.length > 1) {
      if (fieldsArray[conditionArray[0]] == conditionArray[1]) {
        return parseLayout(trueresult, fieldsArray);
      } else {
        return parseLayout(falseresult, fieldsArray);
      }
    } else {
      return "#BAD CONDITION (else)#";
    }
  };

  let outStr = '';
  let i;
  let j;
  let k;
  let l;
  let condition;
  let hashctr;
  let trueresult;
  let falseresult;
  for (i = 0; i < layStr.length; i++) {
    if (layStr[i] === "#") {
      i += 1;
      if (layStr.slice(i, i + 2) === "IF") {
        i += 2;
        if (layStr[i] != "(") {
          outStr += "#BAD CONDITIONAL! (no opening parentheses)#";
          i -= 1;
          continue;
        } else {
          j = i + 1;
          while (j < layStr.length && layStr[j] != ")") {
            j += 1;
          }

          if (j === layStr.length) {
            outStr+= "#BAD CONDITIONAL! (no closing parentheses)#";
            i -= 1;
            continue;
          }

          condition = layStr.slice(i + 1, j);
          i = j + 1;
          if (layStr[i] != "{") {
            outStr+= "#BAD CONDITIONAL! (no opening brackets for true)#";
            i -= 1;
          } else {
            i += 1;
            k = i;
            hashctr = 0;
            while (k < layStr.length && (layStr[k] != "}" || hashctr > 0)) {
              if (layStr[k] == "#") {
                hashctr += 1;
              }

              if (layStr[k] == "}" && layStr[k + 1] != "{") {
                hashctr -= 1;
              }

              k += 1;
            }

            if (k === layStr.length) {
              outStr += "#BAD CONDITIONAL! (no closing brackets for true)#";
              i -= 1;
              continue;
            }

            trueresult = layStr.slice(i, k);
            i = k + 1;
            if (layStr[i] === "{") {
              i += 1;
              l = i;
              hashctr = 0;

              while (l < layStr.length && (layStr[l] != "}" || hashctr > 0)) {
                if (layStr[l] == "#") {
                  hashctr += 1;
                }

                if (layStr[l] == "}" && layStr[l + 1] != "{") {
                  hashctr -= 1;
                }

                l += 1;
              }

              falseresult = layStr.slice(i, l);
              i = l + 1;
            } else {
              falseresult = '';
            }

            i -= 1;
            outStr += parseLayoutIf(condition, trueresult, falseresult);
          }
        }
      } else if (layStr[i] === "{") {
        i += 1;
        j = i;
        while (j < layStr.length && layStr[j] != "}") {
          j += 1;
        }

        if (j === layStr.length) {
          outStr+="#BAD FIELD#";
          i -= 1;
          continue;
        }

        if (fieldsArray[layStr.slice(i, j)]) {
          outStr += fieldsArray[layStr.slice(i, j)];
        } else {
          outStr += "#BAD FIELD#";
        }

        i = j;
      } else {
        outStr += "#";
      }
    } else {
      outStr += layStr[i];
    }
  }

  return outStr;
};

module.exports.convRecSA = convRecSA
module.exports.getFieldsForLayout = getFieldsForLayout;
module.exports.getBorR = getBorR;
module.exports.getFm = getFm;
module.exports.parseLayout = parseLayout;
