/**
 * Manages project creation, progress, and completion
 */
export class ProjectManager {
    constructor(gameState) {
        this.gameState = gameState;
        
        // Define project types and their base properties
        this.projectTypes = {
            'b2c': {
                name: 'B2C App',
                baseReward: 1000,
                baseDifficulty: 1,
                examples: ['TaskMaster', 'FitBuddy', 'MealPlan', 'BudgetPal', 'TravelGuide']
            },
            'b2b': {
                name: 'B2B Software',
                baseReward: 2000,
                baseDifficulty: 1.5,
                examples: ['DataSync', 'InvoiceGenius', 'LeadTracker', 'TeamCollab', 'SalesBooster']
            },
            'game': {
                name: 'Game Prototype',
                baseReward: 1500,
                baseDifficulty: 1.7,
                examples: ['SpaceExplorer', 'DungeonCrawler', 'ZombieSurvival', 'FarmLife', 'RacingChampion']
            },
            'course': {
                name: 'Online Course',
                baseReward: 800,
                baseDifficulty: 0.8,
                examples: ['CodeMastery', 'FinanceFundamentals', 'DigitalMarketing', 'HealthyLiving', 'CreativeWriting']
            },
            'influencer': {
                name: 'Influencer Content',
                baseReward: 600,
                baseDifficulty: 0.6,
                examples: ['TechReviews', 'FoodieJourney', 'FitnessChallenge', 'TravelVlog', 'GamingStream']
            }
        };
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
        
        // Create the project object
        return {
            name: randomName,
            type: randomTypeKey,
            reward: reward,
            difficulty: projectType.baseDifficulty,
            progress: 0,
            completed: false,
            workedOnToday: false
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
        
        // Create the project object
        const newProject = {
            name: randomName,
            type: typeKey,
            reward: reward,
            difficulty: projectType.baseDifficulty,
            progress: 0,
            completed: false,
            workedOnToday: false
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
    
    // Update project progress
    updateProjectProgress(projectIndex, progressAmount) {
        if (projectIndex < 0 || projectIndex >= this.gameState.activeProjects.length) {
            return false;
        }
        
        const project = this.gameState.activeProjects[projectIndex];
        project.progress += progressAmount;
        project.workedOnToday = true;
        
        // Check if project is completed
        if (project.progress >= 100) {
            project.progress = 100;
            project.completed = true;
            
            // Calculate final reward based on market trends
            let rewardMultiplier = 1;
            
            // Check if current trends boost this project type
            this.gameState.marketTrends.current.forEach(trend => {
                const trendData = this.gameState.marketTrends.trendCycles[trend];
                if (trendData && trendData.impact[project.type]) {
                    rewardMultiplier = trendData.impact[project.type];
                }
            });
            
            const finalReward = Math.floor(project.reward * rewardMultiplier);
            
            // Add money to player
            this.gameState.addMoney(finalReward);
            
            // Move to completed projects
            this.gameState.completedProjects.push(project);
            this.gameState.activeProjects.splice(projectIndex, 1);
            
            return {
                completed: true,
                reward: finalReward,
                multiplier: rewardMultiplier
            };
        }
        
        return {
            completed: false,
            progress: project.progress
        };
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
        // Not used in MVP, but will be implemented in later versions
        // Will return list of projects with approaching deadlines
    }
} 