import { LajiMapVisualization } from '@laji-map/visualization/laji-map-visualization';

const baseFeatureStyle = {
  weight: 1,
  opacity: 1,
  fillOpacity: .5
};

const visualizationModes = ['obsCount', 'recordQuality', 'redlistStatus', 'individualCount', 'recordAge'] as const;
export type ObservationVisualizationMode = typeof visualizationModes[number];

export const lajiMapObservationVisualization: LajiMapVisualization<ObservationVisualizationMode> = {
  obsCount: {
    label: 'label',
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
    label: 'label',
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
    getFeatureStyle: (o) => (
      {
        ...baseFeatureStyle,
        color: lajiMapObservationVisualization.recordQuality.categories[0].color
      }
    ),
    getClusterStyle: undefined
  },
  redlistStatus: {
    label: 'label',
    categories: [],
    getFeatureStyle: undefined,
    getClusterStyle: undefined
  },
  individualCount: {
    label: 'label',
    categories: [],
    getFeatureStyle: undefined,
    getClusterStyle: undefined
  },
  recordAge: {
    label: 'label',
    categories: [],
    getFeatureStyle: undefined,
    getClusterStyle: undefined
  }
};
