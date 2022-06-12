import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListComponent } from './user-list.component';

const page = {
  content: [
    { id: 1, username: 'user1', email: 'user1@mail.com' },
    { id: 2, username: 'user2', email: 'user2@mail.com' },
    { id: 3, username: 'user3', email: 'user3@mail.com' },
  ],
  page: 0,
  size: 3,
  totalPages: 6,
};

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserListComponent],
      imports: [HttpClientTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    httpTestingController = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('displays three users in list', () => {
    const request = httpTestingController.expectOne('/api/1.0/users');
    request.flush(page);
    fixture.detectChanges();
    const listItems = fixture.nativeElement.querySelectorAll('li');
    expect(listItems.length).toBe(3);
  });
});
