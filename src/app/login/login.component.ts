import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [
  ]
})
export class LoginComponent implements OnInit {

  email = '';
  password = '';

  error = '';

  apiProgress = false;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
  }

  isDisabled(){
    return !this.email || !this.password;
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


}
