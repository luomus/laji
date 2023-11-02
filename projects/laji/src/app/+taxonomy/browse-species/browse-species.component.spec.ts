import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BrowseSpeciesComponent } from './browse-species.component';

describe('BrowseSpeciesComponent', () => {
  let component: BrowseSpeciesComponent;
  let fixture: ComponentFixture<BrowseSpeciesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseSpeciesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseSpeciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
