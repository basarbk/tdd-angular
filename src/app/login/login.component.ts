import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../core/authentication.service';
import { UserService } from '../core/user.service';
import { User } from '../shared/types';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [
  ]
})
export class LoginComponent implements OnInit {

  @ViewChild("emailInput") emailInput!: FormControl;
  @ViewChild("passwordInput") passwordInput!: FormControl;

  email = '';
  password = '';

  error = '';

  apiProgress = false;

  constructor(private userService: UserService,
    private router: Router,
    private authenticationService: AuthenticationService
    ) { }

  ngOnInit(): void {
  }

  isDisabled(){
    return !this.email || !this.password 
    || this.isInvalid(this.emailInput)
    || this.isInvalid(this.passwordInput)
  }

  onClickLogin(){
    this.apiProgress = true;
    this.userService.authenticate(this.email, this.password)
    .subscribe({
      next: (body) => {
        this.router.navigate(['/'])
        this.authenticationService.setLoggedInUser(body as User)
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error.message;
        this.apiProgress = false;
      }
    })
  }

  isInvalid(field: FormControl) {
    const { invalid, dirty, touched } = field;
    return invalid && (dirty || touched)
  }

  onChange(){
    this.error = '';
  }


}
