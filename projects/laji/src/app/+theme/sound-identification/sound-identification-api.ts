import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CombinedData } from './sound-identification-form/sound-identification-form.component';
import { environment } from '../../../environments/environment';

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
    private httpClient: HttpClient,
  ) {}

  public analyse(data: CombinedData): Observable<IdentificationData[]> {
    const headers = new HttpHeaders();
    const url = environment.apiBase + '/sound-identification';

    headers.set('Content-Type', 'multipart/form-data');
    headers.set('Aceept', 'application/json');

    return this.httpClient.post<IdentificationData[]>(url, data.formData, { headers, params: data.params });
  }
}
