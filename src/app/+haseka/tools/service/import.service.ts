import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { Document } from '../../../shared/model';
import { UserService } from '../../../shared/service/user.service';
import { FormField } from '../model/form-field';
import { MappingService } from './mapping.service';
import PublicityRestrictionsEnum = Document.PublicityRestrictionsEnum;

@Injectable()
export class ImportService {

  private documentReady = false;

  constructor(
    private mappingService: MappingService,
    private documentApi: DocumentApi,
    private userService: UserService,
    private translateService: TranslateService
  ) { }

  hasInvalidValue(value: any, field: FormField) {
    const mappedValue = this.mappingService.map(value, field);
    return Array.isArray(mappedValue) ? mappedValue.indexOf(null) > -1 : mappedValue === null;
  }

  validateData(document: Document): Observable<any> {
    return this.documentApi.validate(document, {
      personToken: this.userService.getToken(),
      lang: this.translateService.currentLang,
      validationErrorFormat: 'jsonPath'
    })
  }

  sendData(document: Document, publicityRestrictions: PublicityRestrictionsEnum): Observable<any> {
    document.publicityRestrictions = publicityRestrictions;
    return this.documentApi.create(document, this.userService.getToken())
  }

}
