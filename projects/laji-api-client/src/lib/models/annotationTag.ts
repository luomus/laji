/* tslint:disable:max-line-length */


import { Annotation } from './annotation';

export interface AnnotationTag  {
  id: string;
  description: string;
  name: string;
  requiredRolesAdd: Annotation.RoleEnum[];
  requiredRolesRemove: Annotation.RoleEnum[];
}

