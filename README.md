# 🌍 CustomWorldMap: Interactive 3D World Map Editor

CustomWorldMap is a sophisticated, interactive web application built with **Angular 21**, **Three.js**, and **D3.js** that allows users to design, edit, and export custom planetary geographies. Whether you're a world-builder, a tabletop gamer, or a geography enthusiast, this tool provides a powerful suite of features to create continents and borders from scratch.

![Custom World Map Preview](https://via.placeholder.com/1200x600.png?text=Custom+World+Map+Editor+Interface)

---

## ✨ Key Features

### 🏔️ Continent Creation & Editing
- **Freehand Drawing**: Create custom landmasses with precise control.
- **Splash Tool**: Generate organic, procedural continents with adjustable **Size** and **Complexity** for a more natural look.
- **Intelligent Merging**: Utilizing **Turf.js**, overlapping landmasses are automatically merged into single, continuous features.
- **Eraser Tool**: Quickly remove unwanted landmasses with a single click.

### 📐 Advanced Map Projections
Switch seamlessly between different views of your world:
- **3D Globe (Orthographic)**: A fully interactive, rotatable 3D sphere.
- **Mercator**: The classic navigation projection.
- **Equirectangular**: A standard rectangular grid projection.
- **Orthographic 2D**: A flat circular view centered on your current focus.

### ✍️ Line & Border Management
- **Multiple Line Modes**:
    - **Freehand**: Draw borders and paths manually.
    - **Straight**: Create crisp, geometric lines between points.
    - **Sector**: Generate longitudinal lines stretching from pole to pole.
- **Visibility Controls**: Toggle lines on and off to focus on pure landmass geometry.

### 💾 State Management
- **Undo/Redo (Memento Pattern)**: Full history support allows you to experiment without fear of permanent mistakes.
- **Persistent State**: Reliable geospatial data handling ensures your maps remain topologically correct.

---

## 🚀 Tech Stack

- **Frontend**: [Angular 21](https://angular.dev/) (Signal-driven architecture)
- **3D Rendering**: [Three.js](https://threejs.org/)
- **Geospatial Logic**: [Turf.js](https://turfjs.org/) & [D3-geo](https://d3js.org/d3-geo)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Design**: Modern Glassmorphism & Premium Dark Mode aesthetics
- **Testing**: [Vitest](https://vitest.dev/)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- Angular CLI (`npm install -g @angular/cli`)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/custom-world-map.git
   cd custom-world-map
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## ⌨️ Keyboard Shortcuts

Speed up your workflow with these handy shortcuts:

| Key | Action |
|-----|--------|
| `P` | Switch to **Pan/Rotate** tool |
| `D` | Switch to **Draw** (Continent) tool |
| `S` | Switch to **Splash** (Procedural) tool |
| `E` | Switch to **Eraser** tool |
| `L` | Switch to **Lines** tool |
| `V` | Toggle **Line Visibility** |
| `Ctrl` + `Z` | **Undo** last action |
| `Ctrl` + `Y` / `Ctrl` + `Shift` + `Z` | **Redo** action |

---

## 📐 Geospatial Accuracy

The editor handles complex GIS challenges under the hood:
- **Winding Order Correction**: Ensures polygons are correctly oriented for rendering.
- **Hemisphere Detection**: Automatically corrects polygons that exceed 180 degrees of longitude (the "inside-out" problem).
- **Topology Merging**: Uses robust Boolean operations for seamless continent union/intersection.

---

## 📝 Development

### Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running Tests
Run `ng test` to execute unit tests via **Vitest**.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Acknowledgments
- Inspired by modern world-building tools and cartography software.
- Built with a focus on high-performance geospatial rendering.
