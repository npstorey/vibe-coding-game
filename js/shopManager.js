/**
 * Manages the shop interface and purchasing logic
 */
export class ShopManager {
    constructor(gameState, aiModelManager, promptLibrary, hardwareManager) {
        this.gameState = gameState;
        this.aiModelManager = aiModelManager;
        this.promptLibrary = promptLibrary;
        this.hardwareManager = hardwareManager;
        
        // Premium prompts available for purchase
        this.premiumPrompts = [
            {
                key: 'creative-temperature',
                name: 'Creative Temperature',
                tier: 2,
                effect: '+15% success rate for creative tasks',
                description: 'Encourages AI to produce more novel and creative outputs.',
                price: 1200,
                unlocked: false
            },
            {
                key: 'debugging-error-correction',
                name: 'Debugging & Error Correction',
                tier: 2,
                effect: '+20% success rate for projects with bugs',
                description: 'Specifically prompts the AI to find and fix errors in code.',
                price: 1500,
                unlocked: false
            }
        ];
    }
    
    // Get all hardware available for purchase
    getAvailableHardware() {
        return this.hardwareManager.getAvailableHardware();
    }
    
    // Get all AI models available for purchase
    getAvailableAIModels() {
        const allModels = this.aiModelManager.models;
        const availableModels = this.aiModelManager.availableModels;
        
        return Object.entries(allModels)
            .filter(([key, _]) => !availableModels.includes(key))
            .map(([key, model]) => ({
                key,
                ...model
            }));
    }
    
    // Get all premium prompts available for purchase
    getAvailablePremiumPrompts() {
        return this.premiumPrompts.filter(prompt => !prompt.unlocked);
    }
    
    // Purchase hardware
    purchaseHardware(hardwareKey) {
        const result = this.hardwareManager.purchaseHardware(hardwareKey, this.gameState.money);
        
        if (result.success) {
            this.gameState.money -= result.cost;
            
            // Add to events log
            this.gameState.todayEvents.push({
                type: 'purchase',
                item: 'hardware',
                name: hardwareKey,
                cost: result.cost,
                description: result.message
            });
            
            // Save state after purchase
            this.gameState.saveState();
        }
        
        return result;
    }
    
    // Purchase AI model
    purchaseAIModel(modelKey) {
        const model = this.aiModelManager.models[modelKey];
        
        if (!model) {
            return { success: false, message: 'Model not found' };
        }
        
        if (this.aiModelManager.availableModels.includes(modelKey)) {
            return { success: false, message: 'You already own this model' };
        }
        
        if (this.gameState.money < model.unlockCost) {
            return { success: false, message: 'Not enough money' };
        }
        
        // Check if player has the required hardware tier
        const maxAITier = this.hardwareManager.getMaxAITier();
        if (model.tier > maxAITier) {
            return { 
                success: false, 
                message: `You need Tier ${model.tier} hardware to use this model` 
            };
        }
        
        // Purchase the model
        this.aiModelManager.unlockModel(modelKey);
        this.gameState.money -= model.unlockCost;
        
        // Add to events log
        this.gameState.todayEvents.push({
            type: 'purchase',
            item: 'ai_model',
            name: model.name,
            cost: model.unlockCost,
            description: `Purchased ${model.name} AI model`
        });
        
        // Save state after purchase
        this.gameState.saveState();
        
        return { 
            success: true, 
            message: `Purchased ${model.name}`, 
            cost: model.unlockCost 
        };
    }
    
    // Purchase premium prompt
    purchasePremiumPrompt(promptKey) {
        const prompt = this.premiumPrompts.find(p => p.key === promptKey);
        
        if (!prompt) {
            return { success: false, message: 'Prompt not found' };
        }
        
        if (prompt.unlocked) {
            return { success: false, message: 'You already own this prompt' };
        }
        
        if (this.gameState.money < prompt.price) {
            return { success: false, message: 'Not enough money' };
        }
        
        // Purchase the prompt
        prompt.unlocked = true;
        
        // Also unlock in the prompt library
        this.promptLibrary.unlockPrompt(promptKey);
        
        this.gameState.money -= prompt.price;
        
        // Add to events log
        this.gameState.todayEvents.push({
            type: 'purchase',
            item: 'premium_prompt',
            name: prompt.name,
            cost: prompt.price,
            description: `Purchased ${prompt.name} premium prompt`
        });
        
        // Save state after purchase
        this.gameState.saveState();
        
        return { 
            success: true, 
            message: `Purchased ${prompt.name} prompt`, 
            cost: prompt.price 
        };
    }
    
    // Purchase cloud credits
    purchaseCloudCredits(amount, price) {
        if (this.gameState.money < price) {
            return { success: false, message: 'Not enough money' };
        }
        
        this.hardwareManager.cloudCredits += amount;
        this.gameState.money -= price;
        
        // Add to events log
        this.gameState.todayEvents.push({
            type: 'purchase',
            item: 'cloud_credits',
            amount: amount,
            cost: price,
            description: `Purchased ${amount} cloud credits`
        });
        
        // Save state after purchase
        this.gameState.saveState();
        
        return { 
            success: true, 
            message: `Purchased ${amount} cloud credits`, 
            cost: price 
        };
    }
} 