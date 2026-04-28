import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MapStateService, MapView, MapTool, LineMode } from '../../services/map-state.service';

@Component({
  selector: 'app-map-toolbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <!-- Top Watermark -->
    <div
      class="absolute top-6 left-6 z-10 pointer-events-none opacity-50 select-none flex items-center gap-2"
    >
      <mat-icon class="text-4xl text-white">public</mat-icon>
      <span class="font-bold text-3xl tracking-wider uppercase text-white drop-shadow-md"
        >WorldMap</span
      >
    </div>

    <!-- Floating Sidebar for Projections -->
    <div
      class="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col gap-3 z-10 p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] pointer-events-auto transition-all"
    >
      <button
        matTooltip="3D Sphere"
        matTooltipPosition="left"
        (click)="setView('3d')"
        [class.bg-white]="view() === '3d'"
        [class.text-blue-600]="view() === '3d'"
        [class.text-white]="view() !== '3d'"
        [class.bg-white/5]="view() !== '3d'"
        class="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
      >
        <mat-icon>language</mat-icon>
      </button>
      <div class="w-full h-px bg-white/20 my-1"></div>
      <button
        matTooltip="Mercator"
        matTooltipPosition="left"
        (click)="setView('mercator')"
        [class.bg-white]="view() === 'mercator'"
        [class.text-blue-600]="view() === 'mercator'"
        [class.text-white]="view() !== 'mercator'"
        [class.bg-white/5]="view() !== 'mercator'"
        class="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
      >
        <mat-icon>map</mat-icon>
      </button>
      <button
        matTooltip="Equirectangular"
        matTooltipPosition="left"
        (click)="setView('equirectangular')"
        [class.bg-white]="view() === 'equirectangular'"
        [class.text-blue-600]="view() === 'equirectangular'"
        [class.text-white]="view() !== 'equirectangular'"
        [class.bg-white/5]="view() !== 'equirectangular'"
        class="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
      >
        <mat-icon>panorama_horizontal</mat-icon>
      </button>
      <button
        matTooltip="Orthographic (2D)"
        matTooltipPosition="left"
        (click)="setView('orthographic')"
        [class.bg-white]="view() === 'orthographic'"
        [class.text-blue-600]="view() === 'orthographic'"
        [class.text-white]="view() !== 'orthographic'"
        [class.bg-white/5]="view() !== 'orthographic'"
        class="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
      >
        <mat-icon>radio_button_unchecked</mat-icon>
      </button>
    </div>

    <!-- Bottom Toolbar for Tools -->
    <div
      class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10 p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] pointer-events-auto"
    >
      <!-- History -->
      <div class="flex gap-2">
        <button
          matTooltip="Undo (Ctrl+Z)"
          (click)="undo()"
          [disabled]="!canUndo()"
          class="w-12 h-12 rounded-xl flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
        >
          <mat-icon>undo</mat-icon>
        </button>
        <button
          matTooltip="Redo (Ctrl+Y)"
          (click)="redo()"
          [disabled]="!canRedo()"
          class="w-12 h-12 rounded-xl flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
        >
          <mat-icon>redo</mat-icon>
        </button>
      </div>

      <div class="w-px h-10 bg-white/20 mx-1"></div>

      <!-- Primary Tools -->
      <div class="flex gap-2">
        <button
          matTooltip="Pan Map (P)"
          (click)="setTool('pan')"
          [class.bg-white]="tool() === 'pan'"
          [class.text-blue-600]="tool() === 'pan'"
          [class.text-white]="tool() !== 'pan'"
          class="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <mat-icon>pan_tool</mat-icon>
        </button>
        <button
          matTooltip="Draw Continent (D)"
          (click)="setTool('draw')"
          [class.bg-white]="tool() === 'draw'"
          [class.text-green-600]="tool() === 'draw'"
          [class.text-white]="tool() !== 'draw'"
          class="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <mat-icon>edit</mat-icon>
        </button>
        <button
          matTooltip="Auto Generate (S)"
          (click)="setTool('splash')"
          [class.bg-white]="tool() === 'splash'"
          [class.text-cyan-600]="tool() === 'splash'"
          [class.text-white]="tool() !== 'splash'"
          class="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <mat-icon>water_drop</mat-icon>
        </button>
        <button
          matTooltip="Eraser (E)"
          (click)="setTool('eraser')"
          [class.bg-white]="tool() === 'eraser'"
          [class.text-red-500]="tool() === 'eraser'"
          [class.text-white]="tool() !== 'eraser'"
          class="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <mat-icon>cleaning_services</mat-icon>
        </button>
        <button
          matTooltip="Draw Lines (L)"
          (click)="setTool('lines')"
          [class.bg-white]="tool() === 'lines'"
          [class.text-purple-600]="tool() === 'lines'"
          [class.text-white]="tool() !== 'lines'"
          class="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <mat-icon>straighten</mat-icon>
        </button>
      </div>

      <div class="w-px h-10 bg-white/20 mx-2"></div>

      <!-- Visibility / Download Actions -->
      <div class="flex gap-2">
        <button
          [matTooltip]="showLines() ? 'Hide Lines (V)' : 'Show Lines (V)'"
          (click)="toggleLines()"
          [class.bg-white]="showLines()"
          [class.text-purple-600]="showLines()"
          [class.text-white]="!showLines()"
          class="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <mat-icon>{{ showLines() ? 'visibility' : 'visibility_off' }}</mat-icon>
        </button>
        <button
          matTooltip="Download Image"
          (click)="triggerDownload()"
          class="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <mat-icon>download</mat-icon>
        </button>
      </div>
    </div>

    <!-- Sub Toolbars (Conditional based on active tool) -->
    <div class="absolute bottom-28 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex gap-4">
      @if (tool() === 'splash') {
        <div
          class="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg pointer-events-auto text-white flex gap-6"
        >
          <label class="flex flex-col gap-1 text-xs uppercase tracking-wider font-semibold">
            Size
            <input
              type="range"
              min="5"
              max="50"
              [value]="splashSize()"
              (input)="updateSplashSize($event)"
              class="w-32 accent-cyan-400"
            />
          </label>
          <label class="flex flex-col gap-1 text-xs uppercase tracking-wider font-semibold">
            Complexity
            <input
              type="range"
              min="1"
              max="10"
              [value]="splashComplexity()"
              (input)="updateSplashComplexity($event)"
              class="w-32 accent-cyan-400"
            />
          </label>
        </div>
      }
      @if (tool() === 'lines') {
        <div
          class="p-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg pointer-events-auto flex gap-2"
        >
          <button
            (click)="setLineMode('free')"
            [class.bg-purple-600]="lineMode() === 'free'"
            class="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Freehand
          </button>
          <button
            (click)="setLineMode('straight')"
            [class.bg-purple-600]="lineMode() === 'straight'"
            class="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Straight
          </button>
          <button
            (click)="setLineMode('sector')"
            [class.bg-purple-600]="lineMode() === 'sector'"
            class="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
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
  readonly canUndo = this.state.canUndo;
  readonly canRedo = this.state.canRedo;

  setView(view: MapView) {
    this.state.setView(view);
  }

  setTool(tool: MapTool) {
    if (this.state.tool() === tool) {
      this.state.setTool('pan'); // toggle off
    } else {
      this.state.setTool(tool);
    }
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

  undo() {
    this.state.undo();
  }

  redo() {
    this.state.redo();
  }

  triggerDownload() {
    this.state.triggerDownload();
  }
}
