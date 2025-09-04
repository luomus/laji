import { components } from 'projects/laji-api-client-b/generated/api.d';

type TaxonImage = components['schemas']['Image'];

export interface IImageSelectEvent {
  taxonId?: string;
  documentId?: string;
  unitId?: string;
  fullURL?: string;
}

export interface Image extends TaxonImage {
  taxonId?: string;
  documentId?: string;
  caption: string;
  unitId?: string;
  vernacularName?: string;
  scientificName?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'MODEL';
  videoURL?: string;
  lowDetailModelURL?: string;
  fullResolutionMediaAvailable?: boolean;
}
