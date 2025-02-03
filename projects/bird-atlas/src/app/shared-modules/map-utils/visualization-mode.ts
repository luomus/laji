import { AtlasActivityCategory, AtlasGridSquare } from '../../core/atlas-api.service';

export type VisualizationMode = 'activityCategory' | 'speciesCount';

export const activityCategoryGradient = ['ffffff','ffff47','ffc000','38ff8e','479ab8','282e57'];
export const speciesCountGradient = ['ffff47','ffc000','5fed28','24bf67','479ab8','282e57'];
export const visualizationModeTitles: Record<VisualizationMode, string> = {
  activityCategory: 'Selvitysasteet',
  speciesCount: 'Lajimäärä',
};

export const getAtlasActivityCategoryColor = (ac: AtlasActivityCategory): string => ({
  'MY.atlasActivityCategoryEnum0': activityCategoryGradient[0],
  'MY.atlasActivityCategoryEnum1': activityCategoryGradient[1],
  'MY.atlasActivityCategoryEnum2': activityCategoryGradient[2],
  'MY.atlasActivityCategoryEnum3': activityCategoryGradient[3],
  'MY.atlasActivityCategoryEnum4': activityCategoryGradient[4],
  'MY.atlasActivityCategoryEnum5': activityCategoryGradient[5]
}[ac]);
export const getSpeciesCountColor = (speciesCount: number): string => {
  if (speciesCount < 25) { return speciesCountGradient[0]; }
  if (speciesCount < 50) { return speciesCountGradient[1]; }
  if (speciesCount < 75) { return speciesCountGradient[2]; }
  if (speciesCount < 100) { return speciesCountGradient[3]; }
  if (speciesCount < 125) { return speciesCountGradient[4]; }
  return speciesCountGradient[5];
};
export const getFeatureColor = (gridSq: AtlasGridSquare, visualizationMode: VisualizationMode): string => (
  visualizationMode === 'activityCategory'
    ? getAtlasActivityCategoryColor(gridSq.activityCategory!.key)
    : getSpeciesCountColor(gridSq.speciesCount!)
);
