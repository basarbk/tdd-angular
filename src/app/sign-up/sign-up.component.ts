import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  password = '';
  passwordRepeat = '';

  constructor() { }

  ngOnInit(): void {
  }

  onChangePassword(event: Event){
    this.password = (event.target as HTMLInputElement).value
  }

  onChangePasswordRepeat(event: Event){
    this.passwordRepeat = (event.target as HTMLInputElement).value
  }

  isDisabled(){
    return this.password ? (this.password !== this.passwordRepeat) : true
  }
}
