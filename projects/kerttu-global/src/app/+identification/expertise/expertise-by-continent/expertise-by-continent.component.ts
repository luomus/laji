import { Component, ChangeDetectionStrategy, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { SelectStyle } from '../../../../../../laji/src/app/shared-modules/select/metadata-select/metadata-select.component';
import { Profile } from '../../../../../../laji/src/app/shared/model/Profile';
import BirdSongRecognitionSkillLevel = Profile.BirdSongRecognitionSkillLevel;

@Component({
  selector: 'laji-expertise-by-continent',
  templateUrl: './expertise-by-continent.component.html',
  styleUrls: ['./expertise-by-continent.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpertiseByContinentComponent implements OnChanges {
  @Input() continents: {id: string; value: string}[] = [];
  @Input() birdSongRecognitionSkillLevels: BirdSongRecognitionSkillLevel[] = [];
  @Input() disabled = false;

  skillLevelByContinent = {};
  basicSelectStyle = SelectStyle.basic;

  @Output() birdSongRecognitionSkillLevelsChange = new EventEmitter<BirdSongRecognitionSkillLevel[]>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes.birdSongRecognitionSkillLevels) {
      (this.birdSongRecognitionSkillLevels || []).forEach(level => {
        this.skillLevelByContinent[level.birdSongRecognitionArea] = level.birdSongRecognitionSkillLevel;
      });
    }
  }

  selectChange() {
    (this.birdSongRecognitionSkillLevels || []).forEach(level => {
      level.birdSongRecognitionSkillLevel = this.skillLevelByContinent[level.birdSongRecognitionArea];
    });
    this.birdSongRecognitionSkillLevelsChange.emit(this.birdSongRecognitionSkillLevels);
  }
}
