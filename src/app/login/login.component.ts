import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserService } from '../core/user.service';

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

  constructor(private userService: UserService) { }

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
      next: () => {},
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
