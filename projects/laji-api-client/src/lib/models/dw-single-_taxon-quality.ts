/* tslint:disable */
export interface DwSingle_TaxonQuality {
  reliability?: 'RELIABLE' | 'LIKELY' | 'NEUTRAL' | 'SUSPICIOUS' | 'UNRELIABLE';
  source?: 'AUTOMATED_FINBIF_VALIDATION' | 'ORIGINAL_DOCUMENT' | 'COLLECTION_QUALITY_RATING' | 'USER_ANNOTATION' | 'EXPERT_ANNOTATION' | 'ADMIN_ANNOTATION' | 'ORIGINAL_OBSERVER';
  message?: string;
}
