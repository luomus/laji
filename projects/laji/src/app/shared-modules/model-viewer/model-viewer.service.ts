import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable()
export class ModelViewerService {
  constructor(private http: HttpClient) {}
  getTestObj() {
    return this.http.get('https://cdn.laji.fi/test-data/european-honey-buzzard.obj', { responseType: 'text' });
  }
  getTestGLB() {
    return this.http.get('https://cdn.laji.fi/test-data/european-honey-buzzard.glb', { responseType: 'blob' });
  }
}
