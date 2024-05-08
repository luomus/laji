import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { LangModule } from '../lang/lang.module';
import { LajiMapModule } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.module';
import { LajiUiModule } from '../../../../../laji-ui/src/public-api';
import { JwBootstrapSwitchNg2Module } from '@servoy/jw-bootstrap-switch-ng2';
import { AudioViewerComponent } from './audio-viewer/audio-viewer.component';
import { AudioSpectrogramComponent } from './audio-viewer/audio-spectrogram/audio-spectrogram.component';
import { AudioNotSupportedErrorComponent } from './directive/audio-not-supported-error.component';
import { AudioIosWarningComponent } from './directive/audio-ios-warning.component';
import { AudioService } from './service/audio.service';
import { SpectrogramService } from './service/spectrogram.service';
import { RequiresAudioSupportDirective } from './directive/requires-audio-support.directive';
import { AudioViewerSettingsComponent } from './audio-viewer-settings/audio-viewer-settings.component';
import { SpectrogramComponent } from './audio-viewer/audio-spectrogram/spectrogram/spectrogram.component';
import { SpectrogramChartComponent } from './audio-viewer/audio-spectrogram/spectrogram-chart/spectrogram-chart.component';
import { SmallAudioViewerComponent } from './small-audio-viewer/small-audio-viewer.component';
import { UtilitiesDumbDirectivesModule } from '../utilities/directive/dumb-directives/utilities-dumb-directives.module';
import { AudioViewerSimpleSettingsComponent } from './audio-viewer-simple-settings/audio-viewer-simple-settings.component';

@NgModule({
  declarations: [AudioViewerComponent, AudioSpectrogramComponent,
    AudioNotSupportedErrorComponent, AudioIosWarningComponent,
    RequiresAudioSupportDirective, AudioViewerSettingsComponent,
    SpectrogramComponent, SpectrogramChartComponent, SmallAudioViewerComponent,
    AudioViewerSimpleSettingsComponent
  ],
  providers: [AudioService, SpectrogramService],
  imports: [
    CommonModule,
    SharedModule,
    LangModule,
    LajiUiModule,
    LajiMapModule,
    JwBootstrapSwitchNg2Module,
    UtilitiesDumbDirectivesModule
  ],
  exports: [
    AudioViewerComponent,
    RequiresAudioSupportDirective,
    AudioViewerSettingsComponent,
    AudioViewerSimpleSettingsComponent,
    SmallAudioViewerComponent
  ]
})
export class AudioViewerModule { }
