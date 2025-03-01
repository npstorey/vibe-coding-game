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
                screen.userData.clickable = true;
                monitorGroup.add(screen);
                
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
                
            default:
                console.warn(`No placeholder defined for: ${type}`);
                return new THREE.Group();
        }
    }

    // Add method to load models from JSON config
    async loadModelsFromConfig(configPath = 'models/office/models.json') {
        try {
            const response = await fetch(configPath);
            if (!response.ok) {
                throw new Error(`Failed to load model config: ${response.status} ${response.statusText}`);
            }
            
            const config = await response.json();
            console.log('Loaded model configuration:', config);
            
            // Load all models
            const modelPromises = config.models.map(modelInfo => {
                return this.loadModel(modelInfo.path).then(model => {
                    // Apply transformations
                    model.scale.set(
                        modelInfo.scale || 1, 
                        modelInfo.scale || 1, 
                        modelInfo.scale || 1
                    );
                    
                    if (modelInfo.position) {
                        model.position.set(
                            modelInfo.position[0] || 0,
                            modelInfo.position[1] || 0,
                            modelInfo.position[2] || 0
                        );
                    }
                    
                    if (modelInfo.rotation) {
                        model.rotation.set(
                            modelInfo.rotation[0] || 0,
                            modelInfo.rotation[1] || 0,
                            modelInfo.rotation[2] || 0
                        );
                    }
                    
                    // Set the model ID for easy access
                    model.userData.id = modelInfo.id;
                    
                    // Make monitor screen clickable if this is the monitor
                    if (modelInfo.id === 'monitor') {
                        const screenMesh = this.findScreenInModel(model);
                        if (screenMesh) {
                            screenMesh.userData.clickable = true;
                        }
                    }
                    
                    return {
                        id: modelInfo.id,
                        model: model
                    };
                });
            });
            
            // Wait for all models to load
            const loadedModels = await Promise.all(modelPromises);
            
            // Create a map for easy access
            const modelMap = {};
            loadedModels.forEach(item => {
                modelMap[item.id] = item.model;
            });
            
            return {
                models: modelMap,
                config: config
            };
        } catch (error) {
            console.error('Error loading model configuration:', error);
            // If loading fails, return placeholder models instead
            console.log('Falling back to placeholder models');
            return null;
        }
    }

    // Helper method to find the screen in a monitor model
    findScreenInModel(model) {
        let screenMesh = null;
        
        // Search for a mesh that might be the screen
        // Usually screens have different materials and are flat
        model.traverse(child => {
            if (child.isMesh) {
                // Look for mesh with screen-like names or materials
                const lowerName = child.name.toLowerCase();
                if (
                    lowerName.includes('screen') || 
                    lowerName.includes('display') ||
                    (child.material && (
                        child.material.name.toLowerCase().includes('screen') ||
                        child.material.name.toLowerCase().includes('display') ||
                        // Screens are often emissive
                        child.material.emissive?.r > 0 ||
                        child.material.emissive?.g > 0 ||
                        child.material.emissive?.b > 0
                    ))
                ) {
                    screenMesh = child;
                }
            }
        });
        
        // If we couldn't find a screen by name or material,
        // look for a flat, rectangular mesh
        if (!screenMesh) {
            model.traverse(child => {
                if (child.isMesh && !screenMesh) {
                    // Check for flat geometry that could be a screen
                    if (child.geometry.type === 'BufferGeometry') {
                        // Check if it's a flat plane (z-dimension is very small)
                        // We'd need to check the geometry in its local space
                        const positions = child.geometry.attributes.position;
                        if (positions) {
                            let minZ = Infinity;
                            let maxZ = -Infinity;
                            
                            for (let i = 0; i < positions.count; i++) {
                                const z = positions.getZ(i);
                                minZ = Math.min(minZ, z);
                                maxZ = Math.max(maxZ, z);
                            }
                            
                            // If the z-range is small compared to x and y, it might be a screen
                            if ((maxZ - minZ) < 0.1) {
                                screenMesh = child;
                            }
                        }
                    }
                }
            });
        }
        
        return screenMesh;
    }

    // Helper method to load an actual model or return a placeholder if loading fails
    async loadModelWithFallback(modelInfo) {
        try {
            const model = await this.loadModel(modelInfo.path);
            
            // Apply transformations from modelInfo
            if (modelInfo.scale) {
                model.scale.set(modelInfo.scale, modelInfo.scale, modelInfo.scale);
            }
            
            if (modelInfo.position) {
                model.position.set(
                    modelInfo.position[0] || 0,
                    modelInfo.position[1] || 0,
                    modelInfo.position[2] || 0
                );
            }
            
            if (modelInfo.rotation) {
                model.rotation.set(
                    modelInfo.rotation[0] || 0,
                    modelInfo.rotation[1] || 0,
                    modelInfo.rotation[2] || 0
                );
            }
            
            return model;
        } catch (error) {
            console.warn(`Failed to load model ${modelInfo.id}, using placeholder instead:`, error);
            const placeholder = this.createPlaceholder(modelInfo.id);
            
            // Apply position from modelInfo (scale is handled in createPlaceholder)
            if (modelInfo.position) {
                placeholder.position.set(
                    modelInfo.position[0] || 0,
                    modelInfo.position[1] || 0,
                    modelInfo.position[2] || 0
                );
            }
            
            if (modelInfo.rotation) {
                placeholder.rotation.set(
                    modelInfo.rotation[0] || 0,
                    modelInfo.rotation[1] || 0,
                    modelInfo.rotation[2] || 0
                );
            }
            
            return placeholder;
        }
    }
} 