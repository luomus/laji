import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SykeInsectAllResultsComponent } from './syke-insect-all-results.component';

describe('SykeInsectAllResultsComponent', () => {
  let component: SykeInsectAllResultsComponent;
  let fixture: ComponentFixture<SykeInsectAllResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SykeInsectAllResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SykeInsectAllResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
