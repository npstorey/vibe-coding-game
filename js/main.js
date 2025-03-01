import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { GameState } from './gameState.js';
import { UI } from './ui.js';
import { ProjectManager } from './projectManager.js';
import { AssetLoader } from './assetLoader.js';
import { AnimationManager } from './animations.js';

// Main Game class
class Game {
    constructor() {
        this.initThree();
        this.gameState = new GameState();
        this.ui = new UI(this.gameState);
        this.projectManager = new ProjectManager(this.gameState);
        this.animationManager = new AnimationManager();
        
        // Create asset loader with progress callback
        this.assetLoader = new AssetLoader((progress) => {
            const progressBar = document.querySelector('.progress');
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                setTimeout(() => {
                    this.setupScene();
                    this.setupAnimations();
                    this.ui.initEvents(this.projectManager);
                    this.ui.hideLoadingScreen();
                    this.animate();
                }, 500); // Small delay to ensure UI is ready
            }
        });
        
        // Start loading assets
        this.loadAssets();
    }
    
    // Initialize Three.js components
    initThree() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x121212);
        
        // Fog to add depth - more subtle, atmospheric fog
        this.scene.fog = new THREE.FogExp2(0x121212, 0.03);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.6, 3);
        
        // Renderer with improved quality
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance" 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        document.getElementById('scene-container').appendChild(this.renderer.domElement);
        
        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 7;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        // Handling window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Enhanced Atmospheric Lighting Setup
        // Ambient light - warmer and more subtle
        this.ambientLight = new THREE.AmbientLight(0xffeecc, 0.4);
        this.scene.add(this.ambientLight);
        
        // Main directional light (like sunlight through window)
        this.directionalLight = new THREE.DirectionalLight(0xffeedd, 0.5);
        this.directionalLight.position.set(-5, 8, -5);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.far = 30;
        this.directionalLight.shadow.camera.left = -10;
        this.directionalLight.shadow.camera.right = 10;
        this.directionalLight.shadow.camera.top = 10;
        this.directionalLight.shadow.camera.bottom = -10;
        this.directionalLight.shadow.bias = -0.0005;
        this.scene.add(this.directionalLight);
        
        // Add a directional light helper (hidden in production)
        // this.directionalLightHelper = new THREE.DirectionalLightHelper(this.directionalLight, 1);
        // this.scene.add(this.directionalLightHelper);
        
        // Add some accent lights for better illumination
        // Ceiling light - now more focused and atmospheric
        this.ceilingLight = new THREE.PointLight(0xffffee, 0.7, 8);
        this.ceilingLight.position.set(0, 3.5, 0);
        this.ceilingLight.castShadow = true;
        this.ceilingLight.shadow.mapSize.width = 1024;
        this.ceilingLight.shadow.mapSize.height = 1024;
        this.ceilingLight.shadow.bias = -0.001;
        this.scene.add(this.ceilingLight);
        
        // Window light - cooler light coming from window
        this.windowLight = new THREE.DirectionalLight(0xadd8e6, 0.6);
        this.windowLight.position.set(-10, 5, 0);
        this.windowLight.castShadow = true;
        this.windowLight.shadow.mapSize.width = 1024;
        this.windowLight.shadow.mapSize.height = 1024;
        this.windowLight.shadow.bias = -0.0005;
        this.scene.add(this.windowLight);
        
        // Computer monitor glow - add a subtle blue light from the monitor
        this.monitorLight = new THREE.PointLight(0x66aaff, 0.8, 2);
        this.monitorLight.position.set(0, 1.2, -0.1);
        this.scene.add(this.monitorLight);
        
        // Desk lamp light - warm, focused light
        this.deskLampLight = new THREE.SpotLight(0xffcc77, 0.8, 5, Math.PI / 4, 0.5, 1);
        this.deskLampLight.position.set(-0.5, 1.5, -0.3);
        this.deskLampLight.target.position.set(-0.5, 0, -0.3);
        this.deskLampLight.castShadow = true;
        this.deskLampLight.shadow.mapSize.width = 1024;
        this.deskLampLight.shadow.mapSize.height = 1024;
        this.deskLampLight.shadow.bias = -0.001;
        this.scene.add(this.deskLampLight);
        this.scene.add(this.deskLampLight.target);
    }
    
    // Load all assets
    async loadAssets() {
        try {
            // First attempt to load models from the configuration
            const modelResult = await this.assetLoader.loadModelsFromConfig();
            
            if (modelResult) {
                // If we successfully loaded models from config
                this.models = modelResult.models;
                console.log('Loaded models:', this.models);
                
                // Set references to specific models for easy access
                this.desk = this.models.desk || this.assetLoader.createPlaceholder('desk');
                this.chair = this.models.chair || this.assetLoader.createPlaceholder('chair');
                this.monitor = this.models.monitor || this.assetLoader.createPlaceholder('monitor');
                this.keyboard = this.models.keyboard || this.assetLoader.createPlaceholder('keyboard');
                this.mouse = this.models.mouse || this.assetLoader.createPlaceholder('mouse');
                this.lamp = this.models.lamp || this.assetLoader.createPlaceholder('lamp');
                this.bookshelf = this.models.bookshelf || this.assetLoader.createPlaceholder('bookshelf');
                this.plant = this.models.plant || this.assetLoader.createPlaceholder('plant');
                
                // Set positions based on the configuration
                if (this.desk) this.desk.position.set(0, 0.75, 0);
                if (this.chair) this.chair.position.set(0, 0.4, 0.7);
                if (this.monitor) this.monitor.position.set(0, 0.78, -0.2);
                if (this.keyboard) this.keyboard.position.set(0, 0.775, 0.1);
                if (this.mouse) this.mouse.position.set(0.4, 0.775, 0.1);
                if (this.lamp) this.lamp.position.set(-0.5, 0.75, -0.3);
                if (this.bookshelf) this.bookshelf.position.set(-4.5, 0.75, -4.5);
                if (this.bookshelf) this.bookshelf.rotation.y = 0;
                if (this.plant) this.plant.position.set(0.5, 0.8, -0.3);
                
                // Add additional items if they were in the config
                if (this.models.coffee_cup) {
                    this.coffee_cup = this.models.coffee_cup;
                    this.coffee_cup.position.set(0.3, 0.775, 0.0);
                }
                
                if (this.models.notebook) {
                    this.notebook = this.models.notebook;
                    this.notebook.position.set(-0.3, 0.775, 0.0);
                }
                
                // Find the monitor screen for interaction
                if (this.monitor) {
                    this.monitorScreen = null;
                    this.monitor.traverse(child => {
                        if (child.userData && child.userData.clickable) {
                            this.monitorScreen = child;
                        }
                    });
                    
                    // If no clickable screen was found, try to find it by other means
                    if (!this.monitorScreen) {
                        this.monitorScreen = this.assetLoader.findScreenInModel(this.monitor);
                        if (this.monitorScreen) {
                            this.monitorScreen.userData.clickable = true;
                        }
                    }
                }
            } else {
                // If loading failed, create placeholders as fallback
                console.log('Using placeholder models as fallback');
                this.createPlaceholderAssets();
            }
        } catch (error) {
            console.error('Error loading assets:', error);
            // Create placeholder assets as fallback
            this.createPlaceholderAssets();
        }
        
        // Create the floor and walls
        this.createEnvironment();
    }

    // Create placeholder assets if model loading fails
    createPlaceholderAssets() {
        // Create furniture using the placeholder models
        this.desk = this.assetLoader.createPlaceholder('desk');
        this.desk.position.set(0, 0.75, 0);
        
        // Fix chair position and rotation
        this.chair = this.assetLoader.createPlaceholder('chair');
        this.chair.position.set(0, 0.4, 0.7); // Moved back a bit to better align with desk
        this.chair.rotation.y = Math.PI; // Rotate to face the desk
        
        this.monitor = this.assetLoader.createPlaceholder('monitor');
        this.monitor.position.set(0, 0.78, -0.2);
        
        this.keyboard = this.assetLoader.createPlaceholder('keyboard');
        this.keyboard.position.set(0, 0.775, 0.1);
        
        this.mouse = this.assetLoader.createPlaceholder('mouse');
        this.mouse.position.set(0.4, 0.775, 0.1);
        
        // Set the monitor screen as clickable
        this.monitorScreen = this.monitor.children.find(child => child.userData.clickable);
        
        // Add a desk lamp
        this.lamp = this.assetLoader.createPlaceholder('lamp');
        this.lamp.position.set(-0.5, 0.75, -0.3);
        
        // Fix bookshelf position - move it to a more natural location against the wall
        this.bookshelf = this.assetLoader.createPlaceholder('bookshelf');
        this.bookshelf.position.set(-4.5, 0.75, -4.5);
        this.bookshelf.rotation.y = 0; // Align with the wall
        
        // Add a small plant
        this.plant = new THREE.Group();
        
        // Pot
        const potGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.12, 16);
        const potMaterial = new THREE.MeshStandardMaterial({ color: 0xA86032 });
        const pot = new THREE.Mesh(potGeometry, potMaterial);
        this.plant.add(pot);
        
        // Soil
        const soilGeometry = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16);
        const soilMaterial = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
        const soil = new THREE.Mesh(soilGeometry, soilMaterial);
        soil.position.y = 0.06;
        this.plant.add(soil);
        
        // Plant leaves
        for (let i = 0; i < 5; i++) {
            const leafGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            leafGeometry.scale(1, 1.5, 1);
            const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            
            const angle = (i / 5) * Math.PI * 2;
            const radius = 0.05;
            leaf.position.x = Math.cos(angle) * radius;
            leaf.position.z = Math.sin(angle) * radius;
            leaf.position.y = 0.12 + Math.random() * 0.05;
            leaf.rotation.x = Math.random() * 0.2 - 0.1;
            leaf.rotation.z = Math.random() * 0.2 - 0.1;
            
            this.plant.add(leaf);
        }
        
        // Position the plant on the desk
        this.plant.position.set(0.5, 0.8, -0.3);
        this.plant.scale.set(0.8, 0.8, 0.8);
        
        // Add a small rug under the desk
        this.createRug();
        
        // Add a wall picture
        this.createWallPicture();
    }

    // Create environment elements (floor and walls)
    createEnvironment() {
        // Add the base environment (existing code)
        this.createBaseEnvironment();
        // Add holographic coding elements
        this.createHolographicElements();
        // Add ambient audio visualizer
        this.createAudioVisualizer();
        // Add digital workspace elements
        this.createDigitalWorkspace();
    }
    
    // Create the basic environment (floor, walls, ceiling)
    createBaseEnvironment() {
        // Create the floor with better texture
        const floorSize = 10;
        const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
        
        // Create a textured floor using a warm wooden pattern
        const floorCanvas = document.createElement('canvas');
        floorCanvas.width = 512;
        floorCanvas.height = 512;
        const ctx = floorCanvas.getContext('2d');
        
        // Fill the background with a warm wood tone
        ctx.fillStyle = '#754c28';
        ctx.fillRect(0, 0, 512, 512);
        
        // Draw wood grain patterns
        ctx.strokeStyle = '#5a371f';
        ctx.lineWidth = 2;
        
        // Create random wood grain patterns
        for (let i = 0; i < 40; i++) {
            const y = Math.random() * 512;
            const length = Math.random() * 400 + 100;
            const curve = Math.random() * 50 - 25;
            
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(
                200, y + curve, 
                400, y - curve, 
                length, y + (Math.random() * 20 - 10)
            );
            ctx.stroke();
        }
        
        // Add some knots in the wood
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 472 + 20;
            const y = Math.random() * 472 + 20;
            const size = Math.random() * 15 + 5;
            
            // Draw the knot
            ctx.fillStyle = '#513016';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add rings around the knot
            ctx.strokeStyle = '#3e2512';
            ctx.lineWidth = 1;
            for (let j = 1; j <= 3; j++) {
                ctx.beginPath();
                ctx.arc(x, y, size + j * 2, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        // Add subtle digital lines that glow - representing "code" in the floor
        ctx.strokeStyle = 'rgba(0, 200, 170, 0.07)';
        ctx.lineWidth = 3;
        
        for (let i = 0; i < 15; i++) {
            const startX = Math.random() * 512;
            const startY = Math.random() * 512;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            
            let currentX = startX;
            let currentY = startY;
            
            // Create a segment with 90-degree turns like circuit boards
            for (let j = 0; j < 5; j++) {
                // Choose horizontal or vertical movement
                if (Math.random() > 0.5) {
                    currentX += (Math.random() * 100 - 50);
                } else {
                    currentY += (Math.random() * 100 - 50);
                }
                
                ctx.lineTo(currentX, currentY);
            }
            
            ctx.stroke();
        }
        
        const floorTexture = new THREE.CanvasTexture(floorCanvas);
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(2, 2);
        
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            map: floorTexture,
            roughness: 0.7, 
            metalness: 0.1
        });
        
        this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.receiveShadow = true;
        this.floor.position.y = 0;
        
        // Create walls with a more tech-oriented aesthetic
        const wallCanvas = document.createElement('canvas');
        wallCanvas.width = 512;
        wallCanvas.height = 512;
        const wallCtx = wallCanvas.getContext('2d');
        
        // Create a gradient background for walls
        const gradient = wallCtx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#1a1a2e');  // Deep blue at top
        gradient.addColorStop(1, '#16213e');  // Midnight blue at bottom
        wallCtx.fillStyle = gradient;
        wallCtx.fillRect(0, 0, 512, 512);
        
        // Add subtle digital circuit patterns
        wallCtx.strokeStyle = 'rgba(64, 224, 208, 0.05)';  // Subtle teal
        wallCtx.lineWidth = 1;
        
        // Create circuit-like patterns
        for (let i = 0; i < 20; i++) {
            let x = Math.random() * 512;
            let y = Math.random() * 512;
            
            wallCtx.beginPath();
            wallCtx.moveTo(x, y);
            
            // Create a series of right-angle turns
            for (let j = 0; j < 8; j++) {
                if (Math.random() > 0.5) {
                    x += (Math.random() * 80 - 40);
                } else {
                    y += (Math.random() * 80 - 40);
                }
                
                wallCtx.lineTo(x, y);
            }
            
            wallCtx.stroke();
            
            // Add circuit nodes at some points
            if (Math.random() > 0.7) {
                wallCtx.fillStyle = 'rgba(64, 224, 208, 0.1)';
                wallCtx.beginPath();
                wallCtx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
                wallCtx.fill();
            }
        }
        
        // Add some binary code patterns in the background
        wallCtx.fillStyle = 'rgba(100, 255, 218, 0.03)';
        wallCtx.font = '8px monospace';
        
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 492 + 10;
            const y = Math.random() * 492 + 10;
            const binary = Math.random() > 0.5 ? "1" : "0";
            wallCtx.fillText(binary, x, y);
        }
        
        const wallTexture = new THREE.CanvasTexture(wallCanvas);
        wallTexture.wrapS = THREE.RepeatWrapping;
        wallTexture.wrapT = THREE.RepeatWrapping;
        wallTexture.repeat.set(2, 1);
        
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            map: wallTexture,
            roughness: 0.8, 
            metalness: 0.3
        });
        
        // Back wall
        const backWallGeometry = new THREE.PlaneGeometry(10, 4);
        this.backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
        this.backWall.position.z = -5;
        this.backWall.position.y = 2;
        this.backWall.receiveShadow = true;
        
        // Left wall
        const leftWallGeometry = new THREE.PlaneGeometry(10, 4);
        this.leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
        this.leftWall.position.x = -5;
        this.leftWall.position.y = 2;
        this.leftWall.rotation.y = Math.PI / 2;
        this.leftWall.receiveShadow = true;
        
        // Right wall
        const rightWallGeometry = new THREE.PlaneGeometry(10, 4);
        this.rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
        this.rightWall.position.x = 5;
        this.rightWall.position.y = 2;
        this.rightWall.rotation.y = -Math.PI / 2;
        this.rightWall.receiveShadow = true;
        
        // Add ceiling with subtle texture
        const ceilingGeometry = new THREE.PlaneGeometry(10, 10);
        
        // Create ceiling texture
        const ceilingCanvas = document.createElement('canvas');
        ceilingCanvas.width = 512;
        ceilingCanvas.height = 512;
        const ceilingCtx = ceilingCanvas.getContext('2d');
        
        // Fill with dark color
        ceilingCtx.fillStyle = '#0f0f1a';
        ceilingCtx.fillRect(0, 0, 512, 512);
        
        // Add subtle star-like dots
        ceilingCtx.fillStyle = 'rgba(200, 200, 255, 0.4)';
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 1 + 0.5;
            ceilingCtx.beginPath();
            ceilingCtx.arc(x, y, size, 0, Math.PI * 2);
            ceilingCtx.fill();
        }
        
        // Add a few subtle glowing areas
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = 20 + Math.random() * 40;
            
            const glow = ceilingCtx.createRadialGradient(x, y, 0, x, y, radius);
            glow.addColorStop(0, 'rgba(100, 200, 255, 0.1)');
            glow.addColorStop(1, 'rgba(100, 200, 255, 0)');
            
            ceilingCtx.fillStyle = glow;
            ceilingCtx.beginPath();
            ceilingCtx.arc(x, y, radius, 0, Math.PI * 2);
            ceilingCtx.fill();
        }
        
        const ceilingTexture = new THREE.CanvasTexture(ceilingCanvas);
        ceilingTexture.wrapS = THREE.RepeatWrapping;
        ceilingTexture.wrapT = THREE.RepeatWrapping;
        ceilingTexture.repeat.set(2, 2);
        
        const ceilingMaterial = new THREE.MeshStandardMaterial({ 
            map: ceilingTexture,
            roughness: 0.8,
            metalness: 0.2
        });
        
        this.ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        this.ceiling.position.y = 4;
        this.ceiling.rotation.x = Math.PI / 2;
        
        // Add baseboards
        this.createBaseboards();
        
        // Add window
        this.createWindow();
        
        // Add ceiling light
        this.createCeilingLight();
        
        // Add rug
        this.scene.add(this.rug);
    }
    
    // Create holographic floating elements that represent code and algorithms
    createHolographicElements() {
        this.hologramElements = [];
        
        // Create a floating holographic "screen" that displays code snippets
        const createHolographicScreen = (x, y, z, width, height) => {
            // Create a floating screen geometry
            const screenGeometry = new THREE.PlaneGeometry(width, height);
            
            // Create a canvas for the code display
            const codeCanvas = document.createElement('canvas');
            codeCanvas.width = 512;
            codeCanvas.height = 512;
            const ctx = codeCanvas.getContext('2d');
            
            // Fill background
            ctx.fillStyle = 'rgba(10, 20, 40, 0.01)';
            ctx.fillRect(0, 0, 512, 512);
            
            // Add code-like lines
            const codeLines = [
                'const generateResponse = async (prompt) => {',
                '  const aiModel = selectModel("vibeGPT-4");',
                '  const context = { mode: "creative", temperature: 0.8 };',
                '  const response = await aiModel.process(prompt, context);',
                '  return refineOutput(response, prompt);',
                '};',
                '',
                'function optimizeUIcomponents() {',
                '  const elements = document.getElementByClass("vibe-ui");',
                '  elements.forEach(e => applyNeumorphism(e));',
                '  return trackPerformance();',
                '}',
                '',
                'class VibeCode extends Framework {',
                '  constructor(config) {',
                '    super();',
                '    this.aiAssistant = new AIHelper(config);',
                '    this.theme = "synthwave";',
                '  }',
                '',
                '  generateComponent(spec) {',
                '    return this.aiAssistant.createComponent(spec);',
                '  }',
                '}'
            ];
            
            // Draw code with syntax highlighting
            ctx.font = '14px monospace';
            ctx.textBaseline = 'top';
            
            let yPos = 20;
            for (let line of codeLines) {
                // Basic syntax highlighting
                if (line.includes('class') || line.includes('function') || line.includes('const')) {
                    ctx.fillStyle = 'rgba(130, 210, 255, 0.8)';
                } else if (line.includes('return')) {
                    ctx.fillStyle = 'rgba(255, 150, 150, 0.8)';
                } else if (line.includes('{') || line.includes('}')) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                } else if (line.includes('=')) {
                    ctx.fillStyle = 'rgba(180, 255, 180, 0.8)';
                } else {
                    ctx.fillStyle = 'rgba(200, 200, 255, 0.7)';
                }
                
                ctx.fillText(line, 20, yPos);
                yPos += 22;
            }
            
            // Create glowing edges
            ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.strokeRect(2, 2, 508, 508);
            
            // Add active cursor
            const cursorY = 20 + (Math.floor(Math.random() * codeLines.length) * 22);
            const cursorX = 20 + (Math.random() * 300);
            ctx.fillStyle = 'rgba(200, 255, 200, 0.8)';
            ctx.fillRect(cursorX, cursorY, 8, 16);
            
            // Create the texture
            const codeTexture = new THREE.CanvasTexture(codeCanvas);
            
            // Create material with transparency for holographic effect
            const codeMaterial = new THREE.MeshBasicMaterial({
                map: codeTexture,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide,
            });
            
            // Create the screen mesh
            const screen = new THREE.Mesh(screenGeometry, codeMaterial);
            screen.position.set(x, y, z);
            
            // Add to scene
            this.scene.add(screen);
            
            // Add a soft blue glow light
            const glow = new THREE.PointLight(0x66ccff, 0.5, 2);
            glow.position.set(x, y, z);
            this.scene.add(glow);
            
            return { screen, glow };
        };
        
        // Create floating holograms at various positions
        const hologram1 = createHolographicScreen(2.5, 1.8, -3, 1.2, 1);
        const hologram2 = createHolographicScreen(-2.5, 2.2, -3, 0.8, 1.2);
        
        this.hologramElements.push(hologram1.screen, hologram2.screen);
        
        // Create floating particles that move between the holograms
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 50;
        const positionArray = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            // Random positions in the room
            positionArray[i * 3] = (Math.random() - 0.5) * 8;
            positionArray[i * 3 + 1] = Math.random() * 3 + 0.5;
            positionArray[i * 3 + 2] = (Math.random() - 0.5) * 8;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            color: 0x00ffaa,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.dataParticles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.dataParticles);
        
        // Create data streams - curved lines connecting different areas
        const createDataStream = (start, end, color, segments = 100) => {
            const points = [];
            const midY = Math.max(start.y, end.y) + Math.random() * 0.5;
            const midPoint = new THREE.Vector3(
                (start.x + end.x) / 2 + (Math.random() - 0.5) * 0.5,
                midY,
                (start.z + end.z) / 2 + (Math.random() - 0.5) * 0.5
            );
            
            // Create a curve from start to end passing through midPoint
            const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
            
            // Create points along the curve
            for (let i = 0; i <= segments; i++) {
                points.push(curve.getPoint(i / segments));
            }
            
            // Create a tube geometry along the curve
            const tubeGeometry = new THREE.TubeGeometry(
                new THREE.CatmullRomCurve3(points),
                segments,
                0.01,
                8,
                false
            );
            
            // Create a material with glow effect
            const tubeMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.5,
                blending: THREE.AdditiveBlending
            });
            
            const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
            this.scene.add(tube);
            
            return tube;
        };
        
        // Create several data streams connecting different elements
        const dataStreams = [
            createDataStream(
                new THREE.Vector3(0, 1.2, -0.1), // Monitor position
                hologram1.screen.position, 
                0x00ffcc
            ),
            createDataStream(
                new THREE.Vector3(0, 1.2, -0.1), // Monitor position
                hologram2.screen.position, 
                0x66aaff
            ),
            createDataStream(
                hologram1.screen.position,
                hologram2.screen.position,
                0xff66aa
            )
        ];
        
        // Store reference to the holographic elements
        this.hologramDataStreams = dataStreams;
    }
    
    // Create an audio visualizer that responds to ambient lo-fi music
    createAudioVisualizer() {
        // Create a visualizer in a corner of the room
        const visualizerGroup = new THREE.Group();
        visualizerGroup.position.set(-4, 1.5, -4);
        visualizerGroup.rotation.y = Math.PI / 4;
        
        // Create bars for the visualizer
        const barCount = 16;
        const barWidth = 0.04;
        const barMaxHeight = 1.0;
        const barSpacing = 0.06;
        this.visualizerBars = [];
        
        for (let i = 0; i < barCount; i++) {
            // Random initial height
            const height = Math.random() * barMaxHeight * 0.5;
            const barGeometry = new THREE.BoxGeometry(barWidth, height, barWidth);
            
            // Create gradient material
            const barMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(i / barCount, 0.8, 0.6),
                transparent: true,
                opacity: 0.7
            });
            
            const bar = new THREE.Mesh(barGeometry, barMaterial);
            
            // Position bars in a line
            bar.position.x = (i - barCount / 2) * (barWidth + barSpacing);
            bar.position.y = height / 2;
            
            // Store the bar's original properties
            bar.userData.originalHeight = height;
            bar.userData.targetHeight = height;
            
            visualizerGroup.add(bar);
            this.visualizerBars.push(bar);
        }
        
        // Add a base for the visualizer
        const baseGeometry = new THREE.BoxGeometry(
            barCount * (barWidth + barSpacing),
            0.05,
            barWidth * 2
        );
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.3,
            metalness: 0.7
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -0.025;
        visualizerGroup.add(base);
        
        // Add the visualizer to the scene
        this.scene.add(visualizerGroup);
        this.visualizerGroup = visualizerGroup;
    }
    
    // Create digital workspace elements like screens, projections, etc.
    createDigitalWorkspace() {
        // Create a small display with animated code metrics/stats
        const metricsGroup = new THREE.Group();
        metricsGroup.position.set(-2, 1.2, -4.8);
        
        // Screen frame
        const frameGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.05);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.2,
            metalness: 0.8
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        metricsGroup.add(frame);
        
        // Screen display
        const screenGeometry = new THREE.PlaneGeometry(1.1, 0.7);
        
        // Create screen content
        const screenCanvas = document.createElement('canvas');
        screenCanvas.width = 512;
        screenCanvas.height = 324;
        const ctx = screenCanvas.getContext('2d');
        
        // Create the initial screen content
        const updateScreenContent = () => {
            // Background
            ctx.fillStyle = '#0a1622';
            ctx.fillRect(0, 0, 512, 324);
            
            // Draw grid lines
            ctx.strokeStyle = '#1e3146';
            ctx.lineWidth = 1;
            
            // Vertical grid lines
            for (let x = 0; x <= 512; x += 32) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, 324);
                ctx.stroke();
            }
            
            // Horizontal grid lines
            for (let y = 0; y <= 324; y += 32) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(512, y);
                ctx.stroke();
            }
            
            // Draw header
            ctx.fillStyle = '#66aaff';
            ctx.font = 'bold 16px monospace';
            ctx.fillText('VIBE CODING METRICS', 20, 30);
            
            // Draw divider
            ctx.strokeStyle = '#66aaff';
            ctx.beginPath();
            ctx.moveTo(20, 40);
            ctx.lineTo(492, 40);
            ctx.stroke();
            
            // Draw metrics
            ctx.fillStyle = '#aaccff';
            ctx.font = '14px monospace';
            
            const metrics = [
                { label: 'Lines Generated:', value: Math.floor(Math.random() * 100000) },
                { label: 'Bugs Fixed:', value: Math.floor(Math.random() * 1000) },
                { label: 'AI Model:', value: 'VibeGPT-4.5' },
                { label: 'Code Quality:', value: `${(Math.random() * 2 + 8).toFixed(1)}/10` },
                { label: 'Projects Completed:', value: Math.floor(Math.random() * 20) },
                { label: 'Revenue:', value: `$${Math.floor(Math.random() * 100000)}` }
            ];
            
            let yPos = 70;
            for (const metric of metrics) {
                ctx.fillStyle = '#aaccff';
                ctx.fillText(metric.label, 30, yPos);
                ctx.fillStyle = '#66ffaa';
                ctx.fillText(metric.value.toString(), 240, yPos);
                yPos += 30;
            }
            
            // Draw a small chart
            ctx.strokeStyle = '#ff66aa';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(30, 260);
            
            // Generate a random chart
            for (let x = 0; x < 10; x++) {
                const xPos = 30 + x * 48;
                const yPos = 260 - Math.random() * 40 - 40;
                ctx.lineTo(xPos, yPos);
            }
            
            ctx.stroke();
            
            // Label the chart
            ctx.fillStyle = '#ff66aa';
            ctx.font = '12px monospace';
            ctx.fillText('Productivity Trend', 30, 280);
            
            // Add blinking dots to simulate activity
            ctx.fillStyle = Math.random() > 0.5 ? '#66ffaa' : '#66aaff';
            ctx.beginPath();
            ctx.arc(490, 20, 4, 0, Math.PI * 2);
            ctx.fill();
            
            return new THREE.CanvasTexture(screenCanvas);
        };
        
        // Initial texture
        const screenTexture = updateScreenContent();
        const screenMaterial = new THREE.MeshBasicMaterial({ map: screenTexture });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.z = 0.03;
        metricsGroup.add(screen);
        
        // Store references for animation updates
        this.metricsScreen = screen;
        this.updateScreenContent = updateScreenContent;
        
        this.scene.add(metricsGroup);
    }
    
    // Set up the scene with loaded assets
    setupScene() {
        // Add floor, walls, and ceiling
        this.scene.add(this.floor);
        this.scene.add(this.backWall);
        this.scene.add(this.leftWall);
        this.scene.add(this.rightWall);
        this.scene.add(this.ceiling);
        
        // Add rug if it was created
        if (this.rug) {
            this.scene.add(this.rug);
        }
        
        // Add furniture
        this.scene.add(this.desk);
        this.scene.add(this.chair);
        this.scene.add(this.monitor);
        this.scene.add(this.keyboard);
        this.scene.add(this.mouse);
        this.scene.add(this.lamp);
        this.scene.add(this.bookshelf);
        this.scene.add(this.plant);
        
        // Add additional items if they exist
        if (this.coffee_cup) this.scene.add(this.coffee_cup);
        if (this.notebook) this.scene.add(this.notebook);
        
        // Create additional vibe coder elements
        this.createPlants();
        this.createMusicElements();
        this.createAmbientDecorations();
        this.createMoodLighting();
        
        // Add new futuristic vibe coding elements
        this.createHolographicElements();
        this.createAudioVisualizer();
        this.createDigitalWorkspace();
        
        // Set up raycasting for interaction
        this.raycaster = new THREE.Raycaster();
        this.mousePosition = new THREE.Vector2();
        
        // Event listener for clicking on 3D objects
        window.addEventListener('click', (event) => {
            this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mousePosition, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children, true);
            
            for (let i = 0; i < intersects.length; i++) {
                const object = intersects[i].object;
                if (object.userData.clickable) {
                    this.ui.toggleComputerScreen();
                    break;
                }
            }
        });
        
        // Add hover effect on clickable objects
        window.addEventListener('mousemove', (event) => {
            this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mousePosition, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children, true);
            
            let hoveredClickable = false;
            
            for (let i = 0; i < intersects.length; i++) {
                const object = intersects[i].object;
                if (object.userData.clickable) {
                    hoveredClickable = true;
                    document.body.style.cursor = 'pointer';
                    break;
                }
            }
            
            if (!hoveredClickable) {
                document.body.style.cursor = 'default';
            }
        });
    }
    
    // Set up animations with new futuristic elements
    setupAnimations() {
        // Original animations
        this.animationManager.addKeyboardTypingAnimation(this.keyboard);
        this.animationManager.addBreathingAnimation(this.plant, { speed: 0.5, intensity: 0.03 });
        
        if (this.additionalPlants) {
            this.additionalPlants.forEach(plant => {
                this.animationManager.addBreathingAnimation(plant, { 
                    speed: 0.3 + Math.random() * 0.4, 
                    intensity: 0.02 + Math.random() * 0.02 
                });
            });
        }
        
        if (this.lofiElements) {
            this.lofiElements.forEach(element => {
                this.animationManager.addFloatingAnimation(element, {
                    speed: 0.2 + Math.random() * 0.3,
                    height: 0.02 + Math.random() * 0.03
                });
            });
        }
        
        if (this.recordPlayer && this.recordPlayer.disc) {
            this.animationManager.addRotationAnimation(this.recordPlayer.disc, {
                axis: 'y', 
                speed: 0.3
            });
        }
        
        if (this.ledStrips) {
            this.ledStrips.forEach(led => {
                this.animationManager.addColorCycleAnimation(led, {
                    speed: 0.3,
                    colors: [0xff0066, 0x00aaff, 0x00ff99, 0xffaa00]
                });
            });
        }
        
        // New animations for holographic elements
        if (this.hologramElements) {
            this.hologramElements.forEach(hologram => {
                this.animationManager.addFloatingAnimation(hologram, {
                    speed: 0.1 + Math.random() * 0.1,
                    height: 0.02 + Math.random() * 0.02,
                    axis: Math.random() > 0.5 ? 'y' : 'x'
                });
            });
        }
        
        // Animate the data particles that float between holograms
        if (this.dataParticles) {
            // Custom animation for particles
            const particleAnimation = {
                object: this.dataParticles,
                type: 'custom',
                active: true,
                speed: 0.2,
                update: (deltaTime) => {
                    if (!particleAnimation.active) return;
                    
                    const positions = this.dataParticles.geometry.attributes.position.array;
                    const time = this.animationManager.clock.getElapsedTime();
                    
                    for (let i = 0; i < positions.length; i += 3) {
                        // Move particles along the y-axis with varying speeds
                        positions[i + 1] += deltaTime * (0.1 + Math.sin(time + i/3) * 0.1);
                        
                        // Add some subtle x and z movement
                        positions[i] += deltaTime * Math.sin(time * 0.5 + i/3) * 0.05;
                        positions[i + 2] += deltaTime * Math.cos(time * 0.5 + i/3) * 0.05;
                        
                        // Reset particles that go too high
                        if (positions[i + 1] > 4) {
                            positions[i + 1] = 0.5;
                            positions[i] = (Math.random() - 0.5) * 8;
                            positions[i + 2] = (Math.random() - 0.5) * 8;
                        }
                    }
                    
                    this.dataParticles.geometry.attributes.position.needsUpdate = true;
                }
            };
            
            this.animationManager.animations.push(particleAnimation);
        }
        
        // Audio visualizer animation
        if (this.visualizerBars) {
            // Custom animation for the audio visualizer bars
            const visualizerAnimation = {
                object: this.visualizerBars,
                type: 'custom',
                active: true,
                speed: 1.0,
                update: (deltaTime) => {
                    if (!visualizerAnimation.active) return;
                    
                    const time = this.animationManager.clock.getElapsedTime();
                    
                    this.visualizerBars.forEach((bar, index) => {
                        // Generate a pseudo-random height based on time and position
                        const targetHeight = 0.2 + Math.abs(Math.sin(time * 2 + index * 0.2)) * 0.8;
                        
                        // Smoothly interpolate to target height
                        bar.scale.y += (targetHeight - bar.scale.y) * deltaTime * 5;
                        
                        // Update position based on new scale to keep base aligned
                        bar.position.y = bar.scale.y * bar.userData.originalHeight / 2;
                        
                        // Update color based on height
                        bar.material.color.setHSL(
                            (index / this.visualizerBars.length) + time * 0.05, 
                            0.7, 
                            0.4 + bar.scale.y * 0.3
                        );
                    });
                }
            };
            
            this.animationManager.animations.push(visualizerAnimation);
        }
        
        // Metrics screen updates
        if (this.metricsScreen) {
            const metricsAnimation = {
                object: this.metricsScreen,
                type: 'custom',
                active: true,
                timeCounter: 0,
                updateInterval: 3, // seconds between updates
                update: (deltaTime) => {
                    if (!metricsAnimation.active) return;
                    
                    metricsAnimation.timeCounter += deltaTime;
                    
                    if (metricsAnimation.timeCounter >= metricsAnimation.updateInterval) {
                        metricsAnimation.timeCounter = 0;
                        
                        // Update the screen texture
                        this.metricsScreen.material.map = this.updateScreenContent();
                        this.metricsScreen.material.map.needsUpdate = true;
                    }
                }
            };
            
            this.animationManager.animations.push(metricsAnimation);
        }
        
        // Enhanced keyboard lighting
        const keyboardLighting = {
            object: this.keyboard,
            type: 'custom',
            active: true,
            lastKeyTime: 0,
            keyDelay: 0.1, // time between key presses
            update: (deltaTime) => {
                if (!keyboardLighting.active) return;
                
                const time = this.animationManager.clock.getElapsedTime();
                
                // Simulate random key presses
                if (time - keyboardLighting.lastKeyTime > keyboardLighting.keyDelay) {
                    keyboardLighting.lastKeyTime = time;
                    keyboardLighting.keyDelay = 0.05 + Math.random() * 0.2; // random timing between keys
                    
                    // Add a point light at a random position on the keyboard to simulate a key press
                    if (!this.keyLights) this.keyLights = [];
                    
                    // Create a new light or reuse an existing one
                    let keyLight;
                    const inactiveLight = this.keyLights.find(light => !light.active);
                    
                    if (inactiveLight) {
                        keyLight = inactiveLight;
                        keyLight.active = true;
                    } else {
                        keyLight = new THREE.PointLight(0x66ffaa, 1, 0.2);
                        keyLight.active = true;
                        keyLight.life = 0;
                        this.scene.add(keyLight);
                        this.keyLights.push(keyLight);
                    }
                    
                    // Position the light randomly on the keyboard
                    const randomX = (Math.random() - 0.5) * 0.4;
                    const randomZ = (Math.random() - 0.5) * 0.2;
                    keyLight.position.set(
                        this.keyboard.position.x + randomX,
                        this.keyboard.position.y + 0.02,
                        this.keyboard.position.z + randomZ
                    );
                    keyLight.life = 0;
                }
                
                // Update key lights
                if (this.keyLights) {
                    this.keyLights.forEach(light => {
                        if (light.active) {
                            light.life += deltaTime * 5;
                            light.intensity = Math.max(0, 1 - light.life);
                            
                            if (light.life >= 1) {
                                light.active = false;
                            }
                        }
                    });
                }
            }
        };
        
        this.animationManager.animations.push(keyboardLighting);
    }
    
    // Animation loop
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update animations
        this.animationManager.update();
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    // Create plants to enhance the environment
    createPlants() {
        // Create a monstera plant for the corner
        const monsterPlant = new THREE.Group();
        
        // Create a larger pot for the monstera
        const potGeometry = new THREE.CylinderGeometry(0.3, 0.25, 0.35, 16);
        const potMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x5D4037, 
            roughness: 0.8,
            metalness: 0.1
        });
        const pot = new THREE.Mesh(potGeometry, potMaterial);
        monsterPlant.add(pot);
        
        // Add soil
        const soilGeometry = new THREE.CylinderGeometry(0.29, 0.29, 0.05, 16);
        const soilMaterial = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
        const soil = new THREE.Mesh(soilGeometry, soilMaterial);
        soil.position.y = 0.15;
        monsterPlant.add(soil);
        
        // Create a stem
        const stemGeometry = new THREE.CylinderGeometry(0.03, 0.05, 0.6, 8);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x7D5A4F });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.45;
        monsterPlant.add(stem);
        
        // Create monstera leaves (larger, split leaves)
        for (let i = 0; i < 6; i++) {
            const leafGroup = new THREE.Group();
            
            // Create main leaf shape
            const leafGeometry = new THREE.PlaneGeometry(0.4, 0.5, 5, 5);
            
            // Manipulate vertices to create monstera leaf shape
            const positions = leafGeometry.attributes.position.array;
            for (let j = 0; j < positions.length; j += 3) {
                const x = positions[j];
                const y = positions[j+1];
                
                // Create leaf shape
                if (x > 0) {
                    positions[j] += Math.sin(y * 10) * 0.03;
                } else {
                    positions[j] -= Math.sin(y * 10) * 0.03;
                }
                
                // Create splits in the leaf
                if (y > 0.2 && Math.abs(x) < 0.15) {
                    positions[j+2] += Math.abs(x) * 0.2;
                }
            }
            
            leafGeometry.computeVertexNormals();
            
            const leafMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x2E7D32, 
                roughness: 0.8,
                metalness: 0.0,
                side: THREE.DoubleSide
            });
            
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            
            // Position leaf around the stem
            const angle = (i / 6) * Math.PI * 2;
            const height = 0.3 + Math.random() * 0.4;
            
            leaf.position.y = height;
            leafGroup.position.x = Math.cos(angle) * 0.15;
            leafGroup.position.z = Math.sin(angle) * 0.15;
            
            // Rotate leaf to look natural
            leaf.rotation.x = Math.PI / 2 + (Math.random() * 0.2 - 0.1);
            leafGroup.rotation.y = angle;
            
            leafGroup.add(leaf);
            monsterPlant.add(leafGroup);
        }
        
        // Position the monstera plant in the corner
        monsterPlant.position.set(3.5, 0, -3.5);
        this.scene.add(monsterPlant);
        
        // Add the monstera to our additional plants array for animations
        if (!this.additionalPlants) this.additionalPlants = [];
        this.additionalPlants.push(monsterPlant);
        
        // Create small potted succulents
        this.createSucculents();
        
        // Create hanging plant
        this.createHangingPlant();
    }
    
    // Create small potted succulents
    createSucculents() {
        // Create small potted succulents for desk/shelf
        for (let i = 0; i < 2; i++) {
            const succulent = new THREE.Group();
            
            // Create small pot
            const potGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.1, 12);
            const potColors = [0xE0E0E0, 0xBDBDBD, 0x795548];
            const potMaterial = new THREE.MeshStandardMaterial({ 
                color: potColors[i % potColors.length], 
                roughness: 0.7
            });
            const pot = new THREE.Mesh(potGeometry, potMaterial);
            succulent.add(pot);
            
            // Add soil
            const soilGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.02, 12);
            const soilMaterial = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
            const soil = new THREE.Mesh(soilGeometry, soilMaterial);
            soil.position.y = 0.05;
            succulent.add(soil);
            
            // Create succulent leaves in a rosette pattern
            const leafColors = [0x66BB6A, 0x81C784, 0x4CAF50];
            const leafCount = 8 + Math.floor(Math.random() * 5);
            
            for (let j = 0; j < leafCount; j++) {
                // Middle tier leaves
                const leafColor = leafColors[j % leafColors.length];
                this.createSucculentLeaf(succulent, j, leafCount, 0.06, 0.03, 0.07, leafColor);
                
                // If not the first few leaves, add outer leaves
                if (j > 2) {
                    this.createSucculentLeaf(succulent, j, leafCount, 0.08, 0.02, 0.1, leafColor);
                }
                
                // If one of the first leaves, add inner leaves
                if (j < 4) {
                    this.createSucculentLeaf(succulent, j, 4, 0.04, 0.04, 0.12, leafColor);
                }
            }
            
            // Position the succulent
            if (i === 0) {
                // One on the desk
                succulent.position.set(-0.4, 0.77, -0.3);
            } else {
                // One on the bookshelf
                succulent.position.set(-4.3, 2.2, -4.6);
            }
            
            succulent.scale.set(0.8, 0.8, 0.8);
            this.scene.add(succulent);
            
            if (!this.additionalPlants) this.additionalPlants = [];
            this.additionalPlants.push(succulent);
        }
    }
    
    // Helper method to create succulent leaf
    createSucculentLeaf(parent, index, totalLeaves, length, width, height, color) {
        const angle = (index / totalLeaves) * Math.PI * 2;
        
        const leafGeometry = new THREE.ConeGeometry(width, length, 8);
        const leafMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.7
        });
        
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        
        leaf.rotation.x = Math.PI / 2 - 0.6; // Angle upward
        leaf.rotation.y = angle;
        leaf.position.y = height;
        leaf.position.x = Math.cos(angle) * 0.03;
        leaf.position.z = Math.sin(angle) * 0.03;
        
        parent.add(leaf);
        return leaf;
    }
    
    // Create a hanging plant
    createHangingPlant() {
        const hangingPlant = new THREE.Group();
        
        // Create hanging pot
        const potGeometry = new THREE.CylinderGeometry(0.15, 0.1, 0.2, 16);
        const potMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xECEFF1, 
            roughness: 0.7
        });
        const pot = new THREE.Mesh(potGeometry, potMaterial);
        hangingPlant.add(pot);
        
        // Create hanging wire
        const wireGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.8, 8);
        const wireMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x757575,
            metalness: 0.8,
            roughness: 0.2
        });
        const wire = new THREE.Mesh(wireGeometry, wireMaterial);
        wire.position.y = 0.5;
        hangingPlant.add(wire);
        
        // Add soil
        const soilGeometry = new THREE.CylinderGeometry(0.14, 0.14, 0.05, 16);
        const soilMaterial = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
        const soil = new THREE.Mesh(soilGeometry, soilMaterial);
        soil.position.y = 0.08;
        hangingPlant.add(soil);
        
        // Create multiple vines hanging down
        for (let i = 0; i < 6; i++) {
            const vineGroup = new THREE.Group();
            const angle = (i / 6) * Math.PI * 2;
            vineGroup.position.x = Math.cos(angle) * 0.08;
            vineGroup.position.z = Math.sin(angle) * 0.08;
            vineGroup.position.y = 0.1;
            
            const vineSegments = 5 + Math.floor(Math.random() * 3);
            let lastY = 0;
            
            // Create vine with multiple leaves
            for (let j = 0; j < vineSegments; j++) {
                // Create a leaf
                const leafGeometry = new THREE.PlaneGeometry(0.1, 0.1, 1, 1);
                const leafMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x66BB6A, 
                    roughness: 0.8,
                    side: THREE.DoubleSide
                });
                
                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                
                // Position leaf along the vine
                leaf.position.y = lastY - 0.1 - Math.random() * 0.05;
                lastY = leaf.position.y;
                
                // Rotate leaf randomly
                leaf.rotation.x = Math.PI / 2;
                leaf.rotation.y = Math.random() * Math.PI;
                leaf.rotation.z = Math.random() * Math.PI / 4;
                
                vineGroup.add(leaf);
            }
            
            hangingPlant.add(vineGroup);
        }
        
        // Position the hanging plant in the corner
        hangingPlant.position.set(3, 3.5, -4);
        this.scene.add(hangingPlant);
        
        if (!this.additionalPlants) this.additionalPlants = [];
        this.additionalPlants.push(hangingPlant);
    }
    
    // Create music elements like a record player and speakers
    createMusicElements() {
        // Create a record player group
        this.recordPlayer = new THREE.Group();
        
        // Base of the record player
        const baseGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.4);
        const baseMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x212121, 
            roughness: 0.5,
            metalness: 0.5
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        this.recordPlayer.add(base);
        
        // Turntable
        const turntableGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.01, 32);
        const turntableMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x424242, 
            roughness: 0.7
        });
        const turntable = new THREE.Mesh(turntableGeometry, turntableMaterial);
        turntable.position.y = 0.03;
        this.recordPlayer.add(turntable);
        
        // Record
        const recordGeometry = new THREE.CylinderGeometry(0.17, 0.17, 0.01, 32);
        const recordMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x111111, 
            roughness: 0.5
        });
        const record = new THREE.Mesh(recordGeometry, recordMaterial);
        record.position.y = 0.04;
        this.recordPlayer.add(record);
        
        // Record label
        const labelGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.011, 32);
        const labelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xF5F5F5, 
            roughness: 0.8
        });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.y = 0.046;
        this.recordPlayer.add(label);
        
        // Tonearm
        const armBaseGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8);
        const armBaseMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x9E9E9E, 
            metalness: 0.7,
            roughness: 0.3
        });
        const armBase = new THREE.Mesh(armBaseGeometry, armBaseMaterial);
        armBase.position.set(0.15, 0.04, 0.15);
        this.recordPlayer.add(armBase);
        
        // Arm
        const armGeometry = new THREE.BoxGeometry(0.15, 0.01, 0.01);
        const armMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x9E9E9E, 
            metalness: 0.7,
            roughness: 0.3
        });
        const arm = new THREE.Mesh(armGeometry, armMaterial);
        arm.position.set(0.075, 0.05, 0.15);
        arm.rotation.y = -Math.PI / 4;
        this.recordPlayer.add(arm);
        
        // Position the record player
        this.recordPlayer.position.set(-3.5, 0.77, 0);
        this.recordPlayer.rotation.y = Math.PI / 4;
        this.scene.add(this.recordPlayer);
        
        // Store the disc for animation
        this.recordPlayer.disc = record;
        
        // Create speakers
        this.createSpeakers();
        
        // Store references for animations
        if (!this.lofiElements) this.lofiElements = [];
        this.lofiElements.push(this.recordPlayer);
    }
    
    // Create speakers to go with the record player
    createSpeakers() {
        // Create two speakers
        for (let i = 0; i < 2; i++) {
            const speaker = new THREE.Group();
            
            // Speaker box
            const boxGeometry = new THREE.BoxGeometry(0.25, 0.3, 0.2);
            const boxMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x212121, 
                roughness: 0.8
            });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            speaker.add(box);
            
            // Speaker driver (the cone)
            const driverGeometry = new THREE.CircleGeometry(0.08, 32);
            const driverMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x424242, 
                roughness: 0.5,
                metalness: 0.2,
                side: THREE.DoubleSide
            });
            const driver = new THREE.Mesh(driverGeometry, driverMaterial);
            driver.position.z = 0.101;
            driver.rotation.x = Math.PI / 2;
            speaker.add(driver);
            
            // Add a smaller tweeter
            const tweeterGeometry = new THREE.CircleGeometry(0.03, 32);
            const tweeterMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x212121, 
                roughness: 0.5,
                metalness: 0.3,
                side: THREE.DoubleSide
            });
            const tweeter = new THREE.Mesh(tweeterGeometry, tweeterMaterial);
            tweeter.position.z = 0.101;
            tweeter.position.y = 0.1;
            tweeter.rotation.x = Math.PI / 2;
            speaker.add(tweeter);
            
            // Create a subtle glow when music is playing
            const glowGeometry = new THREE.CircleGeometry(0.09, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x66aaff, 
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.z = 0.102;
            glow.rotation.x = Math.PI / 2;
            speaker.add(glow);
            
            // Position the speaker - one on each side of the record player
            if (i === 0) {
                speaker.position.set(-3.8, 0.85, 0.3);
            } else {
                speaker.position.set(-3.2, 0.85, -0.3);
            }
            speaker.rotation.y = Math.PI / 4 + (i === 0 ? -0.3 : 0.3);
            
            this.scene.add(speaker);
            
            // Store for animations
            if (!this.lofiElements) this.lofiElements = [];
            this.lofiElements.push(speaker);
        }
    }
    
    // Create ambient decorations like LED strips, digital clock, etc.
    createAmbientDecorations() {
        // Create LED light strips along the desk edge
        this.createLEDStrips();
        
        // Create a digital desk clock
        this.createDeskClock();
    }
    
    // Create LED light strips
    createLEDStrips() {
        this.ledStrips = [];
        
        // Create LED strip along the back edge of the desk
        const ledStripGeometry = new THREE.BoxGeometry(1.4, 0.02, 0.02);
        const ledStripMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0066, 
            emissive: 0xff0066,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        
        const ledStrip = new THREE.Mesh(ledStripGeometry, ledStripMaterial);
        ledStrip.position.set(0, 0.76, -0.4);
        this.scene.add(ledStrip);
        
        // Add a point light that will follow the strip color
        const ledLight = new THREE.PointLight(0xff0066, 0.5, 2);
        ledLight.position.set(0, 0.8, -0.4);
        this.scene.add(ledLight);
        
        // Store reference to both the strip and its light
        ledStrip.userData.light = ledLight;
        this.ledStrips.push(ledStrip);
        
        // Create a second LED strip on the wall
        const wallLedGeometry = new THREE.BoxGeometry(2, 0.03, 0.01);
        const wallLedMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x00aaff, 
            emissive: 0x00aaff,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        
        const wallLed = new THREE.Mesh(wallLedGeometry, wallLedMaterial);
        wallLed.position.set(0, 3, -4.95);
        this.scene.add(wallLed);
        
        // Add a point light for the wall LED
        const wallLight = new THREE.PointLight(0x00aaff, 0.5, 2);
        wallLight.position.set(0, 3, -4.8);
        this.scene.add(wallLight);
        
        // Store reference
        wallLed.userData.light = wallLight;
        this.ledStrips.push(wallLed);
    }
    
    // Create a digital desk clock
    createDeskClock() {
        const clockGroup = new THREE.Group();
        
        // Clock base
        const baseGeometry = new THREE.BoxGeometry(0.2, 0.08, 0.06);
        const baseMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x212121, 
            roughness: 0.7
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        clockGroup.add(base);
        
        // Clock face
        const faceGeometry = new THREE.PlaneGeometry(0.18, 0.05);
        
        // Create a canvas for the digital display
        const clockCanvas = document.createElement('canvas');
        clockCanvas.width = 180;
        clockCanvas.height = 50;
        const ctx = clockCanvas.getContext('2d');
        
        // Draw clock background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 180, 50);
        
        // Draw time
        ctx.font = 'bold 30px monospace';
        ctx.fillStyle = '#ff0066';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('2:37', 90, 25);
        
        const clockTexture = new THREE.CanvasTexture(clockCanvas);
        const faceMaterial = new THREE.MeshBasicMaterial({ 
            map: clockTexture
        });
        
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.z = 0.031;
        clockGroup.add(face);
        
        // Position the clock on the desk
        clockGroup.position.set(-0.5, 0.8, -0.35);
        clockGroup.rotation.x = Math.PI / 12; // Tilt slightly up
        
        this.scene.add(clockGroup);
    }

    // Create a wall picture
    createWallPicture() {
        // Create a modern picture with a dark charcoal frame for the back wall
        const frameWidth = 1.2;
        const frameHeight = 0.8;
        const frameDepth = 0.04;
        const frameThickness = 0.05;
        
        const frameGroup = new THREE.Group();
        
        // Create the frame
        const outerFrameGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
        const innerFrameGeometry = new THREE.BoxGeometry(
            frameWidth - frameThickness * 2, 
            frameHeight - frameThickness * 2, 
            frameDepth + 0.01
        );
        
        const frameMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1E1E1E, // Dark charcoal 
            roughness: 0.7
        });
        
        const outerFrame = new THREE.Mesh(outerFrameGeometry, frameMaterial);
        frameGroup.add(outerFrame);
        
        // Create a canvas for the art
        const artCanvas = document.createElement('canvas');
        artCanvas.width = 512;
        artCanvas.height = 342;
        const ctx = artCanvas.getContext('2d');
        
        // Create abstract digital art
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 512, 342);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 342);
        
        // Add some digital elements
        for (let i = 0; i < 20; i++) {
            // Random position
            const x = Math.random() * 512;
            const y = Math.random() * 342;
            const size = 20 + Math.random() * 100;
            
            // Random color
            const hue = Math.random() * 360;
            ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.2)`;
            
            // Random shape
            const shape = Math.floor(Math.random() * 3);
            if (shape === 0) {
                // Circle
                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (shape === 1) {
                // Square
                ctx.fillRect(x - size / 2, y - size / 2, size, size);
            } else {
                // Triangle
                ctx.beginPath();
                ctx.moveTo(x, y - size / 2);
                ctx.lineTo(x + size / 2, y + size / 2);
                ctx.lineTo(x - size / 2, y + size / 2);
                ctx.closePath();
                ctx.fill();
            }
        }
        
        // Add some glowing lines
        ctx.strokeStyle = 'rgba(0, 255, 170, 0.3)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 10; i++) {
            const startX = Math.random() * 512;
            const startY = Math.random() * 342;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            
            let currentX = startX;
            let currentY = startY;
            
            for (let j = 0; j < 5; j++) {
                if (Math.random() > 0.5) {
                    currentX += (Math.random() * 100 - 50);
                } else {
                    currentY += (Math.random() * 100 - 50);
                }
                
                ctx.lineTo(currentX, currentY);
            }
            
            ctx.stroke();
        }
        
        // Create the texture from the canvas
        const artTexture = new THREE.CanvasTexture(artCanvas);
        const artMaterial = new THREE.MeshBasicMaterial({ map: artTexture });
        
        // Create the art mesh (slightly smaller than the frame)
        const artGeometry = new THREE.PlaneGeometry(
            frameWidth - frameThickness * 2.5, 
            frameHeight - frameThickness * 2.5
        );
        const art = new THREE.Mesh(artGeometry, artMaterial);
        art.position.z = frameDepth / 2 + 0.001;
        frameGroup.add(art);
        
        // Position the picture on the back wall
        frameGroup.position.set(0, 2, -4.95);
        this.scene.add(frameGroup);
        
        // Add a smaller picture on the side wall
        this.createSmallerPicture();
    }
    
    // Create a smaller, minimalist picture
    createSmallerPicture() {
        const frameWidth = 0.6;
        const frameHeight = 0.8;
        const frameDepth = 0.02;
        const frameThickness = 0.03;
        
        const smallFrameGroup = new THREE.Group();
        
        // Create the frame
        const outerFrameGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
        
        const frameMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xF5F5F5, // White frame
            roughness: 0.8
        });
        
        const outerFrame = new THREE.Mesh(outerFrameGeometry, frameMaterial);
        smallFrameGroup.add(outerFrame);
        
        // Create a canvas for minimalist line art
        const artCanvas = document.createElement('canvas');
        artCanvas.width = 300;
        artCanvas.height = 400;
        const ctx = artCanvas.getContext('2d');
        
        // White background
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(0, 0, 300, 400);
        
        // Draw minimalist line art
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        
        // Draw a few curved lines representing a face or abstract shape
        ctx.beginPath();
        ctx.moveTo(100, 150);
        ctx.bezierCurveTo(120, 100, 180, 100, 200, 150);
        ctx.stroke();
        
        // Eyes or abstract elements
        ctx.beginPath();
        ctx.arc(130, 200, 10, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(170, 200, 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // One more curve
        ctx.beginPath();
        ctx.moveTo(120, 250);
        ctx.bezierCurveTo(140, 280, 160, 280, 180, 250);
        ctx.stroke();
        
        // Create the texture from the canvas
        const artTexture = new THREE.CanvasTexture(artCanvas);
        const artMaterial = new THREE.MeshBasicMaterial({ map: artTexture });
        
        // Create the art mesh
        const artGeometry = new THREE.PlaneGeometry(
            frameWidth - frameThickness * 2, 
            frameHeight - frameThickness * 2
        );
        const art = new THREE.Mesh(artGeometry, artMaterial);
        art.position.z = frameDepth / 2 + 0.001;
        smallFrameGroup.add(art);
        
        // Position the picture on the side wall
        smallFrameGroup.position.set(-4.95, 2, -2);
        smallFrameGroup.rotation.y = Math.PI / 2;
        this.scene.add(smallFrameGroup);
    }
    
    // Create a small rug under the desk
    createRug() {
        const rugWidth = 2.5;
        const rugLength = 2;
        
        const rugGeometry = new THREE.PlaneGeometry(rugWidth, rugLength);
        
        // Create a canvas for the rug texture
        const rugCanvas = document.createElement('canvas');
        rugCanvas.width = 512;
        rugCanvas.height = 512;
        const ctx = rugCanvas.getContext('2d');
        
        // Create a base color
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, 512, 512);
        
        // Add some pattern
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 3;
        
        // Draw a geometric pattern
        for (let i = 0; i < 10; i++) {
            const y = i * 51.2;
            
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();
        }
        
        for (let i = 0; i < 10; i++) {
            const x = i * 51.2;
            
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 512);
            ctx.stroke();
        }
        
        // Add some subtle accent lines
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 20; i++) {
            const y = i * 25.6;
            
            if (i % 5 === 0) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(512, y);
                ctx.stroke();
            }
        }
        
        const rugTexture = new THREE.CanvasTexture(rugCanvas);
        rugTexture.wrapS = THREE.RepeatWrapping;
        rugTexture.wrapT = THREE.RepeatWrapping;
        rugTexture.repeat.set(1, 1);
        
        const rugMaterial = new THREE.MeshStandardMaterial({ 
            map: rugTexture,
            roughness: 1.0
        });
        
        this.rug = new THREE.Mesh(rugGeometry, rugMaterial);
        this.rug.rotation.x = -Math.PI / 2;
        this.rug.position.set(0, 0.01, 0);
    }
    
    // Create mood lighting elements
    createMoodLighting() {
        // Add a subtle blue ambient glow from the LED strips
        const ambientBlueLight = new THREE.AmbientLight(0x0066cc, 0.1);
        this.scene.add(ambientBlueLight);
        
        // Add a subtle "VIBE" neon sign on the wall
        this.createNeonSign();
    }
    
    // Create a neon-style "VIBE" sign
    createNeonSign() {
        // Create a group for the sign
        const signGroup = new THREE.Group();
        
        // Create the letters - we'll use simple line segments
        const letters = ['V', 'I', 'B', 'E'];
        const letterSpacing = 0.12;
        let xPos = -(letterSpacing * (letters.length - 1)) / 2;
        
        letters.forEach(letter => {
            const letterGroup = this.createNeonLetter(letter);
            letterGroup.position.x = xPos;
            signGroup.add(letterGroup);
            xPos += letterSpacing;
        });
        
        // Add a backplate
        const backplateGeometry = new THREE.PlaneGeometry(0.6, 0.25);
        const backplateMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x111111,
            roughness: 0.9,
            metalness: 0.1
        });
        const backplate = new THREE.Mesh(backplateGeometry, backplateMaterial);
        backplate.position.z = -0.01;
        signGroup.add(backplate);
        
        // Add a point light to create a glow
        const signLight = new THREE.PointLight(0xff00aa, 0.5, 1);
        signLight.position.z = 0.1;
        signGroup.add(signLight);
        
        // Position the sign on the wall
        signGroup.position.set(-2, 2.5, -4.94);
        this.scene.add(signGroup);
    }
    
    // Helper method to create a neon letter
    createNeonLetter(letter) {
        const letterGroup = new THREE.Group();
        
        // Define letter paths
        const paths = {
            'V': [
                [-0.04, 0.1, 0],
                [0, -0.1, 0],
                [0.04, 0.1, 0]
            ],
            'I': [
                [0, 0.1, 0],
                [0, -0.1, 0]
            ],
            'B': [
                [-0.04, 0.1, 0],
                [-0.04, -0.1, 0],
                [-0.04, 0.1, 0],
                [0.02, 0.08, 0],
                [0.04, 0.05, 0],
                [0.04, 0, 0],
                [0.02, -0.05, 0],
                [-0.04, -0.1, 0]
            ],
            'E': [
                [0.04, 0.1, 0],
                [-0.04, 0.1, 0],
                [-0.04, -0.1, 0],
                [0.04, -0.1, 0],
                [-0.04, -0.1, 0],
                [-0.04, 0, 0],
                [0.02, 0, 0]
            ]
        };
        
        // Create a tube geometry for the letter
        if (paths[letter]) {
            const points = paths[letter].map(point => new THREE.Vector3(point[0], point[1], point[2]));
            const curve = new THREE.CatmullRomCurve3(points);
            
            const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.005, 8, false);
            const tubeMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xff00aa,
                emissive: 0xff00aa,
                emissiveIntensity: 1.0,
                roughness: 0.4,
                metalness: 0.8
            });
            
            const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
            letterGroup.add(tube);
        }
        
        return letterGroup;
    }
    
    // Create baseboards along the bottom of walls
    createBaseboards() {
        const baseboardHeight = 0.1;
        const baseboardDepth = 0.05;
        const baseboardMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x5D4037, 
            roughness: 0.8
        });
        
        // Back wall baseboard
        const backBaseboardGeometry = new THREE.BoxGeometry(10, baseboardHeight, baseboardDepth);
        const backBaseboard = new THREE.Mesh(backBaseboardGeometry, baseboardMaterial);
        backBaseboard.position.set(0, baseboardHeight/2, -5 + baseboardDepth/2);
        this.scene.add(backBaseboard);
        
        // Left wall baseboard
        const leftBaseboardGeometry = new THREE.BoxGeometry(baseboardDepth, baseboardHeight, 10);
        const leftBaseboard = new THREE.Mesh(leftBaseboardGeometry, baseboardMaterial);
        leftBaseboard.position.set(-5 + baseboardDepth/2, baseboardHeight/2, 0);
        this.scene.add(leftBaseboard);
        
        // Right wall baseboard
        const rightBaseboardGeometry = new THREE.BoxGeometry(baseboardDepth, baseboardHeight, 10);
        const rightBaseboard = new THREE.Mesh(rightBaseboardGeometry, baseboardMaterial);
        rightBaseboard.position.set(5 - baseboardDepth/2, baseboardHeight/2, 0);
        this.scene.add(rightBaseboard);
    }
    
    // Create a window with light coming in
    createWindow() {
        // Window frame
        const frameWidth = 2;
        const frameHeight = 2;
        const frameDepth = 0.1;
        const frameThickness = 0.1;
        
        const windowGroup = new THREE.Group();
        
        // Create the window frame using individual mesh pieces instead of CSG
        // Top, bottom, left, right frame pieces
        const horizontalGeometry = new THREE.BoxGeometry(frameWidth, frameThickness, frameDepth);
        const verticalGeometry = new THREE.BoxGeometry(frameThickness, frameHeight - frameThickness * 2, frameDepth);
        
        const frameMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xECEFF1, 
            roughness: 0.9
        });
        
        // Top frame
        const topFrame = new THREE.Mesh(horizontalGeometry, frameMaterial);
        topFrame.position.y = frameHeight / 2 - frameThickness / 2;
        windowGroup.add(topFrame);
        
        // Bottom frame
        const bottomFrame = new THREE.Mesh(horizontalGeometry, frameMaterial);
        bottomFrame.position.y = -frameHeight / 2 + frameThickness / 2;
        windowGroup.add(bottomFrame);
        
        // Left frame
        const leftFrame = new THREE.Mesh(verticalGeometry, frameMaterial);
        leftFrame.position.x = -frameWidth / 2 + frameThickness / 2;
        windowGroup.add(leftFrame);
        
        // Right frame
        const rightFrame = new THREE.Mesh(verticalGeometry, frameMaterial);
        rightFrame.position.x = frameWidth / 2 - frameThickness / 2;
        windowGroup.add(rightFrame);
        
        // Window glass
        const glassGeometry = new THREE.PlaneGeometry(
            frameWidth - frameThickness * 2, 
            frameHeight - frameThickness * 2
        );
        const glassMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            roughness: 0,
            side: THREE.DoubleSide
        });
        
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        glass.position.z = 0;
        windowGroup.add(glass);
        
        // Window crossbars
        const horizontalBarGeometry = new THREE.BoxGeometry(
            frameWidth - frameThickness * 2, 
            frameThickness / 2, 
            frameDepth / 2
        );
        const horizontalBar = new THREE.Mesh(horizontalBarGeometry, frameMaterial);
        horizontalBar.position.y = 0;
        windowGroup.add(horizontalBar);
        
        const verticalBarGeometry = new THREE.BoxGeometry(
            frameThickness / 2,
            frameHeight - frameThickness * 2,
            frameDepth / 2
        );
        const verticalBar = new THREE.Mesh(verticalBarGeometry, frameMaterial);
        verticalBar.position.x = 0;
        windowGroup.add(verticalBar);
        
        // Position the window on the back wall
        windowGroup.position.set(-3, 2, -4.95);
        this.scene.add(windowGroup);
        
        // Add a light ray effect coming through the window
        this.createLightRays(windowGroup.position);
        
        // Add a window sill
        const sillGeometry = new THREE.BoxGeometry(frameWidth + 0.2, 0.05, 0.2);
        const sillMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xECEFF1, 
            roughness: 0.8
        });
        const sill = new THREE.Mesh(sillGeometry, sillMaterial);
        sill.position.set(-3, 2 - frameHeight/2 - 0.025, -4.85);
        this.scene.add(sill);
    }
    
    // Create light rays coming through the window
    createLightRays(windowPosition) {
        // Create light ray geometries using planes with transparent gradients
        for (let i = 0; i < 3; i++) {
            const rayWidth = 0.5 + Math.random() * 0.5;
            const rayHeight = 5;
            
            const rayGeometry = new THREE.PlaneGeometry(rayWidth, rayHeight);
            
            // Create canvas for gradient
            const rayCanvas = document.createElement('canvas');
            rayCanvas.width = 128;
            rayCanvas.height = 512;
            const ctx = rayCanvas.getContext('2d');
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, 512);
            gradient.addColorStop(0, 'rgba(255, 255, 220, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 255, 220, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 128, 512);
            
            const rayTexture = new THREE.CanvasTexture(rayCanvas);
            const rayMaterial = new THREE.MeshBasicMaterial({ 
                map: rayTexture,
                transparent: true,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            
            const ray = new THREE.Mesh(rayGeometry, rayMaterial);
            
            // Position the ray from the window toward the room
            const angle = Math.PI / 4 - Math.random() * Math.PI / 8;
            ray.position.set(
                windowPosition.x + Math.random() * 0.8 - 0.4,
                windowPosition.y - 0.5 + Math.random() * 0.8,
                windowPosition.z + rayHeight / 2
            );
            ray.rotation.x = Math.PI / 2;
            ray.rotation.z = angle;
            
            this.scene.add(ray);
        }
    }
    
    // Create ceiling light
    createCeilingLight() {
        const lightGroup = new THREE.Group();
        
        // Light fixture
        const fixtureGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.1, 32);
        const fixtureMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xE0E0E0, 
            roughness: 0.8, 
            metalness: 0.2
        });
        const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
        fixture.position.y = -0.05;
        lightGroup.add(fixture);
        
        // Light diffuser
        const diffuserGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.02, 32);
        const diffuserMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xffffff,
            roughness: 0.1,
            transmission: 0.95, // Make it translucent
            thickness: 0.05,    // Add some thickness for realism
            emissive: 0xffffee,
            emissiveIntensity: 0.3
        });
        const diffuser = new THREE.Mesh(diffuserGeometry, diffuserMaterial);
        diffuser.position.y = -0.05 - 0.06;
        lightGroup.add(diffuser);
        
        // Position the ceiling light
        lightGroup.position.set(0, 3.95, 0);
        lightGroup.rotation.x = Math.PI;
        this.scene.add(lightGroup);
    }
}

// Initialize the game
new Game(); 