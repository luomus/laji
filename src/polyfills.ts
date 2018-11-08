import 'core-js/es6';
/** IE10 and IE11 requires the following for NgClass support on SVG elements */
// import 'classlist.js';  // Run `npm install --save classlist.js`.
// If you need to support the browsers/features below, uncomment the import
// and run `npm install import-name-here';
// Learn more in https://angular.io/docs/ts/latest/guide/browser-support.html
import 'core-js/es7/array';
// Animations
// Needed for: All but Chrome and Firefox, Not supported in IE9
import 'web-animations-js';
/** Evergreen browsers require these. **/
import 'core-js/es7/reflect';

import 'classlist.js';
/***************************************************************************************************
 * Zone JS is required by Angular itself.
 */

// fix for IE bug https://github.com/angular/zone.js/issues/933
if (document['documentMode'] || /Edge/.test(navigator.userAgent)) {
  (window as any).__Zone_enable_cross_context_check = true;
}

import 'zone.js/dist/zone'; // Included with Angular CLI.
/***************************************************************************************************
 * APPLICATION IMPORTS
 */
/**
 * Date, currency, decimal and percent pipes.
 * Needed for: All but Chrome, Firefox, Edge, IE11 and Safari 10
 */
// import 'intl';

