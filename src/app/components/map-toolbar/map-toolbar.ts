import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapStateService, MapView, MapTool, LineMode } from '../../services/map-state.service';

@Component({
  selector: 'app-map-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Top Toolbar -->
    <div
      class="absolute top-0 left-0 w-full p-4 flex gap-4 bg-gray-900/80 backdrop-blur z-10 border-b border-gray-700 items-center justify-between pointer-events-auto"
    >
      <div class="flex gap-2 items-center">
        <span class="font-bold text-xl mr-4">World Map</span>

        <div class="flex bg-gray-800 rounded p-1">
          <button
            (click)="setView('3d')"
            [class.bg-blue-600]="view() === '3d'"
            class="px-3 py-1 rounded"
          >
            3D Sphere
          </button>
          <button
            (click)="setView('mercator')"
            [class.bg-blue-600]="view() === 'mercator'"
            class="px-3 py-1 rounded"
          >
            Mercator
          </button>
          <button
            (click)="setView('equirectangular')"
            [class.bg-blue-600]="view() === 'equirectangular'"
            class="px-3 py-1 rounded"
          >
            Equirectangular
          </button>
          <button
            (click)="setView('orthographic')"
            [class.bg-blue-600]="view() === 'orthographic'"
            class="px-3 py-1 rounded"
          >
            Orthographic (2D)
          </button>
        </div>
      </div>

      <div class="flex gap-2 items-center">
        <div class="flex bg-gray-800 rounded p-1">
          <button
            (click)="setTool('hand')"
            [class.bg-green-600]="tool() === 'hand'"
            class="px-3 py-1 rounded"
            title="Draw Continent"
          >
            ✏️ Hand
          </button>
          <button
            (click)="setTool('splash')"
            [class.bg-green-600]="tool() === 'splash'"
            class="px-3 py-1 rounded"
            title="Auto Generate Continent"
          >
            💦 Splash
          </button>
          <button
            (click)="setTool('eraser')"
            [class.bg-green-600]="tool() === 'eraser'"
            class="px-3 py-1 rounded"
            title="Erase Continent"
          >
            🧽 Eraser
          </button>
          <button
            (click)="setTool('lines')"
            [class.bg-green-600]="tool() === 'lines'"
            class="px-3 py-1 rounded"
            title="Draw Lines"
          >
            📏 Lines
          </button>
        </div>

        <label class="flex items-center gap-2 ml-4 bg-gray-800 px-3 py-1 rounded cursor-pointer">
          <input type="checkbox" [checked]="showLines()" (change)="toggleLines()" class="w-4 h-4" />
          Show Lines
        </label>
      </div>
    </div>

    <!-- Sub Toolbar -->
    <div
      class="absolute top-16 left-0 w-full p-2 flex gap-4 justify-center z-10 pointer-events-none"
    >
      @if (tool() === 'splash') {
        <div
          class="bg-gray-800/90 p-2 rounded flex gap-4 pointer-events-auto border border-gray-600"
        >
          <label class="flex items-center gap-2 text-sm">
            Size:
            <input
              type="range"
              min="5"
              max="50"
              [value]="splashSize()"
              (input)="updateSplashSize($event)"
              class="w-24"
            />
          </label>
          <label class="flex items-center gap-2 text-sm">
            Complexity:
            <input
              type="range"
              min="1"
              max="10"
              [value]="splashComplexity()"
              (input)="updateSplashComplexity($event)"
              class="w-24"
            />
          </label>
        </div>
      }
      @if (tool() === 'lines') {
        <div
          class="bg-gray-800/90 p-2 rounded flex gap-2 pointer-events-auto border border-gray-600"
        >
          <button
            (click)="setLineMode('free')"
            [class.bg-purple-600]="lineMode() === 'free'"
            class="px-3 py-1 rounded text-sm"
          >
            Freehand
          </button>
          <button
            (click)="setLineMode('straight')"
            [class.bg-purple-600]="lineMode() === 'straight'"
            class="px-3 py-1 rounded text-sm"
          >
            Straight
          </button>
          <button
            (click)="setLineMode('sector')"
            [class.bg-purple-600]="lineMode() === 'sector'"
            class="px-3 py-1 rounded text-sm"
          >
            Sector Cut
          </button>
        </div>
      }
    </div>
  `,
})
export class MapToolbarComponent {
  private state = inject(MapStateService);

  readonly view = this.state.view;
  readonly tool = this.state.tool;
  readonly lineMode = this.state.lineMode;
  readonly showLines = this.state.showLines;
  readonly splashSize = this.state.splashSize;
  readonly splashComplexity = this.state.splashComplexity;

  setView(view: MapView) {
    this.state.setView(view);
  }
  setTool(tool: MapTool) {
    this.state.setTool(tool);
  }
  setLineMode(mode: LineMode) {
    this.state.setLineMode(mode);
  }
  toggleLines() {
    this.state.toggleLines();
  }

  updateSplashSize(event: Event) {
    this.state.setSplashSize(Number((event.target as HTMLInputElement).value));
  }

  updateSplashComplexity(event: Event) {
    this.state.setSplashComplexity(Number((event.target as HTMLInputElement).value));
  }
}
