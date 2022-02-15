/* eslint-disable max-len */


import { Annotation } from './annotation';

export interface AnnotationTag  {
  id: string;
  description: string;
  name: string;
  requiredRolesAdd: Annotation.RoleEnum[];
  requiredRolesRemove: Annotation.RoleEnum[];
}

