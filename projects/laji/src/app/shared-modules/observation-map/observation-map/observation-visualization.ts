import { LajiMapVisualization } from '@laji-map/visualization/laji-map-visualization';

const baseFeatureStyle = {
  weight: 1,
  opacity: 1,
  fillOpacity: .5
};

const fallbackFeatureStyle = {
  weight: 0,
  opacity: 0,
  fillOpacity: 0
};
const currentYear = new Date().getFullYear();
const yearsAgoBreakpoints = [2, 10, 20, 40, Infinity];

const visualizationModes = ['obsCount', 'recordQuality', 'redlistStatus', 'individualCount', 'recordAge'] as const;
export type ObservationVisualizationMode = typeof visualizationModes[number];

export const lajiMapObservationVisualization: LajiMapVisualization<ObservationVisualizationMode> = {
  obsCount: {
    label: 'laji-map.legend.mode.obsCount',
    categories: [
      {
        color: '#348cf0',
        label: '1-10'
      },
      {
        color: '#90dacf',
        label: '11-100'
      },
      {
        color: '#ffffbf',
        label: '101-1000'
      },
      {
        color: '#fdbf66',
        label: '1001-10000'
      },
      {
        color: '#f26840',
        label: '10001+'
      }
    ],
    getFeatureStyle: (o) => {
      if (o.feature.properties.count === 0) { return { opacity: 0, fillOpacity: 0 }; }
      let idx;
      if (o.feature.properties.count <= 10) {
        idx = 0;
      } else if (o.feature.properties.count <= 100) {
        idx = 1;
      } else if (o.feature.properties.count <= 1000) {
        idx = 2;
      } else if (o.feature.properties.count <= 10000) {
        idx = 3;
      } else {
        idx = 4;
      }
      return {
        ...baseFeatureStyle,
        color: lajiMapObservationVisualization.obsCount.categories[idx].color
      };
    },
    getClusterStyle: undefined
  },
  recordQuality: {
    label: 'laji-map.legend.mode.recordQuality',
    categories: [
      {
        color: '#348cf0',
        label: 'Expert verified'
      },
      {
        color: '#90dacf',
        label: 'Community verified'
      },
      {
        color: '#ffffbf',
        label: 'Neutral'
      },
      {
        color: '#fdbf66',
        label: 'Uncertain'
      },
      {
        color: '#f26840',
        label: 'Erroneous'
      }
    ],
    getFeatureStyle: (o) => {
      if (!o?.feature?.properties?.recordQualityMax) { return fallbackFeatureStyle; }
      let idx;
      switch (o.feature.properties.recordQualityMax) {
        case 'EXPERT_VERIFIED':
          idx = 0;
          break;
        case 'COMMUNITY_VERIFIED':
          idx = 1;
          break;
        case 'NEUTRAL':
          idx = 2;
          break;
        case 'UNCERTAIN':
          idx = 3;
          break;
        case 'ERRONEOUS':
          idx = 4;
          break;
      }
      return {
        ...baseFeatureStyle,
        color: lajiMapObservationVisualization.recordQuality.categories[idx].color
      };
    },
    getClusterStyle: undefined
  },
  redlistStatus: {
    label: 'laji-map.legend.mode.redlistStatus',
    categories: [
      {
        color: '#348cf0',
        label: 'LC'
      },
      {
        color: '#90dacf',
        label: 'NT'
      },
      {
        color: '#ffffbf',
        label: 'VU'
      },
      {
        color: '#fdbf66',
        label: 'EN'
      },
      {
        color: '#f26840',
        label: 'CR'
      },
      {
        color: '#cccccc',
        label: 'RE, EW, EX'
      },
      {
        color: '#ffffff',
        label: 'DD, NA, NE'
      }
    ],
    getFeatureStyle: (o) => {
      if (!o?.feature?.properties?.redListStatusMax) { return fallbackFeatureStyle; }
      let idx;
      switch (o.feature.properties.redListStatusMax) {
        case 'http://tun.fi/MX.iucnGroup8':
          idx = 0;
          break;
        case 'http://tun.fi/MX.iucnGroup7':
          idx = 1;
          break;
        case 'http://tun.fi/MX.iucnGroup6':
          idx = 2;
          break;
        case 'http://tun.fi/MX.iucnGroup5':
          idx = 3;
          break;
        case 'http://tun.fi/MX.iucnGroup4':
          idx = 4;
          break;
        case 'http://tun.fi/MX.iucnGroup3':
        case 'http://tun.fi/MX.iucnGroup2':
        case 'http://tun.fi/MX.iucnGroup1':
          idx = 5;
          break;
        case 'http://tun.fi/MX.iucnGroup9':
          idx = 6;
          break;
        case 'http://tun.fi/MX.iucnGroup10':
          idx = 7;
          break;
        case 'http://tun.fi/MX.iucnGroup11':
          idx = 8;
          break;
      }
      return {
        ...baseFeatureStyle,
        color: lajiMapObservationVisualization.redlistStatus.categories[idx].color
      };
    },
    getClusterStyle: undefined
  },
  individualCount: {
    label: 'laji-map.legend.mode.individualCount',
    categories: [
      {
        color: '#348cf0',
        label: '1-5'
      },
      {
        color: '#90dacf',
        label: '5-20'
      },
      {
        color: '#ffffbf',
        label: '20-50'
      },
      {
        color: '#fdbf66',
        label: '50-100'
      },
      {
        color: '#f26840',
        label: '> 100'
      }
    ],
    getFeatureStyle: (o) => {
      if (!o?.feature?.properties?.individualCountSum) { return fallbackFeatureStyle; }
      if (o.feature.properties.individualCountSum === 0) { return { opacity: 0, fillOpacity: 0 }; }
      let idx;
      if (o.feature.properties.individualCountSum <= 5) {
        idx = 0;
      } else if (o.feature.properties.individualCountSum <= 20) {
        idx = 1;
      } else if (o.feature.properties.individualCountSum <= 50) {
        idx = 2;
      } else if (o.feature.properties.individualCountSum <= 100) {
        idx = 3;
      } else {
        idx = 4;
      }
      return {
        ...baseFeatureStyle,
        color: lajiMapObservationVisualization.individualCount.categories[idx].color
      };
    },
    getClusterStyle: undefined
  },
  recordAge: {
    label: 'laji-map.legend.mode.recordAge',
    categories: [
      {
        color: '#348cf0',
        label: `≥ ${currentYear - yearsAgoBreakpoints[0]}`
      },
      {
        color: '#90dacf',
        label: `≥ ${currentYear - yearsAgoBreakpoints[1]}`
      },
      {
        color: '#ffffbf',
        label: `≥ ${currentYear - yearsAgoBreakpoints[2]}`
      },
      {
        color: '#fdbf66',
        label: `≥ ${currentYear - yearsAgoBreakpoints[3]}`
      },
      {
        color: '#f26840',
        label: `< ${currentYear - yearsAgoBreakpoints[3]}`
      }
    ],
    getFeatureStyle: (o) => {
      if (!o?.feature?.properties?.newestRecord) { return fallbackFeatureStyle; }
      const year = parseInt((<string>o.feature.properties.newestRecord).slice(0, 4), 10);
      let color;
      for (let i = 0; i < yearsAgoBreakpoints.length; i++) {
        const bp = yearsAgoBreakpoints[i];
        if (year >= currentYear - bp) {
          color = lajiMapObservationVisualization.recordAge.categories[i].color;
          break;
        }
      }
      return {
        ...baseFeatureStyle,
        color
      };
    },
    getClusterStyle: undefined
  }
};
