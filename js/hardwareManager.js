/**
 * Manages the hardware inventory and upgrade options available to the player
 */
export class HardwareManager {
    constructor() {
        // Define hardware tiers and their specs
        this.hardware = {
            // Tier 1 Hardware
            'starter-pc': {
                name: 'Starter PC',
                tier: 1,
                type: 'computer',
                specs: {
                    cpu: 'Basic CPU',
                    gpu: 'Integrated Graphics',
                    ram: '8GB RAM',
                    storage: '256GB SSD'
                },
                description: 'A basic setup sufficient for simple projects and Tier 1 AI models.',
                price: 0, // Already owned
                maxAITier: 1
            },
            'cloud-basic': {
                name: 'Basic Cloud Credits',
                tier: 1,
                type: 'cloud',
                specs: {
                    credits: '100 credits',
                    servers: 'Shared instances',
                    performance: 'Standard'
                },
                description: 'Entry-level cloud computing resources for simple deployments.',
                price: 200,
                maxAITier: 1
            },
            
            // Tier 2 Hardware
            'mid-range-pc': {
                name: 'Mid-Range Workstation',
                tier: 2,
                type: 'computer',
                specs: {
                    cpu: 'Multi-core CPU',
                    gpu: 'RTX 4070',
                    ram: '16GB RAM',
                    storage: '512GB SSD'
                },
                description: 'A solid development machine capable of running Tier 2 AI models efficiently.',
                price: 1500,
                maxAITier: 2
            },
            'cloud-standard': {
                name: 'Standard Cloud Package',
                tier: 2,
                type: 'cloud',
                specs: {
                    credits: '300 credits',
                    servers: 'Dedicated instances',
                    performance: 'Enhanced'
                },
                description: 'More robust cloud computing with dedicated resources.',
                price: 500,
                maxAITier: 2
            }
        };
        
        // Default player hardware
        this.ownedHardware = ['starter-pc'];
        this.cloudCredits = 50; // Starting cloud credits
        
        // GPU resource management
        this.gpuUnits = 1; // Player starts with 1 GPU
        this.gpuInUse = false; // Initially not in use
        
        console.log("Hardware Manager initialized with:", {
            ownedHardware: this.ownedHardware,
            cloudCredits: this.cloudCredits,
            gpuUnits: this.gpuUnits
        });
    }
    
    // Get all available hardware for purchase
    getAvailableHardware() {
        return Object.entries(this.hardware)
            .filter(([key, _]) => !this.ownedHardware.includes(key))
            .map(([key, hardware]) => ({
                key,
                ...hardware
            }));
    }
    
    // Get owned hardware
    getOwnedHardware() {
        return this.ownedHardware.map(key => ({
            key,
            ...this.hardware[key]
        }));
    }
    
    // Purchase new hardware
    purchaseHardware(hardwareKey, playerMoney) {
        const hardware = this.hardware[hardwareKey];
        if (!hardware) return { success: false, message: 'Hardware not found' };
        
        if (this.ownedHardware.includes(hardwareKey)) {
            return { success: false, message: 'You already own this hardware' };
        }
        
        if (playerMoney < hardware.price) {
            return { success: false, message: 'Not enough money' };
        }
        
        this.ownedHardware.push(hardwareKey);
        return { 
            success: true, 
            message: `Purchased ${hardware.name}`, 
            cost: hardware.price 
        };
    }
    
    // Purchase cloud credits
    purchaseCloudCredits(amount, price, playerMoney) {
        if (playerMoney < price) {
            return { success: false, message: 'Not enough money' };
        }
        
        this.cloudCredits += amount;
        return { 
            success: true, 
            message: `Purchased ${amount} cloud credits`, 
            cost: price 
        };
    }
    
    // Get cloud credits
    getCloudCredits() {
        return this.cloudCredits;
    }
    
    // Add cloud credits
    addCloudCredits(amount) {
        if (isNaN(amount) || amount <= 0) {
            console.error("Invalid cloud credits amount:", amount);
            return false;
        }
        
        this.cloudCredits += amount;
        console.log(`Added ${amount} cloud credits. New total: ${this.cloudCredits}`);
        return true;
    }
    
    // Use cloud credits
    useCloudCredits(amount) {
        if (isNaN(amount) || amount <= 0) {
            console.error("Invalid cloud credits amount:", amount);
            return false;
        }
        
        if (this.cloudCredits < amount) {
            console.error(`Not enough cloud credits. Have ${this.cloudCredits}, need ${amount}`);
            return false;
        }
        
        this.cloudCredits -= amount;
        console.log(`Used ${amount} cloud credits. Remaining: ${this.cloudCredits}`);
        return true;
    }
    
    // Check the maximum AI model tier the player can use based on their hardware
    getMaxAITier() {
        let maxTier = 1; // Default to tier 1
        
        // Find the highest tier hardware owned
        this.ownedHardware.forEach(key => {
            const hardware = this.hardware[key];
            if (hardware && hardware.maxAITier > maxTier) {
                maxTier = hardware.maxAITier;
            }
        });
        
        return maxTier;
    }
    
    // Get GPU units available to the player
    getGPUUnits() {
        return this.gpuUnits;
    }
    
    // Check if a GPU is available for use
    isGPUAvailable() {
        return this.gpuUnits > 0 && !this.gpuInUse;
    }
    
    // Allocate a GPU to a project
    allocateGPU() {
        if (!this.isGPUAvailable()) {
            return false;
        }
        
        this.gpuInUse = true;
        return true;
    }
    
    // Release an allocated GPU
    releaseGPU() {
        this.gpuInUse = false;
        return true;
    }
    
    // Get GPU status information
    getGPUStatus() {
        return {
            units: this.gpuUnits,
            inUse: this.gpuInUse,
            statusText: this.gpuInUse ? 'In Use' : 'Available'
        };
    }
    
    // Upgrade GPU units (for future shop purchases)
    upgradeGPUUnits(amount = 1) {
        this.gpuUnits += amount;
        return this.gpuUnits;
    }
} 