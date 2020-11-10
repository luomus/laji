import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit, wordComplete = false, dots = '...') {
    const lastWord = 50;

    if (value.length < limit) {
      return value;
    }

      if (wordComplete) {

        let truncatedText = value.slice(0, limit + lastWord);

        while (truncatedText.length > limit - dots.length) {
        const lastSpace = truncatedText.lastIndexOf(' ');

        if (lastSpace === -1) {
          break;
        }

        truncatedText = truncatedText.slice(0, lastSpace).replace(/[!,.?;:]$/, '');
        }
        return truncatedText + dots;
      }

    return `${value.substr(0, limit)}${dots}`;
  }
}
