import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of as ObservableOf } from 'rxjs';

export class RouteDataService {
  public static getDeepest<T>(routeSnapshot: ActivatedRouteSnapshot, key = 'meta', empty: any = {}): Observable<T> {
    const value = routeSnapshot.data && typeof routeSnapshot.data[key] !== 'undefined' ? routeSnapshot.data[key] : empty;
    if (routeSnapshot.firstChild) {
      return this.getDeepest(routeSnapshot.firstChild, key, value);
    }
    return ObservableOf(value);
  }
}
