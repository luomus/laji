import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ViewerModal } from './viewer-modal.po';

describe('AppComponent', () => {
  let component: ViewerModal;
  let fixture: ComponentFixture<ViewerModal>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewerModal]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', async(() => {
    const container = fixture.debugElement.query(By.css('.modal-dialog'));

    container.nativeElement.scrolldown = 50;
    expect(container.nativeElement.scrolldown).toEqual(50);

    container.triggerEventHandler('scroll', null);
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      const taxon = fixture.debugElement.query(By.css('.taxon-input'));
      expect(taxon).toBeTruthy();
    });
  }));
});