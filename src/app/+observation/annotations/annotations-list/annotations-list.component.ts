import { Component, Input, OnInit, Output } from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';
import { PagedResult } from '../../../shared/model/PagedResult';
import {TranslateService} from '@ngx-translate/core';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';

@Component({
  selector: 'laji-annotations-list',
  templateUrl: './annotations-list.component.html',
  styleUrls: ['./annotations-list.component.scss']
})
export class AnnotationListComponent implements OnInit {

  @Input() result: PagedResult<any>;
  lang: string;
  gathering: any[];
  hasTaxon: boolean;

  annotationClass = Annotation.AnnotationClassEnum;

  constructor(
    private transation: TranslateService
  ) { }

  ngOnInit() {
   this.lang = this.transation.currentLang;
  }

}
