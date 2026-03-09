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
    private api: LajiApiClientBService,
  ) {}

  public analyse(data: CombinedData): Observable<IdentificationData[]> {
    return this.api.post(
      '/sound-identification',
      { query: data.params, header: {'Content-Type': 'multipart/form-data', Accept: 'application/json'}} as any,
      data.formData as any
    ) as unknown as Observable<IdentificationData[]>;
  }
}
