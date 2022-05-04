import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { LangModule } from '../lang/lang.module';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { LajiUiModule } from '../../../../../laji-ui/src/public-api';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { AudioViewerComponent } from './audio-viewer/audio-viewer.component';
import { AudioSpectrogramComponent } from './audio-viewer/audio-spectrogram/audio-spectrogram.component';
import { AudioNotSupportedErrorComponent } from './directive/audio-not-supported-error.component';
import { AudioIosWarningComponent } from './directive/audio-ios-warning.component';
import { AudioSampleRateWarningComponent } from './directive/audio-sample-rate-warning.component';
import { AudioService } from './service/audio.service';
import { SpectrogramService } from './service/spectrogram.service';
import { RequiresAudioSupportDirective } from './directive/requires-audio-support.directive';
import { AudioViewerSettingsComponent } from './audio-viewer-settings/audio-viewer-settings.component';
import { DatePipe } from '@angular/common';
import { SpectrogramComponent } from './audio-viewer/audio-spectrogram/spectrogram/spectrogram.component';
import { SpectrogramChartComponent } from './audio-viewer/audio-spectrogram/spectrogram-chart/spectrogram-chart.component';
import { UtilitiesDumbDirectivesModule } from '../utilities/directive/dumb-directives/utilities-dumb-directives.module';

@NgModule({
  declarations: [AudioViewerComponent, AudioSpectrogramComponent,
    AudioNotSupportedErrorComponent, AudioIosWarningComponent,
    RequiresAudioSupportDirective, AudioViewerSettingsComponent,
    SpectrogramComponent, SpectrogramChartComponent, AudioSampleRateWarningComponent
  ],
  providers: [AudioService, SpectrogramService, DatePipe],
  imports: [
    CommonModule,
    SharedModule,
    LangModule,
    LajiUiModule,
    LajiMapModule,
    JwBootstrapSwitchNg2Module,
    UtilitiesDumbDirectivesModule
  ],
  exports: [AudioViewerComponent, RequiresAudioSupportDirective, AudioViewerSettingsComponent, SpectrogramComponent]
})
export class AudioViewerModule { }
