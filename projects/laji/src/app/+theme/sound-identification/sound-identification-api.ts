import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CombinedData } from './sound-identification-form/sound-identification-form.component';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

export interface IdentificationData {
  start_time: number;
  end_time: number;
  confidence: number;
  common_name: string;
  scientific_name: string;
}

@Injectable()
export class SoundIdentificationApi {
  constructor(
    protected api: LajiApiClientBService
  ) {}

  public analyse(data: CombinedData): Observable<IdentificationData[]> {
    const headers = new HttpHeaders();

    headers.set('Content-Type', 'multipart/form-data');
    headers.set('Aceept', 'application/json');

    // @ts-ignore
    return this.api.fetch('/sound-identification', 'post', data.params, data.formData);
  }
}
