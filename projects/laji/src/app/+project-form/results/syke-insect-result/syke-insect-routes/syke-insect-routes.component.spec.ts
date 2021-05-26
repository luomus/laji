import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SykeInsectRoutesComponent } from './syke-insect-routes.component';

describe('SykeInsectRoutesComponent', () => {
  let component: SykeInsectRoutesComponent;
  let fixture: ComponentFixture<SykeInsectRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SykeInsectRoutesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SykeInsectRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
