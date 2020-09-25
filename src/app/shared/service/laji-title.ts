import { Title } from '@angular/platform-browser';
import { Injectable } from '@angular/core';

@Injectable()
export class LajiTitle extends Title {
  setTitle(newTitle: string) {
    super.setTitle(this.decodeHtmlEntity(newTitle));
  }

  private decodeHtmlEntity(str) {
    const translate_re = /&(nbsp|amp|quot|lt|gt|shy);/g;
    const translate = {
      'nbsp': ' ',
      'amp' : '&',
      'quot': '\'',
      'lt'  : '<',
      'gt'  : '>',
      'shy' : ''
    };
    return str.replace(translate_re, function(match, entity) {
      return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
      return String.fromCharCode(parseInt(numStr, 10));
    });
  }
}
