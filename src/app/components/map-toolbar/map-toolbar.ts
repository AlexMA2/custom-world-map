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
      class="absolute top-4 left-4 md:top-6 md:left-6 z-10 pointer-events-none opacity-50 select-none flex items-center gap-1 md:gap-2"
    >
      <mat-icon class="text-2xl md:text-4xl text-white">public</mat-icon>
      <span class="font-bold text-xl md:text-3xl tracking-wider uppercase text-white drop-shadow-md"
        >WorldMap <span class="text-xs font-normal">v1.3.0</span> </span
      >
    </div>

    <!-- Floating Sidebar for Projections -->
    <div
      class="absolute bottom-24 right-4 md:right-6 md:top-1/2 md:bottom-auto md:-translate-y-1/2 flex flex-col gap-2 md:gap-3 z-10 p-2 md:p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl pointer-events-auto transition-all"
    >
      <button
        matTooltip="3D Sphere"
        matTooltipPosition="left"
        (click)="setView('3d')"
        [class.bg-white]="view() === '3d'"
        [class.text-blue-600]="view() === '3d'"
        [class.text-white]="view() !== '3d'"
        [class.bg-white/5]="view() !== '3d'"
        class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
      >
        <mat-icon class="text-xl md:text-2xl">language</mat-icon>
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
        class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
      >
        <mat-icon class="text-xl md:text-2xl">map</mat-icon>
      </button>
      <button
        matTooltip="Equirectangular"
        matTooltipPosition="left"
        (click)="setView('equirectangular')"
        [class.bg-white]="view() === 'equirectangular'"
        [class.text-blue-600]="view() === 'equirectangular'"
        [class.text-white]="view() !== 'equirectangular'"
        [class.bg-white/5]="view() !== 'equirectangular'"
        class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
      >
        <mat-icon class="text-xl md:text-2xl">panorama_horizontal</mat-icon>
      </button>
      <button
        matTooltip="Orthographic (2D)"
        matTooltipPosition="left"
        (click)="setView('orthographic')"
        [class.bg-white]="view() === 'orthographic'"
        [class.text-blue-600]="view() === 'orthographic'"
        [class.text-white]="view() !== 'orthographic'"
        [class.bg-white/5]="view() !== 'orthographic'"
        class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
      >
        <mat-icon class="text-xl md:text-2xl">radio_button_unchecked</mat-icon>
      </button>
    </div>

    <!-- Bottom Toolbar for Tools -->
    <div
      class="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 z-10 p-2 md:p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl pointer-events-auto max-w-[95vw] overflow-x-auto no-scrollbar"
    >
      <!-- History -->
      <div class="flex gap-1 md:gap-2">
        <button
          matTooltip="Undo (Ctrl+Z)"
          (click)="undo()"
          [disabled]="!canUndo()"
          class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all active:scale-95"
        >
          <mat-icon class="text-xl md:text-2xl">undo</mat-icon>
        </button>
        <button
          matTooltip="Redo (Ctrl+Y)"
          (click)="redo()"
          [disabled]="!canRedo()"
          class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all active:scale-95"
        >
          <mat-icon class="text-xl md:text-2xl">redo</mat-icon>
        </button>
      </div>

      <div class="w-px h-8 md:h-10 bg-white/20 mx-1"></div>

      <!-- Primary Tools -->
      <div class="flex gap-1 md:gap-2">
        <button
          matTooltip="Pan Map (P)"
          (click)="setTool('pan')"
          [class.bg-white]="tool() === 'pan'"
          [class.text-blue-600]="tool() === 'pan'"
          [class.text-white]="tool() !== 'pan'"
          class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
        >
          <mat-icon class="text-xl md:text-2xl">pan_tool</mat-icon>
        </button>
        <button
          matTooltip="Draw Continent (D)"
          (click)="setTool('draw')"
          [class.bg-white]="tool() === 'draw'"
          [class.text-green-600]="tool() === 'draw'"
          [class.text-white]="tool() !== 'draw'"
          class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
        >
          <mat-icon class="text-xl md:text-2xl">edit</mat-icon>
        </button>
        <button
          matTooltip="Auto Generate (S)"
          (click)="setTool('splash')"
          [class.bg-white]="tool() === 'splash'"
          [class.text-cyan-600]="tool() === 'splash'"
          [class.text-white]="tool() !== 'splash'"
          class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
        >
          <mat-icon class="text-xl md:text-2xl">water_drop</mat-icon>
        </button>
        <button
          matTooltip="Eraser (E)"
          (click)="setTool('eraser')"
          [class.bg-white]="tool() === 'eraser'"
          [class.text-red-500]="tool() === 'eraser'"
          [class.text-white]="tool() !== 'eraser'"
          class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
        >
          <mat-icon class="text-xl md:text-2xl">cleaning_services</mat-icon>
        </button>
        <button
          matTooltip="Draw Lines (L)"
          (click)="setTool('lines')"
          [class.bg-white]="tool() === 'lines'"
          [class.text-purple-600]="tool() === 'lines'"
          [class.text-white]="tool() !== 'lines'"
          class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
        >
          <mat-icon class="text-xl md:text-2xl">straighten</mat-icon>
        </button>
      </div>

      <div class="w-px h-8 md:h-10 bg-white/20 mx-1 md:mx-2"></div>

      <!-- Visibility / Download Actions -->
      <div class="flex gap-1 md:gap-2">
        <button
          [matTooltip]="showLines() ? 'Hide Lines (V)' : 'Show Lines (V)'"
          (click)="toggleLines()"
          [class.bg-white]="showLines()"
          [class.text-purple-600]="showLines()"
          [class.text-white]="!showLines()"
          class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
        >
          <mat-icon class="text-xl md:text-2xl">{{ showLines() ? 'visibility' : 'visibility_off' }}</mat-icon>
        </button>
        <button
          matTooltip="Download Image"
          (click)="triggerDownload()"
          class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95"
        >
          <mat-icon class="text-xl md:text-2xl">download</mat-icon>
        </button>
      </div>
    </div>

    <!-- Sub Toolbars (Conditional based on active tool) -->
    <div class="absolute bottom-20 md:bottom-28 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex gap-4 max-w-[90vw]">
      @if (tool() === 'splash') {
        <div
          class="p-3 md:p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg pointer-events-auto text-white flex flex-col md:flex-row gap-4 md:gap-6"
        >
          <label class="flex flex-col gap-1 text-[10px] md:text-xs uppercase tracking-wider font-semibold">
            Size
            <input
              type="range"
              min="5"
              max="50"
              [value]="splashSize()"
              (input)="updateSplashSize($event)"
              class="w-24 md:w-32 accent-cyan-400"
            />
          </label>
          <label class="flex flex-col gap-1 text-[10px] md:text-xs uppercase tracking-wider font-semibold">
            Complexity
            <input
              type="range"
              min="1"
              max="10"
              [value]="splashComplexity()"
              (input)="updateSplashComplexity($event)"
              class="w-24 md:w-32 accent-cyan-400"
            />
          </label>
        </div>
      }
      @if (tool() === 'lines') {
        <div
          class="p-1.5 md:p-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg pointer-events-auto flex flex-wrap justify-center gap-1 md:gap-2"
        >
          <button
            (click)="setLineMode('free')"
            [class.bg-purple-600]="lineMode() === 'free'"
            class="px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium text-white hover:bg-white/10 transition-colors active:scale-95"
          >
            Freehand
          </button>
          <button
            (click)="setLineMode('straight')"
            [class.bg-purple-600]="lineMode() === 'straight'"
            class="px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium text-white hover:bg-white/10 transition-colors active:scale-95"
          >
            Straight
          </button>
          <button
            (click)="setLineMode('sector')"
            [class.bg-purple-600]="lineMode() === 'sector'"
            class="px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium text-white hover:bg-white/10 transition-colors active:scale-95"
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
    this.state.notify('🔙 Undone');
  }

  redo() {
    this.state.redo();
    this.state.notify('🔄 Redone');
  }

  triggerDownload() {
    this.state.triggerDownload();
    this.state.notify('📸 Capturing map...');
  }
}
