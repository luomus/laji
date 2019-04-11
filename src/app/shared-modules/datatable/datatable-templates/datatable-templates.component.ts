import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';

@Component({
  selector: 'laji-datatable-templates',
  templateUrl: './datatable-templates.component.html',
  styleUrls: ['./datatable-templates.component.css']
})
export class DatatableTemplatesComponent {
  @ViewChild('taxon') taxon: TemplateRef<any>;
  @ViewChild('originalTaxon') originalTaxon: TemplateRef<any>;
  @ViewChild('species') species: TemplateRef<any>;
  @ViewChild('headerTpl') header: TemplateRef<any>;
  @ViewChild('eventDate') eventDate: TemplateRef<any>;
  @ViewChild('multiLang') multiLang: TemplateRef<any>;
  @ViewChild('multiLangAll') multiLangAll: TemplateRef<any>;
  @ViewChild('vernacularName') vernacularName: TemplateRef<any>;
  @ViewChild('scientificName') scientificName: TemplateRef<any>;
  @ViewChild('taxonScientificName') taxonScientificName: TemplateRef<any>;
  @ViewChild('taxonScientificNameLink') taxonScientificNameLink: TemplateRef<any>;
  @ViewChild('cursive') cursive: TemplateRef<any>;
  @ViewChild('boolean') boolean: TemplateRef<any>;
  @ViewChild('label') label: TemplateRef<any>;
  @ViewChild('labelArray') labelArray: TemplateRef<any>;
  @ViewChild('warehouseLabel') warehouseLabel: TemplateRef<any>;
  @ViewChild('toSemicolon') toSemicolon: TemplateRef<any>;
  @ViewChild('numeric') numeric: TemplateRef<any>;
  @ViewChild('date') date: TemplateRef<any>;
  @ViewChild('user') user: TemplateRef<any>;
  @ViewChild('publication') publication: TemplateRef<any>;
  @ViewChild('publicationArray') publicationArray: TemplateRef<any>;
  @ViewChild('iucnStatus') iucnStatus: TemplateRef<any>;
  @ViewChild('annotation') annotation: TemplateRef<any>;
  @ViewChild('image') image: TemplateRef<any>;
  @ViewChild('link') link: TemplateRef<any>;
  @ViewChild('number') number: TemplateRef<any>;
  @ViewChild('biogeographicalProvince') biogeographicalProvince: TemplateRef<any>;

  annotationClass = Annotation.AnnotationClassEnum;
  annotationTypes = Annotation.TypeEnum;

  constructor() { }

  roundNumber(value: number) {
    return Math.round(value * 10 ) / 10;
  }
}
