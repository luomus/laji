import { AtlasActivityCategory, AtlasGridSquare } from '../../core/atlas-api.service';

export type VisualizationMode = 'activityCategory' | 'speciesCount';

// Performance optimization: precomputing gradients
// import { discreteColorGradient } from './color-math';
// export const activityCategoryGradient = ['cccccc', ...discreteColorGradient('f3f38c', '4b57a4', 5)];
export const activityCategoryGradient = ['cccccc', 'f3f38c', 'c6e774', '61d694', '4798b6', '4b57a4'];
// export const speciesCountGradient = ['cccccc', ...discreteColorGradient('f3f38c', '4b57a4', 3)];
export const speciesCountGradient = ['cccccc', 'f3f38c', '61d694', '4b57a4'];

export const getAtlasActivityCategoryColor = (ac: AtlasActivityCategory): string => ({
  'MY.atlasActivityCategoryEnum0': activityCategoryGradient[0],
  'MY.atlasActivityCategoryEnum1': activityCategoryGradient[1],
  'MY.atlasActivityCategoryEnum2': activityCategoryGradient[2],
  'MY.atlasActivityCategoryEnum3': activityCategoryGradient[3],
  'MY.atlasActivityCategoryEnum4': activityCategoryGradient[4],
  'MY.atlasActivityCategoryEnum5': activityCategoryGradient[5]
}[ac]);
export const getSpeciesCountColor = (speciesCount: number): string => {
  if (speciesCount < 50) { return speciesCountGradient[0]; }
  if (speciesCount < 100) { return speciesCountGradient[1]; }
  if (speciesCount < 150) { return speciesCountGradient[2]; }
  return speciesCountGradient[3];
};
export const getFeatureColor = (gridSq: AtlasGridSquare, visualizationMode: VisualizationMode): string => (
  visualizationMode === 'activityCategory'
    ? getAtlasActivityCategoryColor(gridSq.activityCategory.key)
    : getSpeciesCountColor(gridSq.speciesCount)
);
