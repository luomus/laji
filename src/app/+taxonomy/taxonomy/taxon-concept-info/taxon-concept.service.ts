import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { TaxonMatch } from './taxon-match.model';

@Injectable()
export class TaxonConceptService {
  private XML = 'http://www.w3.org/XML/1998/namespace';
  private RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
  private RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
  private TAXONID = 'http://taxonid.org/';
  private TUN = 'http://tun.fi/';
  private SKOS = 'http://www.w3.org/2004/02/skos/core#';
  private DWC = 'http://rs.tdwg.org/dwc/terms/';

  constructor(protected http: HttpClient) { }

  public getMatches(id: string, taxonId: string): Observable<string[]> {
    const path = this.TAXONID + taxonId;

    return this.makeRdfRequest(path)
      .pipe(
        map(xml => {
          const matches = xml.getElementsByTagNameNS(this.SKOS, 'exactMatch');
          const result = [];

          for (let i = 0; i < matches.length; i++) {
            const match = this.getValueOrResource(matches[i]);
            if (match && match !== this.TUN + id) {
              result.push(match);
            }
          }
          return result;
        })
      );
  }

  public getMatchInfo(path: string): Observable<TaxonMatch> {
    return this.makeRdfRequest(path)
      .pipe(
        switchMap(xml => {
          const result: TaxonMatch = {id: path, scientificName: '', inScheme: '', inSchemeLabel: {}};
          const variables = [
            {name: 'scientificName', namespace: this.DWC},
            {name: 'scientificNameAuthorship', namespace: this.DWC},
            {name: 'inScheme', namespace: this.SKOS}
          ];

          for (let i = 0; i < variables.length; i++) {
            const variable = variables[i];
            const match = xml.getElementsByTagNameNS(variable.namespace, variable.name);
            if (match && match.length > 0) {
              const value = this.getValueOrResource(match[0]);
              if (value) {
                result[variable.name] = value;
              }
            }
          }

          return this.getSchemeInfo(result.inScheme).map(schemeInfo => {
            result.inSchemeLabel = schemeInfo;
            return result;
          });
        })
      );
  }

  private getSchemeInfo(path: string): Observable<any> {
    return this.makeRdfRequest(path)
      .pipe(
        map(xml => {
          const result = {};
          const matches = xml.getElementsByTagNameNS(this.RDFS, 'label');

          for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const lang = this.getAttribute(match, this.XML, 'lang');
            const value = this.getValueOrResource(match);
            if (lang && value) {
              result[lang] = value;
            }
          }

          return result;
        })
      );
  }

  private makeRdfRequest(path: string): Observable<any> {
    path = path.replace(/^http:\/\//i, 'https://');

    return this.http.get(path, {
      headers: new HttpHeaders({'Accept': 'application/skos+rdf+xml'}),
      responseType: 'text',
      params: {format: 'skos'}
    })
      .pipe(
        map(data => {
          const parser = new DOMParser();
          return parser.parseFromString(data, 'text/xml');
        })
      );
  }

  private getValueOrResource(dom: any) {
    let value = this.getAttribute(dom, this.RDF, 'resource');

    if (!value && dom.childNodes && dom.childNodes.length > 0) {
      value = dom.childNodes[0].nodeValue;
    }

    return value;
  }

  private getAttribute(dom: any, namespace: string, name: string) {
    if (!dom.attributes) {
      return null;
    }

    const node = dom.attributes.getNamedItemNS(namespace, name);
    if (node) {
      return node.nodeValue;
    }

    return null;
  }
}
