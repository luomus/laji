// Typings reference file, you can add your own global typings here
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html
declare module 'deepmerge';
declare module 'electron';
declare module 'jsonpath-plus';
declare module 'laji-form/lib/laji-form';
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const OpenSeadragon: any;
declare let d3: any;

declare module '*.json' {
   const value: any;
   export default value;
}
