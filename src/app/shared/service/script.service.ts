import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { ScriptStore } from '../../../lazy-loaded-scripts-store';

@Injectable()
export class ScriptService {

  private scripts: any = {};

  constructor() {
    ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });
  }

  load(...scripts: string[]) {
    const observers: any[] = [];
    scripts.forEach((script) => observers.push(this.loadScript(script)));
    return Observable.forkJoin(observers);
  }
  loadScript(name: string) {
    return Observable.create((observer: Observer<any>) => {
      if (this.scripts[name].loaded) {
        observer.next({script: name, loaded: true, status: 'Already Loaded'});
        observer.complete();
      } else {
        const script = <any>document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        if (script.readyState) {  //IE
          script.onreadystatechange = () => {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
              script.onreadystatechange = null;
              this.scripts[name].loaded = true;
              observer.next({script: name, loaded: true, status: 'Loaded'});
              observer.complete();
            }
          };
        } else {  // Others
          script.onload = () => {
            this.scripts[name].loaded = true;
            observer.next({script: name, loaded: true, status: 'Loaded'});
            observer.complete();
          };
        }
        script.onerror = (error: any) => {
          observer.error({script: name, loaded: false, status: 'Loaded'});
          observer.complete();
        };
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }
}
