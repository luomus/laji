import { Injectable } from '@angular/core';
import { FormField } from '../model/form-field';
import { MappingService } from './mapping.service';

@Injectable()
export class ImportService {

  private documentReady = false;

  constructor(
    private mappingService: MappingService
  ) { }

  hasInvalidValue(value: any, field: FormField) {
    const mappedValue = this.mappingService.map(value, field);
    return Array.isArray(mappedValue) ? mappedValue.indexOf(null) > -1 : mappedValue === null;
  }



}
