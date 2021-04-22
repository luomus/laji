import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { LangModule } from '../lang/lang.module';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { LajiUiModule } from '../../../../../laji-ui/src/public-api';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { AudioViewerComponent } from './audio-viewer/audio-viewer.component';
import { AudioSpectrogramComponent } from './audio-viewer/audio-spectrogram/audio-spectrogram.component';
import { AudioInfoComponent } from './audio-viewer/audio-info/audio-info.component';
import { AudioInfoMapComponent } from './audio-viewer/audio-info/audio-info-map/audio-info-map.component';
import { AudioNotSupportedErrorComponent } from './directive/audio-not-supported-error.component';
import { AudioIosWarningComponent } from './directive/audio-ios-warning.component';
import { AudioService } from './service/audio.service';
import { SpectrogramService } from './service/spectrogram.service';
import { RequiresAudioSupportDirective } from './directive/requires-audio-support.directive';
import { AudioViewerSettingsComponent } from './audio-viewer-settings/audio-viewer-settings.component';

@NgModule({
  declarations: [AudioViewerComponent, AudioSpectrogramComponent, AudioInfoComponent,
    AudioInfoMapComponent, AudioNotSupportedErrorComponent, AudioIosWarningComponent, RequiresAudioSupportDirective, AudioViewerSettingsComponent],
  providers: [AudioService, SpectrogramService],
  imports: [
    CommonModule,
    SharedModule,
    LangModule,
    LajiUiModule,
    LajiMapModule,
    JwBootstrapSwitchNg2Module
  ],
  exports: [AudioViewerComponent, RequiresAudioSupportDirective, AudioViewerSettingsComponent]
})
export class AudioViewerModule { }
