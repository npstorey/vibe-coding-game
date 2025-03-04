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
                probability: 0.3
            },
            {
                type: 'prompt_tip',
                content: 'Just discovered that using "{promptTip}" in AI prompts can significantly improve code quality!',
                probability: 0.2
            },
            {
                type: 'project_opportunity',
                content: 'Looking for a developer to create a {projectType} app. Budget is ${reward}. DM if interested! #ProjectOpportunity',
                probability: 0.25
            },
            {
                type: 'ai_model',
                content: 'Been experimenting with {aiModel} for coding. It is {sentiment} than I expected!',
                probability: 0.15
            },
            {
                type: 'hardware_tip',
                content: 'Upgraded to {hardwareItem} and my AI coding is so much faster now!',
                probability: 0.1
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
                'MealPlan', 'BudgetPal', 'TravelGuide', 'TaskMaster', 'FitBuddy',
                'DataSync', 'InvoiceGenius', 'LeadTracker', 'SpaceExplorer', 'DungeonCrawler'
            ],
            projectTypeCategory: [
                'b2c', 'b2c', 'b2c', 'b2c', 'b2c',
                'b2b', 'b2b', 'b2b', 'game', 'game'
            ],
            reward: [
                '500', '800', '1000', '1200', '1500'
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
        
        // Project descriptions
        this.projectDescriptions = {
            'MealPlan': 'A meal planning app to help users organize their weekly meals.',
            'BudgetPal': 'A budget tracking app to help users manage their finances.',
            'TravelGuide': 'An app to help travelers find and plan their adventures.',
            'TaskMaster': 'A task management app for personal productivity.',
            'FitBuddy': 'A fitness tracking app to monitor workouts and progress.',
            'DataSync': 'A business tool for syncing data across multiple platforms.',
            'InvoiceGenius': 'An invoicing solution for small businesses.',
            'LeadTracker': 'A CRM tool for tracking sales leads and opportunities.',
            'SpaceExplorer': 'A space exploration game with realistic physics.',
            'DungeonCrawler': 'A classic dungeon crawler game with procedural generation.'
        };
        
        // Difficulties for projects
        this.projectDifficulties = {
            'MealPlan': 1.0,
            'BudgetPal': 1.0, 
            'TravelGuide': 1.5,
            'TaskMaster': 0.5,
            'FitBuddy': 1.0,
            'DataSync': 1.5,
            'InvoiceGenius': 1.0,
            'LeadTracker': 1.0,
            'SpaceExplorer': 1.5,
            'DungeonCrawler': 1.5
        };
        
        // User names for social media posts
        this.userNames = [
            'AiCodeMaster', 'PromptEngineer', 'DevGuru42', 'TechCrea8or', 'CodeAlchemist',
            'AiWizard', 'DigitalNomad', 'WebDevMage', 'AIPromptQueen', 'CodingVibes',
            'FreelanceConnect', 'ProjectHub', 'ClientFinder', 'DevNetwork', 'TechJobsDaily'
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
            let projectNameSelected = null;
            let projectTypeSelected = null;
            let rewardSelected = null;
            
            // Replace placeholders with random content variations
            postContent = postContent.replace(/{trend}/g, () => {
                return this.getRandomItem(this.contentVariations.trend);
            });
            
            postContent = postContent.replace(/{promptTip}/g, () => {
                return this.getRandomItem(this.contentVariations.promptTip);
            });
            
            postContent = postContent.replace(/{projectType}/g, () => {
                const index = Math.floor(Math.random() * this.contentVariations.projectType.length);
                projectNameSelected = this.contentVariations.projectType[index];
                projectTypeSelected = this.contentVariations.projectTypeCategory[index];
                return projectNameSelected;
            });
            
            postContent = postContent.replace(/{reward}/g, () => {
                rewardSelected = this.getRandomItem(this.contentVariations.reward);
                return rewardSelected;
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
                tags.push(trend || 'trending');
                tags.push('market');
                
                // Store the discovered trend
                if (trend && !this.discoveredTrends.includes(trend)) {
                    this.discoveredTrends.push(trend);
                }
            } else if (selectedTemplate.type === 'prompt_tip') {
                const promptTip = this.extractPromptTip(postContent);
                tags.push('prompting');
                tags.push(promptTip || 'tips');
                
                // Check if this should unlock a prompt
                this.tryUnlockPrompt(promptTip);
            } else if (selectedTemplate.type === 'project_opportunity') {
                tags.push('ProjectOpportunity');
                tags.push(projectNameSelected || 'job');
            } else {
                tags.push(selectedTemplate.type.replace('_', ''));
            }
            
            // Create the post object
            const post = {
                author: this.getRandomItem(this.userNames),
                time: `${Math.floor(Math.random() * 12) + 1}h ago`,
                content: postContent,
                type: selectedTemplate.type,
                tags: tags
            };
            
            // Add project offer if it's a project opportunity
            if (selectedTemplate.type === 'project_opportunity' && projectNameSelected && projectTypeSelected && rewardSelected) {
                post.hasProjectOffer = true;
                post.projectOffer = {
                    name: projectNameSelected,
                    type: projectTypeSelected,
                    difficulty: this.projectDifficulties[projectNameSelected] || 1.0,
                    reward: parseInt(rewardSelected),
                    description: this.projectDescriptions[projectNameSelected] || `A ${projectTypeSelected} project.`
                };
            }
            
            posts.push(post);
        }
        
        return posts;
    }
    
    // Scroll feed action
    scrollFeed(shouldConsumeTimeBlock = false) {
        // Check if player has enough time blocks
        if (shouldConsumeTimeBlock && !this.gameState.useTimeBlock(1)) {
            return { success: false, message: 'Not enough time blocks' };
        }
        
        // Generate new posts (always ensure at least one is a project opportunity)
        let posts = this.generatePosts(3);
        let hasProjectOffer = posts.some(post => post.hasProjectOffer);
        
        // If no project offers were generated, replace one post with a project offer
        if (!hasProjectOffer) {
            // Create a project opportunity post
            const projectTemplate = this.postTemplates.find(template => template.type === 'project_opportunity');
            if (projectTemplate) {
                const index = Math.floor(Math.random() * posts.length);
                const projectNameIndex = Math.floor(Math.random() * this.contentVariations.projectType.length);
                const projectName = this.contentVariations.projectType[projectNameIndex];
                const projectType = this.contentVariations.projectTypeCategory[projectNameIndex];
                const reward = this.getRandomItem(this.contentVariations.reward);
                
                let content = projectTemplate.content
                    .replace('{projectType}', projectName)
                    .replace('{reward}', reward);
                
                posts[index] = {
                    author: this.getRandomItem(this.userNames),
                    time: `${Math.floor(Math.random() * 12) + 1}h ago`,
                    content: content,
                    type: 'project_opportunity',
                    tags: ['ProjectOpportunity', projectName],
                    hasProjectOffer: true,
                    projectOffer: {
                        name: projectName,
                        type: projectType,
                        difficulty: this.projectDifficulties[projectName] || 1.0,
                        reward: parseInt(reward),
                        description: this.projectDescriptions[projectName] || `A ${projectType} project.`
                    }
                };
            }
        }
        
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