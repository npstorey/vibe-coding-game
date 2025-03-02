/**
 * Manages social media interactions and discoveries
 */
export class SocialMediaManager {
    constructor(gameState, promptLibrary) {
        this.gameState = gameState;
        this.promptLibrary = promptLibrary;
        
        // Content templates for social media posts
        this.postTemplates = [
            {
                type: 'trend',
                content: 'Everyone is talking about {trend} projects lately. Seems like there is high demand!',
                probability: 0.4
            },
            {
                type: 'prompt_tip',
                content: 'Just discovered that using "{promptTip}" in AI prompts can significantly improve code quality!',
                probability: 0.3
            },
            {
                type: 'project_idea',
                content: 'Working on a {projectType} lately. The market seems really interested in this space.',
                probability: 0.3
            },
            {
                type: 'ai_model',
                content: 'Been experimenting with {aiModel} for coding. It is {sentiment} than I expected!',
                probability: 0.2
            },
            {
                type: 'hardware_tip',
                content: 'Upgraded to {hardwareItem} and my AI coding is so much faster now!',
                probability: 0.2
            }
        ];
        
        // Content variations for post templates
        this.contentVariations = {
            trend: [
                'chatbots', 'mobile apps', 'web apps', 'games', 'online courses', 'content creation'
            ],
            promptTip: [
                'Step-by-Step Reasoning', 'Few-Shot Examples', 'Persona Context', 'Iterative Refinement'
            ],
            projectType: [
                'B2C app', 'B2B software', 'game prototype', 'online course', 'influencer content'
            ],
            aiModel: [
                'GPT-3.5 Turbo', 'GPT-4', 'Claude 2', 'Falcon-40B'
            ],
            sentiment: [
                'much better', 'a bit better', 'more reliable', 'more creative'
            ],
            hardwareItem: [
                'RTX 4070', 'multi-core CPU', 'mid-range workstation', 'cloud computing'
            ]
        };
        
        // User names for social media posts
        this.userNames = [
            'AiCodeMaster', 'PromptEngineer', 'DevGuru42', 'TechCrea8or', 'CodeAlchemist',
            'AiWizard', 'DigitalNomad', 'WebDevMage', 'AIPromptQueen', 'CodingVibes'
        ];
        
        // Recently discovered trends
        this.discoveredTrends = [];
    }
    
    // Generate social media posts
    generatePosts(count = 3) {
        const posts = [];
        
        for (let i = 0; i < count; i++) {
            // Select a random post template weighted by probability
            const randomValue = Math.random();
            let cumulativeProbability = 0;
            let selectedTemplate = null;
            
            for (const template of this.postTemplates) {
                cumulativeProbability += template.probability;
                if (randomValue <= cumulativeProbability) {
                    selectedTemplate = template;
                    break;
                }
            }
            
            if (!selectedTemplate) {
                selectedTemplate = this.postTemplates[0];
            }
            
            // Process the post content
            let postContent = selectedTemplate.content;
            
            // Replace placeholders with random content variations
            postContent = postContent.replace(/{trend}/g, () => {
                return this.getRandomItem(this.contentVariations.trend);
            });
            
            postContent = postContent.replace(/{promptTip}/g, () => {
                return this.getRandomItem(this.contentVariations.promptTip);
            });
            
            postContent = postContent.replace(/{projectType}/g, () => {
                return this.getRandomItem(this.contentVariations.projectType);
            });
            
            postContent = postContent.replace(/{aiModel}/g, () => {
                return this.getRandomItem(this.contentVariations.aiModel);
            });
            
            postContent = postContent.replace(/{sentiment}/g, () => {
                return this.getRandomItem(this.contentVariations.sentiment);
            });
            
            postContent = postContent.replace(/{hardwareItem}/g, () => {
                return this.getRandomItem(this.contentVariations.hardwareItem);
            });
            
            // Create tags based on post type
            const tags = [];
            if (selectedTemplate.type === 'trend') {
                const trend = this.extractTrend(postContent);
                tags.push({ text: trend, trending: true });
                tags.push({ text: 'trending', trending: false });
                
                // Store the discovered trend
                if (trend && !this.discoveredTrends.includes(trend)) {
                    this.discoveredTrends.push(trend);
                }
            } else if (selectedTemplate.type === 'prompt_tip') {
                const promptTip = this.extractPromptTip(postContent);
                tags.push({ text: 'prompting', trending: false });
                tags.push({ text: promptTip, trending: false });
                
                // Check if this should unlock a prompt
                this.tryUnlockPrompt(promptTip);
            } else {
                tags.push({ text: selectedTemplate.type, trending: false });
            }
            
            // Create the post
            posts.push({
                author: this.getRandomItem(this.userNames),
                time: `${Math.floor(Math.random() * 12) + 1}h ago`,
                content: postContent,
                type: selectedTemplate.type,
                tags: tags
            });
        }
        
        return posts;
    }
    
    // Scroll feed action
    scrollFeed() {
        // Check if player has enough time blocks
        if (!this.gameState.useTimeBlock(1)) {
            return { success: false, message: 'Not enough time blocks' };
        }
        
        // Generate new posts
        const posts = this.generatePosts(3);
        
        // Small chance to discover a new prompt
        let discoveredPrompt = null;
        if (Math.random() < 0.15) { // 15% chance
            discoveredPrompt = this.discoverRandomPrompt();
        }
        
        return {
            success: true,
            posts: posts,
            discoveredPrompt: discoveredPrompt,
            discoveredTrends: this.discoveredTrends
        };
    }
    
    // Helper to extract trend from post content
    extractTrend(content) {
        for (const trend of this.contentVariations.trend) {
            if (content.includes(trend)) {
                return trend;
            }
        }
        return null;
    }
    
    // Helper to extract prompt tip from post content
    extractPromptTip(content) {
        for (const promptTip of this.contentVariations.promptTip) {
            if (content.includes(promptTip)) {
                return promptTip;
            }
        }
        return null;
    }
    
    // Try to unlock a prompt based on discovered tip
    tryUnlockPrompt(promptTip) {
        if (!promptTip) return null;
        
        // Map the prompt tip to a prompt key
        const promptKeyMap = {
            'Step-by-Step Reasoning': 'step-by-step',
            'Few-Shot Examples': 'few-shot',
            'Persona Context': 'persona-context',
            'Iterative Refinement': 'iterative-refinement'
        };
        
        const promptKey = promptKeyMap[promptTip];
        
        // Check if prompt exists and is not already unlocked
        if (promptKey && Math.random() < 0.2) { // 20% chance to unlock
            return this.promptLibrary.unlockPrompt(promptKey);
        }
        
        return false;
    }
    
    // Discover a random prompt (small chance when scrolling)
    discoverRandomPrompt() {
        const allPrompts = this.promptLibrary.getAllPrompts();
        const lockedPrompts = allPrompts.filter(prompt => !prompt.unlocked);
        
        if (lockedPrompts.length === 0) return null;
        
        const randomPrompt = this.getRandomItem(lockedPrompts);
        const promptKey = Object.keys(this.promptLibrary.prompts).find(key => 
            this.promptLibrary.prompts[key].name === randomPrompt.name
        );
        
        if (promptKey) {
            this.promptLibrary.unlockPrompt(promptKey);
            return { key: promptKey, ...randomPrompt };
        }
        
        return null;
    }
    
    // Helper to get a random item from an array
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    // Get discovered market trends
    getDiscoveredTrends() {
        return this.discoveredTrends;
    }
} 