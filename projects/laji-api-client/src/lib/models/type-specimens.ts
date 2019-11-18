/* tslint:disable */
export interface TypeSpecimens {
  typeSeriesID?: string;

  /**
   * Context for the given json
   */
  '@context'?: string;

  /**
   * Unique ID for the object. This will be automatically generated.
   */
  id?: string;

  /**
   * PUBLIC: all data can be published; PROTECTED: exact locality is hidden; PRIVATE: most of the data is hidden. If blank means same as public
   */
  publicityRestrictions?: 'MZ.publicityRestrictionsPublic' | 'MZ.publicityRestrictionsProtected' | 'MZ.publicityRestrictionsPrivate';
  typeAuthor?: string;

  /**
   * Publication reference for original description or basionyme
   */
  typeBasionymePubl?: string;
  typeNotes?: string;
  typePubl?: string;

  /**
   * This field is automatically populated with the objects type and any user given value in here will be ignored!
   */
  '@type'?: string;
  typeSpecies?: string;

  /**
   * Is this holotype, paratype, syntype etc...
   */
  typeStatus?: 'MY.typeStatusType' | 'MY.typeStatusHolotype' | 'MY.typeStatusSyntype' | 'MY.typeStatusParatype' | 'MY.typeStatusLectotype' | 'MY.typeStatusParalectotype' | 'MY.typeStatusNeotype' | 'MY.typeStatusAllotype' | 'MY.typeStatusNeoallotype' | 'MY.typeStatusIsotype' | 'MY.typeStatusEpitype' | 'MY.typeStatusIsolectotype' | 'MY.typeStatusIsoepitype' | 'MY.typeStatusIsoneotype' | 'MY.typeStatusIsoparatype' | 'MY.typeStatusIsosyntype' | 'MY.typeStatusOriginalMaterial' | 'MY.typeStatusCotype' | 'MY.typeStatusTopotype' | 'MY.typeStatusHomotype' | 'MY.typeStatusNo' | 'MY.typeStatusPossible' | 'MY.typeStatusObscure' | 'MY.typeStatusTypeStrain' | 'MY.typeStatusPathovarReferenceStrain';
  typeSubspecies?: string;
  typeSubspeciesAuthor?: string;

  /**
   * Verification whether this really is a type?
   */
  typeVerification?: 'MY.typeVerificationVerified' | 'MY.typeVerificationUnverified' | 'MY.typeVerificationProbable' | 'MY.typeVerificationDoubtful';
  typif?: string;
  typifDate?: string;
}
