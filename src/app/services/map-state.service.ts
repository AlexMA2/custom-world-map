import { Injectable, signal } from '@angular/core';
import * as d3 from 'd3-geo';
import * as turf from '@turf/turf';

export type MapView = '3d' | 'mercator' | 'equirectangular' | 'orthographic';
export type MapTool = 'pan' | 'draw' | 'splash' | 'eraser' | 'lines';
export type LineMode = 'free' | 'straight' | 'sector';

@Injectable({
  providedIn: 'root',
})
export class MapStateService {
  readonly view = signal<MapView>('3d');
  readonly tool = signal<MapTool>('pan');
  readonly lineMode = signal<LineMode>('free');
  readonly showLines = signal(true);

  readonly splashSize = signal(20);
  readonly splashComplexity = signal(5);

  readonly continents = signal<any[]>([]);
  readonly lines = signal<any[]>([]);

  readonly isDrawing = signal(false);
  readonly currentShapeCoords = signal<[number, number][]>([]);

  readonly downloadTrigger = signal(0);

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
  triggerDownload() {
    this.downloadTrigger.update((v) => v + 1);
  }

  startDrawing(lon: number, lat: number) {
    if (this.tool() === 'pan') return;
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
    if (!this.isDrawing()) return;
    this.isDrawing.set(false);
    const coords = this.currentShapeCoords();

    if (coords.length < 3 && this.tool() !== 'lines') {
      this.currentShapeCoords.set([]);
      return;
    }

    const tool = this.tool();
    if (tool === 'draw') {
      const closedCoords = [...coords, coords[0]];
      let newFeature = turf.polygon([closedCoords]);
      newFeature = turf.rewind(newFeature, { reverse: true }) as any;
      this.addAndMergeContinent(newFeature);
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

      this.lines.update((l) => [...l, turf.lineString(finalCoords, { mode })]);
    } else if (tool === 'eraser') {
      const pt = coords[coords.length - 1];
      this.continents.update((c) => c.filter((continent) => !d3.geoContains(continent, pt)));
    }

    this.currentShapeCoords.set([]);
  }

  private addAndMergeContinent(newFeature: any) {
    // Rewind initial
    turf.rewind(newFeature, { mutate: true });
    if (d3.geoArea(newFeature) > 2 * Math.PI) {
      newFeature.geometry.coordinates[0].reverse();
    }

    this.continents.update((conts) => {
      let merged = newFeature;
      const nonOverlapping = [];
      for (const cont of conts) {
        const intersection = turf.intersect(turf.featureCollection([merged, cont]));
        if (intersection) {
          merged = turf.union(turf.featureCollection([merged, cont]));
        } else {
          nonOverlapping.push(cont);
        }
      }

      // Ensure proper winding order for the final merged result
      turf.rewind(merged, { mutate: true });
      if (merged.geometry.type === 'Polygon') {
        if (d3.geoArea(merged) > 2 * Math.PI) {
          merged.geometry.coordinates[0].reverse();
        }
      } else if (merged.geometry.type === 'MultiPolygon') {
        // For multipolygon, check each polygon ring (though usually turf handles it)
        // If the whole multipolygon area > hemisphere, it's inverted
        if (d3.geoArea(merged) > 2 * Math.PI) {
          merged.geometry.coordinates.forEach((poly: any) => poly[0].reverse());
        }
      }

      return [...nonOverlapping, merged];
    });
  }

  private generateSplash(lon: number, lat: number) {
    const points: [number, number][] = [];
    // Increase points for smoother edges
    const numPoints = 60;
    const size = this.splashSize();
    const complexity = this.splashComplexity();
    
    // Create random phase shifts for organic look
    const phase1 = Math.random() * Math.PI * 2;
    const phase2 = Math.random() * Math.PI * 2;
    const phase3 = Math.random() * Math.PI * 2;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      
      // Base radius
      let r = size / 2;
      
      // Add organic bumps based on complexity
      r += Math.sin(angle * Math.max(1, complexity) + phase1) * (size * 0.2);
      r += Math.cos(angle * Math.max(2, complexity * 1.5) + phase2) * (size * 0.15);
      r += Math.sin(angle * Math.max(3, complexity * 2.5) + phase3) * (size * 0.05);

      // Add a tiny bit of noise
      r += (Math.random() - 0.5) * (size * 0.05);

      // Ensure r is positive
      r = Math.max(r, size * 0.1);

      const dLon = (r * Math.cos(angle)) / Math.cos((lat * Math.PI) / 180);
      const dLat = r * Math.sin(angle);

      points.push([lon + dLon, lat + dLat]);
    }
    points.push(points[0]);

    let feature = turf.polygon([points]);
    this.addAndMergeContinent(feature);
  }
}
