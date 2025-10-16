import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { LangModule } from '../lang/lang.module';
import { LajiMapModule } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.module';
import { LajiUiModule } from '../../../../../laji-ui/src/public-api';
import { JwBootstrapSwitchNg2Module } from '@servoy/jw-bootstrap-switch-ng2';
import { AudioSpectrogramComponent } from './audio-viewer/audio-spectrogram/audio-spectrogram.component';
import { AudioNotSupportedErrorComponent } from './directive/audio-not-supported-error.component';
import { AudioIosWarningComponent } from './directive/audio-ios-warning.component';
import { AudioService } from './service/audio.service';
import { SpectrogramService } from './service/spectrogram.service';
import { RequiresAudioSupportDirective } from './directive/requires-audio-support.directive';
import { SpectrogramComponent } from './audio-viewer/audio-spectrogram/spectrogram/spectrogram.component';
import { SpectrogramChartComponent } from './audio-viewer/audio-spectrogram/spectrogram-chart/spectrogram-chart.component';
import { SmallAudioViewerComponent } from './small-audio-viewer/small-audio-viewer.component';
import { UtilitiesDumbDirectivesModule } from '../utilities/directive/dumb-directives/utilities-dumb-directives.module';
import { AudioViewerComponent } from './audio-viewer/audio-viewer.component';
import { AudioViewerControlsComponent } from './audio-viewer/audio-viewer-controls/audio-viewer-controls.component';
import { SpectrogramConfigModalComponent } from './audio-viewer/spectrogram-config-modal/spectrogram-config-modal.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AudioSpectrogramComponent,
    AudioNotSupportedErrorComponent, AudioIosWarningComponent,
    RequiresAudioSupportDirective,
    SpectrogramComponent, SpectrogramChartComponent, SmallAudioViewerComponent,
    AudioViewerComponent,
    AudioViewerControlsComponent,
    SpectrogramConfigModalComponent
  ],
  providers: [AudioService, SpectrogramService],
  imports: [
    CommonModule,
    SharedModule,
    LangModule,
    LajiUiModule,
    LajiMapModule,
    JwBootstrapSwitchNg2Module,
    UtilitiesDumbDirectivesModule,
    FormsModule
  ],
  exports: [
    AudioViewerComponent,
    SmallAudioViewerComponent,
    RequiresAudioSupportDirective
  ]
})
export class AudioViewerModule { }
