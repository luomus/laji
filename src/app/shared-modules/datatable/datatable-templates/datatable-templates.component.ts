import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'laji-datatable-templates',
  templateUrl: './datatable-templates.component.html',
  styleUrls: ['./datatable-templates.component.css']
})
export class DatatableTemplatesComponent implements OnInit {
  @ViewChild('taxon') taxonTpl: TemplateRef<any>;
  @ViewChild('originalTaxon') originalTaxonTpl: TemplateRef<any>;
  @ViewChild('species') speciesTpl: TemplateRef<any>;
  @ViewChild('headerTpl') headerTpl: TemplateRef<any>;
  @ViewChild('eventDate') eventDateTpl: TemplateRef<any>;
  @ViewChild('multiLang') multiLangTpl: TemplateRef<any>;
  @ViewChild('multiLangAll') multiLangAllTpl: TemplateRef<any>;
  @ViewChild('vernacularName') vernacularNameTpl: TemplateRef<any>;
  @ViewChild('scientificName') scientificNameTpl: TemplateRef<any>;
  @ViewChild('taxonScientificName') taxonScientificNameTpl: TemplateRef<any>;
  @ViewChild('cursive') cursiveTpl: TemplateRef<any>;
  @ViewChild('boolean') booleanTpl: TemplateRef<any>;
  @ViewChild('label') labelTpl: TemplateRef<any>;
  @ViewChild('labelArray') labelArrayTpl: TemplateRef<any>;
  @ViewChild('warehouseLabel') warehouseLabelTpl: TemplateRef<any>;
  @ViewChild('toSemicolon') toSemicolonTpl: TemplateRef<any>;
  @ViewChild('numeric') numericTpl: TemplateRef<any>;
  @ViewChild('date') dateTpl: TemplateRef<any>;
  @ViewChild('user') userTpl: TemplateRef<any>;
  @ViewChild('publication') publicationTpl: TemplateRef<any>;
  @ViewChild('publicationArray') publicationArrayTpl: TemplateRef<any>;
  @ViewChild('iucnStatus') iucnStatusTpl: TemplateRef<any>;
  @ViewChild('annotation') annotationTpl: TemplateRef<any>;
  @ViewChild('image') imageTpl: TemplateRef<any>;

  constructor() { }

  ngOnInit() {
  }

  getColumns(columns, settings?: any, resizable?: boolean) {
    return columns.map((column) => {
      if (!column.headerTemplate) {
        column.headerTemplate = this.headerTpl;
      }
      if (typeof column.cellTemplate === 'string') {
        column.cellTemplate = this[column.cellTemplate + 'Tpl'];
      }
      if (!column.prop) {
        column.prop = column.name;
      }
      if (settings && settings[column.name] && settings[column.name].width) {
        column.width = settings[column.name].width;
      }
      if (resizable === false) {
        column.resizeable = false;
      }
      return column;
    });
  }

}
