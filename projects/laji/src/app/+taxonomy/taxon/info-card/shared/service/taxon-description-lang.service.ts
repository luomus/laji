import {
  TaxonomyDescription,
  TaxonomyDescriptionGroup,
  TaxonomyDescriptionVariable
} from '../../../../../shared/model/Taxonomy';

export class TaxonDescriptionLangService {
  static multiLangDescriptionToLang(taxonDescription: TaxonomyDescription[], lang: string): TaxonomyDescription[] {
    return taxonDescription.reduce((result: TaxonomyDescription[], description: TaxonomyDescription) => {
      const groups = TaxonDescriptionLangService.multiLangDescriptionGroupsToLang(description.groups || [], lang);

      let speciesCardAuthors: TaxonomyDescriptionVariable;
      if (description.speciesCardAuthors) {
        const variable = description.speciesCardAuthors;
        speciesCardAuthors = { ...variable, title: variable.title?.[lang] || '', content: variable.content[lang] };
      }

      if (groups.length > 0) {
        result.push({ ...description, title: description.title?.[lang] || '', groups, speciesCardAuthors });
      }

      return result;
    }, []);
  }

  private static multiLangDescriptionGroupsToLang(descriptionGroups: TaxonomyDescriptionGroup[], lang: string): TaxonomyDescriptionGroup[] {
    return descriptionGroups.reduce((groups: TaxonomyDescriptionGroup[], group: TaxonomyDescriptionGroup) => {
      const variables = TaxonDescriptionLangService.multiLangGroupVariablesToLang(group.variables || [], lang);

      if (variables.length > 0) {
        groups.push({ ...group, title: group.title?.[lang] || '', variables });
      }

      return groups;
    }, []);
  }

  private static multiLangGroupVariablesToLang(groupVariables: TaxonomyDescriptionVariable[], lang: string): TaxonomyDescriptionVariable[] {
    return groupVariables.reduce((variables: TaxonomyDescriptionVariable[], variable: TaxonomyDescriptionVariable) => {
      if (variable.content?.[lang]) {
        variables.push({ ...variable, title: variable.title?.[lang] || '', content: variable.content[lang] });
      }
      return variables;
    }, []);
  }
}
