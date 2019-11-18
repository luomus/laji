/* tslint:disable */
export interface Person {
  id: string;
  fullName?: string;
  emailAddress?: string;
  defaultLanguage?: string;
  role?: Array<string>;

  /**
   * Group, membership or any other way that allows the user to distinguish themselves from people with the same name
   */
  group?: string;
  roleAnnotation?: 'MMAN.expert' | 'MMAN.basic' | 'MMAN.owner';
}
