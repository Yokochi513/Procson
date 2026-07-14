import { Component } from '@angular/core';
import { Chat } from './chat';

@Component({
  selector: 'app-root',
  imports: [Chat],
  template: `<app-chat />`,
  styles: [],
})
export class App {}
