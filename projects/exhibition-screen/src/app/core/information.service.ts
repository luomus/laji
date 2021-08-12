import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

@Injectable({providedIn: 'root'})
export class InformationService {
	getData(): Observable<any> {
		return of({});
	}
}