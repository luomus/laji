import { Injectable } from '@angular/core';
import { GenericLabelMakerTranslationsInterface } from './generic-label-maker-translations.interface';

@Injectable()
export class TranslateService {

  /* tslint:disable:max-line-length */
  private translations: GenericLabelMakerTranslationsInterface = {
    'Labels on page': 'There can be a total of {{total}} labels on a single page (in {{cols}} columns and {{rows}} rows).',
    'Label intro': '  <p>With this tool you can make a label design to print labels for specimens.</p>\n' +
      '  <p>You can start from scratch and design an entirely new label. You can also use pre-defined label templates as they are or as a starting point for your design.</p>\n' +
      '  <p>\n' +
      '    You can find the pre-defined label templates under File in the menu bar. There you can also save your label design templates, load previously saved templates, see your own recent label' +
      '    templates, generate specimen data for the labels or import it from an XLS, CSV or ODS file and download the label PDF. Under Edit you find the undo and redo buttons and under View you can ' +
      '    magnify the editor, go to full screen mode or choose to show a grid to help with the design. Under Label fields you find all the data fields available for labels. Under Settings you can adjust' +
      '    various things - separately for each field and generally for the whole label and for the page, including two sided labels. Under Map values you can choose how a certain field content is to be' +
      '    shown on the label.' +
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
