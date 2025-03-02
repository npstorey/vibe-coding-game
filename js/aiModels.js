/**
 * Defines AI models available in the game with their attributes
 */
export class AIModelManager {
    constructor() {
        // Define all available AI models with their attributes
        this.models = {
            // Tier 1 Models
            'gpt-3': {
                name: 'GPT-3',
                tier: 1,
                attributes: {
                    knowledgeCutoff: 2021,
                    webSearch: false,
                    imageGeneration: false,
                    multimodal: false,
                    creativity: 6,
                    directionFollowing: 7,
                    reasoning: 6
                },
                description: 'A basic AI model capable of generating simple code and following straightforward instructions.',
                unlockCost: 0, // Free/base model
                timeBlockCost: 1
            },
            'gpt-3.5-turbo': {
                name: 'GPT-3.5 Turbo',
                tier: 1,
                attributes: {
                    knowledgeCutoff: 2021,
                    webSearch: false,
                    imageGeneration: false,
                    multimodal: false,
                    creativity: 7,
                    directionFollowing: 8,
                    reasoning: 7
                },
                description: 'An improved version with better direction following and slightly enhanced reasoning capabilities.',
                unlockCost: 500,
                timeBlockCost: 1
            },
            'bloom': {
                name: 'Bloom',
                tier: 1,
                attributes: {
                    knowledgeCutoff: 2021,
                    webSearch: false,
                    imageGeneration: false,
                    multimodal: false,
                    creativity: 6,
                    directionFollowing: 6,
                    reasoning: 6
                },
                description: 'An open-source alternative with balanced capabilities across different aspects.',
                unlockCost: 300,
                timeBlockCost: 1
            }
        };
        
        // Default available models (player starts with just GPT-3)
        this.availableModels = ['gpt-3'];
    }
    
    // Get a specific model by its key
    getModel(modelKey) {
        return this.models[modelKey];
    }
    
    // Get all available models for the player
    getAvailableModels() {
        return this.availableModels.map(key => this.models[key]);
    }
    
    // Unlock a new model
    unlockModel(modelKey) {
        if (!this.availableModels.includes(modelKey) && this.models[modelKey]) {
            this.availableModels.push(modelKey);
            return true;
        }
        return false;
    }
    
    // Calculate success rate for a given model and project
    calculateSuccessRate(modelKey, project, promptKey) {
        const model = this.models[modelKey];
        if (!model) return 0;
        
        // Base success chance from model attributes
        let successRate = 0.4; // Base 40% success chance
        
        // Add bonus from model attributes (simplified calculation)
        successRate += (model.attributes.directionFollowing / 20); // Up to +40% from direction following
        successRate += (model.attributes.reasoning / 25); // Up to +32% from reasoning
        
        // Project difficulty reduces success rate
        successRate -= (project.difficulty * 0.1); // -10% per difficulty level
        
        // Add prompt bonus if applicable
        if (promptKey === 'basic-instruction') {
            successRate += 0.05; // +5% from basic instruction prompt
        }
        
        // Ensure success rate is between 0 and 1
        return Math.max(0, Math.min(1, successRate));
    }
    
    // Get the next available AI model tier
    getNextAIModelTier(currentTier) {
        // Find all model tiers
        const allTiers = Object.values(this.models)
            .map(model => model.tier)
            .filter((value, index, self) => self.indexOf(value) === index) // unique values
            .sort((a, b) => a - b); // sorted numerically
        
        // Find the next tier after the current one
        for (const tier of allTiers) {
            if (tier > currentTier) {
                return tier;
            }
        }
        
        // If no higher tier exists, return the current tier
        return currentTier;
    }
} 