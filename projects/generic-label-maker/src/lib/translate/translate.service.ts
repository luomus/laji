import { Injectable } from '@angular/core';
import { GenericLabelMakerTranslationsInterface } from './generic-label-maker-translations.interface';

@Injectable()
export class TranslateService {

  /* tslint:disable:max-line-length */
  private translations: GenericLabelMakerTranslationsInterface = {
    'Labels on page': 'There can be a total of {{total}} labels on a single page (in {{cols}} columns and {{rows}} rows).',
    'Label intro': '  <p>With this tool you can make a specimen label design that can be used to print labels for Notebook observations.</p>\n' +
      '  <p>You can start from scratch and design an entirely new label. You can also use pre-defined label templates as they are or as a starting point for your design.</p>\n' +
      '  <p>\n' +
      '    Under Fields you find all the data fields available for labels.\n' +
      '    Under settings you can adjust both general label settings and separate field settings.\n' +
      '    Under Files you can save your label design templates, load previously saved templates,\n' +
      '    see your recent label template files and download the label pdf.\n' +
      '  </p>'
  };

  setTranslations(translations: GenericLabelMakerTranslationsInterface) {
    this.translations = {...this.translations, ...translations};
  }

  get(key: keyof GenericLabelMakerTranslationsInterface, variables?: object) {
    return this.openVariables(this.translations[key] || key, variables);
  }

  private openVariables(value: string, variables?: object) {
    if (variables) {
      Object.keys(variables).forEach(key =>  {
        value = value.replace(`{{${key}}}`, variables[key] || '');
      });
    }
    return value;
  }
}
