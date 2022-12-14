import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'qualityUrl'
})

export class QualityUrlPipe implements PipeTransform {
  recordPath = 'static/images/quality-icons/record/';
  collectionPath = 'static/images/quality-icons/collection/';

  transform(value: any): any {
    switch (value) {
      case 'EXPERT_VERIFIED':
        return this.recordPath + 'expert_verified.svg';
      case 'COMMUNITY_VERIFIED':
        return this.recordPath + 'community_verified.svg';
      case 'NEUTRAL':
        return this.recordPath + 'neutral.svg';
      case 'UNCERTAIN':
        return this.recordPath + 'uncertain.svg';
      case 'ERRONEOUS':
        return this.recordPath + 'erroneus.svg';
      case 'PROFESSIONAL':
      case 'MY.collectionQualityEnum3':
        return this.collectionPath + 'professional_collection.svg';
      case 'HOBBYIST':
      case 'MY.collectionQualityEnum2':
        return this.collectionPath + 'hobbyist_collection.svg';
      case 'AMATEUR':
      case 'MY.collectionQualityEnum1':
        return this.collectionPath + 'amateur_collection.svg';
      default:
        return '';
    }
  }

}
