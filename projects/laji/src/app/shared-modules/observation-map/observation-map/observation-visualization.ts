import { LajiMapVisualization, LajiMapVisualizationItem } from '../../legend/laji-map-visualization';

const BASE_FEATURE_STYLE = {
  weight: 1,
};
const CURRENT_YEAR = new Date().getFullYear();
const RECORD_AGE_BREAKPOINTS = [2, 10, 20, 40, Infinity].map(bp => CURRENT_YEAR - bp);

const getObsCountColor = (count: number): string => {
  const idx = [10, 100, 1000, 10000, Infinity].findIndex(bp => count <= bp);
  return lajiMapObservationVisualization.obsCount.categories[idx].color;
};

enum RecordQuality { ExpertVerified, CommunityVerified, Neutral, Uncertain, Erroneous }
const recordQualityMap: Record<string, RecordQuality> = {
  EXPERT_VERIFIED: RecordQuality.ExpertVerified,
  COMMUNITY_VERIFIED: RecordQuality.CommunityVerified,
  NEUTRAL: RecordQuality.Neutral,
  UNCERTAIN: RecordQuality.Uncertain,
  ERRONEOUS: RecordQuality.Erroneous
};
const recordQualityMapRev = ['EXPERT_VERIFIED', 'COMMUNITY_VERIFIED', 'NEUTRAL', 'UNCERTAIN', 'ERRONEOUS'];
const getRecordQualityColor = (recordQuality: string | undefined): string => {
  const cats = lajiMapObservationVisualization.recordQuality.categories;
  if (!recordQuality) { return cats[RecordQuality.Neutral].color; }
  return cats[recordQualityMap[recordQuality]].color;
};

enum RedlistStatusGroup { Group1, Group2, Group3, Group4, Group5 };
const redlistStatusMap = {
  'http://tun.fi/MX.iucnGroup1': RedlistStatusGroup.Group1,
  'http://tun.fi/MX.iucnGroup2': RedlistStatusGroup.Group2,
  'http://tun.fi/MX.iucnGroup3': RedlistStatusGroup.Group3,
  'http://tun.fi/MX.iucnGroup4': RedlistStatusGroup.Group4,
  'http://tun.fi/MX.iucnGroup5': RedlistStatusGroup.Group5
};
const redlistStatusMapRev = [
  'http://tun.fi/MX.iucnGroup1','http://tun.fi/MX.iucnGroup2','http://tun.fi/MX.iucnGroup3','http://tun.fi/MX.iucnGroup4','http://tun.fi/MX.iucnGroup5'
];
const getRedlistStatusColor = (redlistStatus: string | undefined): string => {
  if (!redlistStatus) { return '#ffffff'; }
  return lajiMapObservationVisualization.redlistStatus.categories[redlistStatusMap[<keyof typeof redlistStatusMap>redlistStatus]].color;
};

const getIndividualCountColor = (count: number): string => {
  const idx = [0, 5, 20, 50, 100, Infinity].findIndex(bp => count <= bp);
  return lajiMapObservationVisualization.individualCount.categories[idx].color;
};

const sliceYear = (newestRecord: string): number => (
  parseInt((newestRecord).slice(0, 4), 10)
);

const getRecordAgeColor = (newestRecord: string | undefined): string => {
  if (!newestRecord) { return '#ffffff'; }
  const year = sliceYear(newestRecord);
  const idx = RECORD_AGE_BREAKPOINTS.findIndex(bp => year >= bp);
  return lajiMapObservationVisualization.recordAge.categories[idx].color;
};

const getCoordinateAccuracyClassName = (coordinateAccuracy: number): string => {
  if (!coordinateAccuracy) { return 'coordinate-accuracy-0'; }
  const idx = [10, 100, 1000, 10000, 100000].findIndex(bp => coordinateAccuracy <= bp);
  return 'coordinate-accuracy-' + (idx + 1);
};

const visualizationModes = ['obsCount', 'recordQuality', 'redlistStatus', 'individualCount', 'recordAge'] as const;
export type ObservationVisualizationMode = typeof visualizationModes[number];
type ObservationVisualization = LajiMapVisualization<ObservationVisualizationMode> &
  Record<ObservationVisualizationMode,
  {
    getClusterColor: LajiMapVisualizationItem['getClusterColor'];
  }>;

export const lajiMapObservationVisualization: ObservationVisualization = {
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
    getFeatureStyle: (options) => ({
      ...BASE_FEATURE_STYLE,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      color: getObsCountColor(options.feature!.properties!.count),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      className: getCoordinateAccuracyClassName(options.feature!.properties!['gathering.interpretations.coordinateAccuracy'])
    }),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    getClusterColor: (markers) => getObsCountColor(markers.reduce((prev, marker) => prev + marker.feature!.properties.count, 0))
  },
  recordQuality: {
    label: 'laji-map.legend.mode.recordQuality',
    categories: [
      {
        color: '#348cf0',
        label: 'laji-map.legend.mode.recordQuality.' + RecordQuality.ExpertVerified
      },
      {
        color: '#90dacf',
        label: 'laji-map.legend.mode.recordQuality.' + RecordQuality.CommunityVerified
      },
      {
        color: '#ffffbf',
        label: 'laji-map.legend.mode.recordQuality.' + RecordQuality.Neutral
      },
      {
        color: '#fdbf66',
        label: 'laji-map.legend.mode.recordQuality.' + RecordQuality.Uncertain
      },
      {
        color: '#f26840',
        label: 'laji-map.legend.mode.recordQuality.' + RecordQuality.Erroneous
      }
    ],
    getFeatureStyle: (options) => ({
      ...BASE_FEATURE_STYLE,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      color: getRecordQualityColor(options.feature!.properties!.recordQualityMax),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      className: getCoordinateAccuracyClassName(options.feature!.properties!['gathering.interpretations.coordinateAccuracy'])
    }),
    // display the best (smallest) record quality
    getClusterColor: (markers) => getRecordQualityColor(
      recordQualityMapRev[
        markers.reduce(
          (min, curr) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const n = recordQualityMap[curr.feature!.properties.recordQualityMax];
            return min < n ? min : n;
          },
          Infinity
        )
      ]
    )
  },
  redlistStatus: {
    label: 'laji-map.legend.mode.redlistStatus',
    categories: [
      {
        color: '#348cf0',
        label: 'LC, DD, NA, NE'
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
        label: 'CR, RE, EW, EX'
      }
    ],
    getFeatureStyle: (options) => ({
      ...BASE_FEATURE_STYLE,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      color: getRedlistStatusColor(options.feature!.properties!.redListStatusMax),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      className: getCoordinateAccuracyClassName(options.feature!.properties!['gathering.interpretations.coordinateAccuracy'])
    }),
    // display the worst (largest) redlist status group
    // defaults to 0
    getClusterColor: (markers) => getRedlistStatusColor(
      redlistStatusMapRev[
        markers.reduce(
          (max, curr) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const n = redlistStatusMap[<keyof typeof redlistStatusMap>curr.feature!.properties.redListStatusMax];
            return n > max ? n : max;
          },
          0
        )
      ]
    )
  },
  individualCount: {
    label: 'laji-map.legend.mode.individualCount',
    categories: [
      {
        color: '#ffffff',
        label: '0'
      },
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
    getFeatureStyle: (options) => ({
      ...BASE_FEATURE_STYLE,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      color: getIndividualCountColor(options.feature!.properties!.individualCountSum),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      className: getCoordinateAccuracyClassName(options.feature!.properties!['gathering.interpretations.coordinateAccuracy'])
    }),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    getClusterColor: (markers) => getIndividualCountColor(markers.reduce((prev, marker) => prev + marker.feature!.properties.individualCountSum, 0))
  },
  recordAge: {
    label: 'laji-map.legend.mode.recordAge',
    categories: [
      {
        color: '#348cf0',
        label: `≥ ${RECORD_AGE_BREAKPOINTS[0]}`
      },
      {
        color: '#90dacf',
        label: `≥ ${RECORD_AGE_BREAKPOINTS[1]}`
      },
      {
        color: '#ffffbf',
        label: `≥ ${RECORD_AGE_BREAKPOINTS[2]}`
      },
      {
        color: '#fdbf66',
        label: `≥ ${RECORD_AGE_BREAKPOINTS[3]}`
      },
      {
        color: '#f26840',
        label: `< ${RECORD_AGE_BREAKPOINTS[3]}`
      }
    ],
    getFeatureStyle: (options) => ({
      ...BASE_FEATURE_STYLE,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      color: getRecordAgeColor(options.feature!.properties!.newestRecord),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      className: getCoordinateAccuracyClassName(options.feature!.properties!['gathering.interpretations.coordinateAccuracy'])
    }),
    getClusterColor: (markers) =>
      // display color based on the newest record
      getRecordAgeColor(markers.reduce((p, curr) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nr = curr.feature!.properties.newestRecord || '0001-01-01';
        return sliceYear(p) < sliceYear(nr) ? nr : p;
      }, '0001-01-01'))
  }
};
