import { RouterModule, Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { ObservationComponent } from './observation.component';
import { ModuleWithProviders } from '@angular/core';

const observationMatcher = (segments: UrlSegment[]): UrlMatchResult => {
  if (segments.length === 0) {
    return {
      consumed: segments,
      posParams: {},
    };
  } else if (segments.length === 1) {
    return {
      consumed: segments,
      posParams: {tab: segments[0]},
    };
  }
  return <UrlMatchResult>(null as any);
};

export const observationRoutes: Routes = [
  {
    matcher: observationMatcher,
    component: ObservationComponent,
    data: {
      noScrollToTop: true
    }
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(observationRoutes);
