import { Injectable } from '@angular/core';
import { FieldType, ILabelField } from 'label-designer';
import { Observable } from 'rxjs';
import { Document } from '../model/Document';
import { map, tap } from 'rxjs/operators';
import { FormService as ToolsFormService } from './form.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { IdService } from './id.service';
import { SessionStorage } from 'ngx-webstorage';
import { SchemaService } from '../../../../projects/label-designer/src/lib/schema.service';
import { ILabelData } from '../../../../projects/label-designer/src/lib/label-designer.interface';


@Injectable({
  providedIn: 'root'
})
export class PdfLabelService {

  @SessionStorage('pdf-data', [])
  private data: ILabelData[];

  skipFields: string[] = [
    '@type',
    'geometry',
    'editors',
    'secureLevel',
    'gatheringEvent.legPublic',
    'gatherings.namedPlaceID',
    'gatherings.images',
    'gatherings.units.unitFact.autocompleteSelectedTaxonID',
  ];

  defaultFields: ILabelField[] = [
    { field: 'gatherings.units.id', content: 'http://tun.fi/EXAMPLE', label: 'ID - QRCode', type: FieldType.qrCode },
    { field: 'gatherings.units.id', content: 'http://tun.fi/EXAMPLE', label: 'ID', type: FieldType.uri },
    { field: 'gatherings.units.id_domain', content: 'EXAMPLE', label: 'label.domain', type: FieldType.domain },
    { field: 'gatherings.units.id_short', content: 'EXAMPLE', label: 'label.id_short', type: FieldType.id },
    { field: '', content: 'Text', label: 'Text', type: FieldType.text }
  ];


  constructor(
    private formService: ToolsFormService,
    private schemaService: SchemaService,
    private translateService: TranslateService
  ) {
    this.defaultFields.forEach(field => {
      if (field.label.startsWith('label.')) {
        field.label = this.translateService.instant(field.label);
      }
    });
  }

  setData(documents: Document[]): Observable<boolean> {
    return this.allPossibleFields().pipe(
      map(fields => this.schemaService.convertDataToLabelData(
        [...fields, {field: 'id', label: ''}], documents, 'gatherings.units')
      ),
      map(data => data.map(item => {
        item['gatherings.units.id'] = IdService.getUri(item['gatherings.units.id'] || item['id']) || '';
        item['gatherings.units.id_short'] = item['gatherings.units.id'] || item['id'] || '';
        item['gatherings.units.id_domain'] = (item['gatherings.units.id'] as string)
          .replace(item['gatherings.units.id_short'] as string, '');
        return item;
      })),
      tap(data => this.data = data),
      map(() => true)
    );
  }

  getData(): ILabelData[] {
    return this.data || [];
  }

  allPossibleFields(): Observable<ILabelField[]> {
    return this.formService.getForm(environment.defaultForm, this.translateService.currentLang).pipe(
      map(form => this.schemaService.schemaToAvailableFields(form.schema, [...this.defaultFields], { skip: this.skipFields }))
    );
  }

}
