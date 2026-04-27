import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WorldMap } from './components/world-map/world-map';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WorldMap],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('custom-world-map');
}
