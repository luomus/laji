/* tslint:disable */
export interface PersonToken {

  /**
   * users identifier
   */
  personId: string;

  /**
   * target system to witch user token was issued to
   */
  target?: string;

  /**
   * content of next parameter send on login
   */
  next?: string;
}
