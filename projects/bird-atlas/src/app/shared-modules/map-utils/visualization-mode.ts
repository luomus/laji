import { AtlasActivityCategory } from '../../core/atlas-api.service';

export type VisualizationMode = 'activityCategory' | 'speciesCount';

// Performance optimization: precomputing gradients
// import { discreteColorGradient } from './color-math';
// const acGradient = discreteColorGradient('FAFAD1', '4B57A4', 6);
// const scGradient = discreteColorGradient('FAFAD1', '4B57A4', 4);
export const activityCategoryGradient = ['fafad1', 'cbf2ad', '8ee59a', '72d5b9', '59a3c2', '4b57a4'];
export const speciesCountGradient = ['fafad1', '9bea98', '69cfc6', '4b57a4'];

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
