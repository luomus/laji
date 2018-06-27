import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
// import * as rdflib from 'rdflib';
import { TaxonInfo } from './taxon-info.model';

@Injectable()
export class TaxonConceptService {
  // private RDF = rdflib.Namespace('http://www.w3.org/2000/01/rdf-schema#');
  // private TAXONID = rdflib.Namespace('http://taxonid.org/');
  // private TUN = rdflib.Namespace('http://tun.fi/');
  // private SKOS = rdflib.Namespace('http://www.w3.org/2004/02/skos/core#');
  // private DWC = rdflib.Namespace('http://rs.tdwg.org/dwc/terms/');

  constructor(protected http: HttpClient) {
  }

  public getExactMatches(id: string, taxonId: string): Observable<TaxonInfo[]> {
    return this.getMatches(id, taxonId).switchMap(matches => {
      if (matches.length === 0) {
        return Observable.of([]);
      }
      return Observable.forkJoin(matches.map(taxonPath => this.getTaxonInfo(taxonPath)));
    });
  }

  private getMatches(id: string, taxonId: string): Observable<string[]> {
    return ObservableOf([]);
    /*
    const path = this.TAXONID(taxonId).value;

    return this.makeRdfRequest(path)
      .map(store => {
        const matches = store.statementsMatching(undefined, this.SKOS('exactMatch'));
        return matches.reduce((arr, stm) => {
          const match = stm.object.value;
          if (match !== this.TUN(id).value) {
            arr.push(match);
          }
          return arr;
        }, []);
      });
    */
  }

  private getTaxonInfo(path: string): Observable<TaxonInfo> {
    return ObservableOf(null);
    /*
    return this.makeRdfRequest(path)
      .switchMap(store => {
        const result: TaxonInfo = {id: path, scientificName: '', inScheme: '', inSchemeLabel: {}};
        const variables = [
          {name: 'scientificName', namespace: this.DWC},
          {name: 'scientificNameAuthorship', namespace: this.DWC},
          {name: 'inScheme', namespace: this.SKOS}
        ];

        for (let i = 0; i < variables.length; i++) {
          const variable = variables[i];
          const match = store.statementsMatching(undefined, variable.namespace(variable.name));
          if (match && match.length > 0) {
            result[variable.name] = match[0].object.value;
          }
        }

        return this.getSchemeInfo(result.inScheme).map(schemeInfo => {
          result.inSchemeLabel = schemeInfo;
          return result;
        });
      });
      */
  }

  private getSchemeInfo(path: string): Observable<any> {
    return ObservableOf(null);
    /*
    return this.makeRdfRequest(path)
      .map(store => {
        const result = {};
        const matches = store.statementsMatching(undefined, this.RDF('label'));

        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          result[match.object.lang] = match.object.value;
        }

        return result;
      });
    */
  }

  private makeRdfRequest(path: string): Observable<any> {
    return ObservableOf(null);
    /*
    return this.http.get(path, {
      headers: new HttpHeaders({'Accept': 'application/rdf+xml'}),
      responseType: 'text',
      params: {format: 'skos'}
    })
      .map(data => {
        const store = rdflib.graph();
        rdflib.parse(data, store, path, 'application/rdf+xml');
        return store;
      });
    */
  }
}
