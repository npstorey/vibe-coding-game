import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { GameState } from './gameState.js';
import { UI } from './ui.js';
import { ProjectManager } from './projectManager.js';
import { AssetLoader } from './assetLoader.js';
import { AnimationManager } from './animations.js';
import { AIModelManager } from './aiModels.js';
import { PromptLibrary } from './promptLibrary.js';
import { HardwareManager } from './hardwareManager.js';
import { SocialMediaManager } from './socialMedia.js';
import { ShopManager } from './shopManager.js';
import { ResourceManager } from './resourceManager.js';

// Main Game class
class Game {
    constructor() {
        // Make the game instance available globally
        window.game = this;
        
        // Initialize essential properties
        this.gameState = new GameState();
        
        // Initialize interactive objects array first
        this.interactiveObjects = [];
        
        this.initThree();
        this.aiModelManager = new AIModelManager();
        this.promptLibrary = new PromptLibrary();
        
        try {
            // Add explicit error handling for HardwareManager creation
            this.hardwareManager = new HardwareManager();
            console.log("HardwareManager initialized successfully");
        } catch (error) {
            console.error("Error creating HardwareManager:", error);
            // Create a minimal fallback hardware manager with required methods
            this.hardwareManager = {
                getMaxAITier: () => 1, // Default to tier 1
                getCloudCredits: () => 0,
                useCloudCredits: () => false,
                getOwnedHardware: () => [],
                getAvailableHardware: () => []
            };
            console.warn("Using fallback HardwareManager with limited functionality");
        }
        
        this.socialMediaManager = new SocialMediaManager(this.gameState, this.promptLibrary);
        this.projectManager = new ProjectManager(this.gameState, this.aiModelManager, this.promptLibrary);
        this.shopManager = new ShopManager(this.gameState, this.aiModelManager, this.promptLibrary, this.hardwareManager);
        this.resourceManager = new ResourceManager(this.gameState, this.aiModelManager, this.promptLibrary, this.hardwareManager);
        
        try {
            // Initialize UI with error handling and pass all managers
            this.ui = new UI(this.gameState, this.aiModelManager, this.promptLibrary);
            this.ui.hardwareManager = this.hardwareManager; // Add hardware manager reference
            this.ui.socialMediaManager = this.socialMediaManager; // Make sure socialMediaManager is directly available
            
            // Add any missing methods to UI instance to prevent errors
            if (!this.ui.setupMainMenu) {
                console.warn("Adding missing setupMainMenu method to UI");
                this.ui.setupMainMenu = function() {
                    console.log("Auto-created setupMainMenu method called");
                    const mainMenu = document.getElementById('main-menu');
                    if (mainMenu) {
                        document.querySelectorAll('.panel').forEach(panel => {
                            panel.classList.add('hidden');
                        });
                        mainMenu.classList.remove('hidden');
                    }
                };
            }
            
            console.log("UI initialized successfully");
        } catch (error) {
            console.error("Error initializing UI:", error);
            // Create a minimal UI if initialization fails
            this.ui = {
                init: () => console.log("Using fallback UI init"),
                initEvents: () => console.log("Using fallback UI events"),
                hideLoadingScreen: () => {
                    const loadingScreen = document.getElementById('loading-screen');
                    if (loadingScreen) loadingScreen.classList.add('hidden');
                    console.log("Loading screen hidden with fallback");
                },
                showNotification: (msg) => console.log("Notification (fallback):", msg)
            };
        }
        
        this.animationManager = new AnimationManager();
        
        // Create asset loader with progress callback
        this.assetLoader = new AssetLoader((progress) => {
            const progressBar = document.querySelector('.progress');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            // Once loading is complete
            if (progress >= 100) {
                console.log("Asset loading progress complete");
            }
        });
        
        // Initialize the game world
        this.initGame();
    }
    
    // Initialize Three.js components
    initThree() {
        // Scene with lighter background
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf5f2ef);  // Slightly warmer light gray
        
        // Subtle fog to add depth
        this.scene.fog = new THREE.FogExp2(0xf5f2ef, 0.015);  // Matching fog color
        
        // Camera - adjusted for better isometric view
        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(2.5, 2.2, 2.5);  // More isometric position
        this.camera.lookAt(0, 1, 0);  // Look at center of desk
        
        // Renderer with improved quality
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance" 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        document.getElementById('scene-container').appendChild(this.renderer.domElement);
        
        // Controls - more limited for better user experience
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;  // Increased for smoother movement
        this.controls.minDistance = 3;  // Increased min distance
        this.controls.maxDistance = 5;  // Reduced max distance
        this.controls.minPolarAngle = Math.PI / 6;  // Limit vertical angle
        this.controls.maxPolarAngle = Math.PI / 2;  // Limit to horizon
        this.controls.enablePan = false;  // Disable panning for simplicity
        this.controls.rotateSpeed = 0.7;  // Slower rotation for better control
        
        // Handling window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Enhanced Atmospheric Lighting Setup
        // Natural ambient light
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);  // Pure white, slightly brighter
        this.scene.add(this.ambientLight);
        
        // Main directional light (like sunlight through window)
        this.directionalLight = new THREE.DirectionalLight(0xfffaf0, 0.7);  // Warm white light, slightly stronger
        this.directionalLight.position.set(-5, 8, -5);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.far = 30;
        this.directionalLight.shadow.camera.left = -10;
        this.directionalLight.shadow.camera.right = 10;
        this.directionalLight.shadow.camera.top = 10;
        this.directionalLight.shadow.camera.bottom = -10;
        
        // Add shadow bias to reduce artifacts
        this.directionalLight.shadow.bias = -0.001;
        this.scene.add(this.directionalLight);
        
        // Secondary fill light from opposite direction
        this.fillLight = new THREE.DirectionalLight(0xc4d7ff, 0.4);  // Cooler blue-ish light
        this.fillLight.position.set(5, 3, 5);
        this.scene.add(this.fillLight);
    }
    
    // Initialize the game world
    initGame() {
        console.log("Initializing game...");
        
        try {
            // Start loading assets
            this.loadAssets();
            
            // Initialize UI
            this.ui.init();
            
            // Initialize UI event handlers without eval() (CSP-friendly)
            this.initializeUI();
            
            // Add defensive check for each manager before passing to initEvents
            if (!this.projectManager || !this.socialMediaManager || !this.hardwareManager || 
                !this.shopManager || !this.resourceManager) {
                console.error("One or more game managers are undefined before UI.initEvents:", 
                    {
                        projectManager: !!this.projectManager,
                        socialMediaManager: !!this.socialMediaManager,
                        hardwareManager: !!this.hardwareManager,
                        shopManager: !!this.shopManager,
                        resourceManager: !!this.resourceManager
                    }
                );
            }
            
            // Set up event listeners with all managers - this is the critical fix
            console.log("Passing all manager references to UI.initEvents");
            this.ui.initEvents(
                this.projectManager || {}, 
                this.socialMediaManager || {}, 
                this.hardwareManager || {}, 
                this.shopManager || {}, 
                this.resourceManager || {}
            );
            
            // Generate initial opportunities
            if (this.gameState) {
                this.generateInitialOpportunities();
            }
            
            // Setup debugging tools
            this.setupDebugTools();
            
            // Start animation loop
            this.animate();
            
            console.log("Game initialization complete");
        } catch (error) {
            console.error("Error initializing game:", error);
            
            // Display user-friendly error message
            const errorOverlay = document.createElement('div');
            errorOverlay.style.position = 'fixed';
            errorOverlay.style.top = '0';
            errorOverlay.style.left = '0';
            errorOverlay.style.width = '100%';
            errorOverlay.style.height = '100%';
            errorOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            errorOverlay.style.display = 'flex';
            errorOverlay.style.justifyContent = 'center';
            errorOverlay.style.alignItems = 'center';
            errorOverlay.style.zIndex = '9999';
            
            const errorMessage = document.createElement('div');
            errorMessage.style.backgroundColor = '#d9534f';
            errorMessage.style.color = 'white';
            errorMessage.style.padding = '20px';
            errorMessage.style.borderRadius = '5px';
            errorMessage.style.maxWidth = '80%';
            errorMessage.style.textAlign = 'center';
            errorMessage.innerHTML = `
                <h3>Error initializing game</h3>
                <p>Please refresh the page to try again.</p>
                <button id="refresh-button" style="background:#333; color:white; border:none; padding:10px 20px; margin-top:15px; cursor:pointer;">
                    Refresh Page
                </button>
            `;
            
            errorOverlay.appendChild(errorMessage);
            document.body.appendChild(errorOverlay);
            
            // Add event listener to refresh button
            document.getElementById('refresh-button').addEventListener('click', () => {
                window.location.reload();
            });
        }
    }
    
    // Load assets for the scene
    loadAssets() {
        try {
            // Begin loading 3D assets and textures
            this.assetLoader.loadModelsFromConfig()
                .then(models => {
                    console.log("Successfully loaded models, setting up scene");
                    this.setupScene();
                })
                .catch(error => {
                    console.warn("Error loading models, using fallbacks instead:", error);
                    this.setupSceneWithFallbacks();
                });
        } catch (error) {
            console.warn("Error in asset loading, using fallbacks instead:", error);
            this.setupSceneWithFallbacks();
        }
    }
    
    // Setup fallback scene if models can't be loaded
    setupSceneWithFallbacks() {
        console.log("Setting up scene with fallback models");
        
        // Create basic placeholders
        this.desk = this.assetLoader.createPlaceholder('desk');
        this.desk.position.y = 0;
        this.scene.add(this.desk);
        
        this.computer = this.assetLoader.createPlaceholder('computer');
        this.computer.position.set(0, 0.75, 0);
        this.scene.add(this.computer);
        this.makeInteractive(this.computer, 'computer');
        
        this.chair = this.assetLoader.createPlaceholder('chair');
        this.chair.position.set(0, 0, 1.5);
        this.chair.rotation.y = Math.PI;
        this.scene.add(this.chair);
        
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xe0e0e0,
            roughness: 0.8,
            metalness: 0.2
        });
        this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.position.y = -0.1;
        this.floor.receiveShadow = true;
        this.scene.add(this.floor);
        
        // Setup the rest of the scene
        this.createWalls();
        
        // Notify that the scene is ready
        setTimeout(() => {
            this.setupAnimations();
            this.setupInteractivity();
            // Initialize all UI components properly
            this.ui.init();
            this.ui.initEvents(this.projectManager);
            this.ui.hideLoadingScreen();
            this.showWelcomeMessage();
            this.generateInitialOpportunities();
            this.animate();
        }, 500);
    }
    
    // Setup the 3D scene with office environment
    setupScene() {
        console.log("Setting up scene with loaded models or placeholders");
        
        try {
            // Office desk
            this.desk = this.assetLoader.getModel('desk');
            if (this.desk) {
                this.desk.position.y = 0;
                this.scene.add(this.desk);
            } else {
                console.warn("Desk model not available, using placeholder");
                this.desk = this.assetLoader.createPlaceholder('desk');
                this.desk.position.y = 0;
                this.scene.add(this.desk);
            }
            
            // Computer
            this.computer = this.assetLoader.getModel('computer');
            if (!this.computer) {
                console.warn("Computer model not available, using monitor placeholder");
                this.computer = this.assetLoader.createPlaceholder('computer');
            }
            
            // Position the computer on the desk
            this.computer.position.set(0, 0.75, 0);
            
            // Explicitly ensure computer has required properties for interaction
            if (!this.computer.userData) {
                this.computer.userData = {};
            }
            
            // Set interactive properties directly
            this.computer.userData.isInteractive = true;
            this.computer.userData.objectType = 'computer';
            
            // Add the computer to the scene
            this.scene.add(this.computer);
            
            // Store in interactiveObjects array explicitly
            if (!this.interactiveObjects) {
                this.interactiveObjects = [];
            }
            
            if (!this.interactiveObjects.includes(this.computer)) {
                this.interactiveObjects.push(this.computer);
                console.log("Computer added to interactive objects array directly");
            }
            
            // Also use the makeInteractive method as a backup
            this.makeInteractive(this.computer, 'computer');
            
            console.log("Computer setup complete: ", {
                inScene: this.scene.children.includes(this.computer),
                isInteractive: this.computer.userData.isInteractive,
                objectType: this.computer.userData.objectType,
                inInteractiveObjects: this.interactiveObjects.includes(this.computer)
            });
            
            // Office chair
            this.chair = this.assetLoader.getModel('chair');
            if (!this.chair) {
                console.warn("Chair model not available, using placeholder");
                this.chair = this.assetLoader.createPlaceholder('chair');
            }
            
            this.chair.position.set(0, 0, 1.5);
            this.chair.rotation.y = Math.PI; // Facing the desk
            this.scene.add(this.chair);
            
            // Floor
            const floorGeometry = new THREE.PlaneGeometry(20, 20);
            const floorMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xe0e0e0,
                roughness: 0.8,
                metalness: 0.2
            });
            this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
            this.floor.rotation.x = -Math.PI / 2;
            this.floor.position.y = -0.1;
            this.floor.receiveShadow = true;
            this.scene.add(this.floor);
            
            // Walls (simple for Phase 1)
            this.createWalls();
            
            // Additional decorative items
            this.addDecorativeItems();
            
            // Notify that the scene is ready
            setTimeout(() => {
                try {
                    console.log("Setting up animations and interactivity");
                    if (this.setupAnimations && typeof this.setupAnimations === 'function') {
                        this.setupAnimations();
                    }
                    
                    if (this.setupInteractivity && typeof this.setupInteractivity === 'function') {
                        this.setupInteractivity();
                    }
                    
                    // Force hide loading screen regardless of UI initialization
                    this.ensureLoadingScreenHidden();
                    
                    // Carefully initialize UI methods with error handling
                    if (this.ui) {
                        console.log("Initializing UI components");
                        
                        // Initialize UI
                        if (typeof this.ui.init === 'function') {
                            console.log("Calling ui.init()");
                            this.ui.init();
                        }
                        
                        // Initialize UI events
                        if (typeof this.ui.initEvents === 'function') {
                            console.log("Calling ui.initEvents()");
                            // Pass all required manager objects to initEvents
                            this.ui.initEvents(
                                this.projectManager, 
                                this.socialMediaManager, 
                                this.hardwareManager, 
                                this.shopManager, 
                                this.resourceManager
                            );
                        }
                        
                        // Hide loading screen
                        if (typeof this.ui.hideLoadingScreen === 'function') {
                            console.log("Hiding loading screen");
                            this.ui.hideLoadingScreen();
                        }
                        
                        // Show welcome message
                        if (typeof this.showWelcomeMessage === 'function') {
                            this.showWelcomeMessage();
                        }
                        
                        // Generate initial opportunities
                        if (typeof this.generateInitialOpportunities === 'function') {
                            this.generateInitialOpportunities();
                        }
                    }
                    
                    // Start animation loop
                    this.animate();
                } catch (error) {
                    console.error("Error during scene setup:", error);
                    
                    // Try to gracefully recover by hiding loading screen
                    this.ensureLoadingScreenHidden();
                    
                    // Display error message
                    const errorMsg = document.createElement('div');
                    errorMsg.style.position = 'fixed';
                    errorMsg.style.top = '50%';
                    errorMsg.style.left = '50%';
                    errorMsg.style.transform = 'translate(-50%, -50%)';
                    errorMsg.style.background = 'rgba(200, 0, 0, 0.8)';
                    errorMsg.style.color = 'white';
                    errorMsg.style.padding = '20px';
                    errorMsg.style.borderRadius = '5px';
                    errorMsg.style.zIndex = '9999';
                    errorMsg.textContent = 'Error initializing game. Please refresh the page.';
                    document.body.appendChild(errorMsg);
                }
            }, 500);
        } catch (error) {
            console.error("Error setting up scene:", error);
            // Fall back to simplified scene
            this.setupSceneWithFallbacks();
        }
        
        // Add verification call at the end of setupScene
        // This will log detailed information about the computer object's interactivity
        setTimeout(() => {
            this.debugVerifyComputerInteractivity();
        }, 1000); // Delay to ensure everything is initialized
    }
    
    // Ensure loading screen is hidden and doesn't block interactions
    ensureLoadingScreenHidden() {
        console.log("Forcibly ensuring loading screen is hidden");
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            loadingScreen.style.display = 'none';
            loadingScreen.style.zIndex = '-1';
            loadingScreen.style.pointerEvents = 'none';
            console.log("Loading screen forcibly hidden and disabled");
        }
        
        // Also ensure UI overlay is visible and active
        const uiOverlay = document.getElementById('ui-overlay');
        if (uiOverlay) {
            uiOverlay.classList.remove('hidden');
            
            // Make sure the stats panel is visible
            const statsPanel = document.getElementById('stats-panel');
            if (statsPanel) {
                statsPanel.classList.remove('hidden');
            }
        }
        
        // Final check - are we able to raytrace to the computer?
        if (this.computer && this.camera && this.raycaster) {
            console.log("Testing computer visibility...");
            
            // Get computer's position in world space
            const computerPosition = new THREE.Vector3();
            this.computer.getWorldPosition(computerPosition);
            
            // Create direction from camera to computer
            const direction = new THREE.Vector3()
                .subVectors(computerPosition, this.camera.position)
                .normalize();
            
            // Set up raycaster manually
            this.raycaster.set(this.camera.position, direction);
            
            // Test if we can hit the computer
            const intersects = this.raycaster.intersectObject(this.computer, true);
            console.log(`Computer visibility test: ${intersects.length > 0 ? 'VISIBLE' : 'OCCLUDED'}`);
            
            if (intersects.length === 0) {
                console.warn("Computer may be occluded - adjusting camera position");
                
                // Adjust camera position for better view
                this.camera.position.set(3, 3, 3);
                this.camera.lookAt(0, 0.75, 0); // Look at computer position
                
                if (this.controls) {
                    this.controls.target.set(0, 0.75, 0);
                    this.controls.update();
                }
            }
        }
    }
    
    // Create simple walls
    createWalls() {
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5f5f5,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Back wall
        const backWallGeometry = new THREE.PlaneGeometry(20, 10);
        this.backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
        this.backWall.position.set(0, 5, -10);
        this.backWall.receiveShadow = true;
        this.scene.add(this.backWall);
        
        // Left wall
        const leftWallGeometry = new THREE.PlaneGeometry(20, 10);
        this.leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
        this.leftWall.position.set(-10, 5, 0);
        this.leftWall.rotation.y = Math.PI / 2;
        this.leftWall.receiveShadow = true;
        this.scene.add(this.leftWall);
    }
    
    // Add decorative items to the scene
    addDecorativeItems() {
        try {
            // Potted plant
            const plant = this.assetLoader.getModel('plant');
            if (plant) {
                this.plant = plant;
                this.plant.position.set(2, 0, -1);
                this.plant.scale.set(0.5, 0.5, 0.5);
                this.scene.add(this.plant);
            } else {
                console.log("Plant model not available, skipping");
            }
            
            // Coffee mug
            const mug = this.assetLoader.getModel('mug') || this.assetLoader.getModel('coffee_cup');
            if (mug) {
                this.mug = mug;
                this.mug.position.set(-0.5, 0.75, -0.3);
                this.mug.scale.set(0.1, 0.1, 0.1);
                this.scene.add(this.mug);
            } else {
                console.log("Mug model not available, skipping");
            }
        } catch (error) {
            console.error("Error adding decorative items:", error);
        }
    }
    
    // Setup animations
    setupAnimations() {
        try {
            // Register animations with the animation manager
            if (this.computer) {
                this.animationManager.registerPulsatingEffect(this.computer, 0.05, 2);
            } else {
                console.warn("Computer not available for animations");
            }
        } catch (error) {
            console.error("Error setting up animations:", error);
        }
    }
    
    // Setup interactivity for objects
    setupInteractivity() {
        try {
            console.log("Setting up interactivity...");
            
            // Setup raycaster for mouse interaction
            this.raycaster = new THREE.Raycaster();
            this.mouse = new THREE.Vector2();
            
            // IMPORTANT: Always ensure interactiveObjects is an array, never undefined
            if (!this.interactiveObjects) {
                this.interactiveObjects = [];
                console.warn("Interactive objects array was undefined - initializing empty array");
            }
            
            console.log(`Starting with ${this.interactiveObjects.length} interactive objects`);
            
            // Debug check for computer object
            const hasComputer = this.interactiveObjects.some(obj => 
                obj.userData && (obj.userData.objectType === 'computer' || obj.userData.type === 'computer'));
            console.log(`Computer object in interactive objects: ${hasComputer}`);
            
            // Re-add the computer if it exists in the scene but not in interactiveObjects
            if (!hasComputer && this.computer) {
                console.log("Computer found in scene but not in interactive objects - re-adding it");
                this.makeInteractive(this.computer, 'computer');
            }
            
            // Verify computer is properly set up
            if (this.computer) {
                // Ensure the computer has the correct userData
                if (!this.computer.userData) {
                    this.computer.userData = {};
                }
                
                // Set interactive properties directly - using BOTH old and new property names for compatibility
                this.computer.userData.isInteractive = true;
                this.computer.userData.objectType = 'computer';
                this.computer.userData.type = 'computer'; // For backward compatibility
                
                // Add the computer to the scene
                this.scene.add(this.computer);
                
                // Store in interactiveObjects array explicitly
                if (!this.interactiveObjects) {
                    this.interactiveObjects = [];
                }
                
                if (!this.interactiveObjects.includes(this.computer)) {
                    this.interactiveObjects.push(this.computer);
                    console.log("Computer added to interactive objects array directly");
                }
            } else {
                console.warn("Computer object not found in scene");
            }
            
            // Add event listeners for mouse interaction
            document.addEventListener('mousemove', (event) => {
                // Calculate mouse position in normalized device coordinates
                this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            });
            
            // Direct canvas click handling to avoid event propagation issues
            const canvas = this.renderer.domElement;
            canvas.addEventListener('click', this.handleCanvasClick.bind(this));
            
            // Add backup event listener on document for safety
            document.addEventListener('click', (event) => {
                console.log("Document click detected, checking for intersections with interactive objects");
                
                // Ensure raycaster, camera and interactiveObjects all exist
                if (!this.raycaster || !this.camera) {
                    console.warn("Raycaster or camera not initialized for click detection");
                    return;
                }
                
                if (!this.interactiveObjects || this.interactiveObjects.length === 0) {
                    console.warn("No interactive objects available for intersection testing");
                    return;
                }
                
                // Check for intersections with interactive objects
                try {
                    this.raycaster.setFromCamera(this.mouse, this.camera);
                    
                    console.log(`Checking ${this.interactiveObjects.length} interactive objects for intersection`);
                    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
                    
                    if (intersects.length > 0) {
                        console.log("Intersection found:", intersects[0]);
                        // Find the clicked object and its userData
                        let clickedObject = intersects[0].object;
                        
                        // Traverse up the parent chain until we find an interactive object
                        while (clickedObject && !clickedObject.userData?.isInteractive) {
                            clickedObject = clickedObject.parent;
                        }
                        
                        if (clickedObject && clickedObject.userData && clickedObject.userData.isInteractive) {
                            // Handle the interactive object click
                            const objectType = clickedObject.userData.objectType || clickedObject.userData.type;
                            console.log(`Clicked on interactive object of type: ${objectType}`);
                            this.handleObjectClick(objectType);
                        } else {
                            console.log("Intersection was not with an interactive object");
                        }
                    } else {
                        console.log("No intersections found");
                    }
                } catch (error) {
                    // Log detailed error information for debugging
                    console.error("Error during raycasting:", error);
                    console.error("Raycaster state:", {
                        raycasterExists: !!this.raycaster,
                        mousePosition: this.mouse,
                        cameraExists: !!this.camera,
                        interactiveObjectsCount: this.interactiveObjects?.length || 0
                    });
                }
            });
            
            console.log("Interactivity setup complete");
        } catch (error) {
            console.error("Error setting up interactivity:", error);
        }
    }
    
    // Direct canvas click handler for better raycasting reliability
    handleCanvasClick(event) {
        console.log("Canvas click detected - Direct raycasting");
        
        // Ensure we have all required components
        if (!this.camera || !this.raycaster) {
            console.warn("Missing core components for canvas click handling");
            return;
        }
        
        try {
            // Calculate mouse position
            const canvas = this.renderer.domElement;
            const rect = canvas.getBoundingClientRect();
            const mouse = new THREE.Vector2();
            
            // Calculate mouse position in normalized device coordinates (-1 to +1)
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            console.log(`Mouse position: (${mouse.x.toFixed(2)}, ${mouse.y.toFixed(2)})`);
            
            // Set up the raycaster
            this.raycaster.setFromCamera(mouse, this.camera);
            
            // First ensure computer is properly configured
            if (this.computer) {
                // Ensure userData is set
                if (!this.computer.userData) {
                    this.computer.userData = {};
                }
                
                // Make sure computer is interactive and has proper type
                this.computer.userData.isInteractive = true;
                this.computer.userData.interactive = true; // Add redundant property for compatibility
                this.computer.userData.objectType = 'computer';
                this.computer.userData.type = 'computer';
                
                // Make sure it's in the interactiveObjects array
                if (!this.interactiveObjects) {
                    this.interactiveObjects = [];
                }
                if (!this.interactiveObjects.includes(this.computer)) {
                    this.interactiveObjects.push(this.computer);
                    console.log("Added computer to interactiveObjects array");
                }
            } else {
                console.warn("Computer object not found in the scene!");
            }
            
            // Test for intersection with interactive objects
            const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
            console.log(`Found ${intersects.length} intersections with interactive objects`);
            
            if (intersects.length > 0) {
                console.log("Click detection succeeded!");
                
                // Find the clicked object and determine its type
                let clickedObject = intersects[0].object;
                let objectType = null;
                
                // Check if the object itself has metadata
                if (clickedObject.userData && (clickedObject.userData.objectType || clickedObject.userData.type)) {
                    objectType = clickedObject.userData.objectType || clickedObject.userData.type;
                } else {
                    // Traverse up to find interactive parent
                    let parentObj = clickedObject.parent;
                    while (parentObj) {
                        if (parentObj.userData && (parentObj.userData.objectType || parentObj.userData.type)) {
                            objectType = parentObj.userData.objectType || parentObj.userData.type;
                            clickedObject = parentObj; // Use the parent with proper type
                            break;
                        }
                        parentObj = parentObj.parent;
                    }
                }
                
                // If this is part of the computer, handle as computer click
                if (objectType === 'computer' || 
                    (clickedObject.userData && clickedObject.userData.isComputerPart)) {
                    console.log("Computer clicked!");
                    this.handleObjectClick('computer');
                    return;
                } else if (objectType) {
                    console.log(`Clicked on object type: ${objectType}`);
                    this.handleObjectClick(objectType);
                    return;
                }
            } else {
                console.log("No direct intersections detected");
            }
            
        } catch (err) {
            console.error("Error in handleCanvasClick:", err);
        }
    }
    
    // Helper method to visualize the click position
    showClickMarker(x, y) {
        // Remove any existing click marker
        const existingMarker = document.getElementById('click-marker');
        if (existingMarker) {
            existingMarker.remove();
        }
        
        // Create a new marker
        const marker = document.createElement('div');
        marker.id = 'click-marker';
        marker.style.position = 'absolute';
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
        marker.style.width = '20px';
        marker.style.height = '20px';
        marker.style.borderRadius = '50%';
        marker.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        marker.style.transform = 'translate(-50%, -50%)';
        marker.style.pointerEvents = 'none';
        marker.style.zIndex = '1000';
        
        // Add animation
        marker.style.animation = 'click-marker-anim 1s forwards';
        
        // Add style for the animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes click-marker-anim {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(marker);
        
        // Remove after animation
        setTimeout(() => {
            marker.remove();
        }, 1000);
    }
    
    // Helper method to highlight the clicked object
    highlightClickedObject(object) {
        if (!object) return;
        
        // Store original material
        const originalMaterial = object.material;
        
        // Create highlight material
        const highlightMaterial = object.material.clone();
        highlightMaterial.emissive = new THREE.Color(0x00ff00);
        highlightMaterial.emissiveIntensity = 0.5;
        
        // Apply highlight
        object.material = highlightMaterial;
        
        // Reset after a short delay
        setTimeout(() => {
            object.material = originalMaterial;
        }, 300);
    }
    
    // Direct object click handler with extra verification
    handleDirectObjectClick(objectType, intersection) {
        try {
            console.log(`Handling direct object click on: ${objectType}`, intersection);
            
            // For computer clicks, show the computer screen directly
            if (objectType === 'computer') {
                console.log("COMPUTER CLICKED - Opening computer screen interface");
                const computerScreen = document.getElementById('computer-screen');
                if (computerScreen) {
                    // Show the screen with animation
                    computerScreen.classList.remove('hidden');
                    computerScreen.style.display = 'block';
                    
                    // Add a brief highlight effect to the computer object for visual feedback
                    const originalColor = this.computer.material?.color?.clone();
                    if (this.computer.material && this.computer.material.color) {
                        // Highlight in bright green for better visibility
                        this.computer.material.color.set(0x00ff00);
                        
                        // Reset after a short delay
                        setTimeout(() => {
                            this.computer.material.color.copy(originalColor);
                        }, 200);
                    }
                    
                    // Initialize resources if we have the manager
                    if (this.resourceManager) {
                        this.resourceManager.updateResourcesDisplay();
                    } else {
                        console.warn("Resource manager not available for display update");
                    }
                } else {
                    console.error("Computer screen element not found in DOM");
                }
            } else {
                // Handle other object types
                console.log(`Handling other object type: ${objectType}`);
                this.handleObjectClick(objectType);
            }
        } catch (error) {
            console.error(`Error in direct object click handler for ${objectType}:`, error);
        }
    }
    
    // Make an object interactive
    makeInteractive(object, type) {
        if (!object) {
            console.warn(`Cannot make null/undefined object interactive for type: ${type}`);
            return;
        }
        
        try {
            // Ensure the object has userData
            if (!object.userData) {
                object.userData = {};
            }
            
            // Mark the object as interactive - include both property naming conventions
            object.userData.isInteractive = true;
            object.userData.objectType = type || 'unknown';
            object.userData.type = type || 'unknown'; // For backward compatibility
            
            // Initialize interactiveObjects if it doesn't exist
            if (!this.interactiveObjects) {
                this.interactiveObjects = [];
            }
            
            // Add the object to the interactive objects list if not already included
            if (!this.interactiveObjects.includes(object)) {
                this.interactiveObjects.push(object);
                console.log(`Made object interactive: ${type} (total interactive objects: ${this.interactiveObjects.length})`);
                
                // Ensure children are also tagged with the same data
                if (object.children && object.children.length > 0) {
                    object.traverse(child => {
                        if (child && child !== object) {
                            if (!child.userData) {
                                child.userData = {};
                            }
                            child.userData.isInteractive = true;
                            child.userData.objectType = type || 'unknown';
                            child.userData.type = type || 'unknown';
                        }
                    });
                    console.log(`Tagged ${object.children.length} child objects with interactive data`);
                }
            } else {
                console.log(`Object already interactive: ${type}`);
            }
        } catch (error) {
            console.error(`Error making object interactive (${type}):`, error);
        }
    }
    
    // Handle object clicks (original method for backwards compatibility)
    handleObjectClick(objectType) {
        console.log(`Handling click for object type: ${objectType}`);
        
        try {
            if (objectType === 'computer') {
                console.log("Computer clicked, displaying computer screen");
                
                // Check scene container state before changing anything
                const sceneContainer = document.getElementById('scene-container');
                if (sceneContainer) {
                    console.log("Scene container before showing computer:", {
                        display: sceneContainer.style.display,
                        visibility: sceneContainer.style.visibility,
                        className: sceneContainer.className
                    });
                    
                    // Make sure scene container stays visible
                    sceneContainer.style.display = 'block';
                    sceneContainer.style.visibility = 'visible';
                    sceneContainer.classList.remove('hidden');
                }
                
                // Show computer screen
                const computerScreen = document.getElementById('computer-screen');
                if (computerScreen) {
                    computerScreen.classList.remove('hidden');
                    computerScreen.style.display = 'block';
                    
                    // Show the UI overlay if it's hidden
                    const uiOverlay = document.getElementById('ui-overlay');
                    if (uiOverlay && uiOverlay.classList.contains('hidden')) {
                        uiOverlay.classList.remove('hidden');
                        console.log("UI overlay was hidden, now showing");
                    }
                    
                    // Initialize resources display if resourceManager exists
                    if (this.resourceManager) {
                        this.resourceManager.updateResourcesDisplay();
                        console.log("Resources display updated");
                    } else {
                        console.warn("Resource manager not available for display update");
                    }
                    
                    // Make sure other UI elements are visible
                    const statsPanel = document.getElementById('stats-panel');
                    if (statsPanel && statsPanel.classList.contains('hidden')) {
                        statsPanel.classList.remove('hidden');
                    }
                    
                    // Update stats display
                    if (this.ui && typeof this.ui.updateStats === 'function') {
                        this.ui.updateStats();
                        console.log("Stats updated on computer click");
                    }
                    
                    // Add visual feedback animation
                    if (this.computer && this.computer.material) {
                        // Save original color
                        const originalColor = this.computer.material.color ? this.computer.material.color.clone() : null;
                        
                        // Flash green to indicate successful click
                        if (originalColor) {
                            this.computer.material.color.set(0x00ff00);
                            setTimeout(() => {
                                this.computer.material.color.copy(originalColor);
                            }, 300);
                        }
                    }
                } else {
                    console.error("Computer screen element not found in DOM");
                }
            } else {
                console.log(`No specific handler for object type: ${objectType}`);
            }
        } catch (error) {
            console.error(`Error handling click for object type ${objectType}:`, error);
        }
    }
    
    // Phase 1: Show welcome message with tutorial info
    showWelcomeMessage() {
        this.ui.showNotification(
            "Welcome to Vibe Coding Simulator! You're a solo developer with AI assistant tools. Use time blocks to work on projects, research new techniques, and earn money.", 
            "info", 
            10000
        );
        
        setTimeout(() => {
            this.ui.showNotification(
                "Click on your computer to get started. You have 8 time blocks each day to use wisely.", 
                "info", 
                8000
            );
        }, 10500);
        
        setTimeout(() => {
            // Add animated hint to click the computer
            if (this.computer) {
                this.animationManager.enhancePulsatingEffect(this.computer, 0.15, 3);
            }
        }, 11000);
    }
    
    // Phase 1: Generate initial opportunities
    generateInitialOpportunities() {
        // Add an initial email
        const initialEmail = {
            id: Date.now(),
            subject: "Welcome to your coding journey!",
            sender: "mentor@devcoach.com",
            read: false,
            date: this.gameState.day,
            content: "Welcome to your new solo coding career! I recommend starting with a small project to get familiar with the tools. Check your project board to get started."
        };
        this.gameState.emails.push(initialEmail);
        
        // Generate a starter project opportunity
        const starterProject = this.projectManager.createProject('b2c');
        this.projectManager.addProject(starterProject);
        
        // Add some welcome events to the log
        this.gameState.todayEvents.push({
            type: 'info',
            description: 'Started your solo development career!'
        });
        
        this.gameState.todayEvents.push({
            type: 'project_opportunity',
            projectName: starterProject.name,
            description: `New project opportunity: ${starterProject.name}`
        });
    }
    
    // Animation loop
    animate() {
        // Check if essential components are initialized before starting the animation loop
        if (!this.scene || !this.camera || !this.renderer) {
            console.error("Cannot start animation loop: Essential Three.js components are not initialized");
            // Display a user-friendly error message
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.innerHTML = 'Error initializing game engine. Please refresh the page.';
            document.body.appendChild(errorElement);
            return; // Don't continue with animation
        }

        // Request the next frame
        requestAnimationFrame(() => this.animate());
        
        // Update controls if they exist
        if (this.controls) {
            this.controls.update();
        }
        
        // Update animations if animation manager exists
        if (this.animationManager) {
            this.animationManager.update();
        }
        
        // Check for interactive hover
        this.checkInteractiveHover();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    // Check for interactive objects on hover
    checkInteractiveHover() {
        // Ensure raycaster, camera and interactiveObjects all exist before using them
        if (!this.raycaster || !this.camera) {
            return; // Silently exit if dependencies aren't available
        }
        
        if (!this.interactiveObjects || this.interactiveObjects.length === 0) {
            return; // No interactive objects to check
        }
        
        try {
            // Update the raycaster with the camera and mouse position
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            // Check for intersections with interactive objects
            const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
            
            // Reset cursor to default
            document.body.style.cursor = 'default';
            
            // If hovering over an interactive object, change cursor
            if (intersects.length > 0) {
                let hoveredObject = intersects[0].object;
                
                // Traverse up the parent chain to find the interactive parent
                while (hoveredObject && !hoveredObject.userData?.isInteractive) {
                    hoveredObject = hoveredObject.parent;
                }
                
                // Change cursor if we found an interactive object
                if (hoveredObject && hoveredObject.userData && hoveredObject.userData.isInteractive) {
                    document.body.style.cursor = 'pointer';
                }
            }
        } catch (error) {
            // Silent error handling to avoid console spam during animation loop
            // Only log the first occurrence
            if (!this._hasLoggedRaycasterError) {
                console.error("Error in checkInteractiveHover:", error);
                this._hasLoggedRaycasterError = true;
            }
        }
    }

    // Add a dedicated method for UI initialization to avoid CSP issues
    initializeUI() {
        console.log("Initializing UI with direct DOM event listeners (CSP-friendly)");
        
        try {
            // Close computer screen button
            const closeBtn = document.getElementById('close-computer-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    console.log("Close button clicked");
                    
                    // Check scene container state before changing anything
                    const sceneContainer = document.getElementById('scene-container');
                    if (sceneContainer) {
                        console.log("Scene container before closing computer:", {
                            display: sceneContainer.style.display,
                            visibility: sceneContainer.style.visibility,
                            className: sceneContainer.className
                        });
                    }
                    
                    const computerScreen = document.getElementById('computer-screen');
                    if (computerScreen) {
                        computerScreen.classList.add('hidden');
                        computerScreen.style.display = 'none';
                        
                        // Ensure the scene container is still visible when closing the computer
                        if (sceneContainer) {
                            sceneContainer.style.display = 'block';
                            sceneContainer.style.visibility = 'visible';
                            sceneContainer.classList.remove('hidden');
                            console.log("Ensuring scene container remains visible after closing computer");
                            
                            // Log the state after changes
                            console.log("Scene container after fixing:", {
                                display: sceneContainer.style.display,
                                visibility: sceneContainer.style.visibility,
                                className: sceneContainer.className
                            });
                            
                            // Force a reflow
                            void sceneContainer.offsetHeight;
                        }
                    }
                });
            }
            
            // Menu buttons
            const menuButtons = document.querySelectorAll('.menu-button');
            menuButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const action = button.getAttribute('data-action');
                    console.log(`Menu button clicked: ${action}`);
                    
                    // Ensure the ui panels are initialized
                    if (this.ui) {
                        // Make sure the UI has been fully initialized with managers
                        if (!this.ui.socialMediaManager && this.socialMediaManager) {
                            console.log("Initializing UI with managers that were missing");
                            this.ui.initEvents(
                                this.projectManager, 
                                this.socialMediaManager,
                                this.hardwareManager,
                                this.shopManager,
                                this.resourceManager
                            );
                        }
                    }
                    
                    // Handle specific actions
                    if (action === 'email') {
                        // Make sure the UI updates email list when clicking
                        if (this.ui && typeof this.ui.updateEmailList === 'function') {
                            this.ui.updateEmailList();
                        }
                    } else if (action === 'social') {
                        // Make sure the UI initializes social panel when clicking
                        if (this.ui && typeof this.ui.initSocialPanel === 'function') {
                            this.ui.initSocialPanel();
                        }
                    }
                });
            });
            
            // Back buttons
            const backBtns = document.querySelectorAll('.back-btn');
            backBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    console.log("Back button clicked");
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Use UI method if available
                    if (this.ui && typeof this.ui.switchPanel === 'function') {
                        this.ui.switchPanel('main-menu');
                        return;
                    }
                    
                    // Fallback implementation
                    document.querySelectorAll('.panel').forEach(panel => {
                        panel.classList.add('hidden');
                        panel.style.display = 'none';
                    });
                    
                    const mainMenu = document.getElementById('main-menu');
                    if (mainMenu) {
                        mainMenu.classList.remove('hidden');
                        mainMenu.style.display = 'block';
                    }
                });
            });
            
            // Add a direct method to handle panel content updates as fallback
            if (!this.updatePanelContent) {
                this.updatePanelContent = function(panelName) {
                    try {
                        console.log(`Updating panel content for: ${panelName}`);
                        
                        // Basic implementations for essential panels
                        switch (panelName) {
                            case 'email':
                                // Update email list if handler exists
                                if (this.ui && typeof this.ui.updateEmailList === 'function') {
                                    this.ui.updateEmailList();
                                }
                                break;
                                
                            case 'code':
                            case 'coding':
                                // Update project and AI model selection if handlers exist
                                if (this.ui) {
                                    if (typeof this.ui.updateProjectSelection === 'function') {
                                        this.ui.updateProjectSelection();
                                    }
                                    if (typeof this.ui.updateAIModelSelection === 'function') {
                                        this.ui.updateAIModelSelection();
                                    }
                                }
                                break;
                                
                            case 'resources':
                                // Update resources display if manager exists
                                if (this.resourceManager && typeof this.resourceManager.updateResourcesDisplay === 'function') {
                                    this.resourceManager.updateResourcesDisplay();
                                }
                                break;
                        }
                    } catch (error) {
                        console.error(`Error updating panel content for ${panelName}:`, error);
                    }
                };
            }
            
            // Add submit prompt button handler
            const submitPromptBtn = document.getElementById('submit-prompt-btn');
            if (submitPromptBtn) {
                console.log("Setting up submit prompt button listener");
                submitPromptBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Call UI's handlePromptSubmission method if available
                    if (this.ui && typeof this.ui.handlePromptSubmission === 'function') {
                        console.log("Calling UI.handlePromptSubmission");
                        this.ui.handlePromptSubmission(e);
                    } else {
                        console.error("UI.handlePromptSubmission method not available");
                    }
                });
            }
            
            // Add debug button handlers
            const debugShowComputer = document.getElementById('debug-show-computer');
            if (debugShowComputer) {
                console.log("Setting up debug show computer button");
                debugShowComputer.addEventListener('click', () => {
                    console.log("Debug: Showing computer UI");
                    this.handleObjectClick('computer');
                });
            }
            
            // Add hidden test panel
            const testPanel = document.createElement('div');
            testPanel.id = 'test-panel';
            testPanel.style.position = 'fixed';
            testPanel.style.top = '50px';
            testPanel.style.right = '10px';
            testPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            testPanel.style.padding = '10px';
            testPanel.style.borderRadius = '5px';
            testPanel.style.zIndex = '9998';
            testPanel.style.display = 'none';
            
            // Add test buttons for each panel
            const panels = ['email', 'coding', 'social', 'shop', 'resources'];
            panels.forEach(panel => {
                const button = document.createElement('button');
                button.textContent = `Show ${panel} panel`;
                button.style.display = 'block';
                button.style.width = '100%';
                button.style.marginBottom = '5px';
                button.style.padding = '5px';
                button.addEventListener('click', () => {
                    if (this.ui && typeof this.ui.switchPanel === 'function') {
                        console.log(`Debug: Switching to ${panel} panel`);
                        this.ui.switchPanel(panel);
                    } else {
                        console.warn(`UI.switchPanel not available for ${panel}`);
                    }
                });
                testPanel.appendChild(button);
            });
            
            // Add End Day button
            const endDayButton = document.createElement('button');
            endDayButton.textContent = 'End Day';
            endDayButton.style.display = 'block';
            endDayButton.style.width = '100%';
            endDayButton.style.marginBottom = '5px';
            endDayButton.style.padding = '5px';
            endDayButton.addEventListener('click', () => {
                if (this.ui && typeof this.ui.handleEndDay === 'function') {
                    console.log("Debug: Ending day");
                    this.ui.handleEndDay();
                } else {
                    console.warn("UI.handleEndDay not available");
                }
            });
            testPanel.appendChild(endDayButton);
            
            document.body.appendChild(testPanel);
            
            // Set up toggle button
            const debugTogglePanels = document.getElementById('debug-toggle-panels');
            if (debugTogglePanels) {
                console.log("Setting up debug toggle panels button");
                debugTogglePanels.addEventListener('click', () => {
                    console.log("Debug: Toggling test panels");
                    testPanel.style.display = testPanel.style.display === 'none' ? 'block' : 'none';
                });
            }
            
            console.log("UI initialization completed");
        } catch (error) {
            console.error("Error in initializeUI:", error);
        }
    }

    // Add debugging function to verify computer interactivity
    debugVerifyComputerInteractivity() {
        console.log("================ COMPUTER INTERACTIVITY VERIFICATION ================");
        
        // Check scene existence
        if (!this.scene) {
            console.error("Scene is not initialized");
            return false;
        }
        
        // Check computer object
        if (!this.computer) {
            console.error("Computer object not found");
            return false;
        }
        
        // Check if computer has proper userData
        if (!this.computer.userData) {
            console.error("Computer userData is missing");
            return false;
        }
        
        // Check interactive flags
        const hasIsInteractive = !!this.computer.userData.isInteractive;
        const hasObjectType = !!this.computer.userData.objectType;
        const hasType = !!this.computer.userData.type;
        
        console.log("Computer interactive properties:", {
            isInteractive: hasIsInteractive,
            objectType: this.computer.userData.objectType,
            type: this.computer.userData.type
        });
        
        // Check if computer is in scene
        const computerInScene = this.scene.children.includes(this.computer);
        console.log(`Computer in scene: ${computerInScene}`);
        
        // Check if computer is in interactiveObjects array
        if (!this.interactiveObjects) {
            console.error("interactiveObjects array is undefined");
            return false;
        }
        
        const computerInInteractiveObjects = this.interactiveObjects.includes(this.computer);
        console.log(`Computer in interactiveObjects array: ${computerInInteractiveObjects}`);
        
        // Check if raycaster and camera exist
        if (!this.raycaster || !this.camera) {
            console.error("Raycaster or camera is missing");
            return false;
        }
        
        // Final score
        const interactivityScore = [
            hasIsInteractive,
            hasObjectType || hasType,
            computerInScene,
            computerInInteractiveObjects
        ].filter(Boolean).length;
        
        console.log(`Computer interactivity score: ${interactivityScore}/4`);
        
        return interactivityScore === 4;
    }
    
    // Comprehensive function to verify and fix computer interactivity issues
    verifyAndFixComputerInteractivity() {
        console.log("STARTING COMPREHENSIVE COMPUTER INTERACTIVITY VERIFICATION AND FIX");
        
        // 1. Check if loading screen is hidden
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
            console.log("Loading screen found to be visible - hiding it");
            this.ensureLoadingScreenHidden();
        }
        
        // 2. Check scene-container z-index and pointer-events
        const sceneContainer = document.getElementById('scene-container');
        if (sceneContainer) {
            const computedStyle = window.getComputedStyle(sceneContainer);
            console.log("Scene container style:", {
                zIndex: computedStyle.zIndex,
                pointerEvents: computedStyle.pointerEvents
            });
            
            // Fix scene container if needed
            if (computedStyle.pointerEvents === 'none' || computedStyle.zIndex === 'auto') {
                console.log("Fixing scene container styles");
                sceneContainer.style.pointerEvents = 'auto';
                sceneContainer.style.zIndex = '10'; // Above background, below UI
            }
        }
        
        // 3. Check if computer exists, has proper properties
        if (!this.computer) {
            console.error("Computer object not found - creating fallback");
            this.computer = this.assetLoader.createPlaceholder('computer');
            this.computer.position.set(0, 0.75, 0);
            this.scene.add(this.computer);
        }
        
        // 4. Verify and fix computer userData properties
        if (!this.computer.userData) {
            this.computer.userData = {};
        }
        
        // Set interactive properties directly
        this.computer.userData.isInteractive = true;
        this.computer.userData.objectType = 'computer';
        this.computer.userData.type = 'computer'; // For backward compatibility
        console.log("Computer userData fixed:", this.computer.userData);
        
        // 5. Ensure computer is in scene
        if (!this.scene.children.includes(this.computer)) {
            console.log("Computer not found in scene - adding it");
            this.scene.add(this.computer);
        }
        
        // 6. Ensure computer is in interactiveObjects array
        if (!this.interactiveObjects) {
            this.interactiveObjects = [];
        }
        
        if (!this.interactiveObjects.includes(this.computer)) {
            console.log("Computer not found in interactiveObjects - adding it");
            this.interactiveObjects.push(this.computer);
        }
        
        // 7. Make sure all computer children are also interactive
        console.log("Making all computer children interactive");
        this.computer.traverse(child => {
            if (child !== this.computer) {
                if (!child.userData) {
                    child.userData = {};
                }
                child.userData.isInteractive = true;
                child.userData.objectType = 'computer';
                child.userData.type = 'computer';
                child.userData.isComputerPart = true;
            }
        });
        
        // 8. Check camera position for good view of computer
        const computerPosition = new THREE.Vector3();
        this.computer.getWorldPosition(computerPosition);
        const cameraToComputer = new THREE.Vector3().subVectors(computerPosition, this.camera.position);
        const distance = cameraToComputer.length();
        
        console.log("Camera to computer distance:", distance);
        if (distance > 5 || distance < 2) {
            console.log("Adjusting camera for better view of computer");
            this.camera.position.set(3, 2.5, 3);
            this.camera.lookAt(computerPosition);
            
            if (this.controls) {
                this.controls.target.copy(computerPosition);
                this.controls.update();
            }
        }
        
        // 9. Verify direct click handler setup
        const canvas = this.renderer.domElement;
        const hasClickHandler = canvas._hasClickListener;
        
        if (!hasClickHandler) {
            console.log("Re-adding click handler to canvas");
            canvas.addEventListener('click', this.handleCanvasClick.bind(this));
            canvas._hasClickListener = true;
        }
        
        // 10. Add a visual highlight to the computer to confirm it's selectable
        this.highlightComputerForUser();
        
        // 11. Run debug verification checks
        const verificationPassed = this.debugVerifyComputerInteractivity();
        console.log(`Final verification: ${verificationPassed ? 'PASSED' : 'FAILED'}`);
        
        return "Computer interactivity fix complete. The computer should now be clickable. If not, check console logs for details.";
    }
    
    // Add a temporary visual highlight to show the computer is interactive
    highlightComputerForUser() {
        if (!this.computer) return;
        
        // Create a pulsing outline effect
        const originalMaterials = [];
        
        // Store original materials and replace with highlight materials
        this.computer.traverse(child => {
            if (child.isMesh && child.material) {
                originalMaterials.push({
                    object: child,
                    material: child.material
                });
                
                // Create highlight material
                const highlightMaterial = child.material.clone();
                highlightMaterial.emissive = new THREE.Color(0x00ff00);
                highlightMaterial.emissiveIntensity = 0.7;
                highlightMaterial.transparent = true;
                highlightMaterial.opacity = 0.9;
                
                // Apply highlight
                child.material = highlightMaterial;
            }
        });
        
        // Pulse animation
        let pulseIntensity = 0.7;
        let increasing = false;
        const pulseInterval = setInterval(() => {
            if (increasing) {
                pulseIntensity += 0.05;
                if (pulseIntensity >= 0.9) increasing = false;
            } else {
                pulseIntensity -= 0.05;
                if (pulseIntensity <= 0.2) increasing = true;
            }
            
            // Update all highlight materials
            this.computer.traverse(child => {
                if (child.isMesh && child.material && child.material.emissiveIntensity !== undefined) {
                    child.material.emissiveIntensity = pulseIntensity;
                }
            });
        }, 50);
        
        // Show tooltip
        const tooltip = document.createElement('div');
        tooltip.style.position = 'fixed';
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -80px)';
        tooltip.style.backgroundColor = 'rgba(0, 255, 100, 0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '10px 15px';
        tooltip.style.borderRadius = '5px';
        tooltip.style.fontWeight = 'bold';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '1000';
        tooltip.textContent = 'Click on the computer!';
        document.body.appendChild(tooltip);
        
        // Reset everything after a few seconds
        setTimeout(() => {
            clearInterval(pulseInterval);
            
            // Restore original materials
            originalMaterials.forEach(item => {
                item.object.material = item.material;
            });
            
            // Remove tooltip
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 5000);
    }

    // Add debugging tools for development
    setupDebugTools() {
        console.log("Setting up debug tools");
        
        // Create debug overlay element
        this.debugOverlay = document.createElement('div');
        this.debugOverlay.id = 'debug-overlay';
        this.debugOverlay.style.position = 'fixed';
        this.debugOverlay.style.top = '10px';
        this.debugOverlay.style.right = '10px';
        this.debugOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.debugOverlay.style.color = '#00ff00';
        this.debugOverlay.style.padding = '10px';
        this.debugOverlay.style.borderRadius = '5px';
        this.debugOverlay.style.fontFamily = 'monospace';
        this.debugOverlay.style.fontSize = '12px';
        this.debugOverlay.style.zIndex = '9999';
        this.debugOverlay.style.maxWidth = '400px';
        this.debugOverlay.style.maxHeight = '300px';
        this.debugOverlay.style.overflow = 'auto';
        this.debugOverlay.style.display = 'none';
        document.body.appendChild(this.debugOverlay);
        
        // Add toggle with tilde key
        document.addEventListener('keydown', (e) => {
            if (e.key === '`' || e.key === '~') {
                this.debugOverlay.style.display = this.debugOverlay.style.display === 'none' ? 'block' : 'none';
                this.updateDebugInfo();
            }
        });
        
        // Create test button panel for quick testing
        this.testPanel = document.createElement('div');
        this.testPanel.id = 'test-panel';
        this.testPanel.style.position = 'fixed';
        this.testPanel.style.bottom = '10px';
        this.testPanel.style.right = '10px';
        this.testPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.testPanel.style.padding = '10px';
        this.testPanel.style.borderRadius = '5px';
        this.testPanel.style.zIndex = '9998';
        this.testPanel.style.display = 'none';
        document.body.appendChild(this.testPanel);
        
        // Add test buttons
        const testButtons = [
            { name: 'Show Computer', action: () => this.handleObjectClick('computer') },
            { name: 'Email Panel', action: () => this.ui?.switchPanel('email') },
            { name: 'Coding Panel', action: () => this.ui?.switchPanel('coding') },
            { name: 'Resources Panel', action: () => this.ui?.switchPanel('resources') },
            { name: 'Shop Panel', action: () => this.ui?.switchPanel('shop') },
            { name: 'Social Panel', action: () => this.ui?.switchPanel('social') },
            { name: 'End Day', action: () => this.ui?.handleEndDay() }
        ];
        
        testButtons.forEach(buttonInfo => {
            const button = document.createElement('button');
            button.innerText = buttonInfo.name;
            button.style.margin = '5px';
            button.style.padding = '5px 10px';
            button.style.backgroundColor = '#333';
            button.style.color = 'white';
            button.style.border = '1px solid #555';
            button.style.borderRadius = '3px';
            button.style.cursor = 'pointer';
            button.addEventListener('click', buttonInfo.action);
            this.testPanel.appendChild(button);
        });
        
        // Log toggle button
        const toggleLogsBtn = document.createElement('button');
        toggleLogsBtn.innerText = 'Toggle Test Panel';
        toggleLogsBtn.style.position = 'fixed';
        toggleLogsBtn.style.bottom = '10px';
        toggleLogsBtn.style.right = '10px';
        toggleLogsBtn.style.backgroundColor = '#444';
        toggleLogsBtn.style.color = 'white';
        toggleLogsBtn.style.border = 'none';
        toggleLogsBtn.style.borderRadius = '3px';
        toggleLogsBtn.style.padding = '5px 10px';
        toggleLogsBtn.style.zIndex = '9999';
        toggleLogsBtn.style.cursor = 'pointer';
        
        toggleLogsBtn.addEventListener('click', () => {
            this.testPanel.style.display = this.testPanel.style.display === 'none' ? 'block' : 'none';
        });
        
        document.body.appendChild(toggleLogsBtn);
        
        // Schedule periodic updates to the debug info
        setInterval(() => {
            if (this.debugOverlay.style.display !== 'none') {
                this.updateDebugInfo();
            }
        }, 1000);
    }
    
    // Update debug information
    updateDebugInfo() {
        if (!this.debugOverlay) return;
        
        try {
            const info = document.createElement('div');
            
            // Game state info
            const gameStateInfo = document.createElement('div');
            gameStateInfo.innerHTML = `<h3>Game State</h3>
                <p>Day: ${this.gameState.day}</p>
                <p>Time Blocks: ${this.gameState.timeBlocks - this.gameState.timeBlocksUsed}/${this.gameState.timeBlocks}</p>
                <p>Money: $${this.gameState.money}</p>
                <p>Coding Skill: ${this.gameState.skills.coding.toFixed(1)}</p>
                <p>Prompt Skill: ${this.gameState.skills.prompt.toFixed(1)}</p>
                <p>Active Projects: ${this.gameState.activeProjects.length}</p>`;
            
            // Computer interactivity info
            const computerInfo = document.createElement('div');
            computerInfo.innerHTML = `<h3>Computer Status</h3>
                <p>Computer Object: ${this.computer ? '✅' : '❌'}</p>
                <p>Interactive: ${this.computer?.userData?.isInteractive ? '✅' : '❌'}</p>
                <p>In interactiveObjects: ${this.interactiveObjects?.includes(this.computer) ? '✅' : '❌'}</p>
                <p>Computer Screen: ${document.getElementById('computer-screen') ? '✅' : '❌'}</p>`;
            
            // UI info
            const uiInfo = document.createElement('div');
            const visiblePanel = Array.from(document.querySelectorAll('.panel')).filter(p => !p.classList.contains('hidden'))[0]?.id || 'None';
            uiInfo.innerHTML = `<h3>UI Status</h3>
                <p>UI Object: ${this.ui ? '✅' : '❌'}</p>
                <p>UI Overlay Visible: ${!document.getElementById('ui-overlay')?.classList.contains('hidden') ? '✅' : '❌'}</p>
                <p>Current Panel: ${visiblePanel}</p>
                <p>Loading Screen Hidden: ${document.getElementById('loading-screen')?.classList.contains('hidden') ? '✅' : '❌'}</p>`;
            
            // Combine all sections
            info.appendChild(gameStateInfo);
            info.appendChild(document.createElement('hr'));
            info.appendChild(computerInfo);
            info.appendChild(document.createElement('hr'));
            info.appendChild(uiInfo);
            
            // Add timestamp
            const timestamp = document.createElement('div');
            timestamp.innerHTML = `<p><em>Last updated: ${new Date().toLocaleTimeString()}</em></p>`;
            info.appendChild(timestamp);
            
            // Update the overlay
            this.debugOverlay.innerHTML = '';
            this.debugOverlay.appendChild(info);
        } catch (error) {
            console.error("Error updating debug info:", error);
            this.debugOverlay.innerHTML = `<p>Error updating debug info: ${error.message}</p>`;
        }
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing game');
    
    // Add the missing function to check UI element visibility
    function checkElementVisibility() {
        // Simple helper to check if key UI elements exist and are properly visible/hidden
        console.log("Checking UI element visibility");
        const elementsToCheck = {
            'scene-container': { shouldBeHidden: false },
            'loading-screen': { shouldBeHidden: false }, // Initially visible, hidden after loading
            'ui-overlay': { shouldBeHidden: true }, // Initially hidden
            'computer-screen': { shouldBeHidden: true } // Initially hidden
        };
        
        for (const [id, config] of Object.entries(elementsToCheck)) {
            const element = document.getElementById(id);
            if (element) {
                const isHidden = element.classList.contains('hidden') || 
                                 window.getComputedStyle(element).display === 'none';
                console.log(`Element #${id}: ${isHidden ? 'hidden' : 'visible'} (should be ${config.shouldBeHidden ? 'hidden' : 'visible'})`);
            } else {
                console.warn(`Element #${id} not found in DOM`);
            }
        }
    }
    
    // Debug any potential issues with the UI
    checkElementVisibility();
    
    try {
        // First check if THREE is available
        if (typeof THREE === 'undefined') {
            console.warn("THREE.js not found, using simplified fallback");
            throw new Error("THREE.js library not available");
        }
        
        // Initialize the game with error handling
        window.game = new Game(); // Make it global for debugging
        console.log("Game initialized successfully");
        console.log("For debugging: Call window.game.verifyAndFixComputerInteractivity() in console if computer is unclickable");
    } catch (error) {
        console.error("Error initializing game:", error);
        
        // Show error message on loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            const loadingContent = loadingScreen.querySelector('.loading-content');
            if (loadingContent) {
                loadingContent.innerHTML = `
                    <h1>Vibe Coding Simulator</h1>
                    <p style="color: red;">Error loading game: ${error.message}</p>
                    <p>Attempting to use fallback mode...</p>
                    <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px;">Reload</button>
                `;
            }
        }
        
        // Try to initialize with fallbacks
        initializeWithFallbacks(error);
    }
}); 