/* eslint-disable no-unused-vars, max-len */
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
import { EMPTY, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Util } from '../service/util.service';
import { Profile } from '../model/Profile';
import { Person } from '../model/Person';
import { environment } from '../../../environments/environment';
import { PlatformService } from '../../root/platform.service';

@Injectable({providedIn: 'root'})
export class PersonApi {
  protected basePath = environment.apiBase;

  constructor(
    private platformService: PlatformService,
    protected http: HttpClient
  ) {
  }

  /**
   * Accept person request
   *
   * @param token User token
   * @param userId Accept this user as a person
   */
  public personAcceptFriendRequest(token: string, userId: string, extraHttpRequestParams?: any): Observable<Profile> {
    if (this.platformService.isServer) {
      return EMPTY;
    }
    const path = this.basePath + '/person/{token}/friends/{userId}'
        .replace('{' + 'token' + '}', String(token))
        .replace('{' + 'userId' + '}', String(userId));

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};
    // verify required parameter 'token' is not null or undefined
    if (token === null || token === undefined) {
      throw new Error('Required parameter token was null or undefined when calling personAcceptFriendRequest.');
    }
    // verify required parameter 'userId' is not null or undefined
    if (userId === null || userId === undefined) {
      throw new Error('Required parameter userId was null or undefined when calling personAcceptFriendRequest.');
    }

    return this.http.put(path, undefined, {params: queryParameters});
  }

  /**
   * Request person to be your friend
   *
   * @param token User token
   * @param profileKey profile key
   */
  public personAddFriendRequest(token: string, profileKey: string, extraHttpRequestParams?: any): Observable<unknown> {
    if (this.platformService.isServer) {
      return EMPTY;
    }
    const path = this.basePath + '/person/{token}/friends/{profileKey}'
        .replace('{' + 'token' + '}', String(token))
        .replace('{' + 'profileKey' + '}', String(profileKey));

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};
    // verify required parameter 'token' is not null or undefined
    if (token === null || token === undefined) {
      throw new Error('Required parameter token was null or undefined when calling personAddFriendRequest.');
    }
    // verify required parameter 'profileKey' is not null or undefined
    if (profileKey === null || profileKey === undefined) {
      throw new Error('Required parameter profileKey was null or undefined when calling personAddFriendRequest.');
    }

    return this.http.post(path, undefined, {params: queryParameters});
  }

  /**
   * Create profile
   *
   * @param profile object to be updated
   * @param token users personToken
   */
  public personCreateProfileByToken(profile: Profile, token: string, extraHttpRequestParams?: any): Observable<Profile> {
    if (this.platformService.isServer) {
      return EMPTY;
    }
    const path = this.basePath + '/person/{token}/profile'
        .replace('{' + 'token' + '}', String(token));

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};
    // verify required parameter 'profile' is not null or undefined
    if (profile === null || profile === undefined) {
      throw new Error('Required parameter profile was null or undefined when calling personCreateProfileByToken.');
    }
    // verify required parameter 'token' is not null or undefined
    if (token === null || token === undefined) {
      throw new Error('Required parameter token was null or undefined when calling personCreateProfileByToken.');
    }
    return this.http.post(path, profile, {params: queryParameters});
  }

  /**
   * Find person by user token
   *
   * @param token users personToken
   */
  public personFindByToken(token: string, extraHttpRequestParams?: any): Observable<Person> {
    if (this.platformService.isServer) {
      return EMPTY;
    }
    const path = this.basePath + '/person/{token}'
        .replace('{' + 'token' + '}', String(token));

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};
    // verify required parameter 'token' is not null or undefined
    if (token === null || token === undefined) {
      throw new Error('Required parameter token was null or undefined when calling personFindByToken.');
    }

    return this.http.get(path, {params: queryParameters});
  }

  /**
   * Find person by user id
   *
   * @param id users id
   */
  public personFindByUserId(id: string, extraHttpRequestParams?: any): Observable<Person> {
    const path = this.basePath + '/person/by-id/{id}'
        .replace('{' + 'id' + '}', String(id));

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};
    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling personFindByUserId.');
    }

    return this.http.get(path, {params: queryParameters});
  }

  /**
   * Find persons profile by user id
   *
   * @param id users id
   */
  public personFindProfileByUserId(id: string, extraHttpRequestParams?: any): Observable<Profile> {
    const path = this.basePath + '/person/by-id/{id}/profile'
        .replace('{' + 'id' + '}', String(id));

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};
    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling personFindByUserId.');
    }

    return this.http.get(path, {params: queryParameters});
  }

  /**
   * Show persons profile
   *
   * @param token users personToken
   */
  public personFindProfileByToken(token: string, extraHttpRequestParams?: any): Observable<Profile> {
    if (this.platformService.isServer) {
      return EMPTY;
    }
    const path = this.basePath + '/person/{token}/profile'
        .replace('{' + 'token' + '}', String(token));

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};
    // verify required parameter 'token' is not null or undefined
    if (token === null || token === undefined) {
      throw new Error('Required parameter token was null or undefined when calling personFindProfileByToken.');
    }

    return this.http.get(path, {params: queryParameters});
  }

  /**
   * Remove person request or person
   *
   * @param token User token
   * @param userId Accept this user as a person
   * @param block if the removed person should be blocked also
   */
  public personRemoveFriend(token: string, userId: string, block: boolean = false, extraHttpRequestParams?: any): Observable<Profile> {
    if (this.platformService.isServer) {
      return EMPTY;
    }
    const path = this.basePath + '/person/{token}/friends/{userId}'
        .replace('{' + 'token' + '}', String(token))
        .replace('{' + 'userId' + '}', String(userId));

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};
    // verify required parameter 'token' is not null or undefined
    if (token === null || token === undefined) {
      throw new Error('Required parameter token was null or undefined when calling personRemoveFriend.');
    }
    // verify required parameter 'userId' is not null or undefined
    if (userId === null || userId === undefined) {
      throw new Error('Required parameter userId was null or undefined when calling personRemoveFriend.');
    }
    if (block !== undefined) {
      queryParameters['block'] = block;
    }

    return this.http.delete(path, {params: queryParameters});
  }

  /**
   * Update profile
   *
   * @param profile users profile object
   * @param token users personToken
   */
  public personUpdateProfileByToken(profile: Profile, token: string, extraHttpRequestParams?: any): Observable<Profile> {
    if (this.platformService.isServer) {
      return EMPTY;
    }
    const path = this.basePath + '/person/{token}/profile'
        .replace('{' + 'token' + '}', String(token));

    const queryParameters = {...Util.removeFromObject(extraHttpRequestParams)};
    // verify required parameter 'profile' is not null or undefined
    if (profile === null || profile === undefined) {
      throw new Error('Required parameter profile was null or undefined when calling personUpdateProfileByToken.');
    }
    // verify required parameter 'token' is not null or undefined
    if (token === null || token === undefined) {
      throw new Error('Required parameter token was null or undefined when calling personUpdateProfileByToken.');
    }

    return this.http.put(path, profile, {params: queryParameters});
  }

  public removePersonToken(token: string) {
    if (this.platformService.isServer) {
      return EMPTY;
    }
    const url = this.basePath + `/person-token/${token}`;
    // expecting 200 "ok"
    return this.http.delete(url, {observe: 'body', responseType: 'text'});
  }

}
