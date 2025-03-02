/**
 * Manages the collection of prompting techniques available to the player
 */
export class PromptLibrary {
    constructor() {
        // Define all available prompting techniques
        this.prompts = {
            // Always available basic prompt
            'basic-instruction': {
                name: 'Basic Instruction',
                tier: 1,
                effect: '+5% success rate for straightforward tasks',
                description: 'Single-step directives that clearly state what you need the AI to do.',
                example: 'Generate a login screen with username and password fields.',
                unlocked: true // Always available from start
            },
            
            // Tier 2 prompts (unlockable through gameplay)
            'step-by-step': {
                name: 'Step-by-Step Reasoning',
                tier: 2,
                effect: '+10% success rate on higher-complexity logic tasks',
                description: 'Breaks down complex logic into smaller, sequential steps.',
                example: 'Create a todo app. First, set up the data structure. Second, implement adding new items. Third, implement completing items...',
                unlocked: false
            },
            
            'few-shot': {
                name: 'Few-Shot Examples',
                tier: 2,
                effect: '+10% success rate on tutorial-like projects',
                description: 'Provide input-output examples to guide the AI toward the desired result.',
                example: 'Generate CSS for a button. Example 1: Input: "primary button" Output: ".btn-primary { background: blue; color: white; }..."',
                unlocked: false
            },
            
            'persona-context': {
                name: 'Persona/System Context',
                tier: 2,
                effect: '+15% success rate on branded/tonal projects',
                description: 'Sets a persona or system style for domain-specific tasks.',
                example: 'You are an expert UI designer focusing on minimalist, modern interfaces. Create a landing page for a tech startup...',
                unlocked: false
            },
            
            'iterative-refinement': {
                name: 'Iterative Refinement',
                tier: 2,
                effect: '+10% success rate on multi-iteration projects',
                description: 'Iteratively improve code by giving feedback on previous generations.',
                example: 'This code has a bug in the login function. The password check is incorrect. Please fix it and explain your changes.',
                unlocked: false
            }
            
            // Additional prompts can be added here for future phases
        };
    }
    
    // Get a specific prompt by its key
    getPrompt(promptKey) {
        return this.prompts[promptKey];
    }
    
    // Get all prompts
    getAllPrompts() {
        return Object.values(this.prompts);
    }
    
    // Get all unlocked prompts
    getUnlockedPrompts() {
        return Object.entries(this.prompts)
            .filter(([key, prompt]) => prompt.unlocked)
            .map(([key, prompt]) => ({
                key,
                ...prompt
            }));
    }
    
    // Unlock a new prompt
    unlockPrompt(promptKey) {
        if (this.prompts[promptKey] && !this.prompts[promptKey].unlocked) {
            this.prompts[promptKey].unlocked = true;
            return true;
        }
        return false;
    }
    
    // Calculate success rate boost for a prompt on a specific project
    calculateBoost(promptKey, project) {
        const prompt = this.prompts[promptKey];
        if (!prompt || !prompt.unlocked) return 0;
        
        // Basic prompt gives flat 5% boost
        if (promptKey === 'basic-instruction') {
            return 0.05;
        }
        
        // Other prompts will be implemented in Phase 2
        return 0;
    }
} 