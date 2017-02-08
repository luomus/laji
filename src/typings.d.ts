// Typings reference file, you can add your own global typings here
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html

declare module 'laji-form/dist/laji-form';
declare module 'laji-map';
declare module 'query-string';
declare module 'openseadragon';
declare let d3: any;
declare const moment: any;

declare module '*.json' {
   const value: any;
   export default value;
}
