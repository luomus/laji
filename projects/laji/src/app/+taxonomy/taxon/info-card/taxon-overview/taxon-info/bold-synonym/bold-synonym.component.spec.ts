import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BoldSynonymComponent } from './bold-synonym.component';

describe('BoldSynonymComponent', () => {
  let component: BoldSynonymComponent;
  let fixture: ComponentFixture<BoldSynonymComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BoldSynonymComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoldSynonymComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
