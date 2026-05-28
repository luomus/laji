import { RouterModule, Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { ObservationComponent } from './observation.component';
import { ModuleWithProviders } from '@angular/core';
import { OnlyLoggedIn } from '../shared/route/only-logged-in';

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

const finnishMatcher = (segments: UrlSegment[]): UrlMatchResult | null => {
  if (segments.length === 1 && segments[0].path === 'finnish') {
    return {
      consumed: segments,
      posParams: {tab: segments[0]},
    };
  }
  return null;
};

export const observationRoutes: Routes = [
  { matcher: finnishMatcher, canActivate: [OnlyLoggedIn], component: ObservationComponent },
  {
    matcher: observationMatcher,
    component: ObservationComponent,
    data: {
      noScrollToTop: true
    }
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(observationRoutes);
