import { Injectable } from '@angular/core';

@Injectable()
export class InformationService {
  private urlMapping: UrlMappingInterface = {
    'citizen-science': {
      'en': '76',
      'fi': '76',
      'sv': '76'
    }
  };

  private idMapping = {};

  constructor() {
    for (const i in this.urlMapping) {
      if (!this.urlMapping.hasOwnProperty(i)) {
        continue;
      }
      this.idMapping[this.urlMapping[i]['en']] = i;
      this.idMapping[this.urlMapping[i]['sv']] = i;
      this.idMapping[this.urlMapping[i]['fi']] = i;
    }
  }

  getNiceUrl(id: string): string {
    if (this.idMapping[id]) {
      return this.idMapping[id];
    }
    return id;
  }

  resolveId(path: string, lang: string): string {
    if (this.urlMapping[path] && this.urlMapping[path][lang]) {
      return this.urlMapping[path][lang];
    }
    return path;
  }

}

export interface UrlMappingInterface {
  [url: string]: {
    'en': string,
    'fi': string,
    'sv': string
  };
}
