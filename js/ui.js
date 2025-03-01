/**
 * Manages UI elements and interactions
 */
export class UI {
    constructor(gameState) {
        this.gameState = gameState;
        
        // Cache DOM elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.uiOverlay = document.getElementById('ui-overlay');
        this.computerScreen = document.getElementById('computer-screen');
        this.statsPanel = document.getElementById('stats-panel');
        
        // Stats elements
        this.dayCount = document.getElementById('day-count');
        this.timeBlocks = document.getElementById('time-blocks');
        this.money = document.getElementById('money');
        this.codingSkill = document.getElementById('coding-skill');
        this.promptSkill = document.getElementById('prompt-skill');
        
        // Panel elements
        this.mainMenu = document.getElementById('main-menu');
        this.projectsPanel = document.getElementById('projects-panel');
        this.codingPanel = document.getElementById('coding-panel');
        this.researchPanel = document.getElementById('research-panel');
        this.skillsPanel = document.getElementById('skills-panel');
        
        // Projects list
        this.projectsList = document.getElementById('projects-list');
        
        // Notification container
        this.notificationContainer = document.getElementById('notification-container');
        
        // Update the initial UI state
        this.updateStats();
    }
    
    // Initialize event listeners
    initEvents(projectManager) {
        this.projectManager = projectManager;
        
        // Computer screen toggle
        document.querySelector('.close-button').addEventListener('click', () => {
            this.hideComputerScreen();
        });
        
        // Main menu buttons
        document.querySelectorAll('.menu-button').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.getAttribute('data-action');
                this.handleMenuAction(action);
            });
        });
        
        // Back buttons
        document.querySelectorAll('.back-btn').forEach(button => {
            button.addEventListener('click', () => {
                this.showPanel('main-menu');
            });
        });
        
        // New project button
        document.getElementById('new-project-btn').addEventListener('click', () => {
            this.showNewProjectForm();
        });
        
        // Submit prompt button
        document.getElementById('submit-prompt-btn').addEventListener('click', () => {
            this.handlePromptSubmission();
        });
        
        // Research buttons
        document.querySelectorAll('.research-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const researchOption = event.target.closest('.research-option');
                const cost = parseInt(researchOption.getAttribute('data-cost'), 10);
                this.handleResearch(researchOption, cost);
            });
        });
    }
    
    // Handle main menu button clicks
    handleMenuAction(action) {
        switch (action) {
            case 'code':
                if (this.gameState.activeProjects.length === 0) {
                    this.showNotification('You need to start a project first!', 'error');
                    return;
                }
                this.showPanel('coding-panel');
                this.updateCurrentProjectInfo();
                break;
            case 'research':
                this.showPanel('research-panel');
                break;
            case 'projects':
                this.showPanel('projects-panel');
                this.updateProjectsList();
                break;
            case 'skills':
                this.showPanel('skills-panel');
                this.updateSkillsAndUpgrades();
                break;
            case 'end-day':
                this.endDay();
                break;
        }
    }
    
    // Handle prompt submission
    handlePromptSubmission() {
        const promptInput = document.getElementById('prompt-input');
        const promptText = promptInput.value.trim();
        
        if (promptText.length < 10) {
            this.showNotification('Your prompt is too short!', 'error');
            return;
        }
        
        if (!this.gameState.useTimeBlock(1)) {
            this.showNotification('Not enough time blocks left today!', 'error');
            return;
        }
        
        // Get current project
        const activeProject = this.gameState.activeProjects[0]; // For MVP, just use the first project
        
        // Mark project as worked on today
        activeProject.workedOnToday = true;
        
        // Calculate success based on game state and prompt quality
        const successRate = this.gameState.getAISuccessRate(activeProject.type);
        const promptQuality = Math.min(1, promptText.length / 100); // Simple measure: longer prompts are better up to a point
        const combinedSuccess = successRate * (0.7 + (promptQuality * 0.3));
        
        // Randomize outcome
        const roll = Math.random();
        let outcome, progressGain;
        
        if (roll < combinedSuccess) {
            // Success - good progress
            progressGain = Math.floor(10 + (roll * 15)); // 10-25% progress
            outcome = `Success! Your AI coding assistant wrote some great code. +${progressGain}% progress.`;
            
            // Small chance to improve skills on success
            if (Math.random() < 0.3) {
                this.gameState.increaseSkill('coding', 0.1);
                outcome += ' Your coding skill improved!';
            }
            if (Math.random() < 0.2) {
                this.gameState.increaseSkill('prompt', 0.1);
                outcome += ' Your prompt engineering skill improved!';
            }
        } else if (roll < combinedSuccess + 0.3) {
            // Partial success
            progressGain = Math.floor(3 + (roll * 7)); // 3-10% progress
            outcome = `Partial success. The AI generated some usable code, but needed tweaking. +${progressGain}% progress.`;
            
            // Higher chance to improve prompt skill on partial success
            if (Math.random() < 0.4) {
                this.gameState.increaseSkill('prompt', 0.1);
                outcome += ' Your prompt engineering skill improved!';
            }
        } else {
            // Failure
            progressGain = 0;
            outcome = 'The AI generated unusable code. No progress made. Try a different approach.';
            
            // Small skill improvement even on failure (learning from mistakes)
            if (Math.random() < 0.2) {
                this.gameState.increaseSkill('prompt', 0.1);
                outcome += ' But your prompt engineering skill improved!';
            }
        }
        
        // Update project progress
        activeProject.progress += progressGain;
        
        // Check for project completion
        if (activeProject.progress >= 100) {
            activeProject.progress = 100;
            activeProject.completed = true;
            
            // Calculate project rewards
            const baseReward = activeProject.reward;
            const trendBonus = 1; // Will be calculated based on market trends
            
            // Apply the reward
            const totalReward = Math.floor(baseReward * trendBonus);
            this.gameState.addMoney(totalReward);
            
            // Move to completed projects
            this.gameState.completedProjects.push(activeProject);
            this.gameState.activeProjects = this.gameState.activeProjects.filter(p => p !== activeProject);
            
            outcome += ` Project complete! You earned $${totalReward}.`;
        }
        
        // Display the results
        document.getElementById('coding-results').innerHTML = outcome;
        
        // Clear the prompt input
        promptInput.value = '';
        
        // Update the UI
        this.updateCurrentProjectInfo();
        this.updateStats();
    }
    
    // Handle research actions
    handleResearch(researchOption, cost) {
        if (!this.gameState.useTimeBlock(cost)) {
            this.showNotification('Not enough time blocks left today!', 'error');
            return;
        }
        
        const researchType = researchOption.querySelector('h3').textContent;
        
        if (researchType === 'Browse Forums') {
            // Random chance to discover new prompting technique
            if (Math.random() < 0.4) {
                const techniques = [
                    'chain-of-thought',
                    'step-by-step',
                    'explain-like-im-five',
                    'role-based-prompting',
                    'few-shot-examples'
                ];
                
                // Find a technique we don't have yet
                const availableTechniques = techniques.filter(t => !this.gameState.unlocks.promptTechniques.includes(t));
                
                if (availableTechniques.length > 0) {
                    const newTechnique = availableTechniques[Math.floor(Math.random() * availableTechniques.length)];
                    this.gameState.unlock('promptTechniques', newTechnique);
                    
                    this.showNotification(`You discovered a new prompting technique: ${newTechnique.replace(/-/g, ' ')}!`, 'success');
                    this.gameState.increaseSkill('prompt', 0.2);
                } else {
                    this.showNotification('You browsed forums but didn\'t find any new techniques.', 'info');
                }
            } else {
                this.showNotification('You browsed forums but didn\'t find anything useful today.', 'info');
            }
        } else if (researchType === 'Study Documentation') {
            // Guaranteed coding skill improvement
            this.gameState.increaseSkill('coding', 0.2);
            this.showNotification('Your coding skills have improved from studying documentation!', 'success');
        }
        
        // Update UI
        this.updateStats();
    }
    
    // End the current day
    endDay() {
        const result = this.gameState.endDay();
        
        if (result === 'bankrupt') {
            this.showNotification('You\'ve gone bankrupt! Game over!', 'error');
            // TODO: Implement game over screen
        } else {
            this.showNotification(`Day ${this.gameState.day} begins. You have 8 time blocks available.`, 'info');
        }
        
        this.hideComputerScreen();
        this.updateStats();
    }
    
    // Show a notification message
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.notificationContainer.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    // Hide loading screen
    hideLoadingScreen() {
        this.loadingScreen.classList.add('hidden');
        this.uiOverlay.classList.remove('hidden');
    }
    
    // Toggle computer screen
    toggleComputerScreen() {
        if (this.computerScreen.classList.contains('hidden')) {
            this.showComputerScreen();
        } else {
            this.hideComputerScreen();
        }
    }
    
    // Show computer screen
    showComputerScreen() {
        this.computerScreen.classList.remove('hidden');
        this.showPanel('main-menu');
    }
    
    // Hide computer screen
    hideComputerScreen() {
        this.computerScreen.classList.add('hidden');
    }
    
    // Show a specific panel and hide others
    showPanel(panelId) {
        // Hide all panels
        this.mainMenu.classList.add('hidden');
        this.projectsPanel.classList.add('hidden');
        this.codingPanel.classList.add('hidden');
        this.researchPanel.classList.add('hidden');
        this.skillsPanel.classList.add('hidden');
        
        // Show the requested panel
        document.getElementById(panelId).classList.remove('hidden');
    }
    
    // Update stats display
    updateStats() {
        this.dayCount.textContent = this.gameState.day;
        this.timeBlocks.textContent = this.gameState.timeBlocks - this.gameState.timeBlocksUsed;
        this.money.textContent = this.gameState.money;
        this.codingSkill.textContent = this.gameState.skills.coding.toFixed(1);
        this.promptSkill.textContent = this.gameState.skills.prompt.toFixed(1);
    }
    
    // Update the list of projects
    updateProjectsList() {
        this.projectsList.innerHTML = '';
        
        if (this.gameState.activeProjects.length === 0) {
            this.projectsList.innerHTML = '<p>No active projects. Start a new project!</p>';
            return;
        }
        
        this.gameState.activeProjects.forEach(project => {
            const projectElement = document.createElement('div');
            projectElement.className = 'project-item';
            
            projectElement.innerHTML = `
                <div class="project-name">${project.name}</div>
                <div class="project-details">
                    Type: ${project.type}<br>
                    Reward: $${project.reward}
                </div>
                <div class="project-progress">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
                <div>Progress: ${project.progress}%</div>
            `;
            
            this.projectsList.appendChild(projectElement);
        });
    }
    
    // Show new project form
    showNewProjectForm() {
        // For MVP, just create a simple B2C app project
        if (this.gameState.activeProjects.length >= 3) {
            this.showNotification('You can only have up to 3 active projects at once!', 'error');
            return;
        }
        
        const projectTypes = [
            { id: 'b2c', name: 'B2C App', reward: 1000, difficulty: 1 },
            { id: 'b2b', name: 'B2B Software', reward: 2000, difficulty: 1.5 },
            { id: 'game', name: 'Game Prototype', reward: 1500, difficulty: 1.7 },
            { id: 'course', name: 'Online Course', reward: 800, difficulty: 0.8 },
            { id: 'influencer', name: 'Influencer Content', reward: 600, difficulty: 0.6 }
        ];
        
        // For MVP, just pick a random project type
        const projectType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
        
        const projectNames = {
            'b2c': ['TaskMaster', 'FitBuddy', 'MealPlan', 'BudgetPal', 'TravelGuide'],
            'b2b': ['DataSync', 'InvoiceGenius', 'LeadTracker', 'TeamCollab', 'SalesBooster'],
            'game': ['SpaceExplorer', 'DungeonCrawler', 'ZombieSurvival', 'FarmLife', 'RacingChampion'],
            'course': ['CodeMastery', 'FinanceFundamentals', 'DigitalMarketing', 'HealthyLiving', 'CreativeWriting'],
            'influencer': ['TechReviews', 'FoodieJourney', 'FitnessChallenge', 'TravelVlog', 'GamingStream']
        };
        
        const randomName = projectNames[projectType.id][Math.floor(Math.random() * projectNames[projectType.id].length)];
        
        const newProject = {
            name: randomName,
            type: projectType.id,
            reward: projectType.reward,
            difficulty: projectType.difficulty,
            progress: 0,
            completed: false,
            workedOnToday: false
        };
        
        this.gameState.activeProjects.push(newProject);
        this.showNotification(`Started new project: ${newProject.name}`, 'success');
        this.updateProjectsList();
    }
    
    // Update current project info in coding panel
    updateCurrentProjectInfo() {
        const currentProjectInfo = document.getElementById('current-project-info');
        
        if (this.gameState.activeProjects.length === 0) {
            currentProjectInfo.innerHTML = '<p>No active project selected.</p>';
            return;
        }
        
        const project = this.gameState.activeProjects[0]; // For MVP, just use the first project
        currentProjectInfo.innerHTML = `
            <h3>${project.name}</h3>
            <p>Type: ${project.type}</p>
            <p>Progress: ${project.progress}%</p>
            <div class="project-progress">
                <div class="progress-fill" style="width: ${project.progress}%"></div>
            </div>
        `;
    }
    
    // Update skills and upgrades panel
    updateSkillsAndUpgrades() {
        const skillsList = document.querySelector('.skills-list');
        const upgradesList = document.querySelector('.upgrades-list');
        
        // Display skills
        skillsList.innerHTML = `
            <h3>Your Skills</h3>
            <div class="skill-item">
                <div class="skill-name">Coding</div>
                <div class="skill-level">Level: ${this.gameState.skills.coding.toFixed(1)}</div>
                <p>Higher coding skill improves your success rate with AI coding.</p>
            </div>
            <div class="skill-item">
                <div class="skill-name">Prompt Engineering</div>
                <div class="skill-level">Level: ${this.gameState.skills.prompt.toFixed(1)}</div>
                <p>Better prompting skills increase the quality of AI responses.</p>
            </div>
        `;
        
        // Display unlocks
        upgradesList.innerHTML = `
            <h3>Your Unlocks</h3>
            <div class="upgrade-item">
                <div class="upgrade-name">AI Models</div>
                <div class="upgrade-info">Current: ${this.gameState.unlocks.aiModels.join(', ')}</div>
                ${this.gameState.unlocks.aiModels.includes('advanced') ? '' : 
                    `<button class="upgrade-btn" data-category="aiModels" data-item="${this.gameState.unlocks.aiModels.includes('intermediate') ? 'advanced' : 'intermediate'}" data-cost="${this.gameState.unlocks.aiModels.includes('intermediate') ? 5000 : 2000}">
                        Upgrade to ${this.gameState.unlocks.aiModels.includes('intermediate') ? 'Advanced' : 'Intermediate'} ($${this.gameState.unlocks.aiModels.includes('intermediate') ? 5000 : 2000})
                    </button>`
                }
            </div>
            <div class="upgrade-item">
                <div class="upgrade-name">Prompting Techniques</div>
                <div class="upgrade-info">Discovered: ${this.gameState.unlocks.promptTechniques.length === 0 ? 'None' : this.gameState.unlocks.promptTechniques.join(', ')}</div>
                <p>Discover new techniques through research.</p>
            </div>
            <div class="upgrade-item">
                <div class="upgrade-name">Hardware</div>
                <div class="upgrade-info">Current: ${this.gameState.unlocks.hardware.join(', ')}</div>
                ${this.gameState.unlocks.hardware.includes('high-end-pc') ? '' : 
                    `<button class="upgrade-btn" data-category="hardware" data-item="${this.gameState.unlocks.hardware.includes('mid-range-pc') ? 'high-end-pc' : 'mid-range-pc'}" data-cost="${this.gameState.unlocks.hardware.includes('mid-range-pc') ? 3000 : 1000}">
                        Upgrade to ${this.gameState.unlocks.hardware.includes('mid-range-pc') ? 'High-End PC' : 'Mid-Range PC'} ($${this.gameState.unlocks.hardware.includes('mid-range-pc') ? 3000 : 1000})
                    </button>`
                }
            </div>
        `;
        
        // Add event listeners to upgrade buttons
        document.querySelectorAll('.upgrade-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const category = event.target.getAttribute('data-category');
                const item = event.target.getAttribute('data-item');
                const cost = parseInt(event.target.getAttribute('data-cost'), 10);
                
                this.handleUpgrade(category, item, cost);
            });
        });
    }
    
    // Handle upgrade purchases
    handleUpgrade(category, item, cost) {
        if (this.gameState.money < cost) {
            this.showNotification('Not enough money for this upgrade!', 'error');
            return;
        }
        
        this.gameState.money -= cost;
        this.gameState.unlock(category, item);
        this.showNotification(`Upgraded ${category} to ${item}!`, 'success');
        this.updateStats();
        this.updateSkillsAndUpgrades();
    }
} 