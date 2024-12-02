import {
  TaxonomyDescription,
  TaxonomyDescriptionGroup,
  TaxonomyDescriptionVariable
} from '../../../../../shared/model/Taxonomy';

export function multiLangDescriptionToLang(taxonDescription: TaxonomyDescription[], lang: string): TaxonomyDescription[] {
  return taxonDescription.reduce((result: TaxonomyDescription[], description: TaxonomyDescription) => {
    const groups = multiLangDescriptionGroupsToLang(description.groups || [], lang);

    let speciesCardAuthors: TaxonomyDescriptionVariable | undefined;
    if (description.speciesCardAuthors) {
      const variable = description.speciesCardAuthors;
      speciesCardAuthors = { ...variable, title: variable.title?.[lang as any] || '', content: variable.content?.[lang as any] };
    }

    if (groups.length > 0) {
      result.push({ ...description, title: description.title?.[lang as any] || '', groups, speciesCardAuthors });
    }

    return result;
  }, []);
}

function multiLangDescriptionGroupsToLang(descriptionGroups: TaxonomyDescriptionGroup[], lang: string): TaxonomyDescriptionGroup[] {
  return descriptionGroups.reduce((groups: TaxonomyDescriptionGroup[], group: TaxonomyDescriptionGroup) => {
    const variables = multiLangGroupVariablesToLang(group.variables || [], lang);

    if (variables.length > 0) {
      groups.push({ ...group, title: group.title?.[lang as any] || '', variables });
    }

    return groups;
  }, []);
}

function multiLangGroupVariablesToLang(groupVariables: TaxonomyDescriptionVariable[], lang: string): TaxonomyDescriptionVariable[] {
  return groupVariables.reduce((variables: TaxonomyDescriptionVariable[], variable: TaxonomyDescriptionVariable) => {
    if (variable.content?.[lang as any]) {
      variables.push({ ...variable, title: variable.title?.[lang as any] || '', content: variable.content[lang as any] });
    }
    return variables;
  }, []);
}
