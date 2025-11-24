# PRD: V6 Modular Liquid Stories System

**Purpose**: Create a modular, maintainable liquid particle storytelling system that delivers the exact same user experience as V3 but with clean, organized code architecture

**Version**: 1.0
**Date**: 2025-11-22
**Status**: Complete Requirements Specification

---

## 1. Executive Summary

### Vision
Transform the monolithic V3 liquid stories system into a clean, modular architecture while maintaining 100% functional parity. V6 must deliver identical user experience, performance, and visual effects as V3 but with organized, maintainable code.

### Success Metrics
- **100% Functional Parity**: V6 behaves identically to V3 in all scenarios
- **Performance**: 10,000 particles running at 60fps on desktop, 30fps on mobile
- **Code Organization**: Modular components with clear separation of concerns
- **Maintainability**: Easy to modify assets, story flow, and visual effects
- **Device Compatibility**: Desktop and mobile versions with device-optimized interactions

### Problem Statement
V3 works perfectly but has 53,661 lines of monolithic code that is difficult to maintain, modify, or extend. V4 and V5 failed due to process violations, not technical issues. V6 must use the established PRD-driven development process to ensure success.

---

## 2. User Stories & Acceptance Criteria

### Story 2.1: Immersive Liquid Particle Experience
**As a user, I want to experience beautiful liquid particle animations that respond to my interaction**

**Acceptance Criteria**:
- [ ] 10,000 particles rendered on desktop (matching V3 exactly)
- [ ] 5,000 particles rendered on mobile (performance optimized)
- [ ] Particles flow in organic, liquid-like patterns
- [ ] Smooth 60fps performance on desktop devices
- [ ] Smooth 30fps performance on mobile devices
- [ ] Particles respond to user interaction with realistic fluid dynamics

### Story 2.2: Progressive Story Transformation
**As a user, I want to experience a 5-stage visual story that transforms from happy child to monster encounter**

**Acceptance Criteria**:
- [ ] 5 distinct transformation stages (1→2→3→4→5)
- [ ] Stage 1: Kid Happy character visible
- [ ] Stage 2: Kid Scared character transformation
- [ ] Stage 3: Monster 01 character appearance
- [ ] Stage 4: Monster 02 character transformation
- [ ] Stage 5: Final story resolution state
- [ ] Smooth visual transitions between all stages
- [ ] Progress indicator showing current stage

### Story 2.3: Dual Device Experience
**As a user, I want the experience to work seamlessly on both desktop and mobile devices**

**Acceptance Criteria**:
- [ ] Automatic device detection and appropriate version loading
- [ ] Desktop: Mouse cursor interaction with universal puck
- [ ] Mobile: Touch interaction with mobile-optimized controls
- [ ] Responsive design adapts to all screen sizes
- [ ] Consistent visual quality across all devices
- [ ] Performance optimized per device class

### Story 2.4: Image Asset Integration
**As a user, I want to see character images that are part of the liquid particle system**

**Acceptance Criteria**:
- [ ] KidHappy.png loads and displays correctly in Stage 1
- [ ] KidScared.png loads and displays correctly in Stage 2
- [ ] Monster01.png loads and displays correctly in Stage 3
- [ ] Monster02.png loads and displays correctly in Stage 4
- [ ] Images integrate seamlessly with particle effects
- [ ] Images load within 2 seconds on desktop, 5 seconds on mobile
- [ ] Failed image loading handled gracefully with error states

---

## 3. Functional Requirements

### 3.1 Particle System
**3.1.1 Particle Generation**
- Generate exactly 10,000 particles on desktop
- Generate exactly 5,000 particles on mobile
- Each particle has position, velocity, color, and size properties
- Particles spawn in visually pleasing initial distribution
- Particle count constant throughout experience (no leaks or creation/destruction)

**3.1.2 Particle Animation**
- Update particle positions at 60fps desktop, 30fps mobile
- Implement fluid dynamics simulation for organic movement
- Particles respond to user interaction forces
- Particle boundaries wrap around screen edges seamlessly
- Particle colors and sizes create visual cohesion

**3.1.3 User Interaction**
- Desktop: Mouse movement creates force field affecting nearby particles
- Desktop: Universal puck cursor follows mouse position
- Mobile: Touch creates force field at touch point
- Mobile: Optimized touch controls for performance
- Interaction forces decay naturally over distance

### 3.2 Image System
**3.2.1 Asset Loading**
- Load 4 PNG assets: KidHappy.png, KidScared.png, Monster01.png, Monster02.png
- Images located in `images/` directory relative to HTML files
- Preload all assets before experience starts
- Loading screen shown during asset preparation
- Cache assets for subsequent stage transitions

**3.2.2 Image Display**
- Images integrate with particle system as visual elements
- Images display at appropriate stages per story progression
- Images scale appropriately for device size
- Images maintain aspect ratio and visual quality
- Images interact with particle effects (particles flow around/through images)

**3.2.3 Stage Transitions**
- 5-stage progression with smooth visual transitions
- Stage progression triggered by user interaction or time-based progression
- Current stage persisted in URL parameters for sharing/bookmarking
- Stage transitions include particle color shifts and image changes
- Each stage has distinct visual atmosphere while maintaining particle system

### 3.3 Device Detection
**3.3.1 Automatic Detection**
- Detect mobile vs desktop device on page load
- Use multiple detection methods: user agent, touch capabilities, screen size
- Redirect to appropriate device-specific HTML files
- Device detection works within 100ms of page load

**3.3.2 Device-Specific Optimization**
- Desktop version optimized for mouse interaction and higher performance
- Mobile version optimized for touch interaction and battery efficiency
- Progressive enhancement ensures core experience works on all devices
- Graceful degradation for very low-end devices

---

## 4. Technical Requirements

### 4.1 Performance Targets
**4.1.1 Frame Rate**
- Desktop: Maintain 60fps (16.67ms per frame) throughout experience
- Mobile: Maintain 30fps (33.33ms per frame) throughout experience
- Frame rate measured over 10-second rolling average
- Performance monitoring integrated for debugging

**4.1.2 Resource Usage**
- Memory usage: Maximum 100MB on desktop, 50MB on mobile
- CPU usage: Maximum 50% of one core on desktop, 30% on mobile
- Asset loading: All images load within specified time limits
- No memory leaks over extended usage (1+ hour testing)

**4.1.3 Browser Compatibility**
- Chrome 90+ (desktop and mobile)
- Safari 14+ (desktop and mobile)
- Firefox 88+ (desktop)
- Edge 90+ (desktop)
- Fallback support for older browsers with reduced features

### 4.2 Architecture Requirements
**4.2.1 Modular Structure**
- Separate JavaScript modules for distinct functionality:
  - `particle-system.js` - Core particle animation logic
  - `image-loader.js` - Asset loading and display
  - `device-detector.js` - Device detection and redirection
  - `interaction-handler.js` - User input processing
  - `story-controller.js` - Stage progression logic
- Clear separation of concerns with minimal coupling
- Each module independently testable

### 4.3 Implementation Specifications
**4.3.1 Particle Physics System**
- **Force Calculation Algorithm**:
  ```
  Force = (Mouse/Touch Position - Particle Position) * Strength
  Damping = 0.98 (applied each frame)
  Max Velocity = 5px/frame
  ```
- **Interaction Parameters**:
  - Interaction radius: 150px
  - Force strength: 0.5 (adjustable per stage)
  - Minimum distance: 10px (prevents singularity)
- **Particle Properties**:
  - Size range: 1-4px (random distribution)
  - Color transition: HSL values with stage-specific palettes
  - Lifetime: Permanent (no creation/destruction after init)
- **Boundary Wrapping**: Seamless wrapping at screen edges with position reset
- **Rendering Technology**: Canvas 2D API with requestAnimationFrame

**4.3.2 Performance Optimization**
- **Particle Rendering**: Batch rendering using Canvas Path2D
- **Memory Management**: Object pooling for particle data structures
- **Frame Rate Control**: Adaptive quality based on performance
- **Mobile Optimizations**: Reduced particle count, simplified physics
- **Desktop Optimizations**: Full particle count, enhanced visual effects

**4.3.3 Error Handling Specifications**
**4.3.3.1 Asset Loading Errors**
- Retry logic: 3 attempts with exponential backoff (1s, 2s, 4s)
- Fallback: Placeholder graphics with error messaging
- User notification: Toast message after 2 failed attempts
- Error logging: Console logs with error context and timing

**4.3.3.2 Performance Degradation**
- Monitoring: Continuous frame rate sampling
- Threshold: Drop below 45fps desktop, 25fps mobile triggers adaptation
- Adaptation: Reduce particle count by 25% increments
- Recovery: Restore particles when performance recovers

**4.3.3.3 Browser Compatibility**
- Feature detection: Check Canvas and ES6 module support
- Fallback: CSS-based animation for unsupported browsers
- User messaging: Clear upgrade recommendations for unsupported browsers
- Graceful degradation: Reduced feature set with core functionality preserved

### 4.4 Measurement & Validation Methodologies
**4.4.1 Performance Measurement**
- **Tool**: Custom performance monitor using requestAnimationFrame
- **Sampling**: 1000ms rolling average of frame timestamps
- **Validation**: Pass if ≥95% of samples meet performance targets
- **Metrics**:
  - Frame time: <16.67ms desktop, <33.33ms mobile
  - Memory usage: Monitor via performance.memory API
  - CPU usage: Measure via performance timing APIs
- **Data Collection**: Automatic logging with performance summaries

**4.4.2 Visual Parity Validation**
- **Tool**: Automated screenshot comparison with V3 reference
- **Baseline**: V3 reference file at `HtmlTests/2image-liquid-paint-v3.html`
- **Tolerance**: 99% pixel similarity for key visual states
- **Comparison Points**: Each story stage, particle density, image placement
- **Manual Validation**: Side-by-side comparison for subjective elements

**4.4.3 Functional Validation**
- **Particle Count**: Automated particle counting algorithm
- **Image Loading**: Verify image files exist and load successfully
- **Device Detection**: Test with various user agent strings
- **Story Progression**: Validate all 5 stages function correctly
- **Interaction Testing**: Automated mouse/touch simulation testing

**4.2.2 Configuration Management**
- `config/images.json` - Image asset configuration
- `config/transformations.json` - Stage transition parameters
- `config/performance.json` - Device-specific performance settings
- Configuration changes do not require code changes
- Environment-specific configuration support

### 4.3 Integration Requirements
**4.3.1 File Organization**
```
V6/
├── index.html                    # Entry point with device detection
├── config/
│   ├── images.json             # Image asset configuration
│   ├── transformations.json     # Stage transition settings
│   └── performance.json         # Performance parameters
├── js/
│   ├── particle-system.js      # Core particle animation
│   ├── image-loader.js         # Asset management
│   ├── device-detector.js      # Device detection
│   ├── interaction-handler.js  # User input processing
│   └── story-controller.js     # Story progression
├── images/
│   ├── KidHappy.png            # Stage 1 character
│   ├── KidScared.png           # Stage 2 character
│   ├── Monster01.png           # Stage 3 character
│   └── Monster02.png           # Stage 4 character
├── desktop/
│   └── index.html              # Desktop-optimized version
└── mobile/
    └── index.html              # Mobile-optimized version
```

**4.3.2 Module Loading**
- Use ES6 modules (`import`/`export`) for clean dependency management
- Async module loading for performance
- Fallback for browsers without module support
- Module versioning for cache busting

---

## 5. User Experience Requirements

### 5.1 Visual Design
**5.1.1 Aesthetic Consistency**
- Maintain V3's visual aesthetic exactly
- Dark background (#0a0a0a) with white/blue particle system
- Consistent color palette across all stages
- Smooth transitions between visual states
- Professional, polished appearance

**5.1.2 Objective Visual Criteria**
- **Color Specifications**:
  - Stage 1: HSL(200, 70%, 60%) particles (blue theme)
  - Stage 2: HSL(20, 70%, 50%) particles (orange transition)
  - Stage 3: HSL(280, 60%, 40%) particles (purple theme)
  - Stage 4: HSL(0, 70%, 50%) particles (red theme)
  - Stage 5: HSL(120, 60%, 50%) particles (green resolution)
- **Transition Timing**: 500ms ease-in-out between stages
- **Visual Quality**: 99% pixel similarity with V3 reference at key states
- **Consistency Metrics**: Color variance <5% within same stage

**5.1.2 Responsive Design**
- Experience adapts seamlessly to all screen sizes
- Mobile version optimized for portrait orientation
- Desktop version optimized for landscape orientation
- Text and UI elements readable on all devices
- No horizontal scrolling on any device

### 5.2 Interaction Design
**5.2.1 Desktop Interaction**
- Universal puck cursor replaces system cursor
- Smooth mouse tracking with no lag
- Particle response to mouse movement feels natural and fluid
- Visual feedback for all interactions
- Intuitive controls that require no explanation

**5.2.2 Desktop Interaction Metrics**
- **Input Latency**: <16ms from mouse movement to particle response
- **Cursor Tracking**: Mouse position accuracy within 1px of system cursor
- **Visual Feedback**: Puck scaling within 50ms of interaction
- **Intuitive Metrics**: First-time user task completion rate >90%

**5.2.3 Mobile Interaction**
- Touch-optimized controls for finger interaction
- Responsive touch handling with no delay
- Particle response to touch feels natural on mobile devices
- Gesture support for enhanced interaction
- Accessible controls for users with different abilities

**5.2.4 Mobile Interaction Metrics**
- **Touch Response**: <33ms from touch to particle response
- **Gesture Recognition**: Tap, swipe gestures detected with 95% accuracy
- **Touch Accuracy**: Interaction within 10px of touch point
- **Accessibility**: Touch targets minimum 44px (WCAG compliance)

### 5.3 Accessibility
**5.3.1 Screen Reader Support**
- Alt text for all meaningful images
- ARIA labels for interactive elements
- Semantic HTML structure for screen readers
- Keyboard navigation support where applicable

**5.3.2 Visual Accessibility**
- Sufficient color contrast for readability
- Adjustable text sizes for readability
- Support for high contrast mode
- Accommodation for color-blind users

---

## 6. Testing Strategy

### 6.1 Unit Testing
**6.1.1 Particle System Tests**
- Test particle generation creates correct number of particles
- Test particle animation updates position correctly
- Test particle physics calculations produce expected behavior
- Test particle boundary wrapping functions properly
- Test performance meets frame rate requirements

**6.1.2 Image System Tests**
- Test all images load successfully within time limits
- Test failed image loading triggers error handling
- Test image display at correct stages
- Test image scaling works on different screen sizes
- Test image caching prevents unnecessary reloads

**6.1.3 Device Detection Tests**
- Test mobile devices detected correctly
- Test desktop devices detected correctly
- Test device detection completes within time limits
- Test redirection to appropriate device versions
- Test fallback handling for unknown devices

### 6.2 Integration Testing
**6.2.1 End-to-End Workflow Tests**
- Test complete 5-stage story progression
- test user interaction throughout all stages
- Test device-specific interaction flows
- Test performance across all stages
- Test error recovery scenarios

**6.2.2 Cross-Browser Testing**
- Test functionality in all supported browsers
- Test performance variations between browsers
- Test fallback behavior in older browsers
- Test mobile browser compatibility
- Test desktop browser responsiveness

### 6.3 Performance Testing
**6.3.1 Load Testing**
- Test asset loading within specified time limits
- Test initial experience load time under 3 seconds
- Test stage transition performance under 1 second
- Test memory usage stays within limits
- Test performance with slow network connections

**6.3.2 Stress Testing**
- Test extended usage (1+ hour) for memory leaks
- Test performance under CPU load
- Test behavior with multiple browser tabs open
- Test mobile device battery usage
- Test thermal performance on mobile devices

---

## 7. Success Metrics & Validation

### 7.1 Quantitative Success Criteria
**7.1.1 Performance Metrics**
- [ ] 60fps sustained on desktop devices (measured over 10-second average)
- [ ] 30fps sustained on mobile devices (measured over 10-second average)
- [ ] <100MB memory usage on desktop, <50MB on mobile
- [ ] <3 seconds initial load time on broadband
- [ ] <5 seconds asset loading on mobile networks
- [ ] 0 failed tests in comprehensive test suite
- [ ] 100% PRD requirement coverage in tests

**7.1.2 Functional Metrics**
- [ ] 10,000 particles rendered on desktop
- [ ] 5,000 particles rendered on mobile
- [ ] 5 story stages functioning correctly
- [ ] 4 images loading and displaying properly
- [ ] Device detection accuracy 100%
- [ ] Zero JavaScript errors in browser console
- [ ] Zero memory leaks over extended usage

### 7.2 Qualitative Success Criteria
**7.2.1 User Experience**
- [ ] Visual experience matches V3 exactly
- [ ] Smooth, fluid particle animations
- [ ] Natural, responsive user interaction
- [ ] Professional, polished appearance
- [ ] Intuitive controls requiring no explanation
- [ ] Consistent experience across all devices

**7.2.2 Technical Quality**
- [ ] Clean, readable, maintainable code
- [ ] Proper separation of concerns
- [ ] Comprehensive documentation
- [ ] No code duplication
- [ ] Consistent coding style
- [ ] Proper error handling throughout

### 7.3 Validation Methods
**7.3.1 Automated Validation**
- Comprehensive test suite runs automatically
- Performance monitoring integrated
- Code quality analysis passes
- Security vulnerability scans pass
- Accessibility compliance verified

**7.3.2 Manual Validation**
- User testing on representative devices
- Visual comparison with V3 baseline
- Performance testing under realistic conditions
- Cross-browser compatibility verification
- Real-world network condition testing

---

## 8. Risk Assessment & Mitigation

### 8.1 Technical Risks
**8.1.1 Performance Risk**
- **Risk**: Particle system performance degrades on lower-end devices
- **Mitigation**: Device-specific optimization, quality settings, progressive enhancement
- **Contingency**: Reduce particle count on detected low-end devices

**8.1.2 Browser Compatibility Risk**
- **Risk**: Certain browsers don't support required features
- **Mitigation**: Feature detection, polyfills, graceful degradation
- **Contingency**: Fallback experience with reduced features

**8.1.3 Asset Loading Risk**
- **Risk**: Images fail to load due to network issues
- **Mitigation**: Retry logic, offline caching, error handling
- **Contingency**: Placeholder graphics or text descriptions

### 8.2 Process Risks
**8.2.1 Requirements Creep Risk**
- **Risk**: Additional requirements added during development
- **Mitigation**: Strict PRD adherence, change request process
- **Contingency**: Phase additional features for future releases

**8.2.2 Testing Coverage Risk**
- **Risk**: Insufficient test coverage misses critical bugs
- **Mitigation**: PRD-driven test creation, coverage analysis
- **Contingency**: Additional testing phases, bug bashes

**8.2.3 Integration Risk**
- **Risk**: Module integration creates unexpected issues
- **Mitigation**: Incremental integration, continuous testing
- **Contingency**: Integration testing phases, rollback capability

---

## 9. Project Timeline & Milestones

### 9.1 Development Phases
**Phase 1: Foundation (Week 1)**
- [ ] Project structure setup
- [ ] Basic device detection implementation
- [ ] Configuration system implementation
- [ ] Core HTML/CSS foundation

**Phase 2: Core Systems (Week 2)**
- [ ] Particle system implementation
- [ ] Image loading system implementation
- [ ] Basic interaction handling
- [ ] Device-specific optimizations

**Phase 3: Story Integration (Week 3)**
- [ ] 5-stage story progression
- [ ] Image-stage integration
- [ ] Transition animations
- [ ] Progress indicators

**Phase 4: Polish & Testing (Week 4)**
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] User experience refinement
- [ ] Comprehensive testing

**Phase 5: Validation & Delivery (Week 5)**
- [ ] Final validation against PRD
- [ ] Quality assurance verification
- [ ] Documentation completion
- [ ] Production deployment

### 9.2 Success Gates
Each phase must pass the following gates before proceeding:
- [ ] All tests pass (100% pass rate)
- [ ] Performance requirements met
- [ ] Code quality standards met
- [ ] Stakeholder approval received
- [ ] No critical security vulnerabilities

---

## 10. Acceptance Criteria Summary

### Must-Have Requirements (Release Blockers)
- [ ] 10,000 particles on desktop, 5,000 on mobile
- [ ] 60fps desktop, 30fps mobile performance
- [ ] All 4 images load and display correctly
- [ ] 5-stage story progression working
- [ ] Device detection and redirection functioning
- [ ] Modular code architecture implemented
- [ ] 100% test coverage of PRD requirements
- [ ] Visual experience identical to V3
- [ ] Zero critical security vulnerabilities
- [ ] Documentation complete and accurate

### Should-Have Requirements (High Priority)
- [ ] Progressive enhancement for older browsers
- [ ] Advanced accessibility features
- [ ] Performance monitoring integration
- [ ] Comprehensive error handling
- [ ] Mobile gesture support
- [ ] Browser-specific optimizations
- [ ] Asset compression and optimization
- [ ] Analytics integration capabilities

### Could-Have Requirements (Nice to Have)
- [ ] Advanced particle effects customization
- [ ] Story editor functionality
- [ ] Multi-language support
- [ ] Advanced analytics and reporting
- [ ] A/B testing capabilities
- [ ] Social sharing integration
- [ ] Offline functionality
- [ ] Progressive Web App features

---

## Conclusion

This PRD defines a comprehensive specification for V6 that maintains 100% functional parity with V3 while delivering a clean, modular architecture. By following the PRD-driven development process with pre-development test creation, we ensure that V6 will meet all requirements and avoid the process failures that affected V4 and V5.

The key to success is strict adherence to this PRD throughout development, with every requirement validated through comprehensive testing. The result will be a maintainable, performant system that delivers the exact same user experience as V3 but with modern, organized code architecture.

**Next Steps**:
1. Validate PRD completeness and testability
2. Create comprehensive test suite from PRD requirements
3. Developer scope confirmation and acceptance
4. Implementation following established development process
5. Quality verification and delivery validation