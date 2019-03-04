/**
 * Functions for entering 1099B transactions into TurboTax Online.
 *
 * See README.md for instructions.
 */

function waitFor(millisecs) {
  return new Promise(function(resolve, reject) {
    window.setTimeout(function() { resolve(true); }, millisecs);
  });
}

function veryShortPause() {
  return waitFor(100);
}

function shortPause() {
  return waitFor(1000);
}

function longPause() {
  return waitFor(3000);
}

function getElement(eltId) {
  let el = document.getElementById(eltId);
  if (!el) {
    throw new Error("Couldn't find: " + eltId);
  }
  return el;
}

function click(eltId) {
  return new Promise(function(resolve, reject) {
    getElement(eltId).click();
    resolve(true);
  });
}

function focus(eltId) {
  return new Promise(function(resolve, reject) {
    getElement(eltId).focus();
    resolve(true);
  });
}

function enterData(eltId, value) {
  return new Promise(function(resolve, reject) {
    getElement(eltId).value = value;
    resolve(true);
  });
}

function waitForElement(eltId) {
  let tester = function(resolve, reject) {
    let el = document.getElementById(eltId);
    if (!el || el.offsetParent === null) {
      // wait 100ms and try again
      window.setTimeout(function() { tester(resolve, reject); }, 100);
    } else {
      resolve(true);
    }
  };
  return new Promise(tester);
}

function clickAndEnter(eltId, data) {
  return waitForElement(eltId)
      .then(focus.bind(null, eltId))
      .then(veryShortPause)
      .then(enterData.bind(null, eltId, data));
}

function handleWashSale(data) {
  return click('Ill_00')
    .then(shortPause)
    .then(clickAndEnter.bind(null, 'edt_01', data["wash"]))
    .then(click.bind(null, 'Done_00'));
}

function enterOneRow(data, haveMore) {
  return click('txtblk_00')
      .then(shortPause)
      .then(clickAndEnter.bind(null, 'edt_00', data['desc']))
      .then(clickAndEnter.bind(null, 'edt_01', data['acq']))
      .then(clickAndEnter.bind(null, 'edt_02', data['sale']))
      .then(clickAndEnter.bind(null, 'edt_03', data['proceeds']))
      .then(clickAndEnter.bind(null, 'edt_04', data['basis']))
      .then(clickAndEnter.bind(null, 'combo_00', data['category']))
      .then(longPause)
      .then(focus.bind(null, 'edt_00'))
      .then(shortPause)
      .then(data["wash"] ? handleWashSale.bind(null, data) : click.bind(null, 'Done_00'))
      .then(longPause)
      .then(click.bind(null, haveMore ? 'txtblk_00_0' : 'txtblk_01_0'))
      .then(shortPause)
      .then(click.bind(null, 'Continue_00'))
      .then(longPause);
}

function enterAll(entries) {
  entries.reduce(function(prev, currEntry, index) {
    return prev.then(function() {
      return enterOneRow(currEntry, index + 1 < entries.length);
    });
  }, longPause().then(longPause)).then(function() {
    console.log('All Done!');
  });
}
