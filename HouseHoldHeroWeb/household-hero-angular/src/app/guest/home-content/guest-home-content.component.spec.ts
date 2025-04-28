import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestHomeContentComponent } from './guest-home-content.component';

describe('GuestHomeContentComponent', () => {
  let component: GuestHomeContentComponent;
  let fixture: ComponentFixture<GuestHomeContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestHomeContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestHomeContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
