/**
 * Manages project creation, progress, and completion
 */
export class ProjectManager {
    constructor(gameState, aiModelManager, promptLibrary) {
        this.gameState = gameState;
        this.aiModelManager = aiModelManager;
        this.promptLibrary = promptLibrary;
        
        // Define project types and their base properties
        this.projectTypes = {
            'b2c': {
                name: 'B2C App',
                baseReward: 1000,
                baseDifficulty: 1,
                examples: ['TaskMaster', 'FitBuddy', 'MealPlan', 'BudgetPal', 'TravelGuide'],
                description: 'A consumer-facing application that solves everyday problems.'
            },
            'b2b': {
                name: 'B2B Software',
                baseReward: 2000,
                baseDifficulty: 1.5,
                examples: ['DataSync', 'InvoiceGenius', 'LeadTracker', 'TeamCollab', 'SalesBooster'],
                description: 'Business software that improves work efficiency and productivity.'
            },
            'game': {
                name: 'Game Prototype',
                baseReward: 1500,
                baseDifficulty: 1.7,
                examples: ['SpaceExplorer', 'DungeonCrawler', 'ZombieSurvival', 'FarmLife', 'RacingChampion'],
                description: 'A simple game prototype that demonstrates core mechanics.'
            },
            'course': {
                name: 'Online Course',
                baseReward: 800,
                baseDifficulty: 0.8,
                examples: ['CodeMastery', 'FinanceFundamentals', 'DigitalMarketing', 'HealthyLiving', 'CreativeWriting'],
                description: 'Educational content to teach others about a specific topic.'
            },
            'influencer': {
                name: 'Influencer Content',
                baseReward: 600,
                baseDifficulty: 0.6,
                examples: ['TechReviews', 'FoodieJourney', 'FitnessChallenge', 'TravelVlog', 'GamingStream'],
                description: 'Content creation for social media or streaming platforms.'
            }
        };
        
        // Prompt templates that can be earned from completing projects
        this.promptTemplates = [
            {
                name: 'Feature Breakdown',
                rarity: 'common',
                description: 'Break down complex features into manageable steps.',
                bonus: { type: 'progress', value: 10 }
            },
            {
                name: 'Error Resolution',
                rarity: 'common',
                description: 'Identify and fix common code errors more effectively.',
                bonus: { type: 'success_rate', value: 0.05 }
            },
            {
                name: 'API Integration',
                rarity: 'uncommon',
                description: 'Simplify connecting to external services and APIs.',
                bonus: { type: 'progress', value: 15 }
            },
            {
                name: 'Optimization Pattern',
                rarity: 'uncommon',
                description: 'Improve code performance through better patterns.',
                bonus: { type: 'quality', value: 0.1 }
            },
            {
                name: 'Architecture Planning',
                rarity: 'rare',
                description: 'Design robust application architectures in advance.',
                bonus: { type: 'progress', value: 20, skill: 'coding' }
            }
        ];
    }
    
    // Generate a new random project
    generateRandomProject() {
        const projectTypeKeys = Object.keys(this.projectTypes);
        const randomTypeKey = projectTypeKeys[Math.floor(Math.random() * projectTypeKeys.length)];
        const projectType = this.projectTypes[randomTypeKey];
        
        // Get a random name for the project
        const randomName = projectType.examples[Math.floor(Math.random() * projectType.examples.length)];
        
        // Randomize reward based on market conditions (±20%)
        const rewardVariation = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
        const reward = Math.floor(projectType.baseReward * rewardVariation);
        
        // Calculate difficulty based on player skill level
        const skillFactor = (this.gameState.skills.coding + this.gameState.skills.prompt) / 2;
        let adjustedDifficulty = projectType.baseDifficulty;
        
        // Slightly adjust difficulty based on player skill (don't make it too easy)
        if (skillFactor > 1) {
            adjustedDifficulty = projectType.baseDifficulty * (1 - (skillFactor - 1) * 0.1);
        }
        
        // Create the project object
        return {
            name: randomName,
            type: randomTypeKey,
            typeName: projectType.name,
            description: projectType.description,
            reward: reward,
            difficulty: adjustedDifficulty,
            requiredProgress: 100, // Base progress required
            progress: 0,
            completed: false,
            workedOnToday: false,
            daysTaken: 0,
            sprints: [] // Track coding sprints
        };
    }
    
    // Create a new project based on type
    createProject(typeKey) {
        if (!this.projectTypes[typeKey]) {
            console.error(`Invalid project type: ${typeKey}`);
            return null;
        }
        
        const projectType = this.projectTypes[typeKey];
        
        // Get a random name for the project
        const randomName = projectType.examples[Math.floor(Math.random() * projectType.examples.length)];
        
        // Base reward
        const reward = projectType.baseReward;
        
        // Calculate difficulty based on player skill level
        const skillFactor = (this.gameState.skills.coding + this.gameState.skills.prompt) / 2;
        let adjustedDifficulty = projectType.baseDifficulty;
        
        // Slightly adjust difficulty based on player skill
        if (skillFactor > 1) {
            adjustedDifficulty = projectType.baseDifficulty * (1 - (skillFactor - 1) * 0.1);
        }
        
        // Create the project object
        const newProject = {
            name: randomName,
            type: typeKey,
            typeName: projectType.name,
            description: projectType.description,
            reward: reward,
            difficulty: adjustedDifficulty,
            requiredProgress: 100, // Base progress required
            progress: 0,
            completed: false,
            workedOnToday: false,
            daysTaken: 0,
            sprints: [] // Track coding sprints
        };
        
        return newProject;
    }
    
    // Add a project to the active projects list
    addProject(project) {
        if (this.gameState.activeProjects.length >= 3) {
            return false; // Maximum 3 active projects
        }
        
        this.gameState.activeProjects.push(project);
        return true;
    }
    
    // Update project progress based on coding sprint with synergy calculations
    updateProjectProgress(projectIndex, aiModelKey, promptKey, hardwareManager) {
        if (projectIndex < 0 || projectIndex >= this.gameState.activeProjects.length) {
            return { success: false, message: 'Invalid project index' };
        }
        
        const project = this.gameState.activeProjects[projectIndex];
        
        // Calculate success rate based on synergy between AI model, prompt, and hardware
        const aiModel = this.aiModelManager.getModel(aiModelKey);
        if (!aiModel) {
            return { success: false, message: 'Invalid AI model' };
        }
        
        const prompt = this.promptLibrary.getPrompt(promptKey);
        if (!prompt || !prompt.unlocked) {
            return { success: false, message: 'Invalid or locked prompt' };
        }
        
        // Get hardware tier
        const maxAITier = hardwareManager.getMaxAITier();
        if (aiModel.tier > maxAITier) {
            return { 
                success: false, 
                message: `Your hardware (Tier ${maxAITier}) cannot run this AI model (Tier ${aiModel.tier})` 
            };
        }
        
        // Calculate base success rate from AI model
        let successRate = 0.4; // Base 40% success chance
        
        // Add bonus from AI model attributes
        successRate += (aiModel.attributes.directionFollowing / 20); // Up to +40% from direction following
        successRate += (aiModel.attributes.reasoning / 25); // Up to +32% from reasoning
        
        // Project difficulty reduces success rate
        successRate -= (project.difficulty * 0.1); // -10% per difficulty level
        
        // Add prompt technique bonus
        let promptBonus = 0;
        switch (promptKey) {
            case 'basic-instruction':
                promptBonus = 0.05; // +5% from basic instruction
                break;
            case 'step-by-step':
                // +10% for complex logic tasks
                promptBonus = 0.1;
                break;
            case 'few-shot':
                // +10% for tutorial-like projects
                if (project.type === 'course') {
                    promptBonus = 0.1;
                } else {
                    promptBonus = 0.05;
                }
                break;
            case 'persona-context':
                // +15% for branded/tone projects
                if (project.type === 'influencer') {
                    promptBonus = 0.15;
                } else {
                    promptBonus = 0.05;
                }
                break;
            case 'iterative-refinement':
                // +10% for all project types
                promptBonus = 0.1;
                break;
            case 'creative-temperature':
                // +15% for creative tasks, -5% for technical
                if (project.type === 'game') {
                    promptBonus = 0.15;
                } else if (project.type === 'b2b') {
                    promptBonus = -0.05;
                } else {
                    promptBonus = 0.05;
                }
                break;
            case 'debugging-error-correction':
                // +20% for fixing failing projects
                if (project.progress > 0 && project.progress < 50) {
                    promptBonus = 0.2;
                } else {
                    promptBonus = 0.1;
                }
                break;
        }
        
        successRate += promptBonus;
        
        // Hardware tier bonus
        // Higher tier hardware than required gives bonus
        if (maxAITier > aiModel.tier) {
            successRate += 0.1 * (maxAITier - aiModel.tier); // +10% per tier above required
        }
        
        // Market trend bonus
        if (this.gameState.marketTrends && this.gameState.marketTrends.current) {
            this.gameState.marketTrends.current.forEach(trend => {
                const trendData = this.gameState.marketTrends.trendCycles[trend];
                if (trendData && trendData.impact[project.type]) {
                    // Convert market multiplier (e.g. 1.5) to success rate bonus (e.g. +0.1)
                    const trendBonus = (trendData.impact[project.type] - 1) * 0.2;
                    successRate += trendBonus;
                }
            });
        }
        
        // Ensure success rate is between 0.1 and 0.95
        successRate = Math.max(0.1, Math.min(0.95, successRate));
        
        // Determine if sprint is successful
        const random = Math.random();
        const isSuccess = random <= successRate;
        
        if (isSuccess) {
            // Calculate progress amount based on synergy
            // Base progress is 15%, can go up to 30% with good synergy
            const progressAmount = 15 + Math.floor(successRate * 15);
            
            // Update project progress
            project.progress += progressAmount;
            project.workedOnToday = true;
            
            // Record this sprint
            project.sprints.push({
                day: this.gameState.day,
                progress: progressAmount,
                aiModel: aiModelKey,
                prompt: promptKey
            });
            
            // Increment days taken counter if this is the first sprint today
            if (project.sprints.filter(sprint => sprint.day === this.gameState.day).length === 1) {
                project.daysTaken++;
            }
            
            // Increase skills based on project and AI model
            const skillGain = 0.1 * project.difficulty * (aiModel.tier / 2);
            this.gameState.increaseSkill('coding', skillGain);
            this.gameState.increaseSkill('prompt', skillGain * 0.8);
            
            // Check if project is completed
            if (project.progress >= project.requiredProgress) {
                return this.completeProject(projectIndex);
            }
            
            return {
                success: true,
                isSprintSuccess: true,
                progress: project.progress,
                progressGained: progressAmount,
                successRate: successRate,
                skillGain: {
                    coding: skillGain,
                    prompt: skillGain * 0.8
                }
            };
        } else {
            // Failed sprint - small progress or none
            const minorProgress = Math.random() < 0.3 ? Math.floor(5 + (successRate * 5)) : 0;
            
            if (minorProgress > 0) {
                project.progress += minorProgress;
                
                // Record this sprint
                project.sprints.push({
                    day: this.gameState.day,
                    progress: minorProgress,
                    aiModel: aiModelKey,
                    prompt: promptKey,
                    partial: true
                });
                
                // Small skill gain even on partial success
                const smallSkillGain = 0.05 * project.difficulty;
                this.gameState.increaseSkill('coding', smallSkillGain);
                this.gameState.increaseSkill('prompt', smallSkillGain * 0.8);
                
                return {
                    success: true,
                    isSprintSuccess: false,
                    progress: project.progress,
                    progressGained: minorProgress,
                    successRate: successRate,
                    message: 'Partial progress made, but sprint wasn\'t fully successful',
                    skillGain: {
                        coding: smallSkillGain,
                        prompt: smallSkillGain * 0.8
                    }
                };
            } else {
                // Complete failure - no progress
                project.sprints.push({
                    day: this.gameState.day,
                    progress: 0,
                    aiModel: aiModelKey,
                    prompt: promptKey,
                    failed: true
                });
                
                // Minimal skill gain even on failure (learning from mistakes)
                const tinySkillGain = 0.02 * project.difficulty;
                this.gameState.increaseSkill('prompt', tinySkillGain);
                
                return {
                    success: true,
                    isSprintSuccess: false,
                    progress: project.progress,
                    progressGained: 0,
                    successRate: successRate,
                    message: 'Sprint failed. Try a different approach or AI model.',
                    skillGain: {
                        coding: 0,
                        prompt: tinySkillGain
                    }
                };
            }
        }
    }
    
    // Handle project completion
    completeProject(projectIndex) {
        const project = this.gameState.activeProjects[projectIndex];
        project.progress = project.requiredProgress;
        project.completed = true;
        
        // Calculate final reward based on market trends
        let rewardMultiplier = 1;
        
        // Check if current trends boost this project type
        if (this.gameState.marketTrends && this.gameState.marketTrends.current) {
            this.gameState.marketTrends.current.forEach(trend => {
                const trendData = this.gameState.marketTrends.trendCycles[trend];
                if (trendData && trendData.impact[project.type]) {
                    rewardMultiplier = trendData.impact[project.type];
                }
            });
        }
        
        const finalReward = Math.floor(project.reward * rewardMultiplier);
        
        // Add money to player
        this.gameState.addMoney(finalReward);
        
        // Award a random prompt template when completing a project
        const earnedPrompt = this.getRandomPromptReward();
        if (earnedPrompt) {
            this.gameState.addPrompt(earnedPrompt);
        }
        
        // Increase skills based on project type and difficulty
        const skillGain = 0.2 * project.difficulty;
        this.gameState.increaseSkill('coding', skillGain);
        this.gameState.increaseSkill('prompt', skillGain * 0.8);
        
        // Move to completed projects
        this.gameState.completedProjects.push({
            ...project,
            completedOn: this.gameState.day,
            finalReward: finalReward,
            rewardMultiplier: rewardMultiplier
        });
        this.gameState.activeProjects.splice(projectIndex, 1);
        
        return {
            success: true,
            isSprintSuccess: true,
            completed: true,
            reward: finalReward,
            multiplier: rewardMultiplier,
            earnedPrompt: earnedPrompt,
            skillGain: {
                coding: skillGain,
                prompt: skillGain * 0.8
            }
        };
    }

    // Verify if player meets project requirements
    verifyProjectRequirements(project, aiModelKey, promptKey, hardwareManager) {
        // Check if player has the required hardware tier
        const requiredTier = Math.ceil(project.difficulty);
        const maxAITier = hardwareManager.getMaxAITier();
        
        if (maxAITier < requiredTier) {
            return {
                meetsRequirements: false,
                message: `This project requires Tier ${requiredTier} hardware. Your hardware is only Tier ${maxAITier}.`
            };
        }
        
        // Check if the selected AI model is powerful enough
        const aiModel = this.aiModelManager.getModel(aiModelKey);
        if (!aiModel) {
            return {
                meetsRequirements: false,
                message: 'Invalid AI model selected.'
            };
        }
        
        if (aiModel.tier < requiredTier) {
            return {
                meetsRequirements: false,
                message: `This project requires a Tier ${requiredTier} AI model. ${aiModel.name} is only Tier ${aiModel.tier}.`
            };
        }
        
        // Check if the selected prompt technique is suitable
        const prompt = this.promptLibrary.getPrompt(promptKey);
        if (!prompt || !prompt.unlocked) {
            return {
                meetsRequirements: false,
                message: 'Invalid or locked prompt technique selected.'
            };
        }
        
        // If project is of specific type, it might require specific prompts
        if (project.type === 'course' && promptKey !== 'few-shot' && prompt.tier < 2) {
            return {
                meetsRequirements: true,
                warning: 'This educational project would benefit from Few-Shot Examples prompt technique.'
            };
        }
        
        if (project.type === 'influencer' && promptKey !== 'persona-context' && prompt.tier < 2) {
            return {
                meetsRequirements: true,
                warning: 'This content project would benefit from Persona/System Context prompt technique.'
            };
        }
        
        if (project.type === 'game' && promptKey !== 'creative-temperature' && prompt.tier < 2) {
            return {
                meetsRequirements: true,
                warning: 'This creative project would benefit from Creative Temperature prompt technique.'
            };
        }
        
        return {
            meetsRequirements: true
        };
    }
    
    // Generate an AI response based on success, selected model, and project
    generateAIResponse(success, model, project) {
        // These would normally be more varied, but for Phase 1 we'll keep it simple
        if (success) {
            const successMessages = [
                `I've made significant progress on your ${project.name} project. The code for the requested feature is now working properly, with good structure and maintainability.`,
                `Your ${project.name} is coming along well. I've implemented the requested functionality using best practices and added appropriate error handling.`,
                `The ${project.name} project feature is complete. I've focused on readability and performance while implementing the solution you asked for.`,
                `Great progress on ${project.name}! The solution I've developed meets all the requirements and includes proper documentation.`
            ];
            
            return successMessages[Math.floor(Math.random() * successMessages.length)];
        } else {
            const failureMessages = [
                `I've attempted to implement the feature for ${project.name}, but encountered some challenges with the architecture. We should reapproach this with a different structure.`,
                `While working on ${project.name}, I ran into compatibility issues. Let's refine our approach and try a different implementation strategy.`,
                `The implementation for ${project.name} is partially complete, but needs refinement. The current solution doesn't fully address all edge cases.`,
                `I made some progress on ${project.name}, but the solution isn't optimal yet. Let's try a more specific approach in our next iteration.`
            ];
            
            return failureMessages[Math.floor(Math.random() * failureMessages.length)];
        }
    }
    
    // Get a random prompt reward when completing a project
    getRandomPromptReward() {
        // In Phase 1, we only want to potentially unlock Step-by-Step Reasoning
        const availablePrompts = Object.entries(this.promptLibrary.prompts)
            .filter(([key, prompt]) => !prompt.unlocked && prompt.tier <= 2)
            .map(([key, prompt]) => ({ key, ...prompt }));
        
        if (availablePrompts.length === 0) return null;
        
        // For Phase 1, prioritize Step-by-Step
        const stepByStepPrompt = availablePrompts.find(p => p.key === 'step-by-step');
        if (stepByStepPrompt) return stepByStepPrompt;
        
        // Otherwise, return a random prompt from available ones
        return availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
    }
    
    // Generate a random client request (for future implementation)
    generateClientRequest() {
        const project = this.generateRandomProject();
        const deadlineDays = Math.floor(3 + (Math.random() * 5)); // 3-7 days
        
        return {
            project: project,
            clientName: this.generateRandomClientName(),
            deadline: this.gameState.day + deadlineDays,
            bonus: Math.floor(project.reward * 0.3) // 30% bonus for meeting deadline
        };
    }
    
    // Helper to generate random client names
    generateRandomClientName() {
        const firstNames = ['Alex', 'Jamie', 'Morgan', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Quinn'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson'];
        
        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    }
    
    // Check if any projects have deadlines approaching (for future implementation)
    checkDeadlines() {
        // Not used in Phase 1, but will be implemented in later versions
        // Will return list of projects with approaching deadlines
    }
} 