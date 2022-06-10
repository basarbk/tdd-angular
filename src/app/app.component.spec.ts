import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from './router/app-router.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HomeComponent } from './home/home.component';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from './shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent, SignUpComponent, HomeComponent, LoginComponent
      ],
      imports: [
        RouterTestingModule.withRoutes(routes),
        HttpClientTestingModule,
        SharedModule,
        ReactiveFormsModule
      ]
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  describe('Routing', () => {

    const testCases = [
      { path: '/', pageId: 'home-page'},
      { path: '/signup', pageId: 'sign-up-page'},
      { path: '/login', pageId: 'login-page'},
      { path: '/user/1', pageId: 'user-page'},
      { path: '/user/2', pageId: 'user-page'},
    ]
    testCases.forEach(({ path, pageId}) => {
      it(`displays ${pageId} when path is ${path}`, async () => {
        await router.navigate([path]);
        fixture.detectChanges();
        const page = fixture.nativeElement.querySelector(`[data-testid="${pageId}"]`);
        expect(page).toBeTruthy();
      })
    })
  })
});
