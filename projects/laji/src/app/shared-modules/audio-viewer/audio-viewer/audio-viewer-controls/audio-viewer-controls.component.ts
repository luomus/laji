import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { AudioPlayer } from '../../service/audio-player';
import { AudioViewerView } from '../../service/audio-viewer-view';
import { AudioViewerControls } from '../../models';

@Component({
  selector: 'laji-audio-viewer-controls',
  templateUrl: './audio-viewer-controls.component.html',
  styleUrls: ['./audio-viewer-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioViewerControlsComponent {
  @Input({ required: true }) audioPlayer!: AudioPlayer;
  @Input({ required: true }) audioViewerView!: AudioViewerView;
  @Input() disabled = false;
  @Input() controls?: AudioViewerControls;
  @Input() customControlsTpl?: TemplateRef<any>;

  setLoop(loop: boolean) {
    this.audioPlayer.setLoop(loop);
  }

  slowDownAudio(slowDown: boolean) {
    const playBackRate = slowDown ? 0.1 : 1;
    this.audioPlayer.setPlayBackRate(playBackRate);
  }

  toggleZoom() {
    const mode = this.audioViewerView.mode() === 'zoom' ? 'default' : 'zoom';
    this.audioViewerView.setMode(mode);
  }

  clearZoomArea() {
    this.audioViewerView.setView(this.audioViewerView.defaultView()!);
  }
}
