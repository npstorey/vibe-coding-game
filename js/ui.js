/**
 * Manages UI elements and interactions
 */
"use strict";

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
        this.essentialActivities = document.querySelector('.essential-activities');
        this.gameOverModal = document.getElementById('game-over-modal');
        
        // Stats elements
        this.dayCount = document.getElementById('day-count');
        this.timeBlocks = document.getElementById('time-blocks');
        this.money = document.getElementById('money');
        this.codingSkill = document.getElementById('coding-skill');
        this.promptSkill = document.getElementById('prompt-skill');
        this.gpuUnits = document.getElementById('gpu-units');
        this.gpuStatus = document.getElementById('gpu-status');
        this.healthDisplay = document.getElementById('health');
        
        // Add a flag to prevent multiple endDay calls in rapid succession
        this.endDayInProgress = false;
        
        // Initial UI update
        this.updateStats();
        
        // Console feedback to aid debugging
        console.log('UI initialized with gameState:', gameState ? 'available' : 'missing');
        console.log('AIModelManager:', aiModelManager ? 'available' : 'missing');
        console.log('PromptLibrary:', promptLibrary ? 'available' : 'missing');
    }
    
    // Initialize UI - Called by Game.initGame()
    init() {
        console.log("Initializing UI...");
        
        try {
            // Hide loading screen if it's visible
            this.hideLoadingScreen();
            
            // Show UI overlay
            if (this.uiOverlay) {
                this.uiOverlay.classList.remove('hidden');
            }
            
            // Update initial stats display
            this.updateStats();
            
            console.log("UI initialization complete");
        } catch (error) {
            console.error("Error initializing UI:", error);
        }
    }
    
    // Hide the loading screen
    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
            console.log("Loading screen hidden");
        }
    }
    
    // Initialize event listeners 
    initEvents(projectManager, socialMediaManager, hardwareManager, shopManager, resourceManager) {
        console.log("Initializing UI events with managers:", {
            projectManager: !!projectManager,
            socialMediaManager: !!socialMediaManager,
            hardwareManager: !!hardwareManager,
            shopManager: !!shopManager,
            resourceManager: !!resourceManager
        });
        
        // Store manager references
        this.projectManager = projectManager;
        this.socialMediaManager = socialMediaManager;
        this.hardwareManager = hardwareManager;
        this.shopManager = shopManager;
        this.resourceManager = resourceManager;
        
        // Initialize panels
        this.initPanels();
        
        var self = this;
        
        // Setup main menu buttons
        this.setupMainMenu();
        
        // Setup essential activities
        this.initEssentialActivities();
        
        // Setup restart button
        const restartButton = document.querySelector('.restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', function() {
                // Reset game state and restart
                self.gameState.initializeDefaults();
                self.updateStats();
                self.gameOverModal.classList.add('hidden');
            });
        }
        
        // Close computer button
        var closeButton = document.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                self.computerScreen.classList.add('hidden');
                
                // Check if all time blocks are used when closing computer
                if (self.gameState.getAvailableTimeBlocks() <= 0) {
                    // If all time blocks used, automatically end the day
                    self.showNotification("All time blocks used! Day is ending...", "info");
                    setTimeout(() => {
                        self.handleEndDay();
                    }, 1500); // Short delay to show the notification
                }
            });
        }
        
        // Menu buttons
        var menuButtons = document.querySelectorAll('.menu-button');
        for (var i = 0; i < menuButtons.length; i++) {
            menuButtons[i].addEventListener('click', function(e) {
                e.preventDefault();
                
                var action = this.getAttribute('data-action');
                console.log('Menu button clicked:', action);
                
                if (action === 'end-day') {
                    self.handleEndDay();
                } else {
                    self.switchPanel(action);
                }
            });
        }
        
        // Back buttons
        var backButtons = document.querySelectorAll('.back-btn');
        for (var j = 0; j < backButtons.length; j++) {
            backButtons[j].addEventListener('click', function() {
                self.switchPanel('main-menu');
            });
        }
        
        // Submit prompt button
        var submitPromptBtn = document.getElementById('submit-prompt-btn');
        if (submitPromptBtn) {
            submitPromptBtn.addEventListener('click', function() {
                self.handlePromptSubmission();
            });
        }
        
        // Email close button
        var emailCloseBtn = document.getElementById('email-close-btn');
        if (emailCloseBtn) {
            emailCloseBtn.addEventListener('click', function() {
                document.getElementById('email-content').classList.add('hidden');
                document.getElementById('email-list').classList.remove('hidden');
            });
        }
        
        // Debug buttons
        var debugShowComputer = document.getElementById('debug-show-computer');
        if (debugShowComputer) {
            debugShowComputer.addEventListener('click', function() {
                self.computerScreen.classList.remove('hidden');
                self.uiOverlay.classList.remove('hidden');
            });
        }
        
        console.log('UI event listeners initialized');
    }
    
    // Update stats display
    updateStats() {
        // Only proceed if we have necessary UI elements
        if (!this.gameState) {
            console.error("Cannot update stats: gameState is not available");
            return;
        }
        
        try {
            if (this.dayCount) {
                const day = this.gameState.day;
                this.dayCount.textContent = day;
                console.log(`updateStats: Setting day counter to ${day}`);
            }
            
            if (this.timeBlocks) {
                const availableTimeBlocks = this.gameState.getAvailableTimeBlocks();
                this.timeBlocks.textContent = availableTimeBlocks;
                console.log(`updateStats: Setting time blocks display to ${availableTimeBlocks}`);
            }
            
            if (this.money) {
                this.money.textContent = this.gameState.money;
            }
            
            if (this.codingSkill) {
                this.codingSkill.textContent = this.gameState.skills.coding;
            }
            
            if (this.promptSkill) {
                this.promptSkill.textContent = this.gameState.skills.prompt;
            }
            
            // Update GPU info if hardwareManager is available
            if (this.gpuUnits && this.hardwareManager) {
                const gpuInfo = this.hardwareManager.getGPUStatus();
                this.gpuUnits.textContent = gpuInfo.units;
                
                if (this.gpuStatus) {
                    this.gpuStatus.textContent = gpuInfo.statusText;
                    this.gpuStatus.className = '';
                    if (gpuInfo.inUse) {
                        this.gpuStatus.classList.add('in-use');
                    }
                }
            }
            
            if (this.healthDisplay) {
                this.healthDisplay.textContent = this.gameState.health;
                
                // Update health color based on value
                this.healthDisplay.className = '';
                if (this.gameState.health <= 30) {
                    this.healthDisplay.classList.add('danger');
                } else if (this.gameState.health <= 60) {
                    this.healthDisplay.classList.add('warning');
                }
                
                // Check for game over condition
                if (this.gameState.health <= 0 && this.gameOverModal) {
                    this.gameOverModal.classList.remove('hidden');
                }
            }
            
            // Update completed activities
            this.updateCompletedActivities();
            
            // Force a browser reflow to ensure updates are displayed
            document.body.offsetHeight;
            
        } catch (error) {
            console.error("Error updating stats:", error);
        }
    }
    
    // Switch to a specific panel
    switchPanel(panelName) {
        console.log("Switching to panel: " + panelName);
        
        try {
            // Check if we're leaving the coding panel and release GPU if needed
            var codingPanel = document.getElementById('coding-panel');
            if (codingPanel && !codingPanel.classList.contains('hidden') && 
                (panelName !== 'coding' && panelName !== 'coding-panel')) {
                // We're switching away from the coding panel
                this.releaseGPU();
            }
            
            // Hide all panels
            var panels = document.querySelectorAll('.panel, #main-menu');
            for (var i = 0; i < panels.length; i++) {
                panels[i].classList.add('hidden');
                panels[i].style.display = 'none';
            }
            
            // Show requested panel
            var targetPanel;
            
            if (panelName === 'main-menu') {
                targetPanel = document.getElementById('main-menu');
            } else if (panelName.endsWith('-panel')) {
                targetPanel = document.getElementById(panelName);
            } else {
                targetPanel = document.getElementById(panelName + '-panel');
            }
            
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
                targetPanel.style.display = 'block';
                
                // Special handling for specific panels
                if (panelName === 'projects' || panelName === 'projects-panel') {
                    console.log("Projects panel detected, updating project lists");
                    this.updateActiveProjectsList();
                    this.updateCompletedProjectsList();
                } else if (panelName === 'social' || panelName === 'social-panel') {
                    console.log("Social panel detected, ensuring it's initialized");
                    const socialPanel = document.getElementById('social-panel');
                    const socialPostsList = document.getElementById('social-posts-list');
                    if (!socialPostsList) {
                        console.error("Critical error: social-posts-list element not found in social panel");
                        console.log("Social panel structure:", socialPanel?.innerHTML);
                    }
                    
                    console.log("Social media manager exists:", !!this.socialMediaManager);
                    
                    // Initialize the panel
                    this.initSocialPanel();
                } else if (panelName === 'coding' || panelName === 'coding-panel') {
                    console.log("Coding panel detected, updating project selection");
                    this.updateProjectSelection();
                    this.updateAIModelSelection();
                }
            } else {
                console.error("Panel not found: " + panelName);
                document.getElementById('main-menu').classList.remove('hidden');
                document.getElementById('main-menu').style.display = 'block';
            }
        } catch (error) {
            console.error("Error switching panel:", error);
        }
    }
    
    // Handle end day action
    handleEndDay() {
        console.log("Handling end of day");
        
        // Prevent multiple calls to handleEndDay
        if (this.endDayInProgress) {
            console.log("End day already in progress, ignoring duplicate call");
            return;
        }
        
        // Set flag to prevent duplicate calls
        this.endDayInProgress = true;
        
        // Add logging to track day increments
        const currentDay = this.gameState.day;
        console.log(`Current day before endDay: ${currentDay}`);
        
        // End the day - this will advance to the next day
        this.gameState.endDay();
        
        // Get the new day value
        const newDay = this.gameState.day;
        console.log(`New day after endDay: ${newDay}`);
        
        // Force immediate update of day counter in UI
        if (this.dayCount) {
            console.log(`Updating day counter in UI from ${this.dayCount.textContent} to ${newDay}`);
            this.dayCount.textContent = newDay;
        }
        
        // Update time blocks counter immediately
        if (this.timeBlocks) {
            const availableTimeBlocks = this.gameState.getAvailableTimeBlocks();
            console.log(`Updating time blocks in UI to ${availableTimeBlocks}`);
            this.timeBlocks.textContent = availableTimeBlocks;
        }
        
        // Show notification about day change
        this.showNotification(`Day ${currentDay} ended. Day ${newDay} begins!`, "info");
        
        // Update all UI elements
        this.updateStats();
        this.updateCompletedActivities();
        
        // Force another update after a brief delay to ensure UI is refreshed
        setTimeout(() => {
            if (this.dayCount) {
                console.log(`Delayed update: Ensuring day counter shows ${newDay}`);
                this.dayCount.textContent = newDay;
            }
            
            if (this.timeBlocks) {
                const availableTimeBlocks = this.gameState.getAvailableTimeBlocks();
                console.log(`Delayed update: Ensuring time blocks counter shows ${availableTimeBlocks}`);
                this.timeBlocks.textContent = availableTimeBlocks;
            }
            
            // Update all stats again to be safe
            this.updateStats();
        }, 50);
        
        // Reset flag after a short delay
        setTimeout(() => {
            this.endDayInProgress = false;
            console.log("UI end day complete, flag reset");
        }, 1000);
    }
    
    // Handle prompt submission
    handlePromptSubmission() {
        console.log("Handling prompt submission");
        
        var projectSelect = document.getElementById('project-select');
        var aiModelSelect = document.getElementById('ai-model-select');
        var promptTechniqueSelect = document.getElementById('prompt-technique-select');
        var promptInput = document.getElementById('prompt-input');
        var allocateGpuToggle = document.getElementById('allocate-gpu-toggle');
        
        if (!projectSelect || !aiModelSelect || !promptInput) {
            this.showNotification("Missing UI elements for prompt submission", "error");
            return;
        }
        
        if (!promptInput.value.trim()) {
            this.showNotification("Please enter a prompt first", "warning");
            return;
        }
        
        // Check for GPU allocation request
        var gpuAllocated = false;
        if (allocateGpuToggle && allocateGpuToggle.checked && this.hardwareManager) {
            // Attempt to allocate GPU
            if (this.hardwareManager.isGPUAvailable()) {
                gpuAllocated = this.hardwareManager.allocateGPU();
                console.log("GPU allocation requested, result:", gpuAllocated);
                
                // Update GPU status in UI
                this.updateStats();
            } else {
                this.showNotification("GPU is not available for allocation", "warning");
            }
        }
        
        // Note: We don't deduct time blocks here since they're already deducted when entering the coding panel
        console.log("Processing prompt without additional time block deduction. Current time blocks:", this.gameState.getAvailableTimeBlocks());
        
        // Get project and model selections
        var projectIndex = parseInt(projectSelect.value);
        var aiModelKey = aiModelSelect.value;
        var promptTechniqueKey = promptTechniqueSelect ? promptTechniqueSelect.value : 'basic-instruction';
        
        // Check if we have a valid project manager and project selection
        if (!this.projectManager || isNaN(projectIndex) || projectIndex < 0) {
            // Fall back to simplified behavior
            this.showNotification("Processing your prompt...", "info");
            this.simulatePromptProcessing();
            return;
        }
        
        // Use the project manager to update project progress
        console.log("Using project manager to update project progress", {
            projectIndex,
            aiModelKey,
            promptTechniqueKey
        });
        
        this.showNotification("Processing your prompt...", "info");
        
        var self = this;
        setTimeout(function() {
            // Try to use projectManager for actual logic
            try {
                var result = self.projectManager.updateProjectProgress(
                    projectIndex, 
                    aiModelKey, 
                    promptTechniqueKey,
                    self.hardwareManager
                );
                
                console.log("Project progress update result:", result);
                
                if (result.success) {
                    if (result.completed) {
                        self.showNotification(`Project completed! You earned $${result.reward}`, "success");
                    } else if (result.isSprintSuccess) {
                        self.showNotification(`Success! Made ${result.progressGained}% progress on the project.${result.gpuUsed ? ' (GPU boost applied)' : ''}`, "success");
                    } else {
                        self.showNotification(result.message || "Partial success or failure in the coding sprint.", "warning");
                    }
                    
                    // Add to coding results
                    self.addCodingResult(result, promptInput.value);
                    
                    // Update UI
                    self.updateStats();
                    self.updateCurrentProjectInfo();
                    self.updateCompletedProjectsList();
                    self.updateActiveProjectsList();
                } else {
                    self.showNotification(result.message || "Error updating project progress", "error");
                }
            } catch (error) {
                console.error("Error in project progress update:", error);
                self.showNotification("An error occurred during the coding sprint.", "error");
                self.simulatePromptProcessing(); // Fall back to simplified behavior
            }
            
            // Clear the prompt input field
            promptInput.value = '';
        }, 1500);
    }
    
    // Simplified fallback for prompt processing
    simulatePromptProcessing() {
        var codingResults = document.getElementById('coding-results');
        if (codingResults) {
            var result = document.createElement('div');
            result.className = 'coding-result success';
            result.innerHTML = '<div class="result-header"><div class="result-status success">SUCCESS</div><div class="result-timestamp">' + 
                new Date().toLocaleTimeString() + '</div></div>' +
                '<div class="result-message">Your code was generated successfully.</div>' +
                '<div class="code-container"><pre><code>// Generated code example\nfunction example() {\n  console.log("Success!");\n}</code></pre></div>';
            
            if (codingResults.firstChild) {
                codingResults.insertBefore(result, codingResults.firstChild);
            } else {
                codingResults.appendChild(result);
            }
        }
    }
    
    // Add coding result to the coding panel
    addCodingResult(result, promptText) {
        var codingResults = document.getElementById('coding-results');
        if (!codingResults) return;
        
        var resultCard = document.createElement('div');
        resultCard.className = 'coding-result ' + (result.isSprintSuccess ? 'success' : 'partial-success');
        
        var statusText = result.isSprintSuccess ? 'SUCCESS' : (result.progressGained > 0 ? 'PARTIAL SUCCESS' : 'FAILURE');
        var statusClass = result.isSprintSuccess ? 'success' : (result.progressGained > 0 ? 'partial-success' : 'failure');
        
        var gpuInfo = result.gpuUsed ? `<div class="detail-item">
            <div class="detail-label">GPU Used:</div>
            <div class="detail-value">Yes (+${result.gpuBonus.toFixed(0)}% success)</div>
        </div>` : '';
        
        resultCard.innerHTML = `
            <div class="result-header">
                <div class="result-status ${statusClass}">${statusText}</div>
                <div class="result-timestamp">${new Date().toLocaleTimeString()}</div>
            </div>
            <div class="result-message">
                ${result.isSprintSuccess ? 
                    `Great work! Your code sprint was successful.` : 
                    (result.message || 'Your code sprint had mixed results.')}
            </div>
            <div class="result-details">
                <div class="detail-item">
                    <div class="detail-label">Progress:</div>
                    <div class="detail-value">+${result.progressGained}%</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Success Rate:</div>
                    <div class="detail-value">${Math.round(result.successRate * 100)}%</div>
                </div>
                ${gpuInfo}
                <div class="detail-item">
                    <div class="detail-label">Skills Gained:</div>
                    <div class="detail-value">
                        Coding: +${result.skillGain.coding.toFixed(1)}, 
                        Prompt: +${result.skillGain.prompt.toFixed(1)}
                    </div>
                </div>
            </div>
            <div class="prompt-container">
                <div class="prompt-header">Your Prompt:</div>
                <div class="prompt-text">${promptText}</div>
            </div>
        `;
        
        if (codingResults.firstChild) {
            codingResults.insertBefore(resultCard, codingResults.firstChild);
        } else {
            codingResults.appendChild(resultCard);
        }
    }
    
    // Show notification
    showNotification(message, type, duration) {
        if (!type) type = 'info';
        if (!duration) duration = 5000;
        
        console.log("Showing notification: " + message);
        
        var notification = document.createElement('div');
        notification.className = "notification " + type;
        notification.textContent = message;
        
        var container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
            
            var self = this;
            setTimeout(function() {
                notification.classList.add('hiding');
                setTimeout(function() {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, duration);
        }
    }
    
    // Initialize panels
    initPanels() {
        console.log("Initializing panels");
        this.setupMainMenu();
        this.updateCompletedProjectsList();
        this.updateProjectSelection();
        this.updateEmailList();
        this.updateActiveProjectsList();
        this.initSocialPanel();
    }
    
    // Update the completed projects list
    updateCompletedProjectsList() {
        console.log("Updating completed projects list");
        
        var completedProjectsList = document.getElementById('completed-projects-list');
        if (!completedProjectsList) {
            console.error("Could not find completed-projects-list element");
            return;
        }
        
        // Clear existing list
        completedProjectsList.innerHTML = '';
        
        // Add each completed project
        if (this.gameState.completedProjects && this.gameState.completedProjects.length > 0) {
            for (var i = 0; i < this.gameState.completedProjects.length; i++) {
                var project = this.gameState.completedProjects[i];
                
                var projectItem = document.createElement('div');
                projectItem.className = 'completed-project-item';
                
                var projectName = document.createElement('div');
                projectName.className = 'project-name';
                projectName.textContent = project.name;
                
                var projectReward = document.createElement('div');
                projectReward.className = 'project-reward';
                projectReward.textContent = '$' + project.reward;
                
                var projectDate = document.createElement('div');
                projectDate.className = 'project-date';
                projectDate.textContent = 'Day ' + project.completionDay;
                
                projectItem.appendChild(projectName);
                projectItem.appendChild(projectReward);
                projectItem.appendChild(projectDate);
                
                completedProjectsList.appendChild(projectItem);
            }
        } else {
            // No completed projects
            var emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No completed projects yet.';
            completedProjectsList.appendChild(emptyMessage);
        }
    }
    
    // Complete a project and move it to completed projects
    completeProject(project) {
        console.log("Completing project: " + project.name);
        
        if (!project) {
            console.error("Cannot complete undefined project");
            return;
        }
        
        try {
            // Mark as completed
            project.completed = true;
            project.completionDay = this.gameState.day;
            
            // Add reward to player's money
            this.gameState.addMoney(project.reward);
            
            // Move from active to completed projects
            var index = this.gameState.activeProjects.indexOf(project);
            if (index !== -1) {
                this.gameState.activeProjects.splice(index, 1);
            }
            
            if (!this.gameState.completedProjects) {
                this.gameState.completedProjects = [];
            }
            
            this.gameState.completedProjects.push(project);
            
            // Show notification
            this.showNotification("Project completed: " + project.name + "! You earned $" + project.reward + ".", "success");
            
            // Update the completed projects list
            this.updateCompletedProjectsList();
            
            // Update stats
            this.updateStats();
        } catch (error) {
            console.error("Error completing project:", error);
        }
    }
    
    // Set up the main menu
    setupMainMenu() {
        var self = this;
        
        // Main menu button handlers
        var codeBtn = document.getElementById('code-btn');
        if (codeBtn) {
            // Remove previous event listeners to prevent duplicates
            codeBtn.replaceWith(codeBtn.cloneNode(true));
            codeBtn = document.getElementById('code-btn');
            
            codeBtn.addEventListener('click', function() {
                console.log("Code Sprint button clicked - current time blocks:", self.gameState.getAvailableTimeBlocks());
                if (self.gameState.getAvailableTimeBlocks() > 0 && self.gameState.useTimeBlock(1)) {
                    console.log("Time block deducted for Code Sprint - remaining:", self.gameState.getAvailableTimeBlocks());
                    
                    // Immediately update the time blocks counter in the UI
                    if (self.timeBlocks) {
                        self.timeBlocks.textContent = self.gameState.getAvailableTimeBlocks();
                    }
                    
                    self.switchPanel('coding-panel');
                    self.showNotification("Started a code sprint! (Used 1 Time Block)", "info");
                    self.updateStats();
                    
                    // Force a redraw for browsers that might batch updates
                    setTimeout(() => {
                        // Update again after a small delay to ensure UI is refreshed
                        if (self.timeBlocks) {
                            self.timeBlocks.textContent = self.gameState.getAvailableTimeBlocks();
                        }
                    }, 50);
                    
                    // Check if all time blocks are used
                    if (self.gameState.getAvailableTimeBlocks() <= 0) {
                        self.showNotification("All time blocks used! Day will end when you close the computer.", "warning");
                    }
                } else {
                    self.showNotification("Not enough time blocks left!", "error");
                }
            });
        }
        
        var emailBtn = document.getElementById('email-btn');
        if (emailBtn) {
            // Remove previous event listeners to prevent duplicates
            emailBtn.replaceWith(emailBtn.cloneNode(true));
            emailBtn = document.getElementById('email-btn');
            
            emailBtn.addEventListener('click', function() {
                console.log("Email button clicked - current time blocks:", self.gameState.getAvailableTimeBlocks());
                if (self.gameState.getAvailableTimeBlocks() > 0 && self.gameState.useTimeBlock(1)) {
                    console.log("Time block deducted for Email - remaining:", self.gameState.getAvailableTimeBlocks());
                    
                    // Immediately update the time blocks counter in the UI
                    if (self.timeBlocks) {
                        self.timeBlocks.textContent = self.gameState.getAvailableTimeBlocks();
                    }
                    
                    self.switchPanel('email-panel');
                    self.updateEmailList();
                    self.showNotification("Checking email! (Used 1 Time Block)", "info");
                    self.updateStats();
                    
                    // Force a redraw for browsers that might batch updates
                    setTimeout(() => {
                        // Update again after a small delay to ensure UI is refreshed
                        if (self.timeBlocks) {
                            self.timeBlocks.textContent = self.gameState.getAvailableTimeBlocks();
                        }
                    }, 50);
                    
                    // Check if all time blocks are used
                    if (self.gameState.getAvailableTimeBlocks() <= 0) {
                        self.showNotification("All time blocks used! Day will end when you close the computer.", "warning");
                    }
                } else {
                    self.showNotification("Not enough time blocks left!", "error");
                }
            });
        }
        
        var socialBtn = document.getElementById('social-btn');
        if (socialBtn) {
            // Remove previous event listeners to prevent duplicates
            socialBtn.replaceWith(socialBtn.cloneNode(true));
            socialBtn = document.getElementById('social-btn');
            
            socialBtn.addEventListener('click', function() {
                console.log("Social button clicked - current time blocks:", self.gameState.getAvailableTimeBlocks());
                if (self.gameState.getAvailableTimeBlocks() > 0 && self.gameState.useTimeBlock(1)) {
                    console.log("Time block deducted for Social - remaining:", self.gameState.getAvailableTimeBlocks());
                    
                    // Immediately update the time blocks counter in the UI
                    if (self.timeBlocks) {
                        self.timeBlocks.textContent = self.gameState.getAvailableTimeBlocks();
                    }
                    
                    self.switchPanel('social-panel');
                    self.initSocialPanel();
                    self.showNotification("Scrolling social media! (Used 1 Time Block)", "info");
                    self.updateStats();
                    
                    // Force a redraw for browsers that might batch updates
                    setTimeout(() => {
                        // Update again after a small delay to ensure UI is refreshed
                        if (self.timeBlocks) {
                            self.timeBlocks.textContent = self.gameState.getAvailableTimeBlocks();
                        }
                    }, 50);
                    
                    // Check if all time blocks are used
                    if (self.gameState.getAvailableTimeBlocks() <= 0) {
                        self.showNotification("All time blocks used! Day will end when you close the computer.", "warning");
                    }
                } else {
                    self.showNotification("Not enough time blocks left!", "error");
                }
            });
        }
        
        var shopBtn = document.getElementById('shop-btn');
        if (shopBtn) {
            // Remove previous event listeners to prevent duplicates
            shopBtn.replaceWith(shopBtn.cloneNode(true));
            shopBtn = document.getElementById('shop-btn');
            
            shopBtn.addEventListener('click', function() {
                console.log("Shop button clicked - current time blocks:", self.gameState.getAvailableTimeBlocks());
                if (self.gameState.getAvailableTimeBlocks() > 0 && self.gameState.useTimeBlock(1)) {
                    console.log("Time block deducted for Shop - remaining:", self.gameState.getAvailableTimeBlocks());
                    
                    // Immediately update the time blocks counter in the UI
                    if (self.timeBlocks) {
                        self.timeBlocks.textContent = self.gameState.getAvailableTimeBlocks();
                    }
                    
                    self.switchPanel('shop-panel');
                    self.showNotification("Browsing the shop! (Used 1 Time Block)", "info");
                    self.updateStats();
                    
                    // Force a redraw for browsers that might batch updates
                    setTimeout(() => {
                        // Update again after a small delay to ensure UI is refreshed
                        if (self.timeBlocks) {
                            self.timeBlocks.textContent = self.gameState.getAvailableTimeBlocks();
                        }
                    }, 50);
                    
                    // Check if all time blocks are used
                    if (self.gameState.getAvailableTimeBlocks() <= 0) {
                        self.showNotification("All time blocks used! Day will end when you close the computer.", "warning");
                    }
                } else {
                    self.showNotification("Not enough time blocks left!", "error");
                }
            });
        }
        
        var resourcesBtn = document.getElementById('resources-btn');
        if (resourcesBtn) {
            // Remove previous event listeners to prevent duplicates
            resourcesBtn.replaceWith(resourcesBtn.cloneNode(true));
            resourcesBtn = document.getElementById('resources-btn');
            
            resourcesBtn.addEventListener('click', function() {
                self.switchPanel('resources-panel');
            });
        }
    }
    
    // Update the email list display
    updateEmailList() {
        console.log("Updating email list");
        
        var self = this;
        var emailList = document.getElementById('email-list');
        if (!emailList) {
            console.error("Email list container not found");
            return;
        }
        
        // Clear current email list
        emailList.innerHTML = '';
        
        // Create default project opportunities if needed
        var defaultEmails = [
            {
                subject: "Welcome to Vibe Coding!",
                sender: "Tutorial Bot",
                day: 1,
                read: false,
                content: "<p>Welcome to Vibe Coding Simulator! This is your first day as an indie developer.</p><p>Use the computer to work on projects and earn money.</p>"
            },
            {
                subject: "Your First Project Opportunity: Tutorial Project",
                sender: "ProjectFinder",
                day: 1,
                read: false,
                hasProjectOffer: true,
                projectTypeOffer: 'b2c',
                content: "<p>We've found a perfect first project for you: a simple tutorial project.</p><div class='project-details'><p><strong>Project Name:</strong> Tutorial Project</p><p><strong>Type:</strong> B2C App</p><p><strong>Difficulty:</strong> Easy</p><p><strong>Reward:</strong> $500</p><p><strong>Description:</strong> A simple app to get you started with AI coding.</p></div><div class='email-actions'><button class='accept-project-btn' data-project-type='b2c' data-project-name='Tutorial Project' data-difficulty='0.5' data-reward='500'>Accept Project</button></div>"
            },
            {
                subject: "Project Opportunity: MealPlan App",
                sender: "Client Connect",
                day: 1,
                read: false,
                hasProjectOffer: true,
                projectTypeOffer: 'b2c',
                content: "<p>Hello Developer,</p><p>We have an exciting project opportunity that matches your skills.</p><div class='project-details'><p><strong>Project Name:</strong> MealPlan</p><p><strong>Type:</strong> B2C App</p><p><strong>Difficulty:</strong> Medium</p><p><strong>Reward:</strong> $800</p><p><strong>Description:</strong> A meal planning app that helps users organize their weekly meals.</p></div><div class='email-actions'><button class='accept-project-btn' data-project-type='b2c' data-project-name='MealPlan' data-difficulty='1.0' data-reward='800'>Accept Project</button></div>"
            },
            {
                subject: "Project Opportunity: BudgetPal",
                sender: "Freelance Connect",
                day: 1,
                read: false,
                hasProjectOffer: true,
                projectTypeOffer: 'b2c',
                content: "<p>Hello Developer,</p><p>We have a client looking for a budget tracking app.</p><div class='project-details'><p><strong>Project Name:</strong> BudgetPal</p><p><strong>Type:</strong> B2C App</p><p><strong>Difficulty:</strong> Medium</p><p><strong>Reward:</strong> $900</p><p><strong>Description:</strong> A budget tracking app to help users manage their finances.</p></div><div class='email-actions'><button class='accept-project-btn' data-project-type='b2c' data-project-name='BudgetPal' data-difficulty='1.0' data-reward='900'>Accept Project</button></div>"
            }
        ];
        
        // Create placeholder if no emails
        if (!this.gameState.emails || this.gameState.emails.length === 0) {
            this.gameState.emails = defaultEmails;
        }
        
        // Limit to showing 5 emails maximum
        const emailsToShow = this.gameState.emails.slice(0, 5);
        
        // Add each email to the list
        emailsToShow.forEach(function(email, index) {
            var emailItem = document.createElement('div');
            emailItem.className = 'email-item' + (email.read ? '' : ' unread');
            
            var emailSubject = document.createElement('div');
            emailSubject.className = 'email-subject';
            emailSubject.textContent = email.subject;
            
            var emailSender = document.createElement('div');
            emailSender.className = 'email-sender';
            emailSender.textContent = email.sender;
            
            var emailDate = document.createElement('div');
            emailDate.className = 'email-date';
            emailDate.textContent = 'Day ' + email.day;
            
            emailItem.appendChild(emailSubject);
            emailItem.appendChild(emailSender);
            emailItem.appendChild(emailDate);
            
            // Add project badge if it has a project offer
            if (email.hasProjectOffer) {
                var projectBadge = document.createElement('div');
                projectBadge.className = 'project-badge';
                projectBadge.textContent = 'Project';
                emailItem.appendChild(projectBadge);
            }
            
            emailItem.addEventListener('click', function() {
                self.showEmailContent(index);
            });
            
            emailList.appendChild(emailItem);
        });
    }
    
    // Show email content when clicked
    showEmailContent(index) {
        if (!this.gameState.emails || !this.gameState.emails[index]) {
            console.error("Email not found at index", index);
            return;
        }
        
        var self = this;
        var email = this.gameState.emails[index];
        email.read = true; // Mark as read
        
        // Get all necessary DOM elements
        var emailList = document.getElementById('email-list');
        var emailContent = document.getElementById('email-content');
        var emailSubject = document.getElementById('email-subject');
        var emailSender = document.getElementById('email-sender');
        var emailDate = document.getElementById('email-date');
        var emailBody = document.getElementById('email-body');
        
        if (!emailContent || !emailSubject || !emailSender || !emailDate || !emailBody) {
            console.error("Email content elements not found");
            return;
        }
        
        // Hide email list and show email content
        emailList.classList.add('hidden');
        emailContent.classList.remove('hidden');
        
        // Populate email details
        emailSubject.textContent = email.subject;
        emailSender.textContent = email.sender;
        emailDate.textContent = 'Day ' + email.day;
        emailBody.innerHTML = email.content;
        
        // Add event listeners to any accept project buttons
        var acceptButtons = emailBody.querySelectorAll('.accept-project-btn');
        if (acceptButtons.length > 0) {
            acceptButtons.forEach(function(button) {
                button.addEventListener('click', function() {
                    const projectType = button.getAttribute('data-project-type');
                    const projectName = button.getAttribute('data-project-name');
                    const difficulty = parseFloat(button.getAttribute('data-difficulty'));
                    const reward = parseInt(button.getAttribute('data-reward'));
                    
                    // Create a new project
                    if (projectType && projectName && !isNaN(difficulty) && !isNaN(reward)) {
                        const newProject = {
                            id: Date.now(),
                            name: projectName,
                            type: projectType,
                            difficulty: difficulty,
                            reward: reward,
                            progress: 0,
                            accepted: true,
                            completed: false,
                            quality: 0
                        };
                        
                        // Add to active projects
                        if (self.gameState.activeProjects) {
                            self.gameState.activeProjects.push(newProject);
                            self.showNotification(`Accepted project: ${projectName}!`, "success");
                            
                            // Update UI
                            self.updateActiveProjectsList();
                            
                            // Close the email
                            document.getElementById('email-close-btn').click();
                        } else {
                            console.error("Active projects array not found in game state");
                        }
                    } else {
                        console.error("Invalid project data in email", { projectType, projectName, difficulty, reward });
                    }
                });
            });
        }
        
        this.gameState.saveState();
    }
    
    // Update project selection dropdown
    updateProjectSelection() {
        console.log("Updating project selection");
        
        var projectSelect = document.getElementById('project-select');
        if (!projectSelect) {
            console.error("Project select element not found");
            return;
        }
        
        // Clear current options
        projectSelect.innerHTML = '';
        
        // Mock data for now
        if (!this.gameState.activeProjects || this.gameState.activeProjects.length === 0) {
            // Create a mock project if none exist
            if (this.projectManager) {
                this.projectManager.addProject({
                    name: "Tutorial Project",
                    difficulty: 1,
                    reward: 100,
                    type: 'tutorial',
                    progress: 0,
                    completed: false
                });
            } else {
                // If no projectManager, create local mock data
                this.gameState.activeProjects = [{
                    name: "Demo Project",
                    difficulty: 1,
                    reward: 100,
                    type: 'demo',
                    progress: 0,
                    completed: false
                }];
            }
        }
        
        // Add each active project to the dropdown
        var self = this;
        if (this.gameState.activeProjects) {
            this.gameState.activeProjects.forEach(function(project, index) {
                var option = document.createElement('option');
                option.value = index;
                option.textContent = project.name;
                projectSelect.appendChild(option);
            });
            
            // Trigger change to update current project info
            this.updateCurrentProjectInfo();
        }
    }
    
    // Update current project info display
    updateCurrentProjectInfo() {
        console.log("Updating current project info");
        
        var projectSelect = document.getElementById('project-select');
        var currentProjectInfo = document.getElementById('current-project-info');
        
        if (!projectSelect || !currentProjectInfo) {
            console.error("Project elements not found");
            return;
        }
        
        // Clear current info
        currentProjectInfo.innerHTML = '';
        
        // Get selected project
        var selectedIndex = parseInt(projectSelect.value);
        if (isNaN(selectedIndex) || !this.gameState.activeProjects || !this.gameState.activeProjects[selectedIndex]) {
            var emptyMessage = document.createElement('div');
            emptyMessage.className = 'no-project-message';
            emptyMessage.innerHTML = '<p>Select a project to start coding</p>';
            currentProjectInfo.appendChild(emptyMessage);
            return;
        }
        
        var project = this.gameState.activeProjects[selectedIndex];
        
        // Create project info elements
        var projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        
        var projectHeader = document.createElement('div');
        projectHeader.className = 'project-header';
        
        var projectName = document.createElement('div');
        projectName.className = 'project-name';
        projectName.textContent = project.name;
        
        var projectType = document.createElement('span');
        projectType.className = 'project-type-badge';
        projectType.textContent = this.getProjectTypeName(project.type) || 'Web';
        
        projectHeader.appendChild(projectName);
        projectHeader.appendChild(projectType);
        
        var projectDetails = document.createElement('div');
        projectDetails.className = 'project-details';
        
        var difficultyRow = document.createElement('div');
        difficultyRow.className = 'detail-row';
        
        var difficultyLabel = document.createElement('span');
        difficultyLabel.className = 'detail-label';
        difficultyLabel.textContent = 'Difficulty:';
        
        var difficultyStars = document.createElement('span');
        difficultyStars.className = 'difficulty-stars';
        
        // Convert decimal difficulty to star rating (assuming difficulty is 0.5, 1.0, 1.5, etc.)
        const starRating = Math.round(project.difficulty * 2); // Convert to a 1-5 scale
        difficultyStars.textContent = this.getDifficultyText(project.difficulty) + ' ' + 
            ('★'.repeat(starRating) + '☆'.repeat(5 - starRating));
        
        difficultyRow.appendChild(difficultyLabel);
        difficultyRow.appendChild(difficultyStars);
        
        var rewardRow = document.createElement('div');
        rewardRow.className = 'detail-row';
        
        var rewardLabel = document.createElement('span');
        rewardLabel.className = 'detail-label';
        rewardLabel.textContent = 'Reward:';
        
        var rewardAmount = document.createElement('span');
        rewardAmount.className = 'reward-amount';
        rewardAmount.textContent = '$' + project.reward;
        
        rewardRow.appendChild(rewardLabel);
        rewardRow.appendChild(rewardAmount);
        
        var progressRow = document.createElement('div');
        progressRow.className = 'project-progress';
        
        var progressBar = document.createElement('div');
        progressBar.className = 'progress-bar-container';
        
        var progressFill = document.createElement('div');
        progressFill.className = 'progress-bar';
        progressFill.style.width = project.progress + '%';
        
        var progressText = document.createElement('div');
        progressText.className = 'progress-text';
        progressText.textContent = Math.round(project.progress) + '%';
        
        progressBar.appendChild(progressFill);
        progressBar.appendChild(progressText);
        
        projectDetails.appendChild(difficultyRow);
        projectDetails.appendChild(rewardRow);
        
        var statusDisplay = document.createElement('div');
        statusDisplay.className = 'project-status ' + 
            (project.progress === 0 ? 'not-started' : 
             project.progress < 50 ? 'in-progress' : 
             project.progress < 100 ? 'advanced' : 'complete');
        statusDisplay.textContent = 
            project.progress === 0 ? 'Not Started' : 
            project.progress < 50 ? 'In Progress' : 
            project.progress < 100 ? 'Advanced' : 'Complete';
        
        projectDetails.appendChild(statusDisplay);
        projectDetails.appendChild(progressRow);
        
        // Create work button
        var workButton = document.createElement('button');
        workButton.className = 'work-on-project-btn';
        workButton.textContent = 'Work on Project';
        workButton.setAttribute('data-index', selectedIndex);
        
        var self = this;
        workButton.addEventListener('click', function() {
            var index = parseInt(this.getAttribute('data-index'));
            self.switchPanel('coding');
            
            // Set the project in the dropdown
            var projectSelect = document.getElementById('project-select');
            if (projectSelect) {
                projectSelect.value = index;
                
                // Trigger change event to update project info
                var event = new Event('change');
                projectSelect.dispatchEvent(event);
                
                // Or call the update directly
                self.updateCurrentProjectInfo();
            }
        });
        
        projectCard.appendChild(projectHeader);
        projectCard.appendChild(projectDetails);
        projectCard.appendChild(workButton);
        
        currentProjectInfo.appendChild(projectCard);
    }
    
    // Update AI model selection dropdown
    updateAIModelSelection() {
        console.log("Updating AI model selection");
        
        var aiModelSelect = document.getElementById('ai-model-select');
        if (!aiModelSelect) {
            console.error("AI model select element not found");
            return;
        }
        
        // Initialize GPU toggle
        var gpuToggle = document.getElementById('allocate-gpu-toggle');
        if (gpuToggle) {
            // Reset toggle to unchecked state when initializing the panel
            gpuToggle.checked = false;
            
            // Disable toggle if GPU is not available
            if (this.hardwareManager && !this.hardwareManager.isGPUAvailable()) {
                gpuToggle.disabled = true;
                gpuToggle.parentElement.classList.add('disabled');
                gpuToggle.parentElement.title = "No GPU available";
            } else {
                gpuToggle.disabled = false;
                gpuToggle.parentElement.classList.remove('disabled');
                gpuToggle.parentElement.title = "Allocate GPU to increase success chance by 5%";
            }
        }
        
        // Clear current options
        aiModelSelect.innerHTML = '';
        
        // Get available models
        var availableModels = this.aiModelManager ? this.aiModelManager.getAvailableModels() : null;
        
        if (!availableModels || availableModels.length === 0) {
            // Default models if none available
            availableModels = [
                { key: "gpt-3", name: "GPT-3", tier: "Basic" },
                { key: "bloom", name: "BLOOM", tier: "Basic" }
            ];
        }
        
        // Add each available model
        var self = this;
        availableModels.forEach(function(model) {
            var option = document.createElement('option');
            option.value = model.key;
            option.textContent = model.name + " (" + model.tier + ")";
            aiModelSelect.appendChild(option);
        });
    }
    
    // Initialize social media panel with mock content
    initSocialPanel() {
        console.log("Initializing social media panel");
        
        var self = this;
        var socialPostsList = document.getElementById('social-posts-list');
        if (!socialPostsList) {
            console.error("Social posts list container not found");
            return;
        }
        
        // Clear current list
        socialPostsList.innerHTML = '';
        
        // Use socialMediaManager if available, otherwise use mock data
        let posts = [];
        
        if (this.socialMediaManager) {
            // Use the social media manager to generate posts without consuming a time block
            // Initial view shouldn't consume a time block as it's already deducted in the button click
            const result = this.socialMediaManager.scrollFeed(false);
            
            if (result.success) {
                posts = result.posts;
                
                // If there's a discovered prompt, show notification
                if (result.discoveredPrompt) {
                    this.showNotification(`Discovered new prompt technique: ${result.discoveredPrompt.name}!`, "success");
                }
            } else {
                this.showNotification(result.message, "error");
                return;
            }
        } else {
            // Create mock social media posts including project opportunities
            posts = [
                {
                    author: "CodingGuru",
                    time: "Today",
                    content: "Just discovered an amazing prompt technique for generating complex algorithms with AI. Start with a step-by-step breakdown of the problem before asking for code. #AIPrompting #CodingTips",
                    tags: ["AIPrompting", "CodingTips"],
                    trending: true
                },
                {
                    author: "TechTrends",
                    time: "Yesterday",
                    content: "AI-generated websites are dominating the freelance market this month. If you're not using AI for your projects, you're falling behind! #TechTrends #AIRevolution",
                    tags: ["TechTrends", "AIRevolution"],
                    trending: true
                },
                {
                    author: "ProjectConnect",
                    time: "Today",
                    content: "Looking for a developer to create a simple meal planning app. Budget is $800. DM if interested! #ProjectOpportunity #MealPlan",
                    tags: ["ProjectOpportunity", "MealPlan"],
                    trending: false,
                    hasProjectOffer: true,
                    projectOffer: {
                        name: "MealPlan",
                        type: "b2c",
                        difficulty: 1.0,
                        reward: 800,
                        description: "A meal planning app to help users organize their weekly meals."
                    }
                },
                {
                    author: "FreelanceHub",
                    time: "Today",
                    content: "Urgent: Need a developer for a budget tracking app. Pays well for quick turnaround. #BudgetPal #Freelance",
                    tags: ["Freelance", "BudgetPal"],
                    trending: false,
                    hasProjectOffer: true,
                    projectOffer: {
                        name: "BudgetPal",
                        type: "b2c",
                        difficulty: 1.0,
                        reward: 900,
                        description: "A budget tracking app to help users manage their finances."
                    }
                },
                {
                    author: "DevLifestyle",
                    time: "2 days ago",
                    content: "Working on a simple landing page for a client using AI assistance. Completed in 1 hour what would have taken a day before! Share your AI productivity wins. #DevLife #Productivity",
                    tags: ["DevLife", "Productivity"],
                    trending: false
                }
            ];
        }
        
        // Display posts (limit to 5)
        const postsToShow = posts.slice(0, 5);
        postsToShow.forEach(post => this.createSocialPostElement(post, socialPostsList));
        
        // Add event listener to scroll social button
        var scrollSocialBtn = document.getElementById('scroll-social-btn');
        if (scrollSocialBtn) {
            // Remove previous event listeners to prevent duplicates
            scrollSocialBtn.replaceWith(scrollSocialBtn.cloneNode(true));
            scrollSocialBtn = document.getElementById('scroll-social-btn');
            
            scrollSocialBtn.addEventListener('click', function() {
                if (self.gameState.getAvailableTimeBlocks() > 0 && self.gameState.useTimeBlock(1)) {
                    self.timeBlocks.textContent = self.gameState.getAvailableTimeBlocks();
                    
                    // When clicking Scroll Feed, we consume timeBlock here, not in the socialMediaManager
                    if (self.socialMediaManager) {
                        // We already consumed the time block above, so don't consume again
                        const result = self.socialMediaManager.scrollFeed(false);
                        if (result.success) {
                            // Update the posts list with new posts
                            socialPostsList.innerHTML = '';
                            result.posts.slice(0, 5).forEach(post => 
                                self.createSocialPostElement(post, socialPostsList));
                                
                            // Show discovered prompt notification if any
                            if (result.discoveredPrompt) {
                                self.showNotification(`Discovered new prompt technique: ${result.discoveredPrompt.name}!`, "success");
                            }
                        }
                    } else {
                        // If no socialMediaManager, just refresh the panel with mock data
                        self.initSocialPanel();
                    }
                    
                    self.showNotification("Scrolled social media feed! (Used 1 Time Block)", "info");
                    self.updateStats();
                } else {
                    self.showNotification("Not enough time blocks left!", "error");
                }
            });
        }
    }
    
    // Create a social post element
    createSocialPostElement(post, container) {
        var postElement = document.createElement('div');
        postElement.className = 'social-post';
        
        var postHeader = document.createElement('div');
        postHeader.className = 'post-header';
        
        var authorElement = document.createElement('div');
        authorElement.className = 'post-author';
        authorElement.textContent = post.author;
        
        var timeElement = document.createElement('div');
        timeElement.className = 'post-time';
        timeElement.textContent = post.time;
        
        postHeader.appendChild(authorElement);
        postHeader.appendChild(timeElement);
        
        var contentElement = document.createElement('div');
        contentElement.className = 'post-content';
        contentElement.textContent = post.content;
        
        var tagsElement = document.createElement('div');
        tagsElement.className = 'post-tags';
        
        // Add tags
        if (post.tags && post.tags.length > 0) {
            post.tags.forEach(tag => {
                var tagElement = document.createElement('span');
                tagElement.className = 'tag' + (post.trending ? ' trending' : '');
                tagElement.textContent = '#' + tag;
                tagsElement.appendChild(tagElement);
            });
        }
        
        // Add elements to post
        postElement.appendChild(postHeader);
        postElement.appendChild(contentElement);
        postElement.appendChild(tagsElement);
        
        // Add project offer if exists
        if (post.hasProjectOffer && post.projectOffer) {
            var projectOffer = post.projectOffer;
            var projectOfferElement = document.createElement('div');
            projectOfferElement.className = 'project-offer';
            
            var projectHeader = document.createElement('h4');
            projectHeader.textContent = `Project Opportunity: ${projectOffer.name}`;
            
            var projectDetails = document.createElement('div');
            projectDetails.className = 'project-details';
            projectDetails.innerHTML = `
                <p><strong>Type:</strong> ${this.getProjectTypeName(projectOffer.type)}</p>
                <p><strong>Difficulty:</strong> ${this.getDifficultyText(projectOffer.difficulty)}</p>
                <p><strong>Reward:</strong> $${projectOffer.reward}</p>
                <p><strong>Description:</strong> ${projectOffer.description}</p>
            `;
            
            var acceptButton = document.createElement('button');
            acceptButton.className = 'accept-project-btn';
            acceptButton.textContent = 'Accept Project';
            acceptButton.setAttribute('data-project-type', projectOffer.type);
            acceptButton.setAttribute('data-project-name', projectOffer.name);
            acceptButton.setAttribute('data-difficulty', projectOffer.difficulty);
            acceptButton.setAttribute('data-reward', projectOffer.reward);
            
            // Add event listener to accept button
            var self = this;
            acceptButton.addEventListener('click', function() {
                const projectType = this.getAttribute('data-project-type');
                const projectName = this.getAttribute('data-project-name');
                const difficulty = parseFloat(this.getAttribute('data-difficulty'));
                const reward = parseInt(this.getAttribute('data-reward'));
                
                // Create a new project
                if (projectType && projectName && !isNaN(difficulty) && !isNaN(reward)) {
                    const newProject = {
                        id: Date.now(),
                        name: projectName,
                        type: projectType,
                        difficulty: difficulty,
                        reward: reward,
                        progress: 0,
                        accepted: true,
                        completed: false,
                        quality: 0
                    };
                    
                    // Add to active projects
                    if (self.gameState.activeProjects) {
                        self.gameState.activeProjects.push(newProject);
                        self.showNotification(`Accepted project: ${projectName}!`, "success");
                        
                        // Update UI
                        self.updateActiveProjectsList();
                        
                        // Remove the accept button to prevent multiple accepts
                        this.remove();
                    } else {
                        console.error("Active projects array not found in game state");
                    }
                } else {
                    console.error("Invalid project data in post", { projectType, projectName, difficulty, reward });
                }
            });
            
            projectOfferElement.appendChild(projectHeader);
            projectOfferElement.appendChild(projectDetails);
            projectOfferElement.appendChild(acceptButton);
            postElement.appendChild(projectOfferElement);
        }
        
        container.appendChild(postElement);
    }
    
    // Helper function to get project type name
    getProjectTypeName(type) {
        const typeNames = {
            'b2c': 'B2C App',
            'b2b': 'B2B Software',
            'game': 'Game',
            'course': 'Online Course',
            'influencer': 'Influencer Content'
        };
        return typeNames[type] || type;
    }
    
    // Helper function to get difficulty text
    getDifficultyText(difficulty) {
        if (difficulty <= 0.5) return 'Easy';
        if (difficulty <= 1.0) return 'Medium';
        if (difficulty <= 1.5) return 'Hard';
        return 'Very Hard';
    }
    
    // Update the active projects list
    updateActiveProjectsList() {
        console.log("Updating active projects list");
        
        var activeProjectsList = document.getElementById('active-projects-list');
        if (!activeProjectsList) {
            console.error("Could not find active-projects-list element");
            return;
        }
        
        // Clear existing list
        activeProjectsList.innerHTML = '';
        
        // Add each active project
        if (this.gameState.activeProjects && this.gameState.activeProjects.length > 0) {
            for (var i = 0; i < this.gameState.activeProjects.length; i++) {
                var project = this.gameState.activeProjects[i];
                
                var projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                
                var projectHeader = document.createElement('div');
                projectHeader.className = 'project-header';
                
                var projectName = document.createElement('h3');
                projectName.textContent = project.name;
                
                var projectType = document.createElement('span');
                projectType.className = 'project-type-badge';
                projectType.textContent = this.getProjectTypeName(project.type) || 'Web';
                
                projectHeader.appendChild(projectName);
                projectHeader.appendChild(projectType);
                
                var projectDetails = document.createElement('div');
                projectDetails.className = 'project-details';
                
                var difficultyRow = document.createElement('div');
                difficultyRow.className = 'detail-row';
                
                var difficultyLabel = document.createElement('span');
                difficultyLabel.className = 'detail-label';
                difficultyLabel.textContent = 'Difficulty:';
                
                var difficultyStars = document.createElement('span');
                difficultyStars.className = 'difficulty-stars';
                
                // Convert decimal difficulty to star rating (assuming difficulty is 0.5, 1.0, 1.5, etc.)
                const starRating = Math.round(project.difficulty * 2); // Convert to a 1-5 scale
                difficultyStars.textContent = this.getDifficultyText(project.difficulty) + ' ' + 
                    ('★'.repeat(starRating) + '☆'.repeat(5 - starRating));
                
                difficultyRow.appendChild(difficultyLabel);
                difficultyRow.appendChild(difficultyStars);
                
                var rewardRow = document.createElement('div');
                rewardRow.className = 'detail-row';
                
                var rewardLabel = document.createElement('span');
                rewardLabel.className = 'detail-label';
                rewardLabel.textContent = 'Reward:';
                
                var rewardAmount = document.createElement('span');
                rewardAmount.className = 'reward-amount';
                rewardAmount.textContent = '$' + project.reward;
                
                rewardRow.appendChild(rewardLabel);
                rewardRow.appendChild(rewardAmount);
                
                var progressRow = document.createElement('div');
                progressRow.className = 'project-progress';
                
                var progressBar = document.createElement('div');
                progressBar.className = 'progress-bar-container';
                
                var progressFill = document.createElement('div');
                progressFill.className = 'progress-bar';
                progressFill.style.width = project.progress + '%';
                
                var progressText = document.createElement('div');
                progressText.className = 'progress-text';
                progressText.textContent = Math.round(project.progress) + '%';
                
                progressBar.appendChild(progressFill);
                progressBar.appendChild(progressText);
                
                projectDetails.appendChild(difficultyRow);
                projectDetails.appendChild(rewardRow);
                
                var statusDisplay = document.createElement('div');
                statusDisplay.className = 'project-status ' + 
                    (project.progress === 0 ? 'not-started' : 
                     project.progress < 50 ? 'in-progress' : 
                     project.progress < 100 ? 'advanced' : 'complete');
                statusDisplay.textContent = 
                    project.progress === 0 ? 'Not Started' : 
                    project.progress < 50 ? 'In Progress' : 
                    project.progress < 100 ? 'Advanced' : 'Complete';
                
                projectDetails.appendChild(statusDisplay);
                projectDetails.appendChild(progressRow);
                
                // Create work button
                var workButton = document.createElement('button');
                workButton.className = 'work-on-project-btn';
                workButton.textContent = 'Work on Project';
                workButton.setAttribute('data-index', i);
                
                var self = this;
                workButton.addEventListener('click', function() {
                    var index = parseInt(this.getAttribute('data-index'));
                    self.switchPanel('coding');
                    
                    // Set the project in the dropdown
                    var projectSelect = document.getElementById('project-select');
                    if (projectSelect) {
                        projectSelect.value = index;
                        
                        // Trigger change event to update project info
                        var event = new Event('change');
                        projectSelect.dispatchEvent(event);
                        
                        // Or call the update directly
                        self.updateCurrentProjectInfo();
                    }
                });
                
                projectCard.appendChild(projectHeader);
                projectCard.appendChild(projectDetails);
                projectCard.appendChild(workButton);
                
                activeProjectsList.appendChild(projectCard);
            }
        } else {
            // No active projects
            var emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No active projects. Check the job board to find new opportunities.';
            activeProjectsList.appendChild(emptyMessage);
        }
        
        // Also update job board
        this.updateJobBoard();
    }
    
    // Update the job board with available projects
    updateJobBoard() {
        console.log("Updating job board");
        
        var jobBoardList = document.getElementById('job-board-list');
        if (!jobBoardList) {
            console.error("Could not find job-board-list element");
            return;
        }
        
        // Clear existing list
        jobBoardList.innerHTML = '';
        
        // Create mock job opportunities if none exist
        var availableJobs = [
            {
                title: "E-commerce Landing Page",
                type: "Web",
                description: "Create a clean, modern landing page for an online clothing store.",
                difficulty: 2,
                reward: 300
            },
            {
                title: "Blog Article Generator",
                type: "Tool",
                description: "Develop a simple script that generates blog article outlines from keywords.",
                difficulty: 1,
                reward: 150
            },
            {
                title: "Personal Portfolio Site",
                type: "Web",
                description: "Build a professional portfolio site for a graphic designer.",
                difficulty: 3,
                reward: 500
            }
        ];
        
        // Add each job opportunity
        for (var i = 0; i < availableJobs.length; i++) {
            var job = availableJobs[i];
            
            var jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            
            var jobHeader = document.createElement('div');
            jobHeader.className = 'job-card-header';
            
            var jobTitle = document.createElement('div');
            jobTitle.className = 'job-card-title';
            jobTitle.textContent = job.title;
            
            var jobType = document.createElement('div');
            jobType.className = 'job-card-type';
            jobType.textContent = job.type;
            
            jobHeader.appendChild(jobTitle);
            jobHeader.appendChild(jobType);
            
            var jobDescription = document.createElement('div');
            jobDescription.className = 'job-card-description';
            jobDescription.textContent = job.description;
            
            var jobDetails = document.createElement('div');
            jobDetails.className = 'job-card-details';
            
            var jobDifficulty = document.createElement('div');
            jobDifficulty.className = 'job-card-difficulty';
            jobDifficulty.textContent = 'Difficulty: ' + '★'.repeat(job.difficulty) + '☆'.repeat(5 - job.difficulty);
            
            var jobReward = document.createElement('div');
            jobReward.className = 'job-card-reward';
            jobReward.textContent = 'Reward: $' + job.reward;
            
            jobDetails.appendChild(jobDifficulty);
            jobDetails.appendChild(jobReward);
            
            var jobActions = document.createElement('div');
            jobActions.className = 'job-card-actions';
            
            var acceptButton = document.createElement('button');
            acceptButton.className = 'accept-job-btn';
            acceptButton.textContent = 'Accept Job';
            
            // Store job data for the click handler
            acceptButton.dataset.job = JSON.stringify(job);
            
            var self = this;
            acceptButton.addEventListener('click', function() {
                try {
                    var jobData = JSON.parse(this.dataset.job);
                    
                    // Add the job to active projects
                    if (self.projectManager && typeof self.projectManager.addProject === 'function') {
                        self.projectManager.addProject({
                            name: jobData.title,
                            type: jobData.type,
                            description: jobData.description,
                            difficulty: jobData.difficulty,
                            reward: jobData.reward,
                            progress: 0,
                            completed: false
                        });
                        
                        self.showNotification("New project accepted: " + jobData.title, "success");
                        
                        // Update the projects list
                        self.updateActiveProjectsList();
                    } else {
                        // Fallback if projectManager is not available
                        if (!self.gameState.activeProjects) {
                            self.gameState.activeProjects = [];
                        }
                        
                        self.gameState.activeProjects.push({
                            name: jobData.title,
                            type: jobData.type,
                            description: jobData.description,
                            difficulty: jobData.difficulty,
                            reward: jobData.reward,
                            progress: 0,
                            completed: false
                        });
                        
                        self.showNotification("New project accepted: " + jobData.title, "success");
                        
                        // Update the projects list
                        self.updateActiveProjectsList();
                    }
                    
                    // Remove this job card
                    this.closest('.job-card').remove();
                } catch (error) {
                    console.error("Error accepting job:", error);
                    self.showNotification("Failed to accept job", "error");
                }
            });
            
            jobActions.appendChild(acceptButton);
            
            jobCard.appendChild(jobHeader);
            jobCard.appendChild(jobDescription);
            jobCard.appendChild(jobDetails);
            jobCard.appendChild(jobActions);
            
            jobBoardList.appendChild(jobCard);
        }
    }
    
    // Initialize essential activities
    initEssentialActivities() {
        const activityButtons = document.querySelectorAll('.essential-activities .essential-activity');
        const self = this;
        
        activityButtons.forEach(button => {
            button.addEventListener('click', function() {
                const activity = this.getAttribute('data-activity');
                
                // Special handling for sleep - immediately end the day without using a time block
                if (activity === 'sleep') {
                    console.log("Sleep selected - ending day without time block deduction");
                    
                    // Capture current day for reference
                    const currentDay = self.gameState.day;
                    console.log(`Sleep clicked on day ${currentDay}`);
                    
                    // Handle ending the day
                    self.handleEndDay();
                    
                    // Force immediate day counter update
                    const newDay = self.gameState.day;
                    if (self.dayCount) {
                        console.log(`Sleep: Directly updating day counter from ${currentDay} to ${newDay}`);
                        self.dayCount.textContent = newDay;
                    }
                    
                    // Close computer screen if open
                    if (self.computerScreen && !self.computerScreen.classList.contains('hidden')) {
                        self.computerScreen.classList.add('hidden');
                    }
                    
                    // Do an additional forced update after a brief delay
                    setTimeout(() => {
                        if (self.dayCount) {
                            console.log(`Sleep: Delayed update of day counter to ensure it shows ${newDay}`);
                            self.dayCount.textContent = newDay;
                        }
                        self.updateStats();
                    }, 100);
                    
                    return;
                }
                
                // For non-sleep activities, handle normally
                
                // Prevent action if the button is already marked as completed
                if (this.classList.contains('completed')) {
                    self.showNotification("You've already done this activity today.", "warning");
                    return;
                }
                
                // Get current time blocks before deduction for debugging
                const beforeTimeBlocks = self.gameState.getAvailableTimeBlocks();
                console.log(`Before ${activity}: ${beforeTimeBlocks} time blocks available`);
                
                // Use a time block for the activity
                if (self.gameState.useTimeBlock(1)) {
                    // Mark activity as completed
                    if (['eat', 'exercise', 'work'].includes(activity)) {
                        self.gameState.completedActivities[activity] = true;
                    }
                    
                    // Mark button as completed immediately to prevent double-clicking
                    this.classList.add('completed');
                    
                    // Immediately update the time blocks counter in the UI
                    const afterTimeBlocks = self.gameState.getAvailableTimeBlocks();
                    if (self.timeBlocks) {
                        self.timeBlocks.textContent = afterTimeBlocks;
                    }
                    console.log(`After ${activity}: ${afterTimeBlocks} time blocks available`);
                    
                    // For non-sleep activities, just show notifications
                    self.showNotification(`Completed: ${activity}`, "success");
                    
                    // Do a full UI update
                    self.updateStats();
                    
                    // Force a redraw for browsers that might batch updates
                    setTimeout(() => {
                        // Update again after a small delay to ensure UI is refreshed
                        if (self.timeBlocks) {
                            self.timeBlocks.textContent = self.gameState.getAvailableTimeBlocks();
                        }
                    }, 50);
                    
                    // Log the activity and remaining time blocks
                    console.log(`Activity ${activity} completed. Remaining time blocks: ${self.gameState.getAvailableTimeBlocks()}`);
                    
                    // Check if all time blocks are used (for auto-end day)
                    if (self.gameState.getAvailableTimeBlocks() <= 0) {
                        // If all time blocks used, automatically end the day
                        self.showNotification("All time blocks used! Day is ending...", "info");
                        setTimeout(() => {
                            self.handleEndDay();
                            // Close computer screen if open
                            if (self.computerScreen && !self.computerScreen.classList.contains('hidden')) {
                                self.computerScreen.classList.add('hidden');
                            }
                        }, 1500); // Short delay to show the notification
                    }
                } else {
                    self.showNotification("No time blocks left! Choose sleep to end the day.", "warning");
                }
            });
        });
    }
    
    // Update completed activities visual state
    updateCompletedActivities() {
        const activityButtons = document.querySelectorAll('.essential-activities .essential-activity');
        
        // Reset all buttons - important when a new day starts
        activityButtons.forEach(button => {
            button.classList.remove('completed');
            console.log(`Reset completed state for ${button.getAttribute('data-activity')}`);
        });
        
        // Mark mandatory activities as completed based on game state
        for (const activity in this.gameState.completedActivities) {
            if (this.gameState.completedActivities[activity]) {
                const button = document.querySelector(`.essential-activities .essential-activity[data-activity="${activity}"]`);
                if (button) {
                    button.classList.add('completed');
                    console.log(`Marked ${activity} as completed`);
                }
            }
        }
        
        // Disable all buttons except sleep if no time blocks left
        if (this.gameState.getAvailableTimeBlocks() <= 0) {
            activityButtons.forEach(button => {
                const activity = button.getAttribute('data-activity');
                if (activity !== 'sleep') {
                    button.classList.add('completed');
                    console.log(`No time blocks left, disabled ${activity}`);
                }
            });
        }
    }
    
    // Release allocated GPU
    releaseGPU() {
        if (this.hardwareManager && this.hardwareManager.getGPUStatus().inUse) {
            console.log("Releasing allocated GPU");
            this.hardwareManager.releaseGPU();
            this.updateStats();
            this.showNotification("GPU resources released", "info");
        }
    }
} 