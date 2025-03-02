/**
 * Manages UI elements and interactions
 */
export class UI {
    constructor(gameState, aiModelManager, promptLibrary) {
        this.gameState = gameState;
        this.aiModelManager = aiModelManager;
        this.promptLibrary = promptLibrary;
        
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
        this.socialPanel = document.getElementById('social-panel');
        this.shopPanel = document.getElementById('shop-panel');
        this.emailPanel = document.getElementById('email-panel');
        this.resourcesPanel = document.getElementById('resources-panel');
        
        // Projects list elements
        this.activeProjectsList = document.getElementById('active-projects-list');
        this.jobBoardList = document.getElementById('job-board-list');
        this.completedProjectsList = document.getElementById('completed-projects-list');
        
        // Project selection elements
        this.projectSelect = document.getElementById('project-select');
        this.currentProjectInfo = document.getElementById('current-project-info');
        
        // Social media elements
        this.socialPostsList = document.getElementById('social-posts-list');
        this.scrollSocialBtn = document.getElementById('scroll-social-btn');
        
        // Shop elements
        this.shopTabs = document.querySelectorAll('.shop-tab');
        this.shopSections = document.querySelectorAll('.shop-section');
        this.hardwareShopList = document.getElementById('hardware-shop-list');
        this.aiModelsShopList = document.getElementById('ai-models-shop-list');
        this.promptsShopList = document.getElementById('prompts-shop-list');
        this.buyCloudBtns = document.querySelectorAll('.buy-cloud-btn');
        
        // Email elements
        this.emailList = document.getElementById('email-list');
        this.emailContent = document.getElementById('email-content');
        this.emailSubject = document.getElementById('email-subject');
        this.emailSender = document.getElementById('email-sender');
        this.emailDate = document.getElementById('email-date');
        this.emailBody = document.getElementById('email-body');
        
        // Notification container
        this.notificationContainer = document.getElementById('notification-container');
        
        // Update the initial UI state
        this.updateStats();
    }
    
    // Initialize event listeners
    initEvents(projectManager, socialMediaManager, hardwareManager, shopManager, resourceManager) {
        console.log("Initializing UI events");
        
        // Store references to managers
        this.projectManager = projectManager;
        this.socialMediaManager = socialMediaManager;
        this.hardwareManager = hardwareManager;
        this.shopManager = shopManager;
        this.resourceManager = resourceManager;
        
        // Now that dependencies are available, initialize panels
        this.initPanels();
        
        // Computer screen toggle with improved event handling
        const closeButton = document.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                this.computerScreen.classList.add('hidden');
                e.stopPropagation();
            });
        }
        
        // Main menu buttons with improved handling
        document.querySelectorAll('.menu-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Menu button clicked:', button.getAttribute('data-action'));
                const action = button.getAttribute('data-action');
                
                if (action === 'end-day') {
                    this.handleEndDay();
                } else {
                    this.switchPanel(action);
                }
            });
        });
        
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            console.log("Adding listener to nav button:", btn);
            btn.addEventListener('click', () => {
                const panel = btn.dataset.panel;
                console.log("Nav button clicked for panel:", panel);
                this.switchPanel(panel);
            });
        });
        
        // Back buttons
        document.querySelectorAll('.back-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.switchPanel('main-menu');
            });
        });
        
        // End day button
        const endDayBtn = document.getElementById('end-day-btn');
        if (endDayBtn) {
            endDayBtn.addEventListener('click', () => this.handleEndDay());
        }
        
        // New project button
        const newProjectBtn = document.getElementById('new-project-btn');
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            this.showNewProjectForm();
        });
        }
        
        // Submit prompt button
        const submitPromptBtn = document.getElementById('submit-prompt-btn');
        if (submitPromptBtn) {
            submitPromptBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            this.handlePromptSubmission();
        });
        }
        
        // Research buttons - Fix to properly update skills and UI
        document.querySelectorAll('.research-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const researchOption = e.target.closest('.research-option');
                if (!researchOption) return;
                
                const cost = parseInt(researchOption.getAttribute('data-cost'), 10);
                const researchType = researchOption.querySelector('h3').textContent.trim();
                
                console.log(`Research button clicked: ${researchType}, cost: ${cost}`);
                this.conductResearch(researchType, cost);
            });
        });
        
        // Make prompt cards clickable
        document.querySelectorAll('.prompt-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectPromptTemplate(card);
            });
        });
        
        // Email close button
        const emailCloseBtn = document.getElementById('email-close-btn');
        if (emailCloseBtn) {
            emailCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            document.getElementById('email-content').classList.add('hidden');
            document.getElementById('email-list').classList.remove('hidden');
        });
        }
        
        // Add direct interaction handlers for consistency
        this.addDirectEventHandlers();

        console.log('UI event listeners initialized');
    }
    
    // Add direct event handlers to ensure clickable elements work
    addDirectEventHandlers() {
        console.log("Adding direct event handlers");
        
        // Global click handler for all interactive buttons
        document.addEventListener('click', (e) => {
            // Handle work-on-project buttons
            if (e.target.matches('.work-on-project-btn')) {
                console.log("Direct click on work-on-project button");
                const index = parseInt(e.target.dataset.index);
                if (!isNaN(index)) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    this.selectProject(index);
                    this.switchPanel('coding');
                }
            }
            
            // Handle research buttons
            if (e.target.matches('.research-btn')) {
                console.log("Direct click on research button");
                const researchOption = e.target.closest('.research-option');
                if (researchOption) {
                    const cost = parseInt(researchOption.dataset.cost, 10);
                    const researchType = researchOption.querySelector('h3').textContent.trim();
                    
                    e.preventDefault();
                    e.stopPropagation();
                    this.conductResearch(researchType, cost);
                }
            }
            
            // Handle prompt cards
            if (e.target.closest('.prompt-card')) {
                console.log("Direct click on prompt card");
                const card = e.target.closest('.prompt-card');
                e.preventDefault();
                e.stopPropagation();
                this.selectPromptTemplate(card);
            }
            
            // Handle direct panel navigation buttons
            if (e.target.matches('.nav-btn')) {
                console.log("Direct click on nav button");
                const panel = e.target.dataset.panel;
                if (panel) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.switchPanel(panel);
                }
            }
        });
    }
    
    // Select a prompt template when clicked
    selectPromptTemplate(card) {
        // Remove 'selected' class from all cards
        document.querySelectorAll('.prompt-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Add 'selected' class to the clicked card
        card.classList.add('selected');
        
        // Get the prompt template name from the card
        const promptName = card.querySelector('h4').textContent.trim();
        
        // Find the prompt in the promptLibrary
        const promptKey = this.findPromptKeyByName(promptName);
        
        if (promptKey) {
            // Set the selected value in the dropdown
            const promptSelect = document.getElementById('prompt-technique-select');
            if (promptSelect) {
                promptSelect.value = promptKey;
            }
            
            // Also populate the prompt input area with a template or example
            const promptExample = card.querySelector('.prompt-example')?.textContent.trim();
            if (promptExample) {
                const promptInput = document.getElementById('prompt-input');
                if (promptInput && promptInput.value.trim() === '') {
                    promptInput.value = promptExample;
                }
            }
        }
    }
    
    // Helper function to find a prompt key by its display name
    findPromptKeyByName(name) {
        const prompts = this.promptLibrary.getUnlockedPrompts();
        const prompt = prompts.find(p => p.name === name);
        return prompt ? prompt.key : null;
    }
    
    // Conduct research with improved error handling and logging
    conductResearch(researchType, cost) {
        console.log(`Conducting research: ${researchType}, cost: ${cost}`);
        
        try {
            // Validate parameters
            if (!researchType) {
                console.error("Invalid research type");
                this.showNotification("Invalid research type", 'error');
                return;
            }
            
            if (isNaN(cost) || cost <= 0) {
                console.error(`Invalid research cost: ${cost}`);
                this.showNotification("Invalid research cost", 'error');
                return;
            }
            
            // Check if game state is available
            if (!this.gameState) {
                console.error("GameState is missing - cannot conduct research");
                this.showNotification("Game state error", 'error');
                return;
            }
            
            // Check available time blocks
            const availableBlocks = this.gameState.timeBlocks - this.gameState.timeBlocksUsed;
            console.log(`Available time blocks: ${availableBlocks}, needed: ${cost}`);
            
            if (availableBlocks < cost) {
                console.warn(`Not enough time blocks! Available: ${availableBlocks}, Required: ${cost}`);
                this.showNotification(`Not enough time blocks! Need ${cost} but only have ${availableBlocks}.`, 'warning');
                return;
            }
            
            // Show researching feedback
            this.showNotification(`Researching ${researchType}...`, 'info', 1500);
            
            // Use time blocks
            this.gameState.useTimeBlock(cost);
            console.log(`Used ${cost} time blocks`);
            
            // Update stats display
            this.updateStats();
            
            // Determine results based on research type
            setTimeout(() => {
                if (researchType === 'Browse Forums') {
                    // Increase prompting skill
                    const skillGain = +(0.2 + (Math.random() * 0.3)).toFixed(1);
                    console.log(`Increasing prompt skill by ${skillGain}`);
                    this.gameState.increaseSkill('prompt', skillGain);
                    
                    this.showNotification(`Prompting skill increased by ${skillGain}!`, 'success');
                    
                    // Small chance to unlock a new prompt technique
                    if (Math.random() < 0.15) { // 15% chance
                        // For Phase 1, we'll just simulate this
                        this.showNotification('You discovered a new prompting technique!', 'success');
                        
                        // If we have a prompt library, try to unlock a random prompt
                        if (this.promptLibrary && typeof this.promptLibrary.unlockPrompt === 'function') {
                            const prompts = ['step-by-step', 'few-shot', 'persona-context', 'iterative-refinement'];
                            const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
                            
                            if (this.promptLibrary.unlockPrompt(randomPrompt)) {
                                console.log(`Unlocked prompt technique: ${randomPrompt}`);
                                this.updatePromptTechniques();
                            }
                        }
                    }
                } else if (researchType === 'Study Documentation') {
                    // Increase coding skill
                    const skillGain = +(0.3 + (Math.random() * 0.4)).toFixed(1);
                    console.log(`Increasing coding skill by ${skillGain}`);
                    this.gameState.increaseSkill('coding', skillGain);
                    
                    this.showNotification(`Coding skill increased by ${skillGain}!`, 'success');
                } else {
                    // Generic skill gain for any other research type
                    const skillGain = +(0.1 + (Math.random() * 0.2)).toFixed(1);
                    console.log(`Generic research: increasing both skills by ${skillGain}`);
                    this.gameState.increaseSkill('coding', skillGain);
                    this.gameState.increaseSkill('prompt', skillGain);
                    
                    this.showNotification(`General knowledge increased!`, 'success');
                }
                
                // Update UI to reflect the changes
                this.updateStats();
                
                // If skills panel is visible, update skills visualization
                if (!document.getElementById('skills-panel').classList.contains('hidden')) {
                    this.updateSkillsAndUpgrades();
                }
            }, 1000); // 1s delay to simulate processing
            
            console.log("Research conducted successfully");
        } catch (error) {
            console.error("Error conducting research:", error);
            this.showNotification("An error occurred during research", 'error');
        }
    }
    
    // Update skills and upgrades panel with current values
    updateSkillsAndUpgrades() {
        console.log("Updating skills and upgrades panel");
        const skillsList = document.querySelector('.skills-list');
        
        if (!skillsList) {
            console.warn("Skills list element not found");
            return;
        }
        
        skillsList.innerHTML = '';
        
        // Create skill items with actual values from gameState
        const codingSkill = this.gameState.skills.coding || 1;
        const promptSkill = this.gameState.skills.prompt || 1;
        
        console.log(`Current skills - Coding: ${codingSkill}, Prompt: ${promptSkill}`);
        
        const skills = [
            { 
                name: 'Coding',
                level: codingSkill,
                description: 'Your ability to write and understand code.'
            },
            { 
                name: 'Prompting',
                level: promptSkill,
                description: 'Your ability to effectively instruct AI models.'
            }
        ];
        
        skills.forEach(skill => {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            
            skillItem.innerHTML = `
                <div class="skill-name">${skill.name}</div>
                <div class="skill-level">Level: ${skill.level.toFixed(1)}</div>
                <div class="skill-description">${skill.description}</div>
                <div class="skill-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${Math.min(skill.level * 10, 100)}%"></div>
                    </div>
                </div>
            `;
            
            skillsList.appendChild(skillItem);
        });
        
        // Update the skill visualization
        this.updateSkillVisualization(codingSkill, promptSkill);
        
        // Update available upgrades
        this.updateUpgrades();
    }
    
    // Update skill visualization with proper animation
    updateSkillVisualization(codingSkill, promptSkill) {
        const skillViz = document.querySelector('.skill-visualization');
        if (!skillViz) return;
        
        // Clear previous visualization
        skillViz.innerHTML = '';
        
        // Create skill graph
        const skillGraph = document.createElement('div');
        skillGraph.className = 'skill-graph';
        
        // Add graph title
        const graphTitle = document.createElement('h4');
        graphTitle.textContent = 'Skill Development';
        skillGraph.appendChild(graphTitle);
        
        // Create coding skill bar
        const codingBar = this.createSkillBar('Coding', codingSkill, 'var(--terminal-green)');
        skillGraph.appendChild(codingBar);
        
        // Create prompting skill bar
        const promptBar = this.createSkillBar('Prompting', promptSkill, 'var(--accent-glow)');
        skillGraph.appendChild(promptBar);
        
        // Add a skill level legend
        const legend = document.createElement('div');
        legend.className = 'skill-legend';
        legend.innerHTML = `
            <div class="legend-item">
                <span class="legend-color" style="background-color: var(--terminal-green)"></span>
                <span class="legend-text">Coding</span>
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background-color: var(--accent-glow)"></span>
                <span class="legend-text">Prompting</span>
            </div>
        `;
        
        skillGraph.appendChild(legend);
        skillViz.appendChild(skillGraph);
    }
    
    // Create skill bar with animation
    createSkillBar(skillName, level, color) {
        const container = document.createElement('div');
        container.className = 'skill-bar-container';
        
        const label = document.createElement('div');
        label.className = 'skill-label';
        label.textContent = `${skillName}: ${level.toFixed(1)}`;
        
        const bar = document.createElement('div');
        bar.className = 'skill-bar';
        
        const fill = document.createElement('div');
        fill.className = 'skill-bar-fill';
        fill.style.width = '0%'; // Start at 0 for animation
        fill.style.backgroundColor = color;
        
        bar.appendChild(fill);
        container.appendChild(label);
        container.appendChild(bar);
        
        // Animate the fill after a slight delay
        setTimeout(() => {
            fill.style.width = `${Math.min(level * 10, 100)}%`;
        }, 100);
        
        return container;
    }
    
    // Improved update stats to show proper skill values
    updateStats() {
        this.dayCount.textContent = this.gameState.day;
        this.timeBlocks.textContent = this.gameState.timeBlocks - this.gameState.timeBlocksUsed;
        this.money.textContent = this.gameState.money;
        
        // Show proper skill values with one decimal place
        const codingSkill = this.gameState.skills.coding || 1;
        const promptSkill = this.gameState.skills.prompt || 1;
        
        this.codingSkill.textContent = codingSkill.toFixed(1);
        this.promptSkill.textContent = promptSkill.toFixed(1);
        
        console.log(`Updated stats - Day: ${this.gameState.day}, Time: ${this.gameState.timeBlocks - this.gameState.timeBlocksUsed}, Money: ${this.gameState.money}, Coding: ${codingSkill.toFixed(1)}, Prompt: ${promptSkill.toFixed(1)}`);
    }
    
    // Handle main menu button clicks
    handleMenuAction(action) {
        switch (action) {
            case 'code':
                this.switchPanel('coding');
                this.updateProjectSelection();
                this.updateAIModelSelection();
                this.updatePromptTechniques();
                break;
            case 'email':
                this.switchPanel('email');
                this.initEmailPanel();
                this.handleEmailAction(); // Check email (generate new opportunities)
                break;
            case 'social':
                this.switchPanel('social');
                this.initSocialPanel();
                break;
            case 'shop':
                this.switchPanel('shop');
                this.initShopPanel();
                break;
            case 'resources':
                this.switchPanel('resources');
                this.resourceManager.updateResourcesDisplay();
                break;
            case 'projects':
                this.switchPanel('projects');
                this.initProjectsPanel();
                break;
            case 'end-day':
                this.handleEndDay();
                break;
            default:
                console.warn(`Unknown menu action: ${action}`);
        }
    }
    
    // Handle prompt submission for coding session
    handlePromptSubmission(event) {
        event.preventDefault();
        
        // Get current project
        const projectSelect = document.getElementById('project-select');
        if (!projectSelect) {
            this.showNotification('No project selected', 'error');
            return;
        }
        
        const projectIndex = parseInt(projectSelect.value);
        if (isNaN(projectIndex)) {
            this.showNotification('Invalid project selection', 'error');
            return;
        }
        
        // Get selected AI model
        const aiModelSelect = document.getElementById('ai-model-select');
        if (!aiModelSelect) {
            this.showNotification('No AI model selected', 'error');
            return;
        }
        
        const aiModelKey = aiModelSelect.value;
        if (!aiModelKey) {
            this.showNotification('Please select an AI model', 'error');
            return;
        }
        
        // Get selected prompt technique
        const promptTechniqueSelect = document.getElementById('prompt-technique-select');
        if (!promptTechniqueSelect) {
            this.showNotification('No prompt technique selected', 'error');
            return;
        }
        
        const promptKey = promptTechniqueSelect.value;
        if (!promptKey) {
            this.showNotification('Please select a prompt technique', 'error');
            return;
        }
        
        // Get prompt text
        const promptInput = document.getElementById('prompt-input');
        if (!promptInput || promptInput.value.trim() === '') {
            this.showNotification('Please write a prompt for the AI', 'error');
            return;
        }
        
        // Check if user has enough time blocks
        if (!this.gameState.useTimeBlock(1)) {
            this.showNotification('Not enough time blocks remaining today', 'error');
            return;
        }
        
        // Check if project meets requirements
        const project = this.gameState.activeProjects[projectIndex];
        const requirementsCheck = this.projectManager.verifyProjectRequirements(
            project, 
            aiModelKey, 
            promptKey, 
            this.hardwareManager
        );
        
        if (!requirementsCheck.meetsRequirements) {
            this.showNotification(requirementsCheck.message, 'error');
            // Refund the time block since we couldn't proceed
            this.gameState.timeBlocksUsed--;
            return;
        }
        
        if (requirementsCheck.warning) {
            this.showNotification(requirementsCheck.warning, 'warning');
        }
        
        // Use cloud credits based on AI model tier
        const aiModel = this.aiModelManager.getModel(aiModelKey);
        const cloudCreditsCost = aiModel.tier * 5; // Tier 1 = 5 credits, Tier 2 = 10 credits, etc.
        
        if (cloudCreditsCost > 0) {
            const hasCredits = this.hardwareManager.useCloudCredits(cloudCreditsCost);
            if (!hasCredits) {
                this.showNotification(`Not enough cloud credits. Need ${cloudCreditsCost} for this model.`, 'error');
                // Refund the time block
                this.gameState.timeBlocksUsed--;
                return;
            }
        }
        
        // Show processing overlay
        this.showProcessingOverlay();
        
        // Execute the coding sprint with synergy calculations
        setTimeout(() => {
            const result = this.projectManager.updateProjectProgress(
                projectIndex,
                aiModelKey,
                promptKey,
                this.hardwareManager
            );
            
            this.hideProcessingOverlay();
            
            if (!result.success) {
                this.showNotification(result.message, 'error');
                return;
            }
            
            // Update stats and resources after sprint
            this.updateStats();
            if (this.resourceManager) {
                this.resourceManager.updateResourcesDisplay();
            }
            
            // Display result
            this.displayCodingResult(result, promptInput.value);
            
            // Clear prompt input for next sprint
            promptInput.value = '';
            
            // Check if project is completed
            if (result.completed) {
                this.showNotification(`Project completed! Earned $${result.reward}`, 'success');
                
                // Update projects list if it exists
                if (typeof this.updateProjectsList === 'function') {
                    this.updateProjectsList();
                }
                
                // If no more projects, go back to main menu
                if (this.gameState.activeProjects.length === 0) {
                    this.switchPanel('main-menu');
                } else {
                    // Update current project info
                    this.updateCurrentProjectInfo();
                }
            }
        }, 2000 + Math.random() * 2000); // Random delay between 2-4 seconds for realism
    }
    
    // Display coding result in the UI
    displayCodingResult(result, promptText) {
        const codingResults = document.getElementById('coding-results');
        if (!codingResults) return;
        
        const resultCard = document.createElement('div');
        resultCard.className = `result-card ${result.isSprintSuccess ? 'success' : 'failure'}`;
        
        // Calculate time
        const now = new Date();
        const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        let resultContent = '';
        
        if (result.completed) {
            // Project completed
            resultContent = `
                <h3>Project Completed at ${timeString}</h3>
                <div class="prompt-used">Prompt: "${truncateText(promptText, 50)}"</div>
                <div class="ai-response">
                    <p>Project successfully completed! All requirements have been met.</p>
                </div>
                <div class="project-completed">
                    <h4>Reward Earned</h4>
                    <p>$${result.reward} (Market Multiplier: ${result.multiplier.toFixed(1)}x)</p>
                </div>
            `;
            
            if (result.earnedPrompt) {
                resultContent += `
                    <div class="prompt-earned">
                        <h4>New Prompt Template Discovered</h4>
                        <p>${result.earnedPrompt.name}: ${result.earnedPrompt.description}</p>
                    </div>
                `;
            }
        } else {
            // Regular sprint result
            resultContent = `
                <h3>${result.isSprintSuccess ? 'Success' : 'Partial Success'} at ${timeString}</h3>
                <div class="prompt-used">Prompt: "${truncateText(promptText, 50)}"</div>
                <div class="ai-response">
                    <p>${result.message || (result.isSprintSuccess ? 'Code generated successfully!' : 'Some issues with the code generation.')}</p>
                </div>
                <div class="progress-info">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${result.progress}%">
                            <span>${result.progress}%</span>
                        </div>
                    </div>
                    <div class="progress-gained">+${result.progressGained}%</div>
                </div>
            `;
        }
        
        // Skill gains section
        if (result.skillGain) {
            resultContent += `
                <div class="skill-gains">
                    <h4>Skills Improved</h4>
                    <ul>
                        ${result.skillGain.coding > 0 ? `<li>Coding +${result.skillGain.coding.toFixed(2)}</li>` : ''}
                        ${result.skillGain.prompt > 0 ? `<li>Prompt Engineering +${result.skillGain.prompt.toFixed(2)}</li>` : ''}
                    </ul>
                </div>
            `;
        }
        
        resultCard.innerHTML = resultContent;
        
        // Add to results list at the top
        codingResults.insertBefore(resultCard, codingResults.firstChild);
        
        // Limit the number of result cards to 5
        while (codingResults.children.length > 5) {
            codingResults.removeChild(codingResults.lastChild);
        }
    }
    
    // Helper function to truncate text
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    // Show processing overlay
    showProcessingOverlay() {
        // Remove existing overlay if any
        this.hideProcessingOverlay();
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'processing-overlay';
        overlay.innerHTML = `
            <div class="processing-spinner"></div>
            <div class="processing-text">AI Assistant is coding...</div>
        `;
        
        const codingPanel = document.getElementById('coding-panel');
        if (codingPanel) {
            codingPanel.appendChild(overlay);
        }
    }
    
    // Hide processing overlay
    hideProcessingOverlay() {
        const existingOverlay = document.querySelector('.processing-overlay');
        if (existingOverlay) {
            existingOverlay.parentNode.removeChild(existingOverlay);
        }
    }
    
    // Switch to a specific panel
    switchPanel(panelName) {
        // Hide all panels
        const panels = ['coding', 'social', 'shop', 'email', 'resources', 'projects'];
        panels.forEach(panel => {
            const panelElement = document.getElementById(`${panel}-panel`);
            if (panelElement) {
                panelElement.classList.add('hidden');
                panelElement.style.display = 'none';
            }
        });
        
        // Hide main menu
        this.mainMenu.classList.add('hidden');
        this.mainMenu.style.display = 'none';
        
        // Show the requested panel
        const panelElement = document.getElementById(`${panelName}-panel`);
        if (panelElement) {
            panelElement.classList.remove('hidden');
            panelElement.style.display = 'block';
        } else {
            console.warn(`Panel not found: ${panelName}-panel`);
            // Show main menu as fallback
            this.mainMenu.classList.remove('hidden');
            this.mainMenu.style.display = 'grid';
        }
    }

    // Add event handlers for interactive elements
    addInteractionEventHandlers() {
        console.log("Adding interaction event handlers");
        
        try {
            // Handle submit prompt button
            const submitPromptBtn = document.getElementById('submit-prompt-btn');
            if (submitPromptBtn) {
                console.log("Adding event listener to submit-prompt-btn");
                submitPromptBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handlePromptSubmission(e);
                });
            } else {
                console.warn("Submit prompt button not found");
            }
            
            // Handle research buttons
            document.querySelectorAll('.research-btn').forEach(button => {
                console.log("Adding event listener to research button");
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const researchOption = e.target.closest('.research-option');
                    if (!researchOption) return;
                    
                    const cost = parseInt(researchOption.getAttribute('data-cost'), 10);
                    const researchType = researchOption.querySelector('h3').textContent.trim();
                    
                    this.conductResearch(researchType, cost);
                });
            });
            
            // Handle new project button
            const newProjectBtn = document.getElementById('new-project-btn');
            if (newProjectBtn) {
                console.log("Adding event listener to new-project-btn");
                newProjectBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Check if we have a project manager
                    if (this.projectManager && typeof this.projectManager.createProject === 'function') {
                        // Generate a new random project
                        const newProject = this.projectManager.createProject('b2c');
                        if (newProject) {
                            console.log("Created new project:", newProject);
                            this.projectManager.addProject(newProject);
                            this.showNotification(`New project started: ${newProject.name}`, 'success');
                            this.updateProjects();
                        } else {
                            console.warn("Failed to create new project");
                            this.showNotification("Could not create new project", 'error');
                        }
                    } else {
                        console.warn("Project manager not available");
                        this.showNotification("Project creation system not available", 'error');
                    }
                });
            } else {
                console.warn("New project button not found");
            }
            
            // Handle end day button
            const endDayBtn = document.querySelector('.menu-button[data-action="end-day"]');
            if (endDayBtn) {
                console.log("Adding event listener to end-day button");
                endDayBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleEndDay();
                });
            }
            
            console.log("Interaction event handlers added successfully");
        } catch (error) {
            console.error("Error adding interaction event handlers:", error);
        }
    }

    init() {
        console.log("Initializing UI");
        
        try {
            // Check for essential dependencies
            if (!this.gameState) {
                console.error("GameState is missing - UI initialization may be incomplete");
            }
            
            if (!this.aiModelManager) {
                console.error("AIModelManager is missing - AI model functionality will be limited");
            }
            
            if (!this.promptLibrary) {
                console.error("PromptLibrary is missing - prompt techniques will be unavailable");
            }
            
            // Update initial stats which don't depend on projectManager
            this.updateStats();
            
            // Only initialize panels that don't depend on projectManager
            // Defer project panel initialization until projectManager is available
            
            // Hide loading screen
            if (this.loadingScreen) {
                this.loadingScreen.classList.add('hidden');
            }
            
            // Show notification
            this.showNotification('Welcome to Vibe Coding Simulator!', 'info');
            
            console.log("UI basic initialization complete - waiting for managers");
        } catch (error) {
            console.error("Error during UI initialization:", error);
        }
    }

    // Initialize panels after all dependencies are available
    initPanels() {
        try {
            console.log("Initializing UI panels");
            
            // Initialize all panels now that dependencies are available
            if (this.projectManager) {
                this.initProjectsPanel();
            } else {
                console.warn("Cannot initialize projects panel: projectManager is not available");
            }
            
            // These methods have been updated with defensive checks to handle missing dependencies
            this.updateProjectSelection();
            this.updateAIModelSelection();
            this.updatePromptTechniques();
            
            console.log("UI panels initialization complete");
        } catch (error) {
            console.error("Error initializing UI panels:", error);
        }
    }

    // Handle end day action
    handleEndDay() {
        console.log("Handling end day");
        
        try {
            // Check if game state is available
            if (!this.gameState) {
                console.error("GameState is missing - cannot end day");
                return;
            }
            
            // Save current state before ending day
            console.log("Ending day in game state");
            const result = this.gameState.endDay();
            
            if (result) {
                // Result will have day events and status
                if (result.status === 'bankrupt') {
                    // Game over - show bankruptcy message
                    this.showNotification("You've gone bankrupt! Game over.", 'error');
                } else {
                    // Show day summary
                    this.showNotification(`Day ${this.gameState.day - 1} complete! Starting day ${this.gameState.day}`, 'success');
                    
                    // Update UI to reflect new day
                    this.updateStats();
                    
                    // Check for any new emails or events
                    if (typeof this.updateEmails === 'function') {
                        this.updateEmails();
                    }
                }
            }
            
            console.log("End day handling complete");
        } catch (error) {
            console.error("Error handling end day:", error);
        }
    }

    // Show a notification to the user
    showNotification(message, type = 'info', duration = 5000) {
        console.log(`Showing notification: ${message} (${type})`);
        
        try {
            // Make sure we have a notification container
            if (!this.notificationContainer) {
                this.notificationContainer = document.getElementById('notification-container');
                if (!this.notificationContainer) {
                    console.error("Notification container not found");
                    return;
                }
            }
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <div class="notification-icon">${this.getNotificationIcon(type)}</div>
                    <div class="notification-message">${message}</div>
                </div>
            `;
            
            // Add close button
            const closeBtn = document.createElement('div');
            closeBtn.className = 'notification-close';
            closeBtn.innerHTML = '×';
            closeBtn.addEventListener('click', () => {
                this.removeNotification(notification);
            });
            notification.appendChild(closeBtn);
            
            // Add to container
            this.notificationContainer.appendChild(notification);
            
            // Add entrance animation class
            setTimeout(() => {
                notification.classList.add('notification-show');
            }, 10);
            
            // Auto-remove after duration
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
            
            return notification;
        } catch (error) {
            console.error("Error showing notification:", error);
        }
    }

    // Remove a notification with animation
    removeNotification(notification) {
        if (!notification) return;
        
        notification.classList.add('notification-hide');
        notification.classList.remove('notification-show');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // Get icon for notification type
    getNotificationIcon(type) {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✗';
            case 'warning':
                return '⚠';
            case 'info':
            default:
                return 'ℹ';
        }
    }

    // Validate DOM elements are available
    validateDomElements() {
        console.log("Validating DOM elements");
        
        // List of critical DOM elements to check
        const criticalElements = [
            { name: 'computerScreen', selector: '#computer-screen' },
            { name: 'mainMenu', selector: '#main-menu' },
            { name: 'projectsPanel', selector: '#projects-panel' },
            { name: 'codingPanel', selector: '#coding-panel' },
            { name: 'researchPanel', selector: '#research-panel' },
            { name: 'skillsPanel', selector: '#skills-panel' },
            { name: 'emailPanel', selector: '#email-panel' },
            { name: 'projectsList', selector: '#projects-list' }
        ];
        
        criticalElements.forEach(item => {
            if (!this[item.name]) {
                console.warn(`${item.name} element not found, attempting to get by selector: ${item.selector}`);
                // Try to get the element
                this[item.name] = document.querySelector(item.selector);
                if (!this[item.name]) {
                    console.error(`Critical UI element not found: ${item.selector}`);
                }
            }
        });
        
        // Check for notification container
        if (!this.notificationContainer) {
            console.warn("Notification container not found, attempting to get by selector");
            this.notificationContainer = document.querySelector('#notification-container');
            if (!this.notificationContainer) {
                console.error("Notification container not found - creating one");
                // Create notification container if missing
                this.notificationContainer = document.createElement('div');
                this.notificationContainer.id = 'notification-container';
                document.body.appendChild(this.notificationContainer);
            }
        }
        
        // Check for required inputs and controls
        const controls = [
            { name: 'promptInput', selector: '#prompt-input' },
            { name: 'aiModelSelect', selector: '#ai-model-select' },
            { name: 'promptTechniqueSelect', selector: '#prompt-technique-select' },
            { name: 'submitPromptBtn', selector: '#submit-prompt-btn' }
        ];
        
        controls.forEach(control => {
            const element = document.querySelector(control.selector);
            if (!element) {
                console.warn(`UI control element not found: ${control.selector}`);
            }
        });
        
        // Check if menu buttons are properly set up
        const menuButtons = document.querySelectorAll('.menu-button');
        console.log(`Found ${menuButtons.length} menu buttons`);
        
        if (menuButtons.length === 0) {
            console.error("No menu buttons found - UI may not function correctly");
        } else {
            menuButtons.forEach((button, index) => {
                const action = button.getAttribute('data-action');
                if (!action) {
                    console.warn(`Menu button ${index} missing data-action attribute`);
                } else {
                    console.log(`Menu button found: ${action}`);
                }
            });
        }
    }

    // Initialize social media panel
    initSocialPanel() {
        // Attach event listener to scroll button
        if (this.scrollSocialBtn) {
            this.scrollSocialBtn.addEventListener('click', () => {
                this.handleSocialScroll();
            });
        }
        
        // Display initial posts if empty
        if (this.socialPostsList && this.socialPostsList.children.length === 0) {
            this.renderSocialPosts(this.socialMediaManager.generatePosts(3));
        }
    }
    
    // Handle social media scrolling
    handleSocialScroll() {
        const result = this.socialMediaManager.scrollFeed();
        
        if (!result.success) {
            this.showNotification(result.message, 'error');
            return;
        }
        
        // Update time blocks
        this.updateStats();
        
        // Render new posts
        this.renderSocialPosts(result.posts);
        
        // Show notification for discovered prompt if any
        if (result.discoveredPrompt) {
            this.showNotification(`Discovered new prompt: ${result.discoveredPrompt.name}!`, 'success');
        }
        
        // Show notification for discovered trends if any new ones
        const newTrends = result.discoveredTrends.slice(-1);
        if (newTrends.length > 0) {
            this.showNotification(`Discovered market trend: ${newTrends[0]}`, 'info');
        }
    }
    
    // Render social media posts
    renderSocialPosts(posts) {
        if (!this.socialPostsList) return;
        
        // Add new posts to the beginning
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'social-post';
            
            let tagsHTML = '';
            if (post.tags && post.tags.length > 0) {
                tagsHTML = '<div class="post-tags">' +
                    post.tags.map(tag => 
                        `<span class="post-tag ${tag.trending ? 'trending' : ''}">#${tag.text}</span>`
                    ).join('') +
                    '</div>';
            }
            
            postElement.innerHTML = `
                <div class="post-header">
                    <div class="post-author">@${post.author}</div>
                    <div class="post-time">${post.time}</div>
                </div>
                <div class="post-content">${post.content}</div>
                ${tagsHTML}
            `;
            
            this.socialPostsList.prepend(postElement);
        });
        
        // Limit posts to 10 for performance
        while (this.socialPostsList.children.length > 10) {
            this.socialPostsList.removeChild(this.socialPostsList.lastChild);
        }
    }
    
    // Initialize shop panel
    initShopPanel() {
        // Attach event listeners to shop tabs
        this.shopTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchShopTab(tabName);
            });
        });
        
        // Populate shop items
        this.updateShopItems();
        
        // Attach event listeners to cloud credit purchase buttons
        this.buyCloudBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.getAttribute('data-amount'));
                const price = parseInt(btn.getAttribute('data-price'));
                this.handleCloudCreditPurchase(amount, price);
            });
        });
    }
    
    // Switch between shop tabs
    switchShopTab(tabName) {
        // Update active tab
        this.shopTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Show corresponding section
        this.shopSections.forEach(section => {
            if (section.id === `shop-${tabName}`) {
                section.classList.add('active');
                section.style.display = 'block';
            } else {
                section.classList.remove('active');
                section.style.display = 'none';
            }
        });
    }
    
    // Update shop items
    updateShopItems() {
        // Update hardware shop
        this.updateHardwareShop();
        
        // Update AI models shop
        this.updateAIModelsShop();
        
        // Update prompts shop
        this.updatePromptsShop();
    }
    
    // Update hardware shop items
    updateHardwareShop() {
        if (!this.hardwareShopList) return;
        
        // Clear current list
        this.hardwareShopList.innerHTML = '';
        
        // Get available hardware
        const availableHardware = this.shopManager.getAvailableHardware();
        
        if (availableHardware.length === 0) {
            this.hardwareShopList.innerHTML = '<p class="empty-state">No hardware available for purchase.</p>';
            return;
        }
        
        // Create hardware items
        availableHardware.forEach(hardware => {
            const hardwareItem = document.createElement('div');
            hardwareItem.className = `shop-item tier-${hardware.tier}`;
            
            // Format spec items
            const specItems = Object.entries(hardware.specs).map(([key, value]) => 
                `<div class="shop-item-stat">
                    <span class="shop-item-stat-name">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <span class="shop-item-stat-value">${value}</span>
                </div>`
            ).join('');
            
            const canAfford = this.gameState.money >= hardware.price;
            
            hardwareItem.innerHTML = `
                <div class="shop-item-header">
                    <div class="shop-item-name">${hardware.name}</div>
                    <div class="shop-item-price">$${hardware.price.toLocaleString()}</div>
                </div>
                <div class="shop-item-description">${hardware.description}</div>
                <div class="shop-item-stats">
                    ${specItems}
                </div>
                <div class="shop-item-buttons">
                    <button class="shop-item-button ${!canAfford ? 'disabled' : ''}" 
                        data-hardware-key="${hardware.key}" 
                        ${!canAfford ? 'disabled' : ''}>
                        Purchase
                    </button>
                </div>
            `;
            
            // Add event listener for purchase button
            hardwareItem.querySelector('.shop-item-button').addEventListener('click', (e) => {
                if (!e.target.classList.contains('disabled')) {
                    const hardwareKey = e.target.getAttribute('data-hardware-key');
                    this.handleHardwarePurchase(hardwareKey);
                }
            });
            
            this.hardwareShopList.appendChild(hardwareItem);
        });
    }
    
    // Update AI models shop items
    updateAIModelsShop() {
        if (!this.aiModelsShopList) return;
        
        // Clear current list
        this.aiModelsShopList.innerHTML = '';
        
        // Get available AI models
        const availableModels = this.shopManager.getAvailableAIModels();
        
        if (availableModels.length === 0) {
            this.aiModelsShopList.innerHTML = '<p class="empty-state">No AI models available for purchase.</p>';
            return;
        }
        
        // Create model items
        availableModels.forEach(model => {
            const modelItem = document.createElement('div');
            modelItem.className = `shop-item tier-${model.tier}`;
            
            // Format attribute items
            const attributes = model.attributes;
            const attributesHTML = `
                <div class="shop-item-stat">
                    <span class="shop-item-stat-name">Creativity</span>
                    <span class="shop-item-stat-value">${attributes.creativity}/10</span>
                </div>
                <div class="shop-item-stat">
                    <span class="shop-item-stat-name">Direction</span>
                    <span class="shop-item-stat-value">${attributes.directionFollowing}/10</span>
                </div>
                <div class="shop-item-stat">
                    <span class="shop-item-stat-name">Reasoning</span>
                    <span class="shop-item-stat-value">${attributes.reasoning}/10</span>
                </div>
            `;
            
            const maxTier = this.hardwareManager.getMaxAITier();
            const canAfford = this.gameState.money >= model.unlockCost;
            const canUse = model.tier <= maxTier;
            const disabled = !canAfford || !canUse;
            
            modelItem.innerHTML = `
                <div class="shop-item-header">
                    <div class="shop-item-name">${model.name}</div>
                    <div class="shop-item-price">$${model.unlockCost.toLocaleString()}</div>
                </div>
                <div class="shop-item-description">${model.description}</div>
                <div class="shop-item-stats">
                    ${attributesHTML}
                </div>
                <div class="shop-item-tier-req">Requires Tier ${model.tier} Hardware</div>
                <div class="shop-item-buttons">
                    <button class="shop-item-button ${disabled ? 'disabled' : ''}" 
                        data-model-key="${model.key}" 
                        ${disabled ? 'disabled' : ''}>
                        ${!canUse ? `Need Tier ${model.tier} Hardware` : 'Purchase'}
                    </button>
                </div>
            `;
            
            // Add event listener for purchase button
            modelItem.querySelector('.shop-item-button').addEventListener('click', (e) => {
                if (!e.target.classList.contains('disabled')) {
                    const modelKey = e.target.getAttribute('data-model-key');
                    this.handleModelPurchase(modelKey);
                }
            });
            
            this.aiModelsShopList.appendChild(modelItem);
        });
    }
    
    // Update prompts shop items
    updatePromptsShop() {
        if (!this.promptsShopList) return;
        
        // Clear current list
        this.promptsShopList.innerHTML = '';
        
        // Get available premium prompts
        const availablePrompts = this.shopManager.getAvailablePremiumPrompts();
        
        if (availablePrompts.length === 0) {
            this.promptsShopList.innerHTML = '<p class="empty-state">No premium prompts available for purchase.</p>';
            return;
        }
        
        // Create prompt items
        availablePrompts.forEach(prompt => {
            const promptItem = document.createElement('div');
            promptItem.className = `shop-item tier-${prompt.tier}`;
            
            const canAfford = this.gameState.money >= prompt.price;
            
            promptItem.innerHTML = `
                <div class="shop-item-header">
                    <div class="shop-item-name">${prompt.name}</div>
                    <div class="shop-item-price">$${prompt.price.toLocaleString()}</div>
                </div>
                <div class="shop-item-description">${prompt.description}</div>
                <div class="shop-item-effect">${prompt.effect}</div>
                <div class="shop-item-buttons">
                    <button class="shop-item-button ${!canAfford ? 'disabled' : ''}" 
                        data-prompt-key="${prompt.key}" 
                        ${!canAfford ? 'disabled' : ''}>
                        Purchase
                    </button>
                </div>
            `;
            
            // Add event listener for purchase button
            promptItem.querySelector('.shop-item-button').addEventListener('click', (e) => {
                if (!e.target.classList.contains('disabled')) {
                    const promptKey = e.target.getAttribute('data-prompt-key');
                    this.handlePromptPurchase(promptKey);
                }
            });
            
            this.promptsShopList.appendChild(promptItem);
        });
    }
    
    // Handle hardware purchase
    handleHardwarePurchase(hardwareKey) {
        const result = this.shopManager.purchaseHardware(hardwareKey);
        
        if (result.success) {
            this.showNotification(result.message, 'success');
            this.updateStats();
            this.updateShopItems();
        } else {
            this.showNotification(result.message, 'error');
        }
    }
    
    // Handle AI model purchase
    handleModelPurchase(modelKey) {
        const result = this.shopManager.purchaseAIModel(modelKey);
        
        if (result.success) {
            this.showNotification(result.message, 'success');
            this.updateStats();
            this.updateShopItems();
        } else {
            this.showNotification(result.message, 'error');
        }
    }
    
    // Handle prompt purchase
    handlePromptPurchase(promptKey) {
        const result = this.shopManager.purchasePremiumPrompt(promptKey);
        
        if (result.success) {
            this.showNotification(result.message, 'success');
            this.updateStats();
            this.updateShopItems();
        } else {
            this.showNotification(result.message, 'error');
        }
    }
    
    // Handle cloud credit purchase
    handleCloudCreditPurchase(amount, price) {
        const result = this.shopManager.purchaseCloudCredits(amount, price);
        
        if (result.success) {
            this.showNotification(result.message, 'success');
            this.updateStats();
        } else {
            this.showNotification(result.message, 'error');
        }
    }

    // Update AI model selection dropdown with hardware tier enforcement
    updateAIModelSelection() {
        const aiModelSelect = document.getElementById('ai-model-select');
        if (!aiModelSelect) return;
        
        // Check if required dependencies are available
        if (!this.aiModelManager) {
            console.error("aiModelManager is not initialized in updateAIModelSelection");
            aiModelSelect.innerHTML = '<option disabled>AI Models not available</option>';
            return;
        }
        
        if (!this.hardwareManager) {
            console.error("hardwareManager is not initialized in updateAIModelSelection");
            // Try to proceed with just the aiModelManager if possible
        }
        
        try {
            // Clear current options
            aiModelSelect.innerHTML = '';
            
            // Get available AI models
            const availableModels = this.aiModelManager.getAvailableModels();
            if (!availableModels || availableModels.length === 0) {
                aiModelSelect.innerHTML = '<option disabled>No AI models available</option>';
                return;
            }
            
            // Get maximum AI tier based on hardware
            let maxAITier = 1; // Default to tier 1
            if (this.hardwareManager && typeof this.hardwareManager.getMaxAITier === 'function') {
                maxAITier = this.hardwareManager.getMaxAITier();
            }
            
            // Add options for each available model with tier enforcement
            availableModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model.key;
                
                // Check if hardware can run this model
                if (model.tier <= maxAITier) {
                    option.textContent = `${model.name} (Tier ${model.tier})`;
                } else {
                    option.textContent = `${model.name} (Requires Tier ${model.tier} hardware)`;
                    option.disabled = true;
                }
                
                aiModelSelect.appendChild(option);
            });
            
            // Select the first enabled option
            for (let i = 0; i < aiModelSelect.options.length; i++) {
                if (!aiModelSelect.options[i].disabled) {
                    aiModelSelect.selectedIndex = i;
                    break;
                }
            }
        } catch (error) {
            console.error("Error in updateAIModelSelection:", error);
            aiModelSelect.innerHTML = '<option disabled>Error loading AI models</option>';
        }
    }

    // Initialize projects panel with job board
    initProjectsPanel() {
        // Update active projects list
        this.updateActiveProjectsList();
        
        // Update job board list
        this.updateJobBoardList();
        
        // Update completed projects list
        this.updateCompletedProjectsList();
        
        // Add event listeners to accept job buttons
        document.querySelectorAll('.accept-job-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const projectType = e.target.dataset.projectType;
                const projectName = e.target.dataset.projectName;
                const difficulty = parseFloat(e.target.dataset.difficulty);
                const reward = parseInt(e.target.dataset.reward);
                
                this.acceptProject(projectType, projectName, difficulty, reward);
            });
        });
    }
    
    // Update active projects list
    updateActiveProjectsList() {
        const activeProjectsList = document.getElementById('active-projects-list');
        if (!activeProjectsList) return;
        
        // Clear existing content
        activeProjectsList.innerHTML = '';
        
        // Get active projects
        const activeProjects = this.gameState.activeProjects;
        
        if (activeProjects.length === 0) {
            activeProjectsList.innerHTML = '<p class="empty-state">No active projects. Check the job board to find new opportunities.</p>';
            return;
        }
        
        // Create project cards for each active project
        activeProjects.forEach((project, index) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            
            projectCard.innerHTML = `
                <div class="project-card-header">
                    <div class="project-card-name">${project.name}</div>
                    <div class="project-card-type">${project.typeName}</div>
                </div>
                <div class="project-card-description">${project.description}</div>
                <div class="project-card-progress">
                    <div class="project-progress-bar">
                        <div class="project-progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                    <div class="project-progress-text">${project.progress}%</div>
                </div>
                <div class="project-card-details">
                    <div class="project-card-reward">Reward: $${project.reward}</div>
                    <div class="project-card-difficulty">Difficulty: ${this.getDifficultyText(project.difficulty)}</div>
                </div>
                <div class="project-card-actions">
                    <button class="work-on-project-btn" data-project-index="${index}">Work on Project</button>
                </div>
            `;
            
            // Add event listener to work on project button
            projectCard.querySelector('.work-on-project-btn').addEventListener('click', () => {
                this.switchPanel('coding');
                this.selectProject(index);
            });
            
            activeProjectsList.appendChild(projectCard);
        });
    }
    
    // Update job board list
    updateJobBoardList() {
        const jobBoardList = document.getElementById('job-board-list');
        if (!jobBoardList) return;
        
        // Clear existing content
        jobBoardList.innerHTML = '';
        
        try {
            // Get available projects from emails or generate random ones
            const availableProjects = this.getAvailableProjects();
            
            if (!availableProjects || availableProjects.length === 0) {
                jobBoardList.innerHTML = '<p class="empty-state">No available projects. Check your email or come back tomorrow.</p>';
                return;
            }
            
            // Create job cards for each available project
            availableProjects.forEach(project => {
                if (!project) return; // Skip undefined projects
                
                const jobCard = document.createElement('div');
                jobCard.className = 'job-card';
                
                jobCard.innerHTML = `
                    <div class="job-card-header">
                        <div class="job-card-title">${project.name || 'Unnamed Project'}</div>
                        <div class="job-card-type">${project.typeName || 'Unknown Type'}</div>
                    </div>
                    <div class="job-card-description">${project.description || 'No description available.'}</div>
                    <div class="job-card-details">
                        <div class="job-card-difficulty">Difficulty: ${this.getDifficultyText(project.difficulty || 1)}</div>
                        <div class="job-card-reward">Reward: $${(project.reward || 0).toLocaleString()}</div>
                    </div>
                    <div class="job-card-actions">
                        <button class="accept-job-btn" 
                            data-project-type="${project.type || 'unknown'}" 
                            data-project-name="${project.name || 'Unnamed Project'}" 
                            data-difficulty="${project.difficulty || 1}" 
                            data-reward="${project.reward || 0}">
                            Accept Project
                        </button>
                    </div>
                `;
                
                jobBoardList.appendChild(jobCard);
            });
            
            // Add event listeners to accept job buttons
            jobBoardList.querySelectorAll('.accept-job-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const projectType = e.target.dataset.projectType;
                    const projectName = e.target.dataset.projectName;
                    const difficulty = parseFloat(e.target.dataset.difficulty);
                    const reward = parseInt(e.target.dataset.reward);
                    
                    this.acceptProject(projectType, projectName, difficulty, reward);
                });
            });
        } catch (error) {
            console.error("Error updating job board:", error);
            jobBoardList.innerHTML = '<p class="empty-state">Error loading projects. Please try again later.</p>';
        }
    }
    
    // Update completed projects list
    updateCompletedProjectsList() {
        const completedProjectsList = document.getElementById('completed-projects-list');
        if (!completedProjectsList) return;
        
        // Clear existing content
        completedProjectsList.innerHTML = '';
        
        // Get completed projects
        const completedProjects = this.gameState.completedProjects;
        
        if (completedProjects.length === 0) {
            completedProjectsList.innerHTML = '<p class="empty-state">No completed projects yet.</p>';
            return;
        }
        
        // Create project cards for each completed project (in reverse order, most recent first)
        completedProjects.slice().reverse().forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card completed-project-card';
            
            projectCard.innerHTML = `
                <div class="project-card-header">
                    <div class="project-card-name">${project.name}</div>
                    <div class="project-card-type">${project.typeName}</div>
                </div>
                <div class="project-card-description">${project.description}</div>
                <div class="completed-project-date">Completed on Day ${project.completedOn}</div>
                <div class="project-card-details">
                    <div class="completed-project-reward">Reward: $${project.finalReward}</div>
                    <div class="project-card-difficulty">Difficulty: ${this.getDifficultyText(project.difficulty)}</div>
                </div>
            `;
            
            completedProjectsList.appendChild(projectCard);
        });
    }
    
    // Get available projects from emails or generate random ones
    getAvailableProjects() {
        const availableProjects = [];
        
        // Check emails for project offers
        const projectEmails = this.gameState.emails.filter(email => 
            email.hasProjectOffer && !email.projectAccepted
        );
        
        // Convert email offers to projects
        projectEmails.forEach(email => {
            // Extract project details from email content
            const projectType = email.projectTypeOffer;
            const projectDetails = this.extractProjectDetailsFromEmail(email);
            
            if (projectDetails) {
                availableProjects.push({
                    name: projectDetails.name,
                    type: projectType,
                    typeName: this.gameState.getProjectTypeName(projectType),
                    description: this.gameState.getProjectTypeDescription(projectType),
                    difficulty: projectDetails.difficulty,
                    reward: projectDetails.reward,
                    emailId: email.id
                });
            }
        });
        
        // If no email offers, generate 1-3 random projects if projectManager is available
        if (availableProjects.length === 0 && this.projectManager) {
            try {
                const numProjects = Math.floor(Math.random() * 3) + 1; // 1-3 projects
                
                for (let i = 0; i < numProjects; i++) {
                    const project = this.projectManager.generateRandomProject();
                    if (project) {
                        availableProjects.push(project);
                    }
                }
            } catch (error) {
                console.warn("Could not generate random projects:", error);
                // Return empty list rather than failing
            }
        }
        
        return availableProjects;
    }
    
    // Extract project details from email content
    extractProjectDetailsFromEmail(email) {
        // Try to extract project details from the accept button data attributes
        const emailContent = document.createElement('div');
        emailContent.innerHTML = email.content;
        
        const acceptButton = emailContent.querySelector('.accept-project-btn');
        if (acceptButton) {
            return {
                name: acceptButton.dataset.projectName,
                difficulty: parseFloat(acceptButton.dataset.difficulty),
                reward: parseInt(acceptButton.dataset.reward)
            };
        }
        
        // If no button found, return null
        return null;
    }
    
    // Accept a project from the job board
    acceptProject(projectType, projectName, difficulty, reward) {
        // Check if player has too many active projects
        if (this.gameState.activeProjects.length >= 3) {
            this.showNotification('You already have 3 active projects. Complete some before accepting more.', 'error');
            return;
        }
        
        // Create the project
        const project = {
            name: projectName,
            type: projectType,
            typeName: this.gameState.getProjectTypeName(projectType),
            description: this.gameState.getProjectTypeDescription(projectType),
            difficulty: difficulty,
            reward: reward,
            requiredProgress: 100,
            progress: 0,
            completed: false,
            workedOnToday: false,
            daysTaken: 0,
            sprints: []
        };
        
        // Add to active projects
        this.gameState.activeProjects.push(project);
        
        // Mark email as accepted if it was from an email
        const projectEmail = this.gameState.emails.find(email => 
            email.hasProjectOffer && 
            email.projectTypeOffer === projectType &&
            !email.projectAccepted
        );
        
        if (projectEmail) {
            projectEmail.projectAccepted = true;
        }
        
        // Show notification
        this.showNotification(`Accepted project: ${projectName}`, 'success');
        
        // Update projects lists
        this.updateActiveProjectsList();
        this.updateJobBoardList();
        
        // Update project selection in coding panel
        this.updateProjectSelection();
    }
    
    // Update project selection in coding panel
    updateProjectSelection() {
        const projectSelect = document.getElementById('project-select');
        if (!projectSelect) return;
        
        // Clear existing options
        projectSelect.innerHTML = '';
        
        // Check if gameState is initialized
        if (!this.gameState) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Game not initialized';
            option.disabled = true;
            projectSelect.appendChild(option);
            return;
        }
        
        // Get active projects
        const activeProjects = this.gameState.activeProjects || [];
        
        if (activeProjects.length === 0) {
            // Add default option
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No active projects';
            option.disabled = true;
            projectSelect.appendChild(option);
            
            // Show notification only if we have the method available
            if (typeof this.showNotification === 'function') {
                this.showNotification('You have no active projects. Check the job board to find new opportunities.', 'info');
            }
            return;
        }
        
        // Add options for each active project
        activeProjects.forEach((project, index) => {
            if (!project) return; // Skip undefined projects
            
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${project.name || 'Unnamed Project'} (${project.progress || 0}%)`;
            projectSelect.appendChild(option);
        });
        
        // Select the first project
        if (projectSelect.options.length > 0) {
            projectSelect.selectedIndex = 0;
        }
        
        // Update project info if the method exists
        if (typeof this.updateCurrentProjectInfo === 'function') {
            this.updateCurrentProjectInfo();
        }
    }
    
    // Select a project for coding
    selectProject(index) {
        const projectSelect = document.getElementById('project-select');
        if (!projectSelect) return;
        
        // Set selected index
        projectSelect.value = index;
        
        // Update project info
        this.updateCurrentProjectInfo();
    }
    
    // Update current project info in coding panel
    updateCurrentProjectInfo() {
        const currentProjectInfo = document.getElementById('current-project-info');
        if (!currentProjectInfo) return;
        
        const projectSelect = document.getElementById('project-select');
        if (!projectSelect) return;
        
        const projectIndex = projectSelect.value;
        if (projectIndex === '' || isNaN(parseInt(projectIndex))) {
            currentProjectInfo.innerHTML = '<p class="empty-state">No active project selected.</p>';
            return;
        }
        
        const project = this.gameState.activeProjects[parseInt(projectIndex)];
        if (!project) {
            currentProjectInfo.innerHTML = '<p class="empty-state">Selected project not found.</p>';
            return;
        }
        
        currentProjectInfo.innerHTML = `
            <div class="current-project-card">
                <div class="current-project-header">
                    <h3>${project.name}</h3>
                    <div class="project-type-badge">${project.typeName}</div>
                </div>
                <div class="current-project-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${project.progress}%">
                            <span>${project.progress}%</span>
                        </div>
                    </div>
                    <div class="project-progress-text">${project.progress}%</div>
                </div>
                <div class="current-project-description">
                    <p>${project.description}</p>
                </div>
                <div class="current-project-details">
                    <div class="detail-item">
                        <span class="detail-label">Difficulty:</span>
                        <span class="detail-value">${this.getDifficultyText(project.difficulty)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Reward:</span>
                        <span class="detail-value">$${project.reward}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Days Worked:</span>
                        <span class="detail-value">${project.daysTaken}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Get difficulty text
    getDifficultyText(difficulty) {
        if (difficulty <= 0.5) return 'Easy';
        if (difficulty <= 1.0) return 'Medium';
        if (difficulty <= 1.5) return 'Hard';
        return 'Very Hard';
    }

    // Initialize email panel
    initEmailPanel() {
        // Update email list
        this.updateEmailList();
        
        // Add event listeners to email items
        const emailList = document.getElementById('email-list');
        if (emailList) {
            emailList.addEventListener('click', (e) => {
                const emailItem = e.target.closest('.email-item');
                if (emailItem) {
                    const emailId = parseInt(emailItem.dataset.emailId);
                    this.openEmail(emailId);
                }
            });
        }
        
        // Add event listener to close email button
        const emailCloseBtn = document.getElementById('email-close-btn');
        if (emailCloseBtn) {
            emailCloseBtn.addEventListener('click', () => {
                this.closeEmail();
            });
        }
    }
    
    // Update email list
    updateEmailList() {
        const emailList = document.getElementById('email-list');
        if (!emailList) return;
        
        // Clear existing content
        emailList.innerHTML = '';
        
        // Get emails and sort by date (newest first)
        const emails = this.gameState.emails.slice().sort((a, b) => b.date - a.date);
        
        if (emails.length === 0) {
            emailList.innerHTML = '<p class="empty-state">No emails yet.</p>';
            return;
        }
        
        // Create email items for each email
        emails.forEach(email => {
            const emailItem = document.createElement('div');
            emailItem.className = `email-item ${email.read ? '' : 'unread'}`;
            emailItem.dataset.emailId = email.id;
            
            emailItem.innerHTML = `
                <div class="email-item-header">
                    <div class="email-subject">${email.subject}</div>
                    <div class="email-date">Day ${email.date}</div>
                </div>
                <div class="email-sender">${email.sender}</div>
            `;
            
            emailList.appendChild(emailItem);
        });
    }
    
    // Open email
    openEmail(emailId) {
        const email = this.gameState.emails.find(e => e.id === emailId);
        if (!email) return;
        
        // Mark email as read
        email.read = true;
        
        // Show email content
        const emailList = document.getElementById('email-list');
        const emailContent = document.getElementById('email-content');
        const emailSubject = document.getElementById('email-subject');
        const emailSender = document.getElementById('email-sender');
        const emailDate = document.getElementById('email-date');
        const emailBody = document.getElementById('email-body');
        
        if (emailList && emailContent && emailSubject && emailSender && emailDate && emailBody) {
            // Hide email list, show email content
            emailList.classList.add('hidden');
            emailContent.classList.remove('hidden');
            
            // Set email content
            emailSubject.textContent = email.subject;
            emailSender.textContent = `From: ${email.sender}`;
            emailDate.textContent = `Day ${email.date}`;
            emailBody.innerHTML = email.content;
            
            // Add event listeners to any accept project buttons in the email
            const acceptProjectBtns = emailBody.querySelectorAll('.accept-project-btn');
            acceptProjectBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const projectType = btn.dataset.projectType;
                    const projectName = btn.dataset.projectName;
                    const difficulty = parseFloat(btn.dataset.difficulty);
                    const reward = parseInt(btn.dataset.reward);
                    
                    this.acceptProject(projectType, projectName, difficulty, reward);
                    
                    // Mark this email as having its project accepted
                    email.projectAccepted = true;
                    
                    // Close the email
                    this.closeEmail();
                });
            });
        }
    }
    
    // Close email
    closeEmail() {
        const emailList = document.getElementById('email-list');
        const emailContent = document.getElementById('email-content');
        
        if (emailList && emailContent) {
            // Show email list, hide email content
            emailList.classList.remove('hidden');
            emailContent.classList.add('hidden');
        }
    }
    
    // Handle email action - generate random project emails
    handleEmailAction() {
        // Check if user has enough time blocks
        if (!this.gameState.useTimeBlock(1)) {
            this.showNotification('Not enough time blocks remaining today', 'error');
            return;
        }
        
        // Have a chance to generate a new email
        const email = this.gameState.generateRandomEmail();
        
        // Show notification
        this.showNotification('You checked your email', 'info');
        
        // If email contains a project offer, show special notification
        if (email.hasProjectOffer) {
            this.showNotification('New project opportunity available!', 'success');
        }
        
        // Update email list
        this.updateEmailList();
        
        // Update stats
        this.updateStats();
    }

    // Update prompt techniques dropdown
    updatePromptTechniques() {
        const promptTechniqueSelect = document.getElementById('prompt-technique-select');
        if (!promptTechniqueSelect) return;
        
        // Check for missing dependencies
        if (!this.promptLibrary) {
            console.error("promptLibrary is not initialized in updatePromptTechniques");
            promptTechniqueSelect.innerHTML = '<option disabled>Prompt techniques not available</option>';
            return;
        }
        
        try {
            // Clear current options
            promptTechniqueSelect.innerHTML = '';
            
            // Get unlocked prompt techniques
            const unlockedPrompts = this.promptLibrary.getUnlockedPrompts();
            
            if (!unlockedPrompts || unlockedPrompts.length === 0) {
                // Default to basic instruction if no prompts are unlocked
                promptTechniqueSelect.innerHTML = '<option value="basic-instruction">Basic Instruction (Default)</option>';
                return;
            }
            
            // Add options for each unlocked prompt
            unlockedPrompts.forEach(prompt => {
                const option = document.createElement('option');
                option.value = prompt.key;
                option.textContent = `${prompt.name} (${prompt.effect})`;
                promptTechniqueSelect.appendChild(option);
            });
            
            // Select the first option
            if (promptTechniqueSelect.options.length > 0) {
                promptTechniqueSelect.selectedIndex = 0;
            }
        } catch (error) {
            console.error("Error in updatePromptTechniques:", error);
            promptTechniqueSelect.innerHTML = '<option disabled>Error loading prompt techniques</option>';
        }
    }
} 