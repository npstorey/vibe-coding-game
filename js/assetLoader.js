import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

/**
 * Handles loading of 3D models, textures, and other assets
 */
export class AssetLoader {
    constructor(onProgressCallback) {
        // Initialize loaders
        this.textureLoader = new THREE.TextureLoader();
        this.gltfLoader = new GLTFLoader();
        
        // Initialize DRACO loader for compressed models
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        this.gltfLoader.setDRACOLoader(this.dracoLoader);
        
        // HDR loader for environment maps
        this.rgbeLoader = new RGBELoader();
        
        // Progress tracking
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.onProgressCallback = onProgressCallback || (() => {});
        
        // Models storage
        this.models = {};
    }
    
    /**
     * Updates the loading progress and calls the progress callback
     */
    updateProgress() {
        const progress = this.totalAssets > 0 ? (this.loadedAssets / this.totalAssets) * 100 : 0;
        this.onProgressCallback(progress);
    }
    
    /**
     * Loads a 3D model from a GLTF/GLB file
     * 
     * @param {string} path - Path to the model file
     * @returns {Promise} - Promise that resolves with the loaded model
     */
    loadModel(path) {
        this.totalAssets++;
        this.updateProgress();
        
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                path,
                (gltf) => {
                    this.loadedAssets++;
                    this.updateProgress();
                    resolve(gltf);
                },
                (xhr) => {
                    // Progress callback if needed
                },
                (error) => {
                    console.error(`Error loading model: ${path}`, error);
                    this.loadedAssets++;
                    this.updateProgress();
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Loads a texture from an image file
     * 
     * @param {string} path - Path to the texture image
     * @returns {Promise} - Promise that resolves with the loaded texture
     */
    loadTexture(path) {
        this.totalAssets++;
        this.updateProgress();
        
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                path,
                (texture) => {
                    this.loadedAssets++;
                    this.updateProgress();
                    resolve(texture);
                },
                (xhr) => {
                    // Progress callback if needed
                },
                (error) => {
                    console.error(`Error loading texture: ${path}`, error);
                    this.loadedAssets++;
                    this.updateProgress();
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Loads an HDR environment map
     * 
     * @param {string} path - Path to the HDR file
     * @returns {Promise} - Promise that resolves with the loaded HDR texture
     */
    loadEnvironmentMap(path) {
        this.totalAssets++;
        this.updateProgress();
        
        return new Promise((resolve, reject) => {
            this.rgbeLoader.load(
                path,
                (texture) => {
                    this.loadedAssets++;
                    this.updateProgress();
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    resolve(texture);
                },
                (xhr) => {
                    // Progress callback if needed
                },
                (error) => {
                    console.error(`Error loading HDR: ${path}`, error);
                    this.loadedAssets++;
                    this.updateProgress();
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Creates a simple placeholder model using basic geometries
     * Used when actual models are not available
     * 
     * @param {string} type - Type of placeholder to create
     * @returns {THREE.Mesh} - The created placeholder mesh
     */
    createPlaceholder(type) {
        console.log(`Creating placeholder for: ${type}`);
        
        // For numeric IDs, convert to a known type if possible
        if (typeof type === 'number' || !isNaN(parseInt(type))) {
            const typeMap = {
                0: 'desk',
                1: 'chair',
                2: 'monitor',
                3: 'keyboard',
                4: 'mouse',
                5: 'lamp',
                6: 'bookshelf',
                7: 'plant',
                8: 'mug', // Based on coffee_cup
                9: 'notebook'
            };
            
            if (typeMap[type]) {
                type = typeMap[type];
                console.log(`Mapped numeric type ${type} to ${typeMap[type]}`);
            }
        }
        
        switch (type) {
            case 'desk':
                const deskGeometry = new THREE.BoxGeometry(1.5, 0.05, 0.8);
                const deskMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
                const desk = new THREE.Mesh(deskGeometry, deskMaterial);
                desk.castShadow = true;
                desk.receiveShadow = true;
                return desk;
                
            case 'chair':
                const chairGroup = new THREE.Group();
                
                // Chair seat
                const seatGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
                const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
                const seat = new THREE.Mesh(seatGeometry, seatMaterial);
                seat.castShadow = true;
                chairGroup.add(seat);
                
                // Chair back
                const backGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
                const backMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
                const back = new THREE.Mesh(backGeometry, backMaterial);
                back.position.set(0, 0.275, -0.225);
                back.castShadow = true;
                chairGroup.add(back);
                
                // Chair legs
                const legGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
                const legMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
                
                const positions = [
                    [-0.2, -0.2, 0.2],  // Front left
                    [0.2, -0.2, 0.2],   // Front right
                    [-0.2, -0.2, -0.2], // Back left
                    [0.2, -0.2, -0.2]   // Back right
                ];
                
                positions.forEach(pos => {
                    const leg = new THREE.Mesh(legGeometry, legMaterial);
                    leg.position.set(pos[0], -0.2, pos[1]);
                    leg.castShadow = true;
                    chairGroup.add(leg);
                });
                
                return chairGroup;
                
            case 'monitor':
            case 'computer':
                const monitorGroup = new THREE.Group();
                
                // Monitor base
                const baseGeometry = new THREE.BoxGeometry(0.3, 0.02, 0.2);
                const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
                const base = new THREE.Mesh(baseGeometry, baseMaterial);
                monitorGroup.add(base);
                
                // Monitor stand
                const standGeometry = new THREE.BoxGeometry(0.05, 0.2, 0.05);
                const standMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
                const stand = new THREE.Mesh(standGeometry, standMaterial);
                stand.position.set(0, 0.1, 0);
                monitorGroup.add(stand);
                
                // Monitor frame
                const monitorFrameGeometry = new THREE.BoxGeometry(0.7, 0.4, 0.02);
                const monitorFrameMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
                const monitorFrame = new THREE.Mesh(monitorFrameGeometry, monitorFrameMaterial);
                monitorFrame.position.set(0, 0.32, 0);
                monitorFrame.castShadow = true;
                monitorGroup.add(monitorFrame);
                
                // Monitor screen
                const screenGeometry = new THREE.PlaneGeometry(0.65, 0.35);
                const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
                const screen = new THREE.Mesh(screenGeometry, screenMaterial);
                screen.position.set(0, 0.32, 0.011);
                
                // Set userData for interactivity on the screen and group
                screen.userData.objectType = 'computer';
                screen.userData.isInteractive = true;
                screen.userData.clickable = true;
                
                monitorGroup.userData.objectType = 'computer';
                monitorGroup.userData.isInteractive = true;
                
                monitorGroup.add(screen);
                
                console.log("Created computer placeholder with interactivity data", monitorGroup.userData);
                return monitorGroup;
                
            case 'keyboard':
                const keyboardGeometry = new THREE.BoxGeometry(0.6, 0.02, 0.2);
                const keyboardMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
                const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
                keyboard.castShadow = true;
                return keyboard;
                
            case 'mouse':
                const mouseGeometry = new THREE.BoxGeometry(0.07, 0.03, 0.12);
                const mouseMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
                const mouse = new THREE.Mesh(mouseGeometry, mouseMaterial);
                mouse.castShadow = true;
                return mouse;
                
            case 'lamp':
                const lampGroup = new THREE.Group();
                
                // Base
                const lampBaseGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.02, 16);
                const lampBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
                const lampBase = new THREE.Mesh(lampBaseGeometry, lampBaseMaterial);
                lampGroup.add(lampBase);
                
                // Stem
                const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
                const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
                const stem = new THREE.Mesh(stemGeometry, stemMaterial);
                stem.position.set(0, 0.25, 0);
                lampGroup.add(stem);
                
                // Neck (angled part)
                const neckGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8);
                const neck = new THREE.Mesh(neckGeometry, stemMaterial);
                neck.rotation.z = Math.PI / 4;
                neck.position.set(0.07, 0.45, 0);
                lampGroup.add(neck);
                
                // Shade
                const shadeGeometry = new THREE.ConeGeometry(0.12, 0.15, 16, 1, true);
                const shadeMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, side: THREE.DoubleSide });
                const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
                shade.rotation.z = Math.PI;
                shade.position.set(0.14, 0.45, 0);
                lampGroup.add(shade);
                
                // Light bulb (emissive)
                const bulbGeometry = new THREE.SphereGeometry(0.03, 16, 8);
                const bulbMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0xFFFFFF, 
                    emissive: 0xFFFFAA,
                    emissiveIntensity: 1
                });
                const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
                bulb.position.set(0.14, 0.4, 0);
                lampGroup.add(bulb);
                
                // Add a point light
                const light = new THREE.PointLight(0xFFFFAA, 1, 3);
                light.position.set(0.14, 0.4, 0);
                lampGroup.add(light);
                
                return lampGroup;
                
            case 'bookshelf':
                const shelfGroup = new THREE.Group();
                
                // Frame
                const shelfFrameGeo = new THREE.BoxGeometry(1, 1.5, 0.3);
                const shelfFrameMat = new THREE.MeshStandardMaterial({ color: 0x5C4033 });
                const shelfFrame = new THREE.Mesh(shelfFrameGeo, shelfFrameMat);
                shelfGroup.add(shelfFrame);
                
                // Shelves (horizontal dividers)
                const shelfGeo = new THREE.BoxGeometry(0.95, 0.02, 0.28);
                const shelfMat = new THREE.MeshStandardMaterial({ color: 0x6D4C41 });
                
                // Add 4 shelves
                for (let i = 0; i < 4; i++) {
                    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
                    shelf.position.set(0, -0.6 + (i * 0.37), 0);
                    shelfGroup.add(shelf);
                }
                
                // Add some books
                const bookColors = [0xE53935, 0x43A047, 0x1E88E5, 0xFDD835, 0x8E24AA, 0xF4511E];
                const bookPositions = [
                    [-0.35, -0.5, 0],
                    [-0.2, -0.5, 0],
                    [-0.05, -0.5, 0],
                    [0.1, -0.5, 0],
                    [0.25, -0.5, 0],
                    [-0.3, -0.13, 0],
                    [-0.15, -0.13, 0],
                    [0, -0.13, 0],
                    [0.2, -0.13, 0],
                    [-0.25, 0.24, 0],
                    [-0.1, 0.24, 0],
                    [0.05, 0.24, 0],
                    [0.2, 0.24, 0],
                    [0.35, 0.24, 0],
                    [-0.3, 0.61, 0],
                    [-0.15, 0.61, 0],
                    [0, 0.61, 0],
                    [0.15, 0.61, 0],
                    [0.3, 0.61, 0]
                ];
                
                bookPositions.forEach((pos, i) => {
                    const bookGeo = new THREE.BoxGeometry(0.08, 0.2, 0.2);
                    const bookMat = new THREE.MeshStandardMaterial({ color: bookColors[i % bookColors.length] });
                    const book = new THREE.Mesh(bookGeo, bookMat);
                    book.position.set(pos[0], pos[1], pos[2]);
                    book.castShadow = true;
                    shelfGroup.add(book);
                });
                
                return shelfGroup;
                
            case 'plant':
                // Simple plant placeholder
                const plantGroup = new THREE.Group();
                
                // Pot
                const potGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.12, 16);
                const potMaterial = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });
                const pot = new THREE.Mesh(potGeometry, potMaterial);
                plantGroup.add(pot);
                
                // Plant/Leaves (simplified as spheres)
                const leafGeometry = new THREE.SphereGeometry(0.15, 16, 8);
                const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
                const leaves = new THREE.Mesh(leafGeometry, leafMaterial);
                leaves.position.y = 0.15;
                plantGroup.add(leaves);
                
                return plantGroup;
                
            case 'mug':
            case 'coffee_cup':
                // Simple mug placeholder
                const mugGroup = new THREE.Group();
                
                // Cup
                const cupGeometry = new THREE.CylinderGeometry(0.04, 0.03, 0.08, 16);
                const cupMaterial = new THREE.MeshStandardMaterial({ color: 0xFAFAFA });
                const cup = new THREE.Mesh(cupGeometry, cupMaterial);
                mugGroup.add(cup);
                
                // Handle
                const handleTorus = new THREE.TorusGeometry(0.02, 0.005, 8, 16, Math.PI);
                const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xFAFAFA });
                const handle = new THREE.Mesh(handleTorus, handleMaterial);
                handle.rotation.y = Math.PI / 2;
                handle.position.set(0.04, 0, 0);
                mugGroup.add(handle);
                
                // Coffee (inside the cup)
                const coffeeGeometry = new THREE.CylinderGeometry(0.035, 0.025, 0.01, 16);
                const coffeeMaterial = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
                const coffee = new THREE.Mesh(coffeeGeometry, coffeeMaterial);
                coffee.position.y = 0.035;
                mugGroup.add(coffee);
                
                return mugGroup;
                
            case 'notebook':
                // Simple notebook placeholder
                const notebookGroup = new THREE.Group();
                
                // Base
                const notebookGeometry = new THREE.BoxGeometry(0.2, 0.01, 0.15);
                const notebookMaterial = new THREE.MeshStandardMaterial({ color: 0x2196F3 });
                const notebook = new THREE.Mesh(notebookGeometry, notebookMaterial);
                notebookGroup.add(notebook);
                
                // Pages (white top)
                const pagesGeometry = new THREE.BoxGeometry(0.19, 0.005, 0.14);
                const pagesMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
                const pages = new THREE.Mesh(pagesGeometry, pagesMaterial);
                pages.position.y = 0.0075;
                notebookGroup.add(pages);
                
                return notebookGroup;
                
            default:
                console.warn(`No placeholder defined for: ${type}`);
                // Return a simple colored cube as a fallback for any undefined types
                const genericGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
                const genericMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
                return new THREE.Mesh(genericGeometry, genericMaterial);
        }
    }

    /**
     * Loads all models defined in the configuration file
     * @returns {Promise} Promise that resolves when all models are loaded
     */
    loadModelsFromConfig() {
        return new Promise((resolve, reject) => {
            // Log that we're trying to load models
            console.log("Loading models from configuration");
            
            // Initialize models object if it doesn't exist
            this.models = {};
            
            try {
                console.log("Using placeholder models for all objects");
                
                // Create placeholders for all standard office objects
                const standardObjects = [
                    'desk', 'chair', 'computer', 'monitor', 'keyboard', 
                    'mouse', 'lamp', 'bookshelf', 'plant', 'coffee_cup', 'mug', 'notebook'
                ];
                
                // Create a placeholder for each standard object
                standardObjects.forEach((key, index) => {
                    console.log(`Creating placeholder for: ${key}`);
                    this.models[key] = this.createPlaceholder(key);
                    // Also store by index for fallback access
                    this.models[index] = this.models[key];
                });
                
                // Map model IDs for convenience
                // This creates aliases like 'computer' -> 'monitor'
                if (this.models['monitor'] && !this.models['computer']) {
                    this.models['computer'] = this.models['monitor'];
                }
                
                if (this.models['coffee_cup'] && !this.models['mug']) {
                    this.models['mug'] = this.models['coffee_cup'];
                }
                
                console.log("All placeholder models created successfully");
                resolve(this.models);
            } catch (error) {
                console.error("Error creating placeholder models:", error);
                // Return empty models object
                resolve(this.models || {});
            }
        });
    }

    /**
     * Get a loaded model by key
     * @param {string} key - The key of the model to get
     * @returns {THREE.Object3D|null} - The model or null if not found
     */
    getModel(key) {
        if (this.models && this.models[key]) {
            return this.models[key];
        }
        
        console.warn(`Model '${key}' not found, creating placeholder`);
        return this.createPlaceholder(key);
    }
} 