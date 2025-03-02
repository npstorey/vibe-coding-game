import * as THREE from 'three';

/**
 * Handles animations for 3D objects in the scene
 */
export class AnimationManager {
    constructor() {
        this.animations = [];
        this.clock = new THREE.Clock();
    }
    
    /**
     * Add a keyboard typing animation
     * 
     * @param {THREE.Mesh} keyboard - The keyboard mesh to animate
     * @returns {Object} - The animation object
     */
    addKeyboardTypingAnimation(keyboard) {
        const animation = {
            object: keyboard,
            type: 'typing',
            active: true,
            speed: 0.15,
            intensity: 0.001, // How much the keyboard moves
            initialY: keyboard.position.y,
            update: (deltaTime) => {
                if (!animation.active) return;
                
                const time = this.clock.getElapsedTime();
                const offset = Math.sin(time * animation.speed * 10) * animation.intensity;
                keyboard.position.y = animation.initialY + offset;
            }
        };
        
        this.animations.push(animation);
        return animation;
    }
    
    /**
     * Add a floating/hover animation to an object
     * 
     * @param {THREE.Object3D} object - The object to animate
     * @param {Object} options - Animation options
     * @returns {Object} - The animation object
     */
    addFloatingAnimation(object, options = {}) {
        const { speed = 1, intensity = 0.05, axis = 'y' } = options;
        const initialPosition = { ...object.position };
        
        const animation = {
            object: object,
            type: 'floating',
            active: true,
            speed: speed,
            intensity: intensity,
            axis: axis,
            initialPosition: initialPosition,
            update: (deltaTime) => {
                if (!animation.active) return;
                
                const time = this.clock.getElapsedTime();
                const offset = Math.sin(time * animation.speed) * animation.intensity;
                
                if (axis === 'y') {
                    object.position.y = initialPosition.y + offset;
                } else if (axis === 'x') {
                    object.position.x = initialPosition.x + offset;
                } else if (axis === 'z') {
                    object.position.z = initialPosition.z + offset;
                }
            }
        };
        
        this.animations.push(animation);
        return animation;
    }
    
    /**
     * Add a breathing effect animation (scaling up and down)
     * 
     * @param {THREE.Object3D} object - The object to animate
     * @param {Object} options - Animation options
     * @returns {Object} - The animation object
     */
    addBreathingAnimation(object, options = {}) {
        const { speed = 1, intensity = 0.02 } = options;
        const initialScale = object.scale.clone();
        
        const animation = {
            object: object,
            type: 'breathing',
            active: true,
            speed: speed,
            intensity: intensity,
            initialScale: initialScale,
            update: (deltaTime) => {
                if (!animation.active) return;
                
                const time = this.clock.getElapsedTime();
                const scale = 1 + (Math.sin(time * animation.speed) * animation.intensity);
                
                object.scale.set(
                    initialScale.x * scale,
                    initialScale.y * scale,
                    initialScale.z * scale
                );
            }
        };
        
        this.animations.push(animation);
        return animation;
    }
    
    /**
     * Add a rotation animation to an object
     * 
     * @param {THREE.Object3D} object - The object to animate
     * @param {Object} options - Animation options
     * @returns {Object} - The animation object
     */
    addRotationAnimation(object, options = {}) {
        const { speed = 1, axis = 'y' } = options;
        
        const animation = {
            object: object,
            type: 'rotation',
            active: true,
            speed: speed,
            axis: axis,
            update: (deltaTime) => {
                if (!animation.active) return;
                
                if (axis === 'y') {
                    object.rotation.y += deltaTime * animation.speed;
                } else if (axis === 'x') {
                    object.rotation.x += deltaTime * animation.speed;
                } else if (axis === 'z') {
                    object.rotation.z += deltaTime * animation.speed;
                }
            }
        };
        
        this.animations.push(animation);
        return animation;
    }
    
    /**
     * Add a blinking light animation
     * 
     * @param {THREE.Light} light - The light to animate
     * @param {Object} options - Animation options
     * @returns {Object} - The animation object
     */
    addBlinkingLightAnimation(light, options = {}) {
        const { speed = 1, minIntensity = 0.5, maxIntensity = 1 } = options;
        const initialIntensity = light.intensity;
        
        const animation = {
            object: light,
            type: 'blinking',
            active: true,
            speed: speed,
            minIntensity: minIntensity * initialIntensity,
            maxIntensity: maxIntensity * initialIntensity,
            initialIntensity: initialIntensity,
            update: (deltaTime) => {
                if (!animation.active) return;
                
                const time = this.clock.getElapsedTime();
                const t = (Math.sin(time * animation.speed) + 1) / 2; // Convert to 0-1 range
                
                light.intensity = animation.minIntensity + (t * (animation.maxIntensity - animation.minIntensity));
            }
        };
        
        this.animations.push(animation);
        return animation;
    }
    
    /**
     * Add a screen animation (like a flickering monitor)
     * 
     * @param {THREE.Mesh} screen - The screen mesh to animate
     * @param {Object} options - Animation options
     * @returns {Object} - The animation object
     */
    addScreenAnimation(screen, options = {}) {
        const { speed = 2, minBrightness = 0.8, maxBrightness = 1.1 } = options;
        const material = screen.material;
        
        // Make sure we're dealing with a MeshBasicMaterial or similar
        if (!material.color) {
            console.warn('Screen animation requires a material with a color property');
            return null;
        }
        
        const initialColor = material.color.clone();
        
        const animation = {
            object: screen,
            type: 'screen',
            active: true,
            speed: speed,
            minBrightness: minBrightness,
            maxBrightness: maxBrightness,
            initialColor: initialColor,
            update: (deltaTime) => {
                if (!animation.active) return;
                
                const time = this.clock.getElapsedTime();
                // Add some randomness for a more realistic effect
                const flicker = Math.sin(time * animation.speed) * 0.1 + (Math.random() * 0.05);
                const brightness = animation.minBrightness + flicker;
                
                material.color.setRGB(
                    initialColor.r * brightness,
                    initialColor.g * brightness,
                    initialColor.b * brightness
                );
            }
        };
        
        this.animations.push(animation);
        return animation;
    }
    
    /**
     * Add a day-night cycle animation that changes the ambient light
     * 
     * @param {THREE.AmbientLight} light - The ambient light to animate
     * @param {Object} options - Animation options
     * @returns {Object} - The animation object
     */
    addDayNightCycleAnimation(light, options = {}) {
        const { 
            cycleDuration = 120, // seconds for a full day-night cycle
            dayColor = 0xFFFFFF,
            nightColor = 0x334455,
            maxIntensity = 1,
            minIntensity = 0.2
        } = options;
        
        const dayColorObj = new THREE.Color(dayColor);
        const nightColorObj = new THREE.Color(nightColor);
        
        const animation = {
            object: light,
            type: 'dayNight',
            active: true,
            cycleDuration: cycleDuration,
            dayColor: dayColorObj,
            nightColor: nightColorObj,
            maxIntensity: maxIntensity,
            minIntensity: minIntensity,
            update: (deltaTime) => {
                if (!animation.active) return;
                
                const time = this.clock.getElapsedTime();
                // Convert to a 0-1 cycle
                const cycle = (time % animation.cycleDuration) / animation.cycleDuration;
                
                // More time in day than night (2/3 day, 1/3 night)
                let t;
                if (cycle < 0.67) {
                    // Day time
                    t = cycle / 0.67; // Normalize to 0-1 for the day portion
                    t = Math.sin(t * Math.PI); // Smooth sine curve for transition
                    
                    // Blend from morning to day to evening
                    light.color.copy(animation.nightColor).lerp(animation.dayColor, t);
                    light.intensity = animation.minIntensity + (t * (animation.maxIntensity - animation.minIntensity));
                } else {
                    // Night time
                    t = (cycle - 0.67) / 0.33; // Normalize to 0-1 for the night portion
                    t = Math.cos(t * Math.PI / 2); // Smooth cosine curve for transition
                    
                    // Blend from evening to night
                    light.color.copy(animation.nightColor).lerp(animation.dayColor, t);
                    light.intensity = animation.minIntensity + (t * (animation.maxIntensity - animation.minIntensity));
                }
            }
        };
        
        this.animations.push(animation);
        return animation;
    }
    
    /**
     * Add a color cycling animation to an object and its light
     * 
     * @param {Object} ledObject - Object containing strip mesh and point light
     * @param {Object} options - Animation options
     * @returns {Object} - The animation object
     */
    addColorCycleAnimation(ledObject, options = {}) {
        const { 
            speed = 0.5, 
            colors = [0xff1a8c, 0x00aaff, 0x00ff99, 0xffaa00],
            intensity = 1.0
        } = options;
        
        // Convert hex colors to THREE.Color objects
        const threeColors = colors.map(color => new THREE.Color(color));
        
        const animation = {
            object: ledObject,
            type: 'colorCycle',
            active: true,
            speed,
            colors: threeColors,
            colorIndex: 0,
            lerpFactor: 0,
            currentColor: new THREE.Color(threeColors[0]),
            nextColor: new THREE.Color(threeColors[1]),
            intensity,
            
            update: (deltaTime) => {
                if (!animation.active) return;
                
                // Update lerp factor
                animation.lerpFactor += deltaTime * animation.speed;
                
                // If lerp complete, move to next color
                if (animation.lerpFactor >= 1) {
                    animation.lerpFactor = 0;
                    animation.colorIndex = (animation.colorIndex + 1) % animation.colors.length;
                    animation.currentColor.copy(animation.nextColor);
                    animation.nextColor.copy(animation.colors[(animation.colorIndex + 1) % animation.colors.length]);
                }
                
                // Interpolate between colors
                const lerpedColor = new THREE.Color();
                lerpedColor.copy(animation.currentColor).lerp(animation.nextColor, animation.lerpFactor);
                
                // Apply color to LED strip mesh
                if (ledObject.strip && ledObject.strip.material) {
                    ledObject.strip.material.color.copy(lerpedColor);
                    ledObject.strip.material.emissive = lerpedColor;
                }
                
                // Apply color to light if present
                if (ledObject.light) {
                    ledObject.light.color.copy(lerpedColor);
                }
            }
        };
        
        this.animations.push(animation);
        return animation;
    }
    
    /**
     * Update all animations
     */
    update() {
        const deltaTime = this.clock.getDelta();
        
        for (const animation of this.animations) {
            if (animation.active) {
                animation.update(deltaTime);
            }
        }
    }
    
    /**
     * Stop all animations
     */
    stopAll() {
        this.animations.forEach(animation => {
            animation.active = false;
        });
    }
    
    /**
     * Start all animations
     */
    startAll() {
        this.animations.forEach(animation => {
            animation.active = true;
        });
    }
    
    /**
     * Remove an animation
     * 
     * @param {Object} animation - The animation to remove
     */
    removeAnimation(animation) {
        const index = this.animations.indexOf(animation);
        if (index !== -1) {
            this.animations.splice(index, 1);
        }
    }
    
    /**
     * Register a pulsating effect animation for an object
     * 
     * @param {THREE.Object3D} object - The object to animate
     * @param {number} intensity - How much the object scales
     * @param {number} speed - Speed of the pulsation
     * @returns {Object|null} - The animation object or null if object is undefined
     */
    registerPulsatingEffect(object, intensity = 0.05, speed = 1) {
        if (!object) {
            console.warn("Attempted to register pulsating effect on undefined object");
            return null;
        }
        
        return this.addBreathingAnimation(object, { 
            speed: speed,
            intensity: intensity
        });
    }
    
    /**
     * Enhance the pulsating effect for an object (make it more noticeable)
     * 
     * @param {THREE.Object3D} object - The object to animate
     * @param {number} intensity - How much the object scales
     * @param {number} speed - Speed of the pulsation
     * @returns {Object|null} - The animation object or null if object is undefined
     */
    enhancePulsatingEffect(object, intensity = 0.1, speed = 2) {
        if (!object) {
            console.warn("Attempted to enhance pulsating effect on undefined object");
            return null;
        }
        
        // First find and remove any existing breathing animations for this object
        const existingAnimations = this.animations.filter(
            anim => anim.object === object && anim.type === 'breathing'
        );
        
        for (const anim of existingAnimations) {
            this.removeAnimation(anim);
        }
        
        // Add a new, more pronounced effect
        return this.addBreathingAnimation(object, { 
            speed: speed,
            intensity: intensity
        });
    }
} 