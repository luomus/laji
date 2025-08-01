/**
 * API documentation
 * To use this api you need an access token.  To get the token, send a post request with your email address to api-users
 * resource and one will be send to your. Each endpoint bellow has more information on how to use this API.
 * If you have any questions you can contact us at helpdesk@laji.fi.
 * You can find more documentation here: [in Finnish](https://laji.fi/about/806), in English (todo).
 * Please refer to [schema.laji.fi](http://schema.laji.fi/) for information about the used vocabulary.
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


