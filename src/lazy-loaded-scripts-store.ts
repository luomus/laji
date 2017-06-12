interface Scripts {
  name: string;
  src: string;
}
export const ScriptStore: Scripts[] = [
  { name: 'openseadragon', src: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/2.2.1/openseadragon.min.js'},
  { name: 'd3', src: 'https://cdn.laji.fi/d3/3.5.17/d3.min.js' },
  { name: 'nvd3', src: 'https://cdn.laji.fi/nvd3/1.8.4/nv.d3.min.js' }
];
