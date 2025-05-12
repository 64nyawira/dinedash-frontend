import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './menus.component.html',
  styleUrl: './menus.component.css'
})
export class MenusComponent {

}
