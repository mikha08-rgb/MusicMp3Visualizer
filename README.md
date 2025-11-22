# GridBeats 🎵⚡

> **Immersive 3D music visualizer with Tron-inspired aesthetics**

Transform your music into a stunning visual experience. Watch frequencies dance across a cyberpunk grid with reactive 3D visualizations, iconic Tron elements, and customizable themes.

![GridBeats](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![React](https://img.shields.io/badge/React-19-blue?logo=react) ![Three.js](https://img.shields.io/badge/Three.js-Latest-white?logo=three.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

---

## ✨ Features

### 🎨 **Visual Experiences**
- **Tron-Inspired Design** - Light cycles, recognizer ships, energy barriers, and glowing circuits
- **Multiple Visualization Modes** - Layered Rings, Circular Spectrum, Orbital Elements
- **8 Color Themes** - Rainbow, Cyberpunk, Synthwave, Fire, Ocean, Forest, Monochrome, Purple Dream
- **Music-Reactive Effects** - Bass hits trigger screen flashes, particle explosions, and dynamic lighting

### 🎵 **Audio Features**
- **Drag & Drop Upload** - Support for MP3, WAV, OGG, and more
- **Demo Track** - Try it instantly with the built-in demo audio
- **Real-Time Analysis** - Advanced frequency analysis with bass, mids, and highs separation
- **Smooth Reactivity** - Adaptive smoothing for natural, flowing animations

### ⚙️ **Customization**
- **Performance Presets** - Ultra, High, Medium, Low, Potato (auto-adaptive)
- **Granular Controls** - Toggle bloom, vignette, god rays, particles, and FPS counter
- **Persistent Settings** - All preferences saved to localStorage
- **Fullscreen Mode** - Press F for immersive fullscreen experience

### 🚀 **Performance**
- **60+ FPS** - Heavily optimized with material swaps, instanced meshes, and batched rendering
- **LOD System** - Distance-based rendering for smooth performance
- **Object Pooling** - Reduced garbage collection for stable frame rates
- **AnimationManager** - Centralized updates with adaptive frame rates

---

## 🎮 Demo

**Try the live demo:** [Coming Soon - Deploy to Vercel]

**Quick Start:**
1. Click "Try Demo Track" to experience GridBeats instantly
2. Or upload your own audio file (drag & drop supported)
3. Adjust settings to your preference
4. Press F for fullscreen
5. Enjoy the show! 🎉

---

## 🛠️ Tech Stack

### **Core Technologies**
- **Next.js 16** - React framework with App Router and server-side rendering
- **React 19** - Modern React with concurrent features
- **TypeScript** - Full type safety throughout
- **Three.js** - 3D graphics engine
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Essential helpers for R3F
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible UI components

### **3D & Effects**
- **@react-three/postprocessing** - Bloom, vignette, god rays
- **InstancedMesh** - High-performance rendering of repeated objects
- **Custom Shaders** - Energy barriers, data streams, Tron glow effects
- **OrbitControls** - Interactive camera movement

### **Performance**
- Custom AnimationManager for batched updates
- Object pooling system for reduced GC
- Material optimization (Basic vs Standard)
- Geometry simplification and LOD
- Distance-based culling

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- npm, pnpm, yarn, or bun

### **Installation**

```bash
# Clone the repository
git clone https://github.com/yourusername/gridbeats.git
cd gridbeats

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see GridBeats in action!

### **Building for Production**

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
gridbeats/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with GA
│   ├── page.tsx                 # Main page with visualizer
│   └── globals.css              # Global styles
├── components/
│   ├── visualizations/          # Visualization modes
│   │   ├── LayeredRings.tsx
│   │   ├── CircularSpectrum.tsx
│   │   └── OrbitalElements.tsx
│   ├── environment/             # 3D scene elements
│   │   ├── EnhancedCyberpunkCity.tsx
│   │   ├── CircuitBoard.tsx
│   │   ├── LightCycles.tsx
│   │   ├── Recognizers.tsx
│   │   └── ...
│   ├── effects/                 # Visual effects
│   │   ├── ScreenFlash.tsx
│   │   └── ParticleExplosion.tsx
│   ├── ui/                      # UI components
│   │   ├── DiagnosticPanels.tsx
│   │   └── ScanningRings.tsx
│   ├── shaders/                 # Custom shaders
│   ├── MusicVisualizerScene.tsx # Main 3D scene
│   ├── ControlsPanel.tsx        # Settings UI
│   ├── FileUpload.tsx           # Audio upload
│   └── GoogleAnalytics.tsx      # Analytics
├── lib/
│   ├── themes.ts                # Color themes
│   ├── performance-helper.ts    # Performance utilities
│   ├── AnimationManager.ts      # Centralized animations
│   ├── object-pool.ts           # Object pooling
│   └── ...
├── hooks/
│   └── useEnhancedAudioAnalyzer.ts  # Audio analysis
└── public/
    └── demo/                    # Demo audio files
```

---

## 🎨 Themes

GridBeats includes 8 beautiful themes:

1. **Rainbow** - Full spectrum of colors
2. **Cyberpunk** - Cyan and magenta neon
3. **Synthwave** - Pink and purple retro vibes
4. **Fire** - Warm orange and red flames
5. **Ocean** - Cool blue depths
6. **Forest** - Natural green tones
7. **Monochrome** - Classic black and white
8. **Purple Dream** - Deep purple atmosphere

All themes are music-reactive and apply across the entire scene!

---

## ⚡ Performance Optimization

GridBeats is heavily optimized for 60+ FPS:

### **What We've Done:**
- ✅ Material optimization (Basic vs Standard materials)
- ✅ InstancedMesh for repeated objects (buildings, particles, traces)
- ✅ AnimationManager for batched updates
- ✅ Object pooling for Vector3, Color, etc.
- ✅ Geometry simplification (reduced segments)
- ✅ Distance-based culling
- ✅ Shadow optimization
- ✅ Adaptive quality presets

### **Performance Presets:**
- **Ultra** - All effects, highest quality (60+ FPS on good GPUs)
- **High** - Balanced quality and performance
- **Medium** - Reduced effects for older hardware
- **Low** - Minimal effects, maximum FPS
- **Potato** - Bare minimum for weak devices

See `OPTIMIZATIONS.md` for detailed performance breakdown.

---

## 🌐 Deployment

GridBeats is ready to deploy for **FREE** on Vercel!

### **Quick Deploy:**
1. Push to GitHub
2. Import to Vercel
3. Add Google Analytics ID (optional)
4. Deploy!

See `DEPLOYMENT.md` for complete step-by-step guide.

**Free Hosting Includes:**
- ✅ Unlimited bandwidth (100GB/month)
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Auto-deploy on git push
- ✅ Preview deployments
- ✅ $0/month cost

---

## 🎯 Roadmap

### **Planned Features:**
- [ ] More visualization modes (waveform, particle field, galaxy)
- [ ] Spotify integration
- [ ] Export recordings as video
- [ ] VR support
- [ ] Custom shader editor
- [ ] Beat detection improvements
- [ ] Social sharing features
- [ ] User-uploaded themes

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📊 Analytics

GridBeats includes optional Google Analytics integration:

```bash
# Add to .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

See `DEPLOYMENT.md` for setup instructions.

---

## 📝 License

MIT License - feel free to use GridBeats for personal or commercial projects!

---

## 🙏 Acknowledgments

- **Three.js** - Amazing 3D library
- **Pmndrs** - React Three Fiber and Drei
- **Vercel** - Hosting and Next.js
- **shadcn** - Beautiful UI components
- **Tron Legacy** - Visual inspiration

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/gridbeats/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/gridbeats/discussions)

---

<div align="center">

**Made with ❤️ and lots of ☕**

**GridBeats** - Where music meets the grid

[⭐ Star on GitHub](https://github.com/yourusername/gridbeats) • [🚀 Deploy Now](https://vercel.com)

</div>
