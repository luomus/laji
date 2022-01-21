import { Title } from '@angular/platform-browser';
import { Injectable } from '@angular/core';

@Injectable()
export class LajiTitle extends Title {
  setTitle(newTitle: string) {
    super.setTitle(this.decodeHtmlEntity(newTitle));
  }

  private decodeHtmlEntity(str: string) {
    const translateRe = /&(nbsp|amp|quot|lt|gt|shy);/g;
    const translate: Record<string, string> = {
      nbsp: ' ',
      amp : '&',
      quot: '\'',
      lt  : '<',
      gt  : '>',
      shy : ''
    };
    return str.replace(translateRe, function(match, entity) {
      return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
      return String.fromCharCode(parseInt(numStr, 10));
    });
  }
}
