// Typings reference file, you can add your own global typings here
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html
declare module 'deepmerge';
declare module 'laji-form/lib/laji-form';
declare module 'laji-map/lib/utils';
declare module 'laji-map/lib/map';
declare const OpenSeadragon: any;
declare let d3: any;
declare const moment: any;
declare const L: any;
declare const JSONPath: any;

declare module '*.json' {
   const value: any;
   export default value;
}
