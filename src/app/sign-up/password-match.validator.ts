import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const passwordMatchValidator : ValidatorFn = (control: AbstractControl) : ValidationErrors | null => {
  const password = control.get('password');
  const passwordRepeat = control.get('passwordRepeat');
  if(password?.value === passwordRepeat?.value){
    return null;
  }
  return {
    passwordMatch: true
  }
}