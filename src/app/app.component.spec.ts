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
import { LoggedInUser } from './shared/types';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;
  let httpTestingController: HttpTestingController;
  let location: Location;

  let appComponent: HTMLElement;

  const setup = async () => {
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
    fixture = TestBed.createComponent(AppComponent);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    httpTestingController = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    fixture.detectChanges();
    appComponent = fixture.nativeElement;
  };

  afterEach(() => {
    localStorage.clear();
  })

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
        await setup();
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
      it(`has link with title ${title} to ${path}`, async () => {
        await setup();
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
        await setup();
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
      await setup();
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

  describe('Login', () => {
    let button : any;
    let httpTestingController : HttpTestingController;
    let loginPage: HTMLElement;
    let emailInput : HTMLInputElement;
    let passwordInput : HTMLInputElement;
    const setupLogin = fakeAsync(async () => {
      await setup();
      await router.navigate(['/login']);
      fixture.detectChanges();

      httpTestingController = TestBed.inject(HttpTestingController);

      loginPage = fixture.nativeElement as HTMLElement;

      await fixture.whenStable();
      emailInput = loginPage.querySelector('input[id="email"]') as HTMLInputElement;
      passwordInput = loginPage.querySelector('input[id="password"]') as HTMLInputElement;
      emailInput.value = 'user1@mail.com';
      emailInput.dispatchEvent(new Event('input'));
      emailInput.dispatchEvent(new Event('blur'));
      passwordInput.value = "P4ssword";
      passwordInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      button = loginPage.querySelector('button');
      button.click();
      const request = httpTestingController.expectOne(() => true);
      request.flush({
        id: 1,
        username: 'user1',
        email: 'user1@mail.com'
      })
      fixture.detectChanges();
      tick();
    })
    it('navigates to home after successful login', async () => {
      await setupLogin();
      const page = appComponent.querySelector(`[data-testid="home-page"]`);
      expect(page).toBeTruthy();
    })

    it('hides Login and Sign Up from nav bar after successful login', async () => {
      await setupLogin();
      const loginLink = appComponent.querySelector(
        `a[title="Login"]`
      ) as HTMLAnchorElement;
      const signUpLink = appComponent.querySelector(
        `a[title="Sign Up"]`
      ) as HTMLAnchorElement;
      expect(loginLink).toBeFalsy();
      expect(signUpLink).toBeFalsy();
    })

    it('displays My Profile link on nav bar after successful login', async () => {
      await setupLogin();
      const myProfileLink = appComponent.querySelector(
        `a[title="My Profile"]`
      ) as HTMLAnchorElement;
      expect(myProfileLink).toBeTruthy();
    })

    it('displays Logout link on nav bar after successful login', async () => {
      await setupLogin();
      const logoutLink = appComponent.querySelector(
        `span[title="Logout"]`
      ) as HTMLAnchorElement;
      expect(logoutLink).toBeTruthy();
    })

    it('displays User Page with logged in user id in url after clicking My Profile link on nav bar', async () => {
      await setupLogin();
      const myProfileLink = appComponent.querySelector(
        `a[title="My Profile"]`
      ) as HTMLAnchorElement;
      await myProfileLink.click();
      const page = appComponent.querySelector(`[data-testid="user-page"]`);
      expect(page).toBeTruthy();
      expect(location.path()).toEqual('/user/1');
    })

    it('stores logged in state in local storage', async () => {
      await setupLogin();
      const state = JSON.parse(localStorage.getItem('auth')!) as LoggedInUser;
      expect(state.isLoggedIn).toBe(true);
    })

    it('displays layout of logged in user', async () => {
      localStorage.setItem('auth', JSON.stringify({ isLoggedIn: true}))
      await setup();
      await router.navigate(['/']);
      fixture.detectChanges();
      const myProfileLink = appComponent.querySelector(
        `a[title="My Profile"]`
      )
      expect(myProfileLink).toBeTruthy();

    })

    it('displays Login and Sign Up after clicking Logout', async () => {
      await setupLogin();
      const logoutLink = appComponent.querySelector(
        `span[title="Logout"]`
      ) as HTMLSpanElement;
      logoutLink.click();
      fixture.detectChanges();
      const loginLink = appComponent.querySelector(
        `a[title="Login"]`
      ) as HTMLAnchorElement;
      const signUpLink = appComponent.querySelector(
        `a[title="Sign Up"]`
      ) as HTMLAnchorElement;
      expect(loginLink).toBeTruthy();
      expect(signUpLink).toBeTruthy();
    })
    it('clears storage after user logs out', async () => {
      await setupLogin();
      const logoutLink = appComponent.querySelector(
        `span[title="Logout"]`
      ) as HTMLSpanElement;
      logoutLink.click();
      fixture.detectChanges();
      const state = localStorage.getItem('auth');
      expect(state).toBeNull();
    })
    it('sends logout request to backend', async () => {
      await setupLogin();
      const logoutLink = appComponent.querySelector(
        `span[title="Logout"]`
      ) as HTMLSpanElement;
      logoutLink.click();
      const request = httpTestingController.expectOne('/api/1.0/logout');
      expect(request).not.toBeNull();
    })
  })
});
