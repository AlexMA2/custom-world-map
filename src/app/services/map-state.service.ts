import { Injectable, signal, computed } from '@angular/core';
import * as d3 from 'd3-geo';

export type MapView = '3d' | 'mercator' | 'equirectangular' | 'orthographic';
export type MapTool = 'hand' | 'splash' | 'eraser' | 'lines';
export type LineMode = 'free' | 'straight' | 'sector';

@Injectable({
  providedIn: 'root',
})
export class MapStateService {
  readonly view = signal<MapView>('3d');
  readonly tool = signal<MapTool>('hand');
  readonly lineMode = signal<LineMode>('free');
  readonly showLines = signal(true);

  readonly splashSize = signal(20);
  readonly splashComplexity = signal(5);

  readonly continents = signal<any[]>([]);
  readonly lines = signal<any[]>([]);

  readonly isDrawing = signal(false);
  readonly currentShapeCoords = signal<[number, number][]>([]);

  // Actions
  setView(view: MapView) {
    this.view.set(view);
  }
  setTool(tool: MapTool) {
    this.tool.set(tool);
  }
  setLineMode(mode: LineMode) {
    this.lineMode.set(mode);
  }
  toggleLines() {
    this.showLines.update((v) => !v);
  }
  setSplashSize(size: number) {
    this.splashSize.set(size);
  }
  setSplashComplexity(comp: number) {
    this.splashComplexity.set(comp);
  }

  startDrawing(lon: number, lat: number) {
    if (this.tool() === 'splash') {
      this.generateSplash(lon, lat);
      return;
    }
    this.isDrawing.set(true);
    this.currentShapeCoords.set([[lon, lat]]);
  }

  addDrawPoint(lon: number, lat: number) {
    if (!this.isDrawing()) return;
    const coords = this.currentShapeCoords();
    const lastCoord = coords[coords.length - 1];
    const dist = Math.sqrt(Math.pow(lon - lastCoord[0], 2) + Math.pow(lat - lastCoord[1], 2));
    if (dist > 1) {
      this.currentShapeCoords.update((c) => [...c, [lon, lat]]);
    }
  }

  finishDrawing() {
    this.isDrawing.set(false);
    const coords = this.currentShapeCoords();

    if (coords.length < 3 && this.tool() !== 'lines') {
      this.currentShapeCoords.set([]);
      return;
    }

    const tool = this.tool();
    if (tool === 'hand') {
      const closedCoords = [...coords, coords[0]];
      this.continents.update((c) => [
        ...c,
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [closedCoords] },
          properties: {},
        },
      ]);
    } else if (tool === 'lines') {
      let finalCoords = [...coords];
      const mode = this.lineMode();

      if (mode === 'straight') {
        finalCoords = [finalCoords[0], finalCoords[finalCoords.length - 1]];
      } else if (mode === 'sector') {
        const startLon = finalCoords[0][0];
        finalCoords = [];
        for (let lat = 90; lat >= -90; lat -= 5) {
          finalCoords.push([startLon, lat]);
        }
      }

      this.lines.update((l) => [
        ...l,
        {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: finalCoords },
          properties: { mode },
        },
      ]);
    } else if (tool === 'eraser') {
      const pt = coords[coords.length - 1];
      this.continents.update((c) => c.filter((continent) => !d3.geoContains(continent, pt)));
    }

    this.currentShapeCoords.set([]);
  }

  private generateSplash(lon: number, lat: number) {
    const points: [number, number][] = [];
    const numPoints = 20 * this.splashComplexity();
    const size = this.splashSize();

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const r = size / 2 + Math.random() * size * 0.5;

      const dLon = (r * Math.cos(angle)) / Math.cos((lat * Math.PI) / 180);
      const dLat = r * Math.sin(angle);

      points.push([lon + dLon, lat + dLat]);
    }
    points.push(points[0]);

    if (confirm('Accept new auto-generated continent?')) {
      this.continents.update((c) => [
        ...c,
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [points] },
          properties: {},
        },
      ]);
    }
  }
}
