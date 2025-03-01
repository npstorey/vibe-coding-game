/**
 * Manages the overall game state including player resources, skills, and time.
 */
export class GameState {
    constructor() {
        // Basic player stats
        this.day = 1;
        this.timeBlocks = 8; // Time blocks available per day
        this.timeBlocksUsed = 0;
        this.money = 1000;
        
        // Player skills
        this.skills = {
            coding: 1, // Affects success rate of coding tasks
            prompt: 1 // Affects quality and success rate of AI responses
        };
        
        // Unlocked technologies and upgrades
        this.unlocks = {
            aiModels: ['basic'], // Available AI models (basic, intermediate, advanced)
            promptTechniques: [], // Special prompting techniques learned
            hardware: ['starter-pc'] // Hardware upgrades
        };
        
        // Market trends that affect project success and income
        this.marketTrends = {
            current: [], // Current active trends
            trendCycles: {
                // Define possible trends and their impact on different project types
                chatbots: { impact: { b2c: 1.5, b2b: 1.3 } },
                mobileApps: { impact: { b2c: 1.4, b2b: 1.1 } },
                webApps: { impact: { b2c: 1.2, b2b: 1.3 } },
                games: { impact: { game: 1.5 } },
                courses: { impact: { course: 1.4 } },
                contentCreation: { impact: { influencer: 1.6 } }
            },
            // Function to update market trends (called at the end of each day)
            updateTrends() {
                // For simplicity, we'll randomly select a trend every 7 days
                if (this.day % 7 === 0) {
                    const trendKeys = Object.keys(this.trendCycles);
                    const randomTrend = trendKeys[Math.floor(Math.random() * trendKeys.length)];
                    this.current = [randomTrend];
                }
            }
        };
        
        // Projects being worked on
        this.activeProjects = [];
        
        // Completed projects
        this.completedProjects = [];
    }
    
    // Use a time block for an action
    useTimeBlock(amount = 1) {
        if (this.timeBlocks - this.timeBlocksUsed < amount) {
            return false; // Not enough time blocks
        }
        
        this.timeBlocksUsed += amount;
        return true;
    }
    
    // End the current day
    endDay() {
        this.day++;
        this.timeBlocksUsed = 0;
        
        // Apply daily expenses (basic living costs)
        this.money -= 50; // $50 per day living expenses
        
        // Update market trends
        this.marketTrends.updateTrends();
        
        // Update projects (progress decay or penalties for projects not worked on)
        this.activeProjects.forEach(project => {
            if (!project.workedOnToday) {
                project.progress -= 5; // 5% progress decay for inactive projects
                if (project.progress < 0) project.progress = 0;
            }
            project.workedOnToday = false; // Reset for the new day
        });
        
        // Check for bankruptcy
        if (this.money < 0) {
            // Handle game over or special events when out of money
            return 'bankrupt';
        }
        
        return true;
    }
    
    // Add money (from completed projects, etc.)
    addMoney(amount) {
        this.money += amount;
    }
    
    // Increase skill levels
    increaseSkill(skill, amount = 0.1) {
        if (this.skills[skill] !== undefined) {
            this.skills[skill] += amount;
        }
    }
    
    // Unlock new items (AI models, techniques, hardware)
    unlock(category, item) {
        if (this.unlocks[category] && !this.unlocks[category].includes(item)) {
            this.unlocks[category].push(item);
            return true;
        }
        return false;
    }
    
    // Get current success rate for AI coding based on skills and unlocks
    getAISuccessRate(projectType) {
        // Base success rate dependent on skills
        let baseRate = 0.4 + (this.skills.coding * 0.05) + (this.skills.prompt * 0.07);
        
        // Adjust based on AI model
        let modelBonus = 0;
        if (this.unlocks.aiModels.includes('advanced')) {
            modelBonus = 0.2;
        } else if (this.unlocks.aiModels.includes('intermediate')) {
            modelBonus = 0.1;
        }
        
        // Adjust based on prompting techniques
        let promptBonus = this.unlocks.promptTechniques.length * 0.03;
        
        // Adjust based on hardware
        let hardwareBonus = 0;
        if (this.unlocks.hardware.includes('high-end-pc')) {
            hardwareBonus = 0.1;
        } else if (this.unlocks.hardware.includes('mid-range-pc')) {
            hardwareBonus = 0.05;
        }
        
        // Market trend impact
        let trendMultiplier = 1;
        this.marketTrends.current.forEach(trend => {
            const trendData = this.marketTrends.trendCycles[trend];
            if (trendData && trendData.impact[projectType]) {
                trendMultiplier = trendData.impact[projectType];
            }
        });
        
        // Calculate final success rate (capped at 0.9 or 90%)
        let successRate = (baseRate + modelBonus + promptBonus + hardwareBonus) * trendMultiplier;
        return Math.min(0.9, successRate);
    }
} 