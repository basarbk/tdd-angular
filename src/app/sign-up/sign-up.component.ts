import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  username = '';
  email = '';
  password = '';
  passwordRepeat = '';
  apiProgress = false;
  signUpSuccess = false;

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
  }

  onChangeUsername(event: Event){
    this.username = (event.target as HTMLInputElement).value
  }

  onChangeEmail(event: Event){
    this.email = (event.target as HTMLInputElement).value
  }

  onChangePassword(event: Event){
    this.password = (event.target as HTMLInputElement).value
  }

  onChangePasswordRepeat(event: Event){
    this.passwordRepeat = (event.target as HTMLInputElement).value
  }

  onClickSignUp(){
    this.apiProgress = true;
    this.httpClient.post("/api/1.0/users", {
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe(() => {
      this.signUpSuccess = true;
    });
  }

  isDisabled(){
    return this.password ? (this.password !== this.passwordRepeat) : true
  }
}
