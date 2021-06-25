import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AdminTabsPage } from './admin-tabs.page';

describe('AdminTabsPage', () => {
  let component: AdminTabsPage;
  let fixture: ComponentFixture<AdminTabsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminTabsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
