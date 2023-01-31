import { Component, ChangeDetectionStrategy, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { Profile } from '../../../../../../laji/src/app/shared/model/Profile';
import BirdSongRecognitionSkillLevel = Profile.BirdSongRecognitionSkillLevel;
import BirdSongRecognitionSkillLevelEnum = Profile.BirdSongRecognitionSkillLevelEnum;

@Component({
  selector: 'bsg-expertise-by-continent',
  templateUrl: './expertise-by-continent.component.html',
  styleUrls: ['./expertise-by-continent.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpertiseByContinentComponent implements OnChanges {
  @Input() continents: {id: string; value: string}[] = [];
  @Input() birdSongRecognitionSkillLevels: BirdSongRecognitionSkillLevel[] = [];
  @Input() disabled = false;

  skillLevelByContinent = {};

  birdSongRecognitionSkillLevelOptions: {id: BirdSongRecognitionSkillLevelEnum; label: string}[] = [
    {id: 'MA.birdSongRecognitionSkillLevelEnum1', label: 'expertise.birdSongRecognitionSkillLevel1'},
    {id: 'MA.birdSongRecognitionSkillLevelEnum2', label: 'expertise.birdSongRecognitionSkillLevel2'},
    {id: 'MA.birdSongRecognitionSkillLevelEnum3', label: 'expertise.birdSongRecognitionSkillLevel3'},
    {id: 'MA.birdSongRecognitionSkillLevelEnum4', label: 'expertise.birdSongRecognitionSkillLevel4'}
  ];

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
