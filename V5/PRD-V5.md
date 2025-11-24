# Product Requirements Document - V5 Modular HTML System

## 🎯 Project Overview

**V5 Modular HTML System** - Transform the working V3 liquid paint system into a clean, modular HTML architecture while preserving ALL functionality.

## 📋 Requirements

### **Functional Requirements - PRESERVE ALL V3 FEATURES**

#### **Core Liquid Paint System**
- ✅ **Particle System**: Grid-based liquid paint transformation effect
- ✅ **Image Transformation**: Smooth transitions between paired images
- ✅ **Universal Puck**: Mouse/touch cursor that drives transformation
- ✅ **60 FPS Performance**: Smooth animation and rendering

#### **Complete Interaction System**
- ✅ **Desktop Controls**: Mouse following, influence adjustment, trails
- ✅ **Mobile Controls**: Touch interaction, mobile menu, responsive design
- ✅ **Control Buttons**: Reset, Auto-complete, Influence adjustment, Toggle trails
- ✅ **Progress Display**: Particle count, transformation percentage, visual progress bar

#### **Background & Content System**
- ✅ **BackBoard Integration**: Background story content display
- ✅ **Timeline System**: Progress tracking through multiple transformations
- ✅ **Celebration Effects**: Success messages and animations on completion

### **Technical Requirements - CLEAN ARCHITECTURE**

#### **Modular HTML Structure**
- **Base System**: `liquid-paint-base.html` - Core functionality (~400 lines)
- **Device Detection**: `device-detector.js` - Mobile vs desktop detection
- **Transformation Files**: 8 separate HTML files (4 desktop + 4 mobile)
- **Config Files**: JSON-based configuration for images and story content

#### **File Organization**
```
V5/
├── liquid-paint-base.html          # Core system (~400 lines)
├── device-detector.js              # Device detection
├── desktop/                         # Desktop transformations
│   ├── liquid-paint-1to2.html     # Happy→Scared
│   ├── liquid-paint-2to3.html     # Scared→Monster1
│   ├── liquid-paint-3to4.html     # Monster1→Monster2
│   └── liquid-paint-4to5.html     # Monster2→[next]
├── mobile/                         # Mobile equivalents
│   └── [4 mobile files]
├── config/                         # Configuration
│   ├── images.json                 # Image paths and metadata
│   ├── backboard.json              # Story content
│   └── transformations.json         # Transformation pairs
└── images/                         # Image assets
    ├── KidHappy.png
    ├── KidScared.png
    ├── Monster01.png
    └── Monster02.png
```

#### **Simplification Requirements**
- ❌ **Remove**: Fallback systems, FPS tracking, velocity display, LED debugging
- ✅ **Keep**: All user-facing functionality, all core effects, all controls
- 📊 **Target**: 300-400 lines per HTML file (vs 1456 lines in V3)

### **Device Optimization**
- **Auto-detection**: Load appropriate HTML based on device type
- **Desktop**: Mouse-based interaction, desktop controls
- **Mobile**: Touch-optimized interface, mobile menu, responsive design
- **Shared Logic**: Core particle system identical across devices

### **Configuration System**
- **Image Config**: JSON with paths to 5 transformation images
- **Story Config**: JSON with background content for each stage
- **Transformation Config**: JSON defining which images transform to each other
- **Easy Updates**: Change content without modifying HTML/JS code

### **Timeline Overlay System**
- **Independent Overlay**: Separate HTML that tracks active transformation
- **Progress Tracking**: Visual timeline showing current transformation
- **Navigation**: Easy switching between different transformations
- **State Management**: Tracks which HTML file is currently active

## 🧪 Testing Requirements

### **Functional Testing**
- [ ] Each transformation HTML loads and works independently
- [ ] Particle system identical to V3 performance
- [ ] All controls work (influence, trails, reset, complete)
- [ ] Desktop mouse interaction functional
- [ ] Mobile touch interaction functional
- [ ] Progress display updates correctly
- [ ] Background content loads properly

### **Device Testing**
- [ ] Auto-detection loads correct HTML version
- [ ] Desktop version works on desktop browsers
- [ ] Mobile version works on mobile devices
- [ ] Responsive design works on different screen sizes

### **Configuration Testing**
- [ ] Config files load properly
- [ ] Image paths resolve correctly
- [ ] Story content displays properly
- [ ] Changes to config files reflect in application

## 🚀 Success Criteria

### **Primary Goals**
1. **100% Feature Parity**: All V3 functionality preserved
2. **Clean Architecture**: Modular HTML files, no complex dependencies
3. **Device Optimization**: Separate desktop/mobile code paths
4. **Configuration Driven**: Easy content updates via JSON files
5. **Maintainable Code**: Each file 300-400 lines vs 1456 lines

### **Quality Gates**
- **Functionality**: Each HTML file works independently
- **Performance**: 60 FPS particle rendering maintained
- **Cross-Device**: Works on desktop and mobile
- **Usability**: All controls accessible and functional

## 📅 Implementation Phases

### **Phase 1: Foundation**
- ✅ Create V5 folder structure
- ✅ Set up config files with test data
- ✅ Create liquid-paint-base.html core system
- 🔄 Create device-detector.js

### **Phase 2: Transformation Files**
- ⏳ Create 8 HTML files (4 desktop + 4 mobile)
- ⏳ Implement config loading in each file
- ⏳ Test each transformation independently

### **Phase 3: Timeline System**
- ⏳ Create timeline-overlay.html
- ⏳ Implement active file tracking
- ⏳ Add navigation between transformations

### **Phase 4: Testing & Refinement**
- ⏳ Functional testing of all features
- ⏳ Cross-device testing
- ⏳ Performance optimization
- ⏳ Documentation updates

## 🎯 End State

**V5 provides the exact same user experience as V3 but with:**
- Clean, maintainable HTML architecture
- Device-optimized code paths
- Easy configuration and content updates
- Simplified file structure without feature loss

**Result**: A modular liquid paint storytelling system that's easy to understand, test, and extend while preserving all the functionality that makes V3 work perfectly.

---

**Ready for development team deployment with clear requirements and clean architecture!**