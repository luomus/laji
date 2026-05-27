import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CombinedData } from './sound-identification-form/sound-identification-form.component';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';

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
    private api: LajiApiClientService,
  ) {}

  public analyse(data: CombinedData): Observable<IdentificationData[]> {
    return this.api.post(
      '/sound-identification',
      { query: data.params, header: {'Content-Type': 'multipart/form-data', Accept: 'application/json'}} as any,
      data.formData as any
    ) as unknown as Observable<IdentificationData[]>;
  }
}
