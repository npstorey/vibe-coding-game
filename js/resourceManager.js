/**
 * Manages the display and tracking of player resources
 */
export class ResourceManager {
    constructor(gameState, aiModelManager, promptLibrary, hardwareManager) {
        this.gameState = gameState;
        this.aiModelManager = aiModelManager;
        this.promptLibrary = promptLibrary;
        this.hardwareManager = hardwareManager;
        
        // Cache DOM elements for resource display
        this.moneyDisplay = document.getElementById('resources-money');
        this.cloudCreditsDisplay = document.getElementById('resources-cloud-credits');
        this.hardwareList = document.getElementById('hardware-inventory-list');
        this.aiModelsList = document.getElementById('ai-models-list');
        this.promptCollectionList = document.getElementById('prompt-collection-list');
    }
    
    // Initialize resources panel
    initResourcesPanel() {
        // Set event listeners for tab switching if needed
        this.updateResourcesDisplay();
    }
    
    // Update the resource displays with current values
    updateResourcesDisplay() {
        // Update financial resources
        this.moneyDisplay.textContent = this.gameState.money.toLocaleString();
        this.cloudCreditsDisplay.textContent = this.hardwareManager.getCloudCredits().toLocaleString();
        
        // Update hardware inventory
        this.updateHardwareInventory();
        
        // Update AI models
        this.updateAIModels();
        
        // Update prompt collection
        this.updatePromptCollection();
    }
    
    // Update hardware inventory display
    updateHardwareInventory() {
        // Clear current list
        this.hardwareList.innerHTML = '';
        
        // Get owned hardware
        const ownedHardware = this.hardwareManager.getOwnedHardware();
        
        if (ownedHardware.length === 0) {
            this.hardwareList.innerHTML = '<p class="empty-state">No hardware available yet.</p>';
            return;
        }
        
        // Create hardware cards
        ownedHardware.forEach(hardware => {
            const hardwareCard = document.createElement('div');
            hardwareCard.className = `resource-card hardware-card tier-${hardware.tier}`;
            
            // Format spec items
            const specItems = Object.entries(hardware.specs).map(([key, value]) => 
                `<div class="spec-item">${value}</div>`
            ).join('');
            
            hardwareCard.innerHTML = `
                <div class="resource-icon">${hardware.type === 'computer' ? '💻' : '☁️'}</div>
                <div class="resource-details">
                    <div class="resource-name">
                        <span>${hardware.name}</span>
                        <span class="tier-badge">Tier ${hardware.tier}</span>
                    </div>
                    <div class="resource-description">${hardware.description}</div>
                    <div class="hardware-specs">
                        ${specItems}
                    </div>
                </div>
            `;
            
            this.hardwareList.appendChild(hardwareCard);
        });
    }
    
    // Update AI models display
    updateAIModels() {
        // Clear current list
        this.aiModelsList.innerHTML = '';
        
        // Get owned AI models
        const ownedModels = this.aiModelManager.availableModels.map(key => ({
            key,
            ...this.aiModelManager.models[key]
        }));
        
        if (ownedModels.length === 0) {
            this.aiModelsList.innerHTML = '<p class="empty-state">No AI models available yet.</p>';
            return;
        }
        
        // Create model cards
        ownedModels.forEach(model => {
            const modelCard = document.createElement('div');
            modelCard.className = `resource-card model-card tier-${model.tier}`;
            
            // Format attribute items
            const attributes = model.attributes;
            const attributesHTML = `
                <div class="resource-attribute">Creativity: ${attributes.creativity}/10</div>
                <div class="resource-attribute">Direction: ${attributes.directionFollowing}/10</div>
                <div class="resource-attribute">Reasoning: ${attributes.reasoning}/10</div>
            `;
            
            modelCard.innerHTML = `
                <div class="resource-icon">🤖</div>
                <div class="resource-details">
                    <div class="resource-name">${model.name}</div>
                    <div class="resource-description">${model.description}</div>
                    <div class="resource-attributes">
                        ${attributesHTML}
                    </div>
                </div>
                <div class="resource-tier">Tier ${model.tier}</div>
            `;
            
            this.aiModelsList.appendChild(modelCard);
        });
    }
    
    // Update prompt collection display
    updatePromptCollection() {
        // Clear current list
        this.promptCollectionList.innerHTML = '';
        
        // Get unlocked prompts
        const unlockedPrompts = this.promptLibrary.getUnlockedPrompts();
        
        if (unlockedPrompts.length === 0) {
            this.promptCollectionList.innerHTML = '<p class="empty-state">No prompts collected yet. Complete projects or research to earn prompts.</p>';
            return;
        }
        
        // Create prompt cards
        unlockedPrompts.forEach(prompt => {
            const promptCard = document.createElement('div');
            promptCard.className = `resource-card prompt-card tier-${prompt.tier}`;
            
            promptCard.innerHTML = `
                <div class="resource-icon">📝</div>
                <div class="resource-details">
                    <div class="resource-name">${prompt.name}</div>
                    <div class="resource-description">${prompt.description}</div>
                    <div class="prompt-effect">${prompt.effect}</div>
                    <div class="prompt-example">
                        <strong>Example:</strong> <em>${prompt.example}</em>
                    </div>
                </div>
                <div class="resource-tier">Tier ${prompt.tier}</div>
            `;
            
            this.promptCollectionList.appendChild(promptCard);
        });
    }
    
    // Get a summary of all current resources
    getResourcesSummary() {
        return {
            money: this.gameState.money,
            cloudCredits: this.hardwareManager.getCloudCredits(),
            hardware: this.hardwareManager.getOwnedHardware(),
            aiModels: this.aiModelManager.availableModels.map(key => ({
                key,
                ...this.aiModelManager.models[key]
            })),
            prompts: this.promptLibrary.getUnlockedPrompts()
        };
    }
} 