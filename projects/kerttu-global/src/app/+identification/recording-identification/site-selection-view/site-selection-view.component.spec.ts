import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteSelectionViewComponent } from './site-selection-view.component';

describe('SiteSelectionViewComponent', () => {
  let component: SiteSelectionViewComponent;
  let fixture: ComponentFixture<SiteSelectionViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteSelectionViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteSelectionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
