import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styles: [
  ]
})
export class AlertComponent implements OnInit {

  @Input() type: 'success' | 'danger' | 'info' = 'success';

  constructor() { }

  ngOnInit(): void {
  }

  get alertClass(){
    const classList = ['alert'];
    classList.push(`alert-${this.type}`);
    return classList.join(' ')
  }

}
