import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  form = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(4)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)]),
    passwordRepeat: new FormControl('')
  })

  apiProgress = false;
  signUpSuccess = false;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
  }

  get usernameError() {
    const field = this.form.get('username');
    if((field?.errors && (field?.touched || field?.dirty))) {
      if(field.errors['required']) {
        return "Username is required";
      } else {
        return "Username must be at least 4 characters long"
      }
    }
    return;
  }

  get emailError() {
    const field = this.form.get('email');
    if((field?.errors && (field?.touched || field?.dirty))) {
      if(field.errors['required']) {
        return "E-mail is required";
      } else if(field.errors['email']) {
        return "Invalid e-mail address"
      }
    }
    return;
  }

  get passwordError() {
    const field = this.form.get('password');
    if((field?.errors && (field?.touched || field?.dirty))) {
      if(field.errors['required']) {
        return "Password is required";
      } else if (field.errors['pattern']) {
        return "Password must have at least 1 uppercase, 1 lowecase letter and 1 number"
      }
    }
    return;
  }

  onClickSignUp(){
    const body = this.form.value;
    delete body.passwordRepeat;
    this.apiProgress = true;
    this.userService.signUp(body).subscribe(() => {
      this.signUpSuccess = true;
    });
  }

  isDisabled(){
    return this.form.get('password')?.value ?
     (this.form.get('password')?.value !== this.form.get('passwordRepeat')?.value) : true
  }
}
