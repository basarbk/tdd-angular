import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from './router/app-router.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HomeComponent } from './home/home.component';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SharedModule } from './shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { ActivateComponent } from './activate/activate.component';
import { UserComponent } from './user/user.component';
import { UserListComponent } from './home/user-list/user-list.component';
import { Location } from '@angular/common';
import { UserListItemComponent } from './home/user-list-item/user-list-item.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;
  let httpTestingController: HttpTestingController;
  let location: Location;

  let appComponent: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        SignUpComponent,
        HomeComponent,
        LoginComponent,
        UserComponent,
        ActivateComponent,
        UserListComponent,
        UserListItemComponent
      ],
      imports: [
        RouterTestingModule.withRoutes(routes),
        HttpClientTestingModule,
        SharedModule,
        ReactiveFormsModule,
        FormsModule
      ],
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    httpTestingController = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    fixture.detectChanges();
    appComponent = fixture.nativeElement;
  });

  describe('Routing', () => {
    const routingTests = [
      { path: '/', pageId: 'home-page' },
      { path: '/signup', pageId: 'sign-up-page' },
      { path: '/login', pageId: 'login-page' },
      { path: '/user/1', pageId: 'user-page' },
      { path: '/user/2', pageId: 'user-page' },
      { path: '/activate/123', pageId: 'activation-page' },
      { path: '/activate/456', pageId: 'activation-page' },
    ];
    routingTests.forEach(({ path, pageId }) => {
      it(`displays ${pageId} when path is ${path}`, async () => {
        await router.navigate([path]);
        fixture.detectChanges();
        const page = appComponent.querySelector(`[data-testid="${pageId}"]`);
        expect(page).toBeTruthy();
      });
    });

    const linkTests = [
      { path: '/', title: 'Home' },
      { path: '/signup', title: 'Sign Up' },
      { path: '/login', title: 'Login' },
    ];

    linkTests.forEach(({ path, title }) => {
      it(`has link with title ${title} to ${path}`, () => {
        const linkElement = appComponent.querySelector(
          `a[title="${title}"]`
        ) as HTMLAnchorElement;
        expect(linkElement.pathname).toEqual(path);
      });
    });

    const navigationTests = [
      {
        initialPath: '/',
        clickingTo: 'Sign Up',
        visiblePage: 'sign-up-page',
      },
      {
        initialPath: '/signup',
        clickingTo: 'Home',
        visiblePage: 'home-page',
      },
      {
        initialPath: '/',
        clickingTo: 'Login',
        visiblePage: 'login-page',
      },
    ];
    navigationTests.forEach(({ initialPath, clickingTo, visiblePage }) => {
      it(`displays ${visiblePage} after clicking ${clickingTo} link`, fakeAsync(async () => {
        await router.navigate([initialPath]);
        const linkElement = appComponent.querySelector(
          `a[title="${clickingTo}"]`
        ) as HTMLAnchorElement;
        linkElement.click();
        tick();
        fixture.detectChanges();
        const page = appComponent.querySelector(
          `[data-testid="${visiblePage}"]`
        );
        expect(page).toBeTruthy();
      }));
    });

    it('navigates to user page when clicking the username on user list', fakeAsync(async () => {
      await router.navigate(['/'])
      fixture.detectChanges();
      const request = httpTestingController.expectOne(() => true);
      request.flush({
        content: [
          { id: 1, username: 'user1', email: 'user1@mail.com'}
        ],
        page: 0, size: 3, totalPages: 1
      })
      fixture.detectChanges();
      const linkToUserPage = fixture.nativeElement.querySelector('.list-group-item')
      linkToUserPage.click();
      tick();
      fixture.detectChanges();
      const page = appComponent.querySelector(
        `[data-testid="user-page"]`
      );
      expect(page).toBeTruthy();
      expect(location.path()).toEqual('/user/1');
    }))
  });
});
