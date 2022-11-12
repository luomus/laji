import { LajiMapVisualization } from '@laji-map/visualization/laji-map-visualization';
import { PathOptions } from 'leaflet';

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

const getObsCountColor = (count: number): string => {
  let idx;
  if (count <= 10) {
    idx = 0;
  } else if (count <= 100) {
    idx = 1;
  } else if (count <= 1000) {
    idx = 2;
  } else if (count <= 10000) {
    idx = 3;
  } else {
    idx = 4;
  }
  return lajiMapObservationVisualization.obsCount.categories[idx].color;
};

const getRecordQualityColorIdx = (quality: string): number => {
  switch (quality) {
    case 'EXPERT_VERIFIED':
      return 0;
    case 'COMMUNITY_VERIFIED':
      return 1;
    case 'NEUTRAL':
      return 2;
    case 'UNCERTAIN':
      return 3;
    case 'ERRONEOUS':
    default:
      return 4;
  }
};

const getRecordQualityColor = (qualities: string | string[]): string => {
  if (!Array.isArray(qualities)) { return lajiMapObservationVisualization.recordQuality.categories[getRecordQualityColorIdx(qualities)].color; }
  const a = qualities.map(q => getRecordQualityColorIdx(q));
  return lajiMapObservationVisualization.recordQuality.categories[Math.min(...a)].color;
};

const getRedlistColorIdx = (status: string): number => {
  switch (status) {
    case 'http://tun.fi/MX.iucnGroup8':
      return 0;
    case 'http://tun.fi/MX.iucnGroup7':
      return 1;
    case 'http://tun.fi/MX.iucnGroup6':
      return 2;
    case 'http://tun.fi/MX.iucnGroup5':
      return 3;
    case 'http://tun.fi/MX.iucnGroup4':
      return 4;
    case 'http://tun.fi/MX.iucnGroup3':
    case 'http://tun.fi/MX.iucnGroup2':
    case 'http://tun.fi/MX.iucnGroup1':
      return 5;
    case 'http://tun.fi/MX.iucnGroup9':
      return 6;
    case 'http://tun.fi/MX.iucnGroup10':
      return 7;
    case 'http://tun.fi/MX.iucnGroup11':
    default:
      return 8;
  }
};

const getRedlistStatusColor = (statuses: string | string[]): string => {
  if (!Array.isArray(statuses)) { return lajiMapObservationVisualization.redlistStatus.categories[getRedlistColorIdx(statuses)].color; }
  const a = statuses.map(s => getRedlistColorIdx(s));
  return lajiMapObservationVisualization.redlistStatus.categories[Math.min(...a)].color;
};

const getIndividualCountColorIdx = (count: number): number => {
  if (count <= 5) {
    return 0;
  } else if (count <= 20) {
    return 1;
  } else if (count <= 50) {
    return 2;
  } else if (count <= 100) {
    return 3;
  } else {
    return 4;
  }
};

const getIndividualCountColor = (count: number): string => (
  lajiMapObservationVisualization.individualCount.categories[getIndividualCountColorIdx(count)].color
);

const getRecordAgeColorIdx = (year: number): number => {
  for (let i = 0; i < yearsAgoBreakpoints.length; i++) {
    const bp = yearsAgoBreakpoints[i];
    if (year >= currentYear - bp) {
      return i;
    }
  }
  return yearsAgoBreakpoints.length - 1;
};

const sliceYear = (newestRecord: string): number => (
  parseInt((newestRecord).slice(0, 4), 10)
);

const getRecordAgeColor = (newestRecords: string | string[]): string => {
  if (!Array.isArray(newestRecords)) { return lajiMapObservationVisualization.recordAge.categories[getRecordAgeColorIdx(sliceYear(newestRecords))].color; }
  const a = newestRecords.map(s => sliceYear(s));
  const year = Math.max(...a);
  return lajiMapObservationVisualization.recordAge.categories[getRecordAgeColorIdx(year)].color;
};

const getCoordinateAccuracyClassName = (
  coordinateAccuracy: number
): string => {
  if (!coordinateAccuracy) { return ''; }
  let className: string;
  if (coordinateAccuracy <= 10) {
    className = 'coordinate-accuracy-1';
  } else if (coordinateAccuracy <= 100) {
    className = 'coordinate-accuracy-2';
  } else if (coordinateAccuracy <= 1000) {
    className = 'coordinate-accuracy-3';
  } else if (coordinateAccuracy <= 10000) {
    className = 'coordinate-accuracy-4';
  } else if (coordinateAccuracy <= 100000) {
    className = 'coordinate-accuracy-5';
  }

  return className;
};

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
    getFeatureStyle: (options) => {
      if (options.feature.properties.count === 0) { return <PathOptions>{ opacity: 0, fillOpacity: 0 }; }
      return {
        ...baseFeatureStyle,
        color: getObsCountColor(options.feature.properties.count),
        className: getCoordinateAccuracyClassName(options.feature.properties['gathering.interpretations.coordinateAccuracy'])
      };
    }
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
    getFeatureStyle: (options) => {
      if (!options?.feature?.properties?.recordQualityMax) { return fallbackFeatureStyle; }
      return {
        ...baseFeatureStyle,
        color: getRecordQualityColor(options.feature.properties.recordQualityMax),
        className: getCoordinateAccuracyClassName(options.feature.properties['gathering.interpretations.coordinateAccuracy'])
      };
    }
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
    getFeatureStyle: (options) => {
      if (!options?.feature?.properties?.redListStatusMax) { return fallbackFeatureStyle; }
      return {
        ...baseFeatureStyle,
        color: getRedlistStatusColor(options.feature.properties.redListStatusMax),
        className: getCoordinateAccuracyClassName(options.feature.properties['gathering.interpretations.coordinateAccuracy'])
      };
    }
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
    getFeatureStyle: (options) => {
      if (!options?.feature?.properties?.individualCountSum) { return fallbackFeatureStyle; }
      return {
        ...baseFeatureStyle,
        color: getIndividualCountColor(options.feature.properties.individualCountSum),
        className: getCoordinateAccuracyClassName(options.feature.properties['gathering.interpretations.coordinateAccuracy'])
      };
    }
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
    getFeatureStyle: (options) => {
      if (!options?.feature?.properties?.newestRecord) { return fallbackFeatureStyle; }
      return {
        ...baseFeatureStyle,
        color: getRecordAgeColor(options.feature.properties.newestRecord),
        className: getCoordinateAccuracyClassName(options.feature.properties['gathering.interpretations.coordinateAccuracy'])
      };
    }
  }
};
