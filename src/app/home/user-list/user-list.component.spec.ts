import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserListItemComponent } from '../user-list-item/user-list-item.component';
import { getPage } from './test-helper';

import { UserListComponent } from './user-list.component';



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
      declarations: [UserListComponent, UserListItemComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
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

  it('displays spinner during the api call', () => {
    const request = httpTestingController.expectOne(() => true);
    expect(fixture.nativeElement.querySelector('span[role="status"]')).toBeTruthy();
    request.flush(getPage(0, 3));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span[role="status"]')).toBeFalsy();
  })

});
