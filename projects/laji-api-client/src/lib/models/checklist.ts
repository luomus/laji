/* eslint-disable max-len */
/**
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


export interface Checklist {
  id: string;
  /**
   *  If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  name?: string;
  isPublic?: boolean;
  owner?: string;
  rootTaxon?: string;
}
