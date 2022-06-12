import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListComponent } from './user-list.component';

export const getPage = (page: number, size: number) => {
  let start = page * size;
  let end = start + size;
  return {
    content: users.slice(start, end),
    page,
    size,
    totalPages: Math.ceil(users.length / size)
  }
}

const users = [
  { id: 1, username: 'user1', email: 'user1@mail.com' },
  { id: 2, username: 'user2', email: 'user2@mail.com' },
  { id: 3, username: 'user3', email: 'user3@mail.com' },
  { id: 4, username: 'user4', email: 'user4@mail.com' },
  { id: 5, username: 'user5', email: 'user5@mail.com' },
  { id: 6, username: 'user6', email: 'user6@mail.com' },
  { id: 7, username: 'user7', email: 'user7@mail.com' },
];

const parsePageParams = (request: TestRequest) => {
  let size = Number.parseInt(request.request.params.get('size')!);
  let page = Number.parseInt(request.request.params.get('page')!);
  if(Number.isNaN(size)) {
    size = 5;
  }
  if(Number.isNaN(page)) {
    page = 0;
  }
  return {
    size, page
  }
}

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
    const request = httpTestingController.expectOne(() => true);
    const { page, size } = parsePageParams(request);
    request.flush(getPage(page, size));
    fixture.detectChanges();
    const listItems = fixture.nativeElement.querySelectorAll('li');
    expect(listItems.length).toBe(3);
  });
  it('sends size param as three', () => {
    const request = httpTestingController.expectOne(() => true);
    expect(request.request.params.get('size')).toBe(3);
  });
  it('displays next page button', () => {
    const request = httpTestingController.expectOne(() => true);
    request.flush(getPage(0, 3));
    fixture.detectChanges();
    const nextPageButton = fixture.nativeElement.querySelector('button[data-testid="next-button"]');
    expect(nextPageButton).toBeTruthy();
  })
  it('request next page after clicking next page button', () => {
    const request = httpTestingController.expectOne(() => true);
    request.flush(getPage(0, 3));
    fixture.detectChanges();
    const nextPageButton = fixture.nativeElement.querySelector('button[data-testid="next-button"]');
    nextPageButton.click();
    const nextRequest = httpTestingController.expectOne(() => true);
    expect(nextRequest.request.params.get('page')).toBe(1);
  })
  it('does not display next page at last page', () => {
    const request = httpTestingController.expectOne(() => true);
    request.flush(getPage(2, 3));
    fixture.detectChanges();
    const nextPageButton = fixture.nativeElement.querySelector('button[data-testid="next-button"]');
    expect(nextPageButton).toBeFalsy();
  })
  it('does not display previous page button at first page', () => {
    const request = httpTestingController.expectOne(() => true);
    request.flush(getPage(0, 3));
    fixture.detectChanges();
    const previousPageButton = fixture.nativeElement.querySelector('button[data-testid="previous-button"]');
    expect(previousPageButton).toBeFalsy();
  })
  it('displays previous page button in page 2', () => {
    const request = httpTestingController.expectOne(() => true);
    request.flush(getPage(1, 3));
    fixture.detectChanges();
    const previousPageButton = fixture.nativeElement.querySelector('button[data-testid="previous-button"]');
    expect(previousPageButton).toBeTruthy();
  })
  it('displays previous page after clicking previous page button', () => {
    const request = httpTestingController.expectOne(() => true);
    request.flush(getPage(1, 3));
    fixture.detectChanges();
    const previousPageButton = fixture.nativeElement.querySelector('button[data-testid="previous-button"]');
    previousPageButton.click();
    const previousPageRequest = httpTestingController.expectOne(() => true);
    expect(previousPageRequest.request.params.get('page')).toBe(0);
  })

});
