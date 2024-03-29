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

'use strict';

export interface TypeSpecimens {


  /**
   * Unique ID for the object. (if none given id will be auto generated during insert)
   */
  id?: string;

  /**
   * PUBLIC: all data can be published; PROTECTED: exact locality is hidden; PRIVATE: most of the data is hidden. If blank means same as public
   */
  publicityRestrictions?: string;

  typeAuthor?: string;

  /**
   * Publication reference for original description or basionyme
   */
  typeBasionymePubl?: string;

  typeNotes?: string;

  typePubl?: string;

  typeSeriesID?: string;

  typeSpecies?: string;

  /**
   * Is this holotype, paratype, syntype etc...
   */
  typeStatus?: string;

  typeSubspecies?: string;

  typeSubspeciesAuthor?: string;

  /**
   * Verification whether this really is a type?
   */
  typeVerification?: string;

  typif?: string;

  typifDate?: string;
}
