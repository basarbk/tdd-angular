import { Injectable } from "@angular/core";
import { AbstractControl, AsyncValidator, ValidationErrors } from "@angular/forms";
import { catchError, map, Observable, of } from "rxjs";
import { UserService } from "../core/user.service";

@Injectable({
  providedIn: 'root'
})
export class UniqueEmailValidator implements AsyncValidator {

  constructor(private userService: UserService) {}

  validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.userService.isEmailTaken(control.value).pipe(
      map((_) => (_ ? { uniqueEmail: true} : null) ),
      catchError(() => of(null))
    )
  }

}