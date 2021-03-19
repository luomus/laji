import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NafiBumblebeeAllResultsComponent } from './nafi-bumblebee-all-results.component';

describe('NafiBumblebeeAllResultsComponent', () => {
  let component: NafiBumblebeeAllResultsComponent;
  let fixture: ComponentFixture<NafiBumblebeeAllResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NafiBumblebeeAllResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NafiBumblebeeAllResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
