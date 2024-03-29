/* eslint-disable max-len */  /**
 * API documentation
 * Access token is needed to use this API. To get a token, send a POST request with your email address to /api-users endpoint and one will be send to your. Each endpoint bellow has more information on how to use this API. If you have any questions you can contact us at helpdesk@laji.fi.  You can find more documentation [here](https://laji.fi/about/806).  ##Endpoints  Observations and collections * Warehouse - Observation Data Warehouse API * Collection - Collection metadata * Source - Information sources (IT systems) * Annotation - Quality control   Taxonomy * Taxa - Taxonomy API * InformalTaxonGroup - Informal taxon groups are used in taxa and warehouse endpoints * Publication - Scientific publications * Checklist - Mainly you only work with one checklits: the FinBIF master checklist. There are others.   Other master data * Metadata - Variable descriptions * Area - Countries, municipalities and biogeographical provinces of Finland, etc. * Person - Information about people.   Helpers * APIUser - Register as an API user * Autocomplete - For making an autocomplete filed for taxa, collections or persons (friends) * PersonToken - Information about an authorized person   Vihko observation system * Form - Form definition * Document - Document instance of a form * Image - Image of a document   Laji.fi portal * Feedback - Feedback form API * Information - CMS content of information pages * Logger - Error logging from user's browsers to FinBIF * News - News
 *
 * OpenAPI spec version: 0.1
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { DwSingleCoordinates } from './dwSingleCoordinates';
import { DwSingleSingleCoordinates } from './dwSingleSingleCoordinates';


export interface DwSingleGatheringConversions {
  wgs84?: DwSingleCoordinates;
  wgs84CenterPoint?: DwSingleSingleCoordinates;
  euref?: DwSingleCoordinates;
  ykj?: DwSingleCoordinates;
  ykj10kmCenter?: DwSingleSingleCoordinates;
  ykj1kmCenter?: DwSingleSingleCoordinates;
  century?: number;
  decade?: number;
  year?: number;
  month?: number;
  day?: number;
  dayOfYearBegin?: number;
  dayOfYearEnd?: number;
  boundingBoxAreaInSquareMeters?: number;
  /**
   * GeoJSON object with custom \"csr\" required property that takes in values WGS84,EUREF,YKJ
   */
  eurefGeo?: any;
  eurefWKT?: string;
  linelengthInMeters?: number;
  seasonBegin?: number;
  seasonEnd?: number;
  /**
   * GeoJSON object with custom \"csr\" required property that takes in values WGS84,EUREF,YKJ
   */
  wgs84Geo?: any;
  wgs84Grid005?: DwSingleSingleCoordinates;
  wgs84Grid01?: DwSingleSingleCoordinates;
  wgs84Grid05?: DwSingleSingleCoordinates;
  wgs84Grid1?: DwSingleSingleCoordinates;
  wgs84WKT?: string;
  ykj100km?: DwSingleSingleCoordinates;
  ykj100kmCenter?: DwSingleSingleCoordinates;
  ykj10km?: DwSingleSingleCoordinates;
  ykj1km?: DwSingleSingleCoordinates;
  ykj50km?: DwSingleSingleCoordinates;
  ykj50kmCenter?: DwSingleSingleCoordinates;
  /**
   * GeoJSON object with custom \"csr\" required property that takes in values WGS84,EUREF,YKJ
   */
  ykjGeo?: any;
  ykjWKT?: string;
}
