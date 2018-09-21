import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoldSynonymComponent } from './bold-synonym.component';

describe('BoldSynonymComponent', () => {
  let component: BoldSynonymComponent;
  let fixture: ComponentFixture<BoldSynonymComponent>;

  beforeEach(async(() => {
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
