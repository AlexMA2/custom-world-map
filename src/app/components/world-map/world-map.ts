import {
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
  viewChild,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as d3 from 'd3-geo';
import { MapStateService } from '../../services/map-state.service';
import { MapToolbarComponent } from '../map-toolbar/map-toolbar';

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [CommonModule, MapToolbarComponent],
  templateUrl: './world-map.html',
  styleUrl: './world-map.css',
})
export class WorldMap implements AfterViewInit, OnDestroy {
  private state = inject(MapStateService);

  readonly view = this.state.view;

  // viewChild signal equivalents
  readonly threeCanvas = viewChild<ElementRef<HTMLCanvasElement>>('threeCanvas');
  readonly d3Canvas = viewChild<ElementRef<HTMLCanvasElement>>('d3Canvas');
  readonly textureCanvas = viewChild<ElementRef<HTMLCanvasElement>>('textureCanvas');

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private sphereMesh!: THREE.Mesh;
  private texture!: THREE.CanvasTexture;

  private d3Context!: CanvasRenderingContext2D;
  private texContext!: CanvasRenderingContext2D;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private animationId = 0;

  constructor() {
    effect(() => {
      // Re-render when map state changes
      this.state.continents();
      this.state.lines();
      this.state.isDrawing();
      this.state.currentShapeCoords();
      this.state.showLines();
      this.state.tool();
      this.view();

      // Defer rendering to ensure canvas is ready
      setTimeout(() => this.renderMap(), 0);
    });
  }

  ngAfterViewInit() {
    this.initTextureCanvas();
    this.initThree();
    this.initD3();
    this.setupInteractions();

    this.animate();
    this.renderMap();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initTextureCanvas() {
    const canvas = this.textureCanvas()?.nativeElement;
    if (!canvas) return;
    this.texContext = canvas.getContext('2d')!;
    this.texContext.fillStyle = '#cccccc';
    this.texContext.fillRect(0, 0, canvas.width, canvas.height);
  }

  private initThree() {
    const canvas = this.threeCanvas()?.nativeElement;
    if (!canvas) return;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 3;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 3, 5);
    this.scene.add(directionalLight);

    const texCanvas = this.textureCanvas()?.nativeElement;
    if (texCanvas) {
      this.texture = new THREE.CanvasTexture(texCanvas);
      const geometry = new THREE.SphereGeometry(1, 64, 64);
      const material = new THREE.MeshStandardMaterial({
        map: this.texture,
        roughness: 0.8,
        metalness: 0.1,
      });

      this.sphereMesh = new THREE.Mesh(geometry, material);
      this.scene.add(this.sphereMesh);
    }

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private initD3() {
    const canvas = this.d3Canvas()?.nativeElement;
    if (!canvas) return;
    this.d3Context = canvas.getContext('2d')!;
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    this.d3Context.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  private onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private setupInteractions() {
    const threeEl = this.threeCanvas()?.nativeElement;
    if (threeEl) {
      threeEl.addEventListener('pointerdown', (e) => {
        const intersect = this.getThreeIntersection(e);
        if (intersect) {
          this.controls.enabled = false;
          this.state.startDrawing(intersect.lon, intersect.lat);
        }
      });
      threeEl.addEventListener('pointermove', (e) => {
        const intersect = this.getThreeIntersection(e);
        if (intersect) this.state.addDrawPoint(intersect.lon, intersect.lat);
      });
      threeEl.addEventListener('pointerup', () => {
        this.controls.enabled = true;
        this.state.finishDrawing();
      });
    }

    const d3El = this.d3Canvas()?.nativeElement;
    if (d3El) {
      d3El.addEventListener('pointerdown', (e) => {
        const coords = this.getD3Intersection(e);
        if (coords) this.state.startDrawing(coords[0], coords[1]);
      });
      d3El.addEventListener('pointermove', (e) => {
        const coords = this.getD3Intersection(e);
        if (coords) this.state.addDrawPoint(coords[0], coords[1]);
      });
      d3El.addEventListener('pointerup', () => this.state.finishDrawing());
    }
  }

  private getThreeIntersection(e: PointerEvent): { lon: number; lat: number } | null {
    const canvas = this.threeCanvas()?.nativeElement;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.sphereMesh);

    if (intersects.length > 0) {
      const uv = intersects[0].uv;
      if (uv) {
        const lon = uv.x * 360 - 180;
        const lat = uv.y * 180 - 90;
        return { lon, lat };
      }
    }
    return null;
  }

  private getD3Projection() {
    const canvas = this.d3Canvas()?.nativeElement;
    if (!canvas) return null;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    switch (this.view()) {
      case 'mercator':
        return d3.geoMercator().fitSize([w, h], { type: 'Sphere' });
      case 'orthographic':
        return d3.geoOrthographic().fitSize([w, h], { type: 'Sphere' });
      case 'equirectangular':
      default:
        return d3.geoEquirectangular().fitSize([w, h], { type: 'Sphere' });
    }
  }

  private getD3Intersection(e: PointerEvent): [number, number] | null {
    const canvas = this.d3Canvas()?.nativeElement;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const proj = this.getD3Projection();
    if (proj && proj.invert) {
      const inverted = proj.invert([e.clientX - rect.left, e.clientY - rect.top]);
      if (inverted) return inverted;
    }
    return null;
  }

  private renderMap() {
    if (!this.texContext || !this.textureCanvas()?.nativeElement) return;
    this.renderTexture();

    if (this.view() !== '3d' && this.d3Context && this.d3Canvas()?.nativeElement) {
      this.renderD3();
    }
  }

  private renderTexture() {
    const canvas = this.textureCanvas()!.nativeElement;
    const ctx = this.texContext;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#6b7280';
    ctx.fillRect(0, 0, w, h);

    const proj = d3.geoEquirectangular().fitSize([w, h], { type: 'Sphere' });
    const path = d3.geoPath(proj, ctx);

    ctx.fillStyle = '#10b981';
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 2;

    this.state.continents().forEach((f) => {
      ctx.beginPath();
      path(f);
      ctx.fill();
      ctx.stroke();
    });

    if (this.state.showLines()) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4;
      this.state.lines().forEach((f) => {
        ctx.beginPath();
        path(f);
        ctx.stroke();
      });
    }

    if (this.state.isDrawing() && this.state.currentShapeCoords().length > 0) {
      ctx.strokeStyle = this.state.tool() === 'lines' ? '#a855f7' : '#ef4444';
      ctx.lineWidth = 4;
      const geom = { type: 'LineString', coordinates: this.state.currentShapeCoords() } as any;
      ctx.beginPath();
      path({ type: 'Feature', geometry: geom, properties: {} });
      ctx.stroke();
    }

    if (this.texture) this.texture.needsUpdate = true;
  }

  private renderD3() {
    const canvas = this.d3Canvas()!.nativeElement;
    const ctx = this.d3Context;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    const proj = this.getD3Projection();
    if (!proj) return;
    const path = d3.geoPath(proj, ctx);

    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.fill();

    const graticule = d3.geoGraticule10();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    path(graticule);
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 1;
    this.state.continents().forEach((f) => {
      ctx.beginPath();
      path(f);
      ctx.fill();
      ctx.stroke();
    });

    if (this.state.showLines()) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      this.state.lines().forEach((f) => {
        ctx.beginPath();
        path(f);
        ctx.stroke();
      });
    }

    if (this.state.isDrawing() && this.state.currentShapeCoords().length > 0) {
      ctx.strokeStyle = this.state.tool() === 'lines' ? '#a855f7' : '#ef4444';
      ctx.lineWidth = 3;
      const geom = { type: 'LineString', coordinates: this.state.currentShapeCoords() } as any;
      ctx.beginPath();
      path({ type: 'Feature', geometry: geom, properties: {} });
      ctx.stroke();
    }
  }
}
