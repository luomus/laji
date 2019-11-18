/* tslint:disable */
export interface FormPermissionPerson {

  /**
   * Users person id
   */
  personID: string;

  /**
   * List of collections where person is admin
   */
  admins?: Array<string>;

  /**
   * List of collections where person is editor
   */
  editors?: Array<string>;

  /**
   * List of collections where person has permission requests
   */
  permissionRequests?: Array<string>;
}
