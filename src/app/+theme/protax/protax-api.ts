import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {ProtaxModelEnum} from './models';

@Injectable()
export class ProtaxApi {
  protected basePath = environment.protaxApi;

  constructor(protected httpClient: HttpClient) {
  }

  public analyse(data: string, model: ProtaxModelEnum, probabilityThreshold: number): Observable<any> {
    const path = this.basePath + '/analyse';

    return this.httpClient.post(path, this.getFormData(data, model, probabilityThreshold),  {responseType: 'arraybuffer'});
  }

  private getFormData(data: string, model: ProtaxModelEnum, probabilityThreshold: number): FormData {
    const formData = new FormData();
    const blob = new Blob([data],
      { type: 'text/plain;charset=utf-8' });
    formData.append('data', blob, 'input_data.fa');
    formData.append('model', model);
    formData.append('probabilityThreshold', probabilityThreshold.toString());
    return formData;
  }
}
