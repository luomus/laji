import { TaxonomyImage } from '../model/Taxonomy';

export interface Image extends TaxonomyImage{

  documentId?: string;

  vernacularName?: string;

}
