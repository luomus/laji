import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NafiBumblebeeResultFiltersComponent } from './nafi-bumblebee-result-filters.component';

describe('NafiBumblebeeResultFiltersComponent', () => {
  let component: NafiBumblebeeResultFiltersComponent;
  let fixture: ComponentFixture<NafiBumblebeeResultFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NafiBumblebeeResultFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NafiBumblebeeResultFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
