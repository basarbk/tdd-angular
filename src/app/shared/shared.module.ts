import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert/alert.component';
import { ButtonComponent } from './button/button.component';



@NgModule({
  declarations: [
    AlertComponent,
    ButtonComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AlertComponent,
    ButtonComponent
  ]
})
export class SharedModule { }
