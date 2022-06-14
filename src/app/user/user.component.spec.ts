import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscriber } from 'rxjs';
import { AlertComponent } from '../shared/alert/alert.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { UserComponent } from './user.component';


type RouteParams = {
  id: string
}

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let httpTestingController : HttpTestingController;
  let subscriber!: Subscriber<RouteParams>;

  beforeEach(async () => {
    const observable = new Observable<RouteParams>(sub => subscriber = sub)

    await TestBed.configureTestingModule({
      declarations: [ UserComponent, AlertComponent, ProfileCardComponent ],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: observable
          }
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    httpTestingController = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sends request to get user data', () => {
    subscriber.next({id: '1'});
    const requests = httpTestingController.match('/api/1.0/users/1')
    expect(requests.length).toBe(1);
  })
  it('displays user name on page when user is found', () => {
    subscriber.next({id: '1'});
    const request = httpTestingController.expectOne('/api/1.0/users/1')
    request.flush({
      id: 1,
      username: 'user1',
      email: 'user1@mail.com'
    });
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('h3');
    expect(header.textContent).toContain('user1');
  })
  it('displays error when user not found', () => {
    subscriber.next({id: '2'});
    const request = httpTestingController.expectOne('/api/1.0/users/2')
    request.flush({message: 'User not found'}, {status: 404, statusText: 'Not Found'});
    fixture.detectChanges();
    const alert = fixture.nativeElement.querySelector('.alert');
    expect(alert.textContent).toContain('User not found');
  })
  it('displays spinner during user get request', () => {
    subscriber.next({id: '1'});
    const request = httpTestingController.expectOne('/api/1.0/users/1')
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span[role="status"]')).toBeTruthy();
    request.flush({
      id: 1,
      username: 'user1',
      email: 'user1@mail.com'
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span[role="status"]')).toBeFalsy();
  })
});
