/**
 * Manages the overall game state including player resources, skills, and time.
 */
export class GameState {
    constructor() {
        try {
            // Try to load saved game state
            this.loadState();
        } catch (error) {
            console.warn("Could not load saved game state:", error);
            // Initialize with default values
            this.initializeDefaults();
        }
    }
    
    // Initialize default game state values
    initializeDefaults() {
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
            aiModels: ['gpt-3'], // Available AI models (gpt-3, gpt-3.5-turbo, bloom)
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
            }
        };
        
        // Projects being worked on
        this.projects = [];
        this.activeProjects = [];
        
        // Completed projects
        this.completedProjects = [];
        
        // Email inbox - for receiving new opportunities
        this.emails = [];
        
        // Today's events log
        this.todayEvents = [];
    }
    
    // Save game state (with error handling)
    saveState() {
        // Skip localStorage entirely and just log that the state would be saved
        console.log("Game state updated (localStorage disabled)");
        // No actual persistence in this version
        return true;
    }
    
    // Load game state (without localStorage)
    loadState() {
        console.log("Starting with default game state (localStorage disabled)");
        // Always initialize with defaults
        this.initializeDefaults();
    }
    
    // Use a time block for an action
    useTimeBlock(amount = 1) {
        if (this.timeBlocks - this.timeBlocksUsed < amount) {
            return false; // Not enough time blocks
        }
        
        this.timeBlocksUsed += amount;
        // Add to events log
        this.todayEvents.push({
            type: 'time_used',
            amount: amount,
            remaining: this.timeBlocks - this.timeBlocksUsed
        });
        
        // Try to save state after changes
        this.saveState();
        return true;
    }
    
    // Check available time blocks
    getAvailableTimeBlocks() {
        return this.timeBlocks - this.timeBlocksUsed;
    }
    
    // End the current day
    endDay() {
        this.day++;
        this.timeBlocksUsed = 0;
        
        // Apply daily expenses (basic living costs)
        this.money -= 50; // $50 per day living expenses
        
        // Add to events log
        this.todayEvents.push({
            type: 'expense',
            amount: 50,
            description: 'Daily living expenses'
        });
        
        // Update market trends (simplified for Phase 1)
        if (Math.random() < 0.3) { // 30% chance of trend change each day
            const trendKeys = Object.keys(this.marketTrends.trendCycles);
            const randomTrend = trendKeys[Math.floor(Math.random() * trendKeys.length)];
            this.marketTrends.current = [randomTrend];
            
            // Add to events log
            this.todayEvents.push({
                type: 'market_trend',
                trend: randomTrend,
                description: `${randomTrend} is trending!`
            });
        }
        
        // Update projects (progress decay or penalties for projects not worked on)
        this.activeProjects.forEach(project => {
            if (!project.workedOnToday) {
                project.progress -= 5; // 5% progress decay for inactive projects
                if (project.progress < 0) project.progress = 0;
                
                // Add to events log
                this.todayEvents.push({
                    type: 'project_decay',
                    project: project.name,
                    amount: 5,
                    description: `${project.name} lost 5% progress due to inactivity`
                });
            }
            project.workedOnToday = false; // Reset for the new day
        });
        
        // Generate random emails/opportunities (simplified for Phase 1)
        if (Math.random() < 0.4) { // 40% chance of new email
            this.generateRandomEmail();
        }
        
        // Reset today's events log for the new day
        const eventsLog = [...this.todayEvents];
        this.todayEvents = [];
        
        // Save state after end of day
        this.saveState();
        
        // Check for bankruptcy
        if (this.money < 0) {
            // Handle game over or special events when out of money
            return { status: 'bankrupt', events: eventsLog };
        }
        
        return { status: 'success', events: eventsLog };
    }
    
    // Add money (from completed projects, etc.)
    addMoney(amount) {
        this.money += amount;
        
        // Add to events log
        this.todayEvents.push({
            type: 'income',
            amount: amount,
            description: 'Project payment received'
        });
        
        // Save state after adding money
        this.saveState();
    }
    
    // Increase a specific skill by the given amount
    increaseSkill(skillName, amount) {
        if (!this.skills[skillName]) {
            console.warn(`Tried to increase unknown skill: ${skillName}`);
            return;
        }
        
        // Ensure amount is a number
        let numAmount = amount;
        if (typeof amount !== 'number') {
            // Try to convert to number
            try {
                numAmount = Number(amount);
                if (isNaN(numAmount)) {
                    console.warn(`Invalid skill increase amount: ${amount}, using 0.1 as fallback`);
                    numAmount = 0.1; // Fallback to small increase
                }
            } catch (e) {
                console.warn(`Error converting skill increase amount: ${e}, using 0.1 as fallback`);
                numAmount = 0.1; // Fallback to small increase
            }
        }
        
        const oldLevel = Math.floor(this.skills[skillName]);
        this.skills[skillName] += numAmount;
        const newLevel = Math.floor(this.skills[skillName]);
        
        // Log the skill increase for debugging
        console.log(`Increased ${skillName} skill by ${numAmount.toFixed(2)}, now at ${this.skills[skillName].toFixed(2)}`);
        
        // If the skill level (whole number) increased, add event
        if (newLevel > oldLevel) {
            this.addEvent(`Skill Level Up: ${skillName} reached level ${newLevel}!`);
        }
        
        // Save state after increasing skill
        this.saveState();
    }
    
    // Generate a random email with project opportunities
    generateRandomEmail() {
        const topics = [
            'Project Opportunity',
            'New Skill Development',
            'Prompt Library Expansion',
            'Market Trend Update'
        ];
        
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        
        const email = {
            id: Date.now(),
            subject: randomTopic,
            sender: this.generateRandomSender(),
            read: false,
            date: this.day,
            content: this.generateEmailContent(randomTopic),
            hasProjectOffer: randomTopic === 'Project Opportunity',
            projectTypeOffer: randomTopic === 'Project Opportunity' ? this.generateRandomProjectType() : null
        };
        
        this.emails.push(email);
        
        // Add to events log
        this.todayEvents.push({
            type: 'email',
            subject: email.subject,
            description: `New email received: ${email.subject}`
        });
        
        return email;
    }
    
    // Generate random project type for project opportunity emails
    generateRandomProjectType() {
        const projectTypes = ['b2c', 'b2b', 'game', 'course', 'influencer'];
        return projectTypes[Math.floor(Math.random() * projectTypes.length)];
    }
    
    // Generate email content based on the topic
    generateEmailContent(topic) {
        switch (topic) {
            case 'Project Opportunity':
                const projectType = this.generateRandomProjectType();
                const projectNames = {
                    'b2c': ['TaskMaster', 'FitBuddy', 'MealPlan', 'BudgetPal', 'TravelGuide'],
                    'b2b': ['DataSync', 'InvoiceGenius', 'LeadTracker', 'TeamCollab', 'SalesBooster'],
                    'game': ['SpaceExplorer', 'DungeonCrawler', 'ZombieSurvival', 'FarmLife', 'RacingChampion'],
                    'course': ['CodeMastery', 'FinanceFundamentals', 'DigitalMarketing', 'HealthyLiving', 'CreativeWriting'],
                    'influencer': ['TechReviews', 'FoodieJourney', 'FitnessChallenge', 'TravelVlog', 'GamingStream']
                };
                
                const projectName = projectNames[projectType][Math.floor(Math.random() * projectNames[projectType].length)];
                const difficulty = (Math.floor(Math.random() * 3) + 1) / 2; // 0.5, 1.0, or 1.5
                const baseReward = {
                    'b2c': 1000,
                    'b2b': 2000,
                    'game': 1500,
                    'course': 800,
                    'influencer': 600
                }[projectType];
                
                // Randomize reward (±20%)
                const rewardVariation = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
                const reward = Math.floor(baseReward * rewardVariation);
                
                return `
                    <h3>New Project Opportunity: ${projectName}</h3>
                    <p>Hello Developer,</p>
                    <p>We have an exciting project opportunity that matches your skills and experience.</p>
                    <div class="project-details">
                        <p><strong>Project Name:</strong> ${projectName}</p>
                        <p><strong>Type:</strong> ${this.getProjectTypeName(projectType)}</p>
                        <p><strong>Difficulty:</strong> ${this.getDifficultyText(difficulty)}</p>
                        <p><strong>Reward:</strong> $${reward}</p>
                        <p><strong>Description:</strong> ${this.getProjectTypeDescription(projectType)}</p>
                    </div>
                    <p>To accept this project, please go to your project management dashboard.</p>
                    <p>Best regards,<br>Opportunity Team</p>
                    
                    <div class="email-actions">
                        <button class="accept-project-btn" data-project-type="${projectType}" data-project-name="${projectName}" data-difficulty="${difficulty}" data-reward="${reward}">Accept Project</button>
                    </div>
                `;
                
            case 'New Skill Development':
                const skills = ['coding', 'prompt'];
                const skill = skills[Math.floor(Math.random() * skills.length)];
                
                return `
                    <h3>Skill Development Opportunity</h3>
                    <p>Hello Developer,</p>
                    <p>We've noticed your progress and wanted to share a skill development opportunity.</p>
                    <p>Focusing on your ${skill === 'coding' ? 'coding' : 'prompt engineering'} skills could open up new project opportunities.</p>
                    <p>Consider investing time in research to boost these skills.</p>
                    <p>Best regards,<br>Skills Development Team</p>
                `;
                
            case 'Prompt Library Expansion':
                const promptTypes = ['step-by-step', 'few-shot', 'persona-context', 'iterative-refinement'];
                const promptType = promptTypes[Math.floor(Math.random() * promptTypes.length)];
                
                return `
                    <h3>Expand Your Prompt Techniques</h3>
                    <p>Hello Developer,</p>
                    <p>Have you tried the ${this.getPromptTypeName(promptType)} prompt technique?</p>
                    <p>${this.getPromptTypeDescription(promptType)}</p>
                    <p>Expanding your prompt library can significantly improve your project success rates.</p>
                    <p>Best regards,<br>Prompt Engineering Team</p>
                `;
                
            case 'Market Trend Update':
                const trends = ['chatbots', 'mobile apps', 'web apps', 'games', 'online courses', 'content creation'];
                const trend = trends[Math.floor(Math.random() * trends.length)];
                
                return `
                    <h3>Market Trend Alert</h3>
                    <p>Hello Developer,</p>
                    <p>We're seeing increased demand for ${trend} in the current market.</p>
                    <p>Projects in this area are currently yielding 20-50% higher rewards due to market demand.</p>
                    <p>Consider focusing your efforts in this area for maximum returns.</p>
                    <p>Best regards,<br>Market Research Team</p>
                `;
                
            default:
                return `
                    <h3>General Update</h3>
                    <p>Hello Developer,</p>
                    <p>This is a general update from the Vibe Coding Simulator team.</p>
                    <p>Keep up the good work!</p>
                    <p>Best regards,<br>Vibe Coding Team</p>
                `;
        }
    }
    
    // Get project type name
    getProjectTypeName(type) {
        const names = {
            'b2c': 'B2C App',
            'b2b': 'B2B Software',
            'game': 'Game Prototype',
            'course': 'Online Course',
            'influencer': 'Influencer Content'
        };
        return names[type] || 'Unknown';
    }
    
    // Get project type description
    getProjectTypeDescription(type) {
        const descriptions = {
            'b2c': 'A consumer-facing application that solves everyday problems.',
            'b2b': 'Business software that improves work efficiency and productivity.',
            'game': 'A simple game prototype that demonstrates core mechanics.',
            'course': 'Educational content to teach others about a specific topic.',
            'influencer': 'Content creation for social media or streaming platforms.'
        };
        return descriptions[type] || 'No description available.';
    }
    
    // Get difficulty text
    getDifficultyText(difficulty) {
        if (difficulty <= 0.5) return 'Easy';
        if (difficulty <= 1.0) return 'Medium';
        if (difficulty <= 1.5) return 'Hard';
        return 'Very Hard';
    }
    
    // Get prompt type name
    getPromptTypeName(type) {
        const names = {
            'step-by-step': 'Step-by-Step Reasoning',
            'few-shot': 'Few-Shot Examples',
            'persona-context': 'Persona/System Context',
            'iterative-refinement': 'Iterative Refinement'
        };
        return names[type] || 'Basic Instruction';
    }
    
    // Get prompt type description
    getPromptTypeDescription(type) {
        const descriptions = {
            'step-by-step': 'This technique breaks down complex logic into smaller, sequential steps for better understanding and implementation.',
            'few-shot': 'By providing examples of input-output pairs, you can guide the AI toward the desired result format.',
            'persona-context': 'Setting a persona or system style helps with domain-specific tasks and consistent tone/branding.',
            'iterative-refinement': 'Iteratively improve code by giving feedback on previous generations for progressive enhancement.'
        };
        return descriptions[type] || 'Simple, direct instructions to the AI.';
    }
    
    // Helper to generate random sender names
    generateRandomSender() {
        const domains = ['techmail.com', 'devspace.net', 'codeworld.org', 'aiprompt.io', 'freelance.dev'];
        const names = ['alex', 'sam', 'jordan', 'taylor', 'casey', 'morgan', 'riley', 'quinn'];
        
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomDomain = domains[Math.floor(Math.random() * domains.length)];
        
        return `${randomName}@${randomDomain}`;
    }
    
    // Unlock new items (AI models, hardware)
    unlock(category, item) {
        console.log(`Attempting to unlock: ${category} - ${item}`);
        
        // Initialize the category if it doesn't exist
        if (!this.unlocks[category]) {
            this.unlocks[category] = [];
        }
        
        // Check if the item is already unlocked
        if (this.unlocks[category] && !this.unlocks[category].includes(item)) {
            // Add the item to the unlocks
            this.unlocks[category].push(item);
            
            // Add to events log
            this.addEvent(`Unlocked new ${category}: ${item}`);
            
            console.log(`Successfully unlocked: ${category} - ${item}`);
            return true;
        } else {
            console.log(`Item already unlocked or invalid category: ${category} - ${item}`);
            return false;
        }
    }
    
    // Add an event to today's event log
    addEvent(description) {
        this.todayEvents.push({
            type: 'info',
            description: description,
            timestamp: Date.now()
        });
        
        console.log(`Event added: ${description}`);
    }
} 