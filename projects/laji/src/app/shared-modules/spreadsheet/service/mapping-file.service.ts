import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ZipService } from './zip.service';
import { IUserMappings } from '../model/excel';

export interface IUserMappingFile {
  version: number;
  mappings: IUserMappings;
  filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class MappingFileService {

  constructor(
    private zipService: ZipService<IUserMappingFile>
  ) { }

  load(event: Event): Observable<IUserMappingFile> {
    return this.zipService.load(event);
  }

  save(filename: string, mappings: IUserMappings): Observable<boolean> {
    filename = filename + (filename.endsWith('.mapping') ? '' : '.mapping');
    return this.zipService.save(filename, {mappings, version: 1, filename: filename});
  }

}
