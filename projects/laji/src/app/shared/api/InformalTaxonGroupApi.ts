/* eslint-disable */
/**
 * API documentation
 * To use this api you need an access token. To getList the token, send a post request with your email address to api-users resource and one will be send to your. See below for information on how to use this api and if you have any questions you can contact us at helpdesk@laji.fi.  Place refer to [schema.laji.fi](http://schema.laji.fi/) for more information about the used vocabulary
 *
 * OpenAPI spec version: 0.0.1
 *
 *
 * NOTE: TEST This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PagedResult } from '../model/PagedResult';
import { HttpClient } from '@angular/common/http';
import { Util } from '../service/util.service';
import { InformalTaxonGroup } from '../model/InformalTaxonGroup';
import { environment } from '../../../environments/environment';


'use strict';

@Injectable({providedIn: 'root'})
export class InformalTaxonGroupApi {
  protected basePath = environment.apiBase;

  constructor(protected http: HttpClient) {
  }

  /**
   * Get all InformalTaxonGroups
   *
   * @param lang Language of fields that have multiple languages. Return english if asked language not found. If multi is selected fields will contain language objects
   * @param page Page number
   * @param pageSize Page size
   */
  public informalTaxonGroupFind(lang?: string, page?: string, pageSize?: string, extraHttpRequestParams?: any): Observable<PagedResult<InformalTaxonGroup>> {
    const path = this.basePath + '/informal-taxon-groups';

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};

    return this.httpGet<InformalTaxonGroup>(path, queryParameters, lang, page, pageSize);
  }

  /**
   * Find InformalTaxonGroup by id
   *
   * @param id
   * @param lang Language of fields that have multiple languages. Return english if asked language not found. If multi is selected fields will contain language objects
   */
  public informalTaxonGroupFindById(id: string, lang?: string, extraHttpRequestParams?: any): Observable<InformalTaxonGroup> {
    const path = this.basePath + '/informal-taxon-groups/{id}'
        .replace('{' + 'id' + '}', String(id));

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};
    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling informalTaxonGroupFindById.');
    }
    if (lang !== undefined) {
      queryParameters['lang'] = lang;
    }

    return this.http.get<InformalTaxonGroup>(path, {params: queryParameters});
  }

  /**
   * Get root informal taxon groups
   *
   * @param lang Language of fields that have multiple languages. Return english if asked language not found.
   * @param page Page number
   * @param pageSize Page size
   */
  public informalTaxonGroupFindRoots(lang?: string, page?: string, pageSize?: string, extraHttpRequestParams?: any): Observable<PagedResult<InformalTaxonGroup>> {
    const path = this.basePath + '/informal-taxon-groups/roots';

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};

    return this.httpGet<InformalTaxonGroup>(path, queryParameters, lang, page, pageSize);
  }

  /**
   * Get immediate children of the informal group
   *
   * @param id
   * @param lang Language of fields that have multiple languages. Return english if asked language not found.
   * @param page Page number
   * @param pageSize Page size
   */
  public informalTaxonGroupGetChildren(id: string, lang?: string, page?: string, pageSize?: string, extraHttpRequestParams?: any): Observable<PagedResult<InformalTaxonGroup>> {
    const path = this.basePath + '/informal-taxon-groups/{id}/children'
        .replace('{' + 'id' + '}', String(id));

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};
    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling informalTaxonGroupGetChildren.');
    }

    return this.httpGet<InformalTaxonGroup>(path, queryParameters, lang, page, pageSize);
  }

  /**
   * Get parents for a informal group
   *
   * @param id
   * @param lang Language of fields that have multiple languages. Return english if asked language not found.
   */
  public informalTaxonGroupGetParents(id: string, lang?: string, extraHttpRequestParams?: any): Observable<Array<InformalTaxonGroup>> {
    const path = this.basePath + '/informal-taxon-groups/{id}/parents'
        .replace('{' + 'id' + '}', String(id));

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};
    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling informalTaxonGroupGetChildren.');
    }
    if (lang !== undefined) {
      queryParameters['lang'] = lang;
    }

    return this.http.get<InformalTaxonGroup[]>(path, {params: queryParameters});
  }

  /**
   * Get current groups parents and parents siblings
   *
   * @param id
   * @param lang Language of fields that have multiple languages. Return english if asked language not found.
   * @param page Page number
   * @param pageSize Page size
   */
  public informalTaxonGroupGetParentLevel(id: string, lang?: string, page?: string, pageSize?: string, extraHttpRequestParams?: any): Observable<PagedResult<InformalTaxonGroup>> {
    const path = this.basePath + '/informal-taxon-groups/{id}/parentLevel'
        .replace('{' + 'id' + '}', String(id));

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};
    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling informalTaxonGroupGetParentLevel.');
    }

    return this.httpGet<InformalTaxonGroup>(path, queryParameters, lang, page, pageSize);
  }

  /**
   * Get full tree of informal groups with hasSubGroup extended
   *
   * @param lang Language of fields that have multiple languages. Return english if asked language not found.
   * @param page Page number
   * @param pageSize Page size
   */
  public informalTaxonGroupGetTree(lang?: string, page?: string, pageSize?: string, extraHttpRequestParams?: any): Observable<PagedResult<InformalTaxonGroup>> {
    const path = this.basePath + '/informal-taxon-groups/tree';
    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};

    return this.httpGet<InformalTaxonGroup>(path, queryParameters, lang, page, pageSize);
  }

  /**
   * Get current groups with it&#39;s siblings
   *
   * @param id
   * @param lang Language of fields that have multiple languages. Return english if asked language not found.
   * @param page Page number
   * @param pageSize Page size
   */
  public informalTaxonGroupGetWithSiblings(id: string, lang?: string, page?: string, pageSize?: string, extraHttpRequestParams?: any): Observable<PagedResult<InformalTaxonGroup>> {
    const path = this.basePath + '/informal-taxon-groups/{id}/siblings'
        .replace('{' + 'id' + '}', String(id));

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};
    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling informalTaxonGroupGetWithSiblings.');
    }

    return this.httpGet<InformalTaxonGroup>(path, queryParameters, lang, page, pageSize);
  }

  private httpGet<T>(path: string, queryParameters: any, lang?: string, page?: string, pageSize?: string) {
    if (lang !== undefined) {
      queryParameters['lang'] = lang;
    }

    if (page !== undefined) {
      queryParameters['page'] = page;
    }

    if (pageSize !== undefined) {
      queryParameters['pageSize'] = pageSize;
    }

    return this.http.get<PagedResult<T>>(path, { params: queryParameters });
  }
}
