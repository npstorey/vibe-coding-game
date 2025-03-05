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
        console.log('UI initializing...');
        
        // Remove any debug elements that might exist
        document.querySelectorAll('[style*="TEST SCRIPT SHOWING CODING PANEL"]').forEach(el => el.remove());
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.includes('TEST: Show Code Sprint')) {
                btn.remove();
            }
        });
        
        // Display loading screen initially
        this.updateStats();
        if (this.loadingScreen) {
            this.loadingScreen.classList.remove('hidden');
        }
        
        // Set up computer screen
        if (this.computerScreen) {
            this.computerScreen.classList.add('hidden');
        }
        
        return this;
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
        
        // Ensure project manager has access to hardware manager and UI
        if (this.projectManager) {
            if (this.hardwareManager) {
                this.projectManager.hardwareManager = this.hardwareManager;
                console.log("Hardware manager reference added to project manager");
            }
            
            // Set UI reference in project manager for debug testing modes
            this.projectManager.setUI(this);
        }
        
        // Initialize debug tools
        this.initDebugTools();
        
        // Remove any debug elements first
        this.removeDebugElements();
        
        // Initialize panels
        this.initPanels();
        
        // Set up debug button handler if it exists
        const debugBtn = document.getElementById('debug-show-computer');
        if (debugBtn) {
            debugBtn.addEventListener('click', () => {
                this.debugShowCodingPanel();
            });
        }
        
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
            // Special case for coding panel - use our more robust method
            if (panelName === 'coding' || panelName === 'coding-panel') {
                console.log("Using ensureCodingPanelVisible for coding panel");
                return this.ensureCodingPanelVisible();
            }
            
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
                    
                    // Check if updateProjectSelection exists
                    if (typeof this.updateProjectSelection === 'function') {
                        this.updateProjectSelection();
                    } else {
                        console.error("updateProjectSelection is not a function");
                    }
                    
                    // Check if initCodeSprintListeners exists
                    if (typeof this.initCodeSprintListeners === 'function') {
                        this.initCodeSprintListeners();
                    } else {
                        console.error("initCodeSprintListeners is not a function");
                    }
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
        // Redirect to the new Code Sprint UI
        console.log("Redirecting to new Code Sprint UI");
        
        if (this.gameState.getAvailableTimeBlocks() <= 0) {
            this.showNotification("Not enough time blocks left!", "error");
            return;
        }
        
        // Switch to the coding panel
        this.switchPanel('coding-panel');
        
        // No need to deduct time blocks here - that'll happen when starting the sprint
    }
    
    // Show the sprint interface
    showSprintInterface() {
        const promptInputWrapper = document.querySelector('.prompt-input-wrapper');
        const sprintInfoContainer = document.getElementById('sprint-info-container');
        
        if (promptInputWrapper && sprintInfoContainer) {
            promptInputWrapper.classList.add('hidden');
            sprintInfoContainer.classList.remove('hidden');
            
            // Initialize event listeners for sprint buttons if they haven't been already
            this.initSprintEventListeners();
        }
    }
    
    // Hide the sprint interface and show prompt input
    hideSprintInterface() {
        const promptInputWrapper = document.querySelector('.prompt-input-wrapper');
        const sprintInfoContainer = document.getElementById('sprint-info-container');
        
        if (promptInputWrapper && sprintInfoContainer) {
            promptInputWrapper.classList.remove('hidden');
            sprintInfoContainer.classList.add('hidden');
            
            // Reset timer if it was running
            this.stopSprintTimer();
        }
    }
    
    // Initialize event listeners for sprint buttons
    initSprintEventListeners() {
        const startSprintBtn = document.getElementById('start-sprint-btn');
        const yoloBtn = document.getElementById('yolo-btn');
        const continueBtn = document.getElementById('continue-btn');
        
        if (startSprintBtn && !startSprintBtn._initialized) {
            startSprintBtn.addEventListener('click', () => this.startSprint());
            startSprintBtn._initialized = true;
        }
        
        if (yoloBtn && !yoloBtn._initialized) {
            yoloBtn.addEventListener('click', () => this.handleYolo());
            yoloBtn._initialized = true;
        }
        
        if (continueBtn && !continueBtn._initialized) {
            continueBtn.addEventListener('click', () => {
                // Hide result and return to prompt input
                document.getElementById('sprint-result').classList.add('hidden');
                this.hideSprintInterface();
                
                // Clear the prompt input field
                const promptInput = document.getElementById('prompt-input');
                if (promptInput) {
                    promptInput.value = '';
                }
            });
            continueBtn._initialized = true;
        }
    }
    
    // Update sprint info display with calculated probability
    updateSprintInfo(probabilityResult, promptText) {
        // Cache elements
        const sprintReward = document.getElementById('sprint-reward');
        const sprintDifficulty = document.getElementById('sprint-difficulty');
        const sprintGpuReq = document.getElementById('sprint-gpu-req');
        const sprintSuccessProb = document.getElementById('sprint-success-prob');
        
        // Store data for use in timer completion
        this._currentSprintData = {
            projectIndex: document.getElementById('project-select').value,
            aiModelKey: document.getElementById('ai-model-select').value,
            promptKey: document.getElementById('prompt-technique-select').value,
            gpuAllocated: document.getElementById('allocate-gpu-toggle').checked,
            promptText: promptText,
            probability: probabilityResult.probability
        };
        
        // Update displayed values
        if (sprintReward && probabilityResult.project) {
            sprintReward.textContent = '$' + probabilityResult.project.reward;
        }
        
        if (sprintDifficulty && probabilityResult.project) {
            // Format difficulty as text
            let difficultyText = 'Easy';
            if (probabilityResult.project.difficulty >= 2.5) {
                difficultyText = 'Very Hard';
            } else if (probabilityResult.project.difficulty >= 2) {
                difficultyText = 'Hard';
            } else if (probabilityResult.project.difficulty >= 1.5) {
                difficultyText = 'Medium';
            }
            sprintDifficulty.textContent = difficultyText;
        }
        
        if (sprintGpuReq) {
            sprintGpuReq.textContent = '1'; // All projects require 1 GPU for now
        }
        
        if (sprintSuccessProb) {
            // Format as percentage
            const probabilityPercentage = Math.round(probabilityResult.probability * 100);
            sprintSuccessProb.textContent = probabilityPercentage + '%';
            
            // Add color class based on probability
            sprintSuccessProb.className = 'detail-value';
            if (probabilityPercentage < 40) {
                sprintSuccessProb.classList.add('low');
            } else if (probabilityPercentage < 70) {
                sprintSuccessProb.classList.add('medium');
            } else {
                sprintSuccessProb.classList.add('high');
            }
        }
    }
    
    // Start the sprint timer
    startSprint() {
        try {
            if (!this._currentSprintData) {
                this.showNotification("Sprint data not available", "error");
                return;
            }
            
            // Check if we have enough time blocks
            if (this.gameState.getAvailableTimeBlocks() < 1) {
                this.showNotification("Not enough time blocks to start a sprint", "error");
                return;
            }
            
            // Deduct 1 time block for the sprint
            if (!this.gameState.useTimeBlock(1)) {
                this.showNotification("Could not use time block", "error");
                return;
            }
            
            // Update stats to reflect used time block
            this.updateStats();
            
            // Try to allocate GPU if requested
            if (this._currentSprintData.gpuAllocated && this.hardwareManager) {
                this.hardwareManager.allocateGPU();
                
                // Update the GPU usage bar
                const gpuBar = document.getElementById('gpu-usage-bar');
                if (gpuBar) {
                    gpuBar.style.width = '100%';
                    gpuBar.classList.add('active');
                }
            }
            
            // Hide start button, show YOLO button
            const startSprintBtn = document.getElementById('start-sprint-btn');
            const yoloBtn = document.getElementById('yolo-btn');
            
            if (startSprintBtn) {
                startSprintBtn.classList.add('hidden');
            }
            
            if (yoloBtn) {
                yoloBtn.classList.remove('hidden');
            }
            
            // Initialize timer variables - use 30 seconds for testing, 120 for production
            this._timerDuration = 120; // 2 minutes in seconds
            this._timerRemaining = this._timerDuration;
            this._timerActive = true;
            
            // Start the countdown
            this.updateTimerDisplay();
            this._timerInterval = setInterval(() => this.updateTimer(), 1000);
            
            // Show notification
            this.showNotification("Code Sprint started! Timer running...", "info");
        } catch (error) {
            console.error("Error starting sprint:", error);
            this.showNotification("Error starting sprint", "error");
        }
    }
    
    // Update the timer display and progress
    updateTimer() {
        try {
            if (!this._timerActive) return;
            
            this._timerRemaining--;
            
            // Update the display
            this.updateTimerDisplay();
            
            // Check if timer is complete
            if (this._timerRemaining <= 0) {
                this.completeSprintTimer();
            }
        } catch (error) {
            console.error("Error updating timer:", error);
            
            // Safety: stop the timer if an error occurs
            this.stopSprintTimer();
        }
    }
    
    // Update the visual timer display
    updateTimerDisplay() {
        try {
            const timerText = document.getElementById('timer-text');
            const timerCircle = document.getElementById('timer-circle');
            
            if (timerText) {
                // Format as MM:SS
                const minutes = Math.floor(this._timerRemaining / 60);
                const seconds = this._timerRemaining % 60;
                timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            if (timerCircle) {
                // Calculate the stroke dash offset based on remaining time
                const circumference = 2 * Math.PI * 68; // 2πr where r=68
                
                // Ensure _timerDuration is not zero to avoid division by zero
                const duration = this._timerDuration || 120;
                
                // Calculate dashOffset with safety checks
                let dashOffset = 0;
                if (this._timerRemaining <= duration) {
                    dashOffset = circumference * (1 - this._timerRemaining / duration);
                }
                
                timerCircle.style.strokeDasharray = circumference;
                timerCircle.style.strokeDashoffset = dashOffset;
                
                // Change color based on remaining time
                if (this._timerRemaining < duration * 0.25) {
                    timerCircle.style.stroke = '#ff3333'; // Red for last 25%
                } else if (this._timerRemaining < duration * 0.5) {
                    timerCircle.style.stroke = '#ffcc00'; // Yellow for 25-50%
                } else {
                    timerCircle.style.stroke = '#5eead4'; // Default teal
                }
            }
        } catch (error) {
            console.error("Error updating timer display:", error);
        }
    }
    
    // Stop the sprint timer
    stopSprintTimer() {
        try {
            if (this._timerInterval) {
                clearInterval(this._timerInterval);
                this._timerInterval = null;
            }
            
            this._timerActive = false;
            
            // Reset UI elements
            const startSprintBtn = document.getElementById('start-sprint-btn');
            const yoloBtn = document.getElementById('yolo-btn');
            
            if (startSprintBtn) {
                startSprintBtn.classList.remove('hidden');
            }
            
            if (yoloBtn) {
                yoloBtn.classList.add('hidden');
            }
        } catch (error) {
            console.error("Error stopping sprint timer:", error);
        }
    }
    
    // Complete the sprint timer and process results
    completeSprintTimer() {
        try {
            // Stop the timer
            this.stopSprintTimer();
            
            if (!this._currentSprintData) {
                console.error("No sprint data available for completion");
                this.showNotification("Sprint data not available", "error");
                this.showErrorResult("Missing sprint data");
                return;
            }
            
            console.log("Current sprint data:", this._currentSprintData);
            
            // Show timer completion notification
            this.showNotification("Sprint completed!", "info");
            
            // Execute the sprint with the project manager
            if (!this.projectManager) {
                console.error("Project manager not available");
                this.showNotification("Project manager not available", "error");
                this.showErrorResult("System error: Project manager not available");
                return;
            }
            
            if (!this.hardwareManager) {
                console.error("Hardware manager not available");
                this.showNotification("Hardware manager not available", "error");
                this.showErrorResult("System error: Hardware manager not available");
                return;
            }
            
            console.log("Executing sprint with timer data:", this._currentSprintData);
            
            try {
                // Ensure all required parameters are valid
                if (typeof this._currentSprintData.projectIndex !== 'number') {
                    throw new Error("Invalid project index: " + this._currentSprintData.projectIndex);
                }
                
                if (!this._currentSprintData.aiModelKey) {
                    throw new Error("Invalid AI model key: " + this._currentSprintData.aiModelKey);
                }
                
                if (!this._currentSprintData.promptKey) {
                    throw new Error("Invalid prompt key: " + this._currentSprintData.promptKey);
                }
                
                // Log the hardware manager state
                console.log("Hardware manager state:", {
                    defined: !!this.hardwareManager,
                    gpuStatus: this.hardwareManager ? this.hardwareManager.getGPUStatus() : null
                });
                
                const result = this.projectManager.executeSprintWithTimer(
                    this._currentSprintData.projectIndex,
                    this._currentSprintData.aiModelKey,
                    this._currentSprintData.promptKey,
                    this.hardwareManager,
                    "Code Sprint completed" // Simplified prompt text
                );
                
                console.log("Sprint result:", result);
                
                // Check if result is valid
                if (!result) {
                    throw new Error("Empty result returned from executeSprintWithTimer");
                }
                
                if (!result.success) {
                    throw new Error(result.message || "Failed to execute sprint");
                }
                
                // Play different sound effects based on outcome
                if (result.completed) {
                    // Play project completion sound if available
                    this.playSound('project-complete');
                } else if (result.isSprintSuccess) {
                    // Play success sound if available
                    this.playSound('sprint-success');
                } else {
                    // Play failure sound if available
                    this.playSound('sprint-fail');
                }
                
                // Hide the timer container
                document.getElementById('sprint-timer-container')?.classList.add('hidden');
                
                // Display results
                this.showSprintResult(result);
                
                // Also add to coding results history
                this.addCodingResult(result, "Code Sprint completed");
                
                // Update UI components
                this.updateStats();
                
                // Update project cards and selection to reflect new progress
                this.updateProjectSelection();
                
                // Reselect the current project if it wasn't completed
                if (!result.completed && typeof this._selectedProjectIndex !== 'undefined') {
                    // Make sure the project still exists (it might have been completed and removed)
                    if (this.gameState.activeProjects && 
                        this._selectedProjectIndex < this.gameState.activeProjects.length) {
                        this.selectProject(this._selectedProjectIndex);
                    } else if (this.gameState.activeProjects && this.gameState.activeProjects.length > 0) {
                        // Select the first project if the previous one is gone
                        this.selectProject(0);
                    }
                }
            } catch (error) {
                console.error("Error executing sprint with timer:", error);
                this.showNotification("Error processing sprint results", "error");
                
                // Hide the timer container and show error result
                document.getElementById('sprint-timer-container')?.classList.add('hidden');
                
                // Show error result
                const sprintResult = document.getElementById('sprint-result');
                if (sprintResult) {
                    sprintResult.classList.remove('hidden');
                    sprintResult.innerHTML = `
                        <div id="result-message" style="color: #ff3333;">Error Processing Sprint</div>
                        <div id="result-details">There was an error processing your sprint results. Please try again.</div>
                        <button id="continue-btn" class="action-button-large">Continue</button>
                    `;
                    
                    // Add event listener to the continue button
                    const continueBtn = document.getElementById('continue-btn');
                    if (continueBtn) {
                        continueBtn.addEventListener('click', () => {
                            sprintResult.classList.add('hidden');
                            this.showSprintWorkspace();
                        });
                    }
                }
            }
            
            // Release GPU if it was allocated
            if (this._currentSprintData.gpuAllocated) {
                this.hardwareManager.releaseGPU();
                
                // Update GPU bar
                const gpuBar = document.getElementById('gpu-usage-bar');
                if (gpuBar) {
                    gpuBar.style.width = '0%';
                    gpuBar.classList.remove('active');
                }
                
                this.updateStats();
            }
        } catch (error) {
            console.error("Error completing sprint timer:", error);
            this.showNotification("Error completing sprint", "error");
            
            // Hide the timer container
            document.getElementById('sprint-timer-container')?.classList.add('hidden');
            
            // Show a basic result
            const sprintResult = document.getElementById('sprint-result');
            if (sprintResult) {
                sprintResult.classList.remove('hidden');
                sprintResult.innerHTML = `
                    <div id="result-message" style="color: #ff3333;">Error Processing Sprint</div>
                    <div id="result-details">There was an error processing your sprint results. Please try again.</div>
                    <button id="continue-btn" class="action-button-large">Continue</button>
                `;
                
                // Add event listener to the continue button
                const continueBtn = document.getElementById('continue-btn');
                if (continueBtn) {
                    continueBtn.addEventListener('click', () => {
                        sprintResult.classList.add('hidden');
                        this.showSprintWorkspace();
                    });
                }
            }
        }
    }
    
    // Play a sound effect if available
    playSound(soundId) {
        // Optional method to play sound effects
        // This is a placeholder method - actual sound implementation would depend on the game's audio system
        try {
            if (window.game && window.game.audio && typeof window.game.audio.playSound === 'function') {
                window.game.audio.playSound(soundId);
            }
        } catch (e) {
            console.log("Sound system not available:", e);
        }
    }
    
    // Show the sprint result
    showSprintResult(result) {
        try {
            const sprintResult = document.getElementById('sprint-result');
            const resultMessage = document.getElementById('result-message');
            const resultDetails = document.getElementById('result-details');
            
            if (!sprintResult || !resultMessage || !resultDetails) {
                console.error("Sprint result elements not found");
                return;
            }
            
            // Always hide the timer container first
            const timerContainer = document.getElementById('sprint-timer-container');
            if (timerContainer) {
                timerContainer.classList.add('hidden');
            }
            
            // Hide sprint workspace
            const sprintWorkspace = document.getElementById('sprint-workspace');
            if (sprintWorkspace) {
                sprintWorkspace.classList.add('hidden');
            } else {
                console.error("Sprint workspace element not found");
            }
            
            // Show result container
            sprintResult.classList.remove('hidden');
            
            // Set result class based on success/failure/completion
            sprintResult.className = 'sprint-result';
            if (result.completed) {
                sprintResult.classList.add('completed');
            } else if (result.isSprintSuccess) {
                sprintResult.classList.add('success');
            } else {
                sprintResult.classList.add('failure');
            }
            
            // Set message with more distinct visuals for project completion
            if (result.completed) {
                resultMessage.innerHTML = `
                    <div class="completion-banner">
                        <div class="completion-icon">🏆</div>
                        <div>Project Completed!</div>
                    </div>
                `;
            } else if (result.isSprintSuccess) {
                resultMessage.textContent = `Success! 🎉 +${result.progressGained}% Progress`;
            } else {
                resultMessage.textContent = result.message || 'Sprint Failed 😕';
            }
            
            // Set details with enhanced visuals
            let detailsHTML = '';
            
            // For completed projects, show special completion banner
            if (result.completed) {
                detailsHTML += `
                    <div class="completion-details">
                        <div class="completion-reward">
                            <div class="reward-label">Reward Earned</div>
                            <div class="reward-amount">$${result.reward}</div>
                        </div>
                        ${result.multiplier > 1 ? `
                            <div class="reward-multiplier">
                                <div class="multiplier-label">Market Trend Bonus</div>
                                <div class="multiplier-value">×${result.multiplier.toFixed(1)}</div>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                // Show notification about project being moved to completed projects
                detailsHTML += `
                    <div class="completion-notification">
                        <p>👉 Project has been moved to your "Completed Projects" list</p>
                        ${result.earnedPrompt ? `<p>🎁 You earned a new prompt template: <strong>${result.earnedPrompt.name}</strong></p>` : ''}
                    </div>
                `;
            } 
            // For non-completed projects, show standard progress info
            else {
                // Add progress made
                if (result.progressGained > 0) {
                    // Show progress bar for better visualization
                    const progressAfter = result.progress || 0;
                    const progressBefore = progressAfter - result.progressGained;
                    const progressPercent = Math.min(100, Math.round(progressAfter));
                    
                    detailsHTML += `
                        <div class="progress-result">
                            <div class="progress-text">Made <strong>${result.progressGained}%</strong> progress on the project</div>
                            <div class="progress-bar-container">
                                <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
                                <div class="progress-amount">${progressPercent}%</div>
                            </div>
                            <div class="progress-before-after">
                                <span>${progressBefore}%</span>
                                <span>→</span>
                                <span>${progressAfter}%</span>
                            </div>
                        </div>
                    `;
                } else if (!result.isSprintSuccess) {
                    detailsHTML += `
                        <div class="failed-sprint">
                            <div class="failure-icon">❌</div>
                            <div>Your sprint didn't make any significant progress.</div>
                            <div class="failure-tip">Try allocating GPU or using different prompt techniques!</div>
                        </div>
                    `;
                }
            }
            
            // Add skill gains
            if (result.skillGain) {
                detailsHTML += '<div class="skill-gains"><div class="skill-gains-title">Skills gained:</div>';
                detailsHTML += '<ul class="skill-list">';
                if (result.skillGain.coding > 0) {
                    detailsHTML += `<li>Coding: <strong>+${result.skillGain.coding.toFixed(2)}</strong></li>`;
                }
                if (result.skillGain.prompt > 0) {
                    detailsHTML += `<li>Prompt Engineering: <strong>+${result.skillGain.prompt.toFixed(2)}</strong></li>`;
                }
                detailsHTML += '</ul></div>';
            }
            
            // Add GPU usage info
            if (result.gpuUsed) {
                detailsHTML += `<div class="gpu-usage-info">GPU boost applied: <strong>+${result.gpuBonus}%</strong> success probability</div>`;
            }
            
            // Add continue button with contextual label
            detailsHTML += `
                <div class="continue-action">
                    <button id="continue-btn" class="action-button-large">
                        ${result.completed ? 'Back to Projects' : 'Continue Coding'}
                    </button>
                </div>
            `;
            
            resultDetails.innerHTML = detailsHTML;
            
            // Add a notification showing project completion
            if (result.completed) {
                this.showNotification(`Project completed! Earned $${result.reward}`, "success", 8000);
            }
            
            // Ensure the continue button has an event listener
            const continueBtn = document.getElementById('continue-btn');
            if (continueBtn) {
                // Remove any existing listeners
                const newBtn = continueBtn.cloneNode(true);
                continueBtn.parentNode.replaceChild(newBtn, continueBtn);
                
                // Add new listener
                newBtn.addEventListener('click', () => {
                    sprintResult.classList.add('hidden');
                    
                    // For completed projects, go back to projects panel
                    if (result.completed) {
                        this.switchPanel('projects-panel');
                    } else {
                        this.showSprintWorkspace();
                    }
                });
            } else {
                console.error("Continue button not found");
            }
        } catch (error) {
            console.error("Error showing sprint result:", error);
        }
    }
    
    // Initialize panels
    initPanels() {
        console.log("Initializing panels");
        this.setupMainMenu();
        this.updateCompletedProjectsList();
        
        // Don't call updateProjectSelection here, it will be called when the coding panel is opened
        
        this.updateEmailList();
        this.updateActiveProjectsList();
        this.initSocialPanel();
        
        // Initialize GPU meter to 0%
        const gpuBar = document.getElementById('gpu-usage-bar');
        if (gpuBar) {
            gpuBar.style.width = '0%';
        }
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
            // Only set up event listener if it doesn't already have one
            if (!codeBtn._initialized) {
                codeBtn.addEventListener('click', function() {
                    console.log("Code Sprint button clicked - current time blocks:", self.gameState.getAvailableTimeBlocks());
                    
                    try {
                        // Check time blocks
                        if (self.gameState.getAvailableTimeBlocks() > 0 && self.gameState.useTimeBlock(1)) {
                            console.log("Time block deducted for Code Sprint - remaining:", self.gameState.getAvailableTimeBlocks());
                            
                            // Immediately update the time blocks counter in the UI
                            if (self.timeBlocks) {
                                self.timeBlocks.textContent = self.gameState.getAvailableTimeBlocks();
                            }
                            
                            // Switch to the coding panel - the critical step
                            try {
                                // Use our more robust method to show the coding panel
                                const success = self.ensureCodingPanelVisible();
                                
                                if (!success) {
                                    console.error("Failed to show coding panel with ensureCodingPanelVisible");
                                    
                                    // Fallback to direct manipulation as a last resort
                                    const codingPanel = document.getElementById('coding-panel');
                                    if (codingPanel) {
                                        // Hide all panels first
                                        document.querySelectorAll('.panel, #main-menu').forEach(panel => {
                                            panel.classList.add('hidden');
                                            panel.style.display = 'none';
                                        });
                                        
                                        // Show coding panel
                                        codingPanel.classList.remove('hidden');
                                        codingPanel.style.display = 'block';
                                        console.log("Coding panel shown with fallback method");
                                    } else {
                                        console.error("CRITICAL ERROR: Coding panel not found even in fallback!");
                                    }
                                }
                            } catch (error) {
                                console.error("Error showing coding panel:", error);
                                
                                // Last resort fallback
                                try {
                                    self.switchPanel('coding-panel');
                                } catch (e) {
                                    console.error("Even switchPanel failed:", e);
                                }
                            }
                            
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
                    } catch (error) {
                        console.error("Error in code button handler:", error);
                    }
                });
                codeBtn._initialized = true;
                console.log("Code Sprint button event listener initialized");
            } else {
                console.log("Code Sprint button already has event listener");
            }
        } else {
            console.error("Code Sprint button not found");
        }
        
        var emailBtn = document.getElementById('email-btn');
        if (emailBtn) {
            // Only set up event listener if it doesn't already have one
            if (!emailBtn._initialized) {
                emailBtn.addEventListener('click', function() {
                    console.log("Email button clicked - current time blocks:", self.gameState.getAvailableTimeBlocks());
                    if (self.gameState.getAvailableTimeBlocks() > 0 && self.gameState.useTimeBlock(1)) {
                        console.log("Time block deducted for Email - remaining:", self.gameState.getAvailableTimeBlocks());
                        self.switchPanel('email-panel');
                        self.updateEmailList();
                        self.showNotification("Checking email! (Used 1 Time Block)", "info");
                        self.updateStats();
                        
                        // Check if all time blocks are used
                        if (self.gameState.getAvailableTimeBlocks() <= 0) {
                            self.showNotification("All time blocks used! Day will end when you close the computer.", "warning");
                        }
                    } else {
                        self.showNotification("Not enough time blocks left!", "error");
                    }
                });
                emailBtn._initialized = true;
                console.log("Email button event listener initialized");
            } else {
                console.log("Email button already has event listener");
            }
        }
        
        var socialBtn = document.getElementById('social-btn');
        if (socialBtn) {
            // Only set up event listener if it doesn't already have one
            if (!socialBtn._initialized) {
                socialBtn.addEventListener('click', function() {
                    console.log("Social button clicked - current time blocks:", self.gameState.getAvailableTimeBlocks());
                    if (self.gameState.getAvailableTimeBlocks() > 0 && self.gameState.useTimeBlock(1)) {
                        console.log("Time block deducted for Social - remaining:", self.gameState.getAvailableTimeBlocks());
                        self.switchPanel('social-panel');
                        self.initSocialPanel();
                        self.showNotification("Scrolling social media! (Used 1 Time Block)", "info");
                        self.updateStats();
                        
                        // Check if all time blocks are used
                        if (self.gameState.getAvailableTimeBlocks() <= 0) {
                            self.showNotification("All time blocks used! Day will end when you close the computer.", "warning");
                        }
                    } else {
                        self.showNotification("Not enough time blocks left!", "error");
                    }
                });
                socialBtn._initialized = true;
                console.log("Social button event listener initialized");
            } else {
                console.log("Social button already has event listener");
            }
        }
        
        var shopBtn = document.getElementById('shop-btn');
        if (shopBtn) {
            // Only set up event listener if it doesn't already have one
            if (!shopBtn._initialized) {
                shopBtn.addEventListener('click', function() {
                    console.log("Shop button clicked - current time blocks:", self.gameState.getAvailableTimeBlocks());
                    if (self.gameState.getAvailableTimeBlocks() > 0 && self.gameState.useTimeBlock(1)) {
                        console.log("Time block deducted for Shop - remaining:", self.gameState.getAvailableTimeBlocks());
                        self.switchPanel('shop-panel');
                        self.showNotification("Shopping for tech! (Used 1 Time Block)", "info");
                        self.updateStats();
                        
                        // Check if all time blocks are used
                        if (self.gameState.getAvailableTimeBlocks() <= 0) {
                            self.showNotification("All time blocks used! Day will end when you close the computer.", "warning");
                        }
                    } else {
                        self.showNotification("Not enough time blocks left!", "error");
                    }
                });
                shopBtn._initialized = true;
                console.log("Shop button event listener initialized");
            } else {
                console.log("Shop button already has event listener");
            }
        }
        
        var resourcesBtn = document.getElementById('resources-btn');
        if (resourcesBtn) {
            // Only set up event listener if it doesn't already have one
            if (!resourcesBtn._initialized) {
                resourcesBtn.addEventListener('click', function() {
                    console.log("Resources button clicked - current time blocks:", self.gameState.getAvailableTimeBlocks());
                    // Resources panel doesn't consume time blocks
                    self.switchPanel('resources-panel');
                    
                    // Update resources display if resource manager exists
                    if (self.resourceManager && typeof self.resourceManager.updateResourcesDisplay === 'function') {
                        self.resourceManager.updateResourcesDisplay();
                    }
                });
                resourcesBtn._initialized = true;
                console.log("Resources button event listener initialized");
            } else {
                console.log("Resources button already has event listener");
            }
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
    
    // Update project selection
    updateProjectSelection() {
        console.log("Updating project selection");
        
        try {
            // Get the project cards container
            const projectCardsGrid = document.getElementById('project-cards-grid');
            if (!projectCardsGrid) {
                console.error("Project cards grid element not found, attempting to create it");
                
                // Try to find the container and create the grid if it doesn't exist
                const container = document.querySelector('.project-cards-container');
                if (container) {
                    const grid = document.createElement('div');
                    grid.id = 'project-cards-grid';
                    container.appendChild(grid);
                    console.log("Created project-cards-grid element");
                } else {
                    console.error("Cannot create project-cards-grid, container not found");
                    return;
                }
            }
            
            // Get the grid again in case we just created it
            const grid = document.getElementById('project-cards-grid');
            
            // Clear existing cards
            if (grid) {
                grid.innerHTML = '';
            } else {
                console.error("Failed to get project-cards-grid even after attempted creation");
                return;
            }
            
            // Ensure we have game state and active projects
            if (!this.gameState) {
                console.error("Game state not available");
                return;
            }
            
            if (!this.gameState.activeProjects) {
                console.log("No active projects array in game state, initializing");
                this.gameState.activeProjects = [];
            }
            
            // Create a card for each active project
            if (this.gameState.activeProjects.length > 0) {
                console.log(`Creating cards for ${this.gameState.activeProjects.length} active projects`);
                this.gameState.activeProjects.forEach((project, index) => {
                    // Create project card element
                    try {
                        const projectCard = this.createProjectCard(project, index);
                        grid.appendChild(projectCard);
                    } catch (err) {
                        console.error(`Error creating card for project ${index}:`, err);
                    }
                });
            } else {
                // Display message if no projects available
                console.log("No active projects found, showing empty state");
                const noProjectsMsg = document.createElement('div');
                noProjectsMsg.className = 'no-projects-message';
                noProjectsMsg.innerHTML = `
                    <p>No active projects found.</p>
                    <p>Check your email or social media for opportunities.</p>
                `;
                grid.appendChild(noProjectsMsg);
                
                // Add a demo project for testing if this is development environment
                if (this.gameState.day === 1) {
                    console.log("Adding demo project for day 1");
                    if (this.projectManager) {
                        // Add a tutorial project if none exists
                        let hasTutorial = false;
                        
                        // Check if tutorial already exists
                        if (this.gameState.activeProjects) {
                            hasTutorial = this.gameState.activeProjects.some(p => p.name === "Tutorial Project");
                        }
                        
                        if (!hasTutorial) {
                            const tutorialProject = {
                                name: "Tutorial Project",
                                type: "tutorial",
                                typeName: "Tutorial",
                                description: "A simple project to get you started with Code Sprints.",
                                difficulty: 1,
                                reward: 100,
                                requiredProgress: 100,
                                progress: 0,
                                completed: false,
                                workedOnToday: false,
                                daysTaken: 0,
                                sprints: []
                            };
                            
                            if (this.gameState.activeProjects) {
                                this.gameState.activeProjects.push(tutorialProject);
                                
                                // After adding the project, update the cards
                                try {
                                    const projectCard = this.createProjectCard(tutorialProject, this.gameState.activeProjects.length - 1);
                                    grid.appendChild(projectCard);
                                } catch (err) {
                                    console.error("Error creating card for tutorial project:", err);
                                }
                            }
                        }
                    }
                }
            }
            
            // Initialize default project selection if we have projects
            if (this.gameState.activeProjects && this.gameState.activeProjects.length > 0) {
                this.selectProject(0);
            }
            
        } catch (error) {
            console.error("Error in updateProjectSelection:", error);
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

    // Initialize event listeners for the Code Sprint UI
    initCodeSprintListeners() {
        console.log("Initializing Code Sprint listeners");
        
        try {
            // Set up GPU toggle listener
            const gpuToggle = document.getElementById('allocate-gpu-toggle');
            if (gpuToggle) {
                gpuToggle.addEventListener('change', () => {
                    // Update the GPU usage bar
                    const gpuBar = document.getElementById('gpu-usage-bar');
                    if (gpuBar) {
                        if (gpuToggle.checked) {
                            gpuBar.style.width = '100%';
                            gpuBar.classList.add('active');
                        } else {
                            gpuBar.style.width = '0%';
                            gpuBar.classList.remove('active');
                        }
                    }
                    
                    // Update success probability based on new GPU setting
                    if (typeof this.updateSuccessProbability === 'function') {
                        this.updateSuccessProbability();
                    } else {
                        console.error("updateSuccessProbability is not a function");
                    }
                });
            }
            
            // Set up Start Sprint button
            const startSprintBtn = document.getElementById('start-sprint-btn');
            if (startSprintBtn) {
                startSprintBtn.addEventListener('click', () => {
                    if (typeof this.startSprint === 'function') {
                        this.startSprint();
                    } else {
                        console.error("startSprint is not a function");
                    }
                });
            }
            
            // Set up YOLO button
            const yoloBtn = document.getElementById('yolo-btn');
            if (yoloBtn) {
                yoloBtn.addEventListener('click', () => {
                    if (typeof this.handleYolo === 'function') {
                        this.handleYolo();
                    } else {
                        console.error("handleYolo is not a function");
                    }
                });
            }
            
            // Set up Continue button
            const continueBtn = document.getElementById('continue-btn');
            if (continueBtn) {
                continueBtn.addEventListener('click', () => {
                    // Hide sprint result
                    const sprintResult = document.getElementById('sprint-result');
                    if (sprintResult) {
                        sprintResult.classList.add('hidden');
                    }
                    
                    // Show the sprint workspace again
                    if (typeof this.showSprintWorkspace === 'function') {
                        this.showSprintWorkspace();
                    } else {
                        console.error("showSprintWorkspace is not a function");
                        
                        // Fallback: show the workspace directly
                        const sprintWorkspace = document.getElementById('sprint-workspace');
                        if (sprintWorkspace) {
                            sprintWorkspace.classList.remove('hidden');
                        }
                    }
                    
                    // Reset timer display
                    if (typeof this.updateTimerDisplay === 'function') {
                        this.updateTimerDisplay();
                    } else {
                        console.error("updateTimerDisplay is not a function");
                    }
                });
            }
            
            console.log("Code Sprint listeners initialized successfully");
        } catch (error) {
            console.error("Error initializing Code Sprint listeners:", error);
        }
    }

    // Create a project card element
    createProjectCard(project, index) {
        if (!project) {
            console.error("Cannot create card for undefined project");
            // Return a placeholder card
            const placeholderCard = document.createElement('div');
            placeholderCard.className = 'project-card error';
            placeholderCard.textContent = "Error: Missing project data";
            return placeholderCard;
        }

        try {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.dataset.projectIndex = index;
            
            // Calculate progress percentage, ensuring we don't divide by zero
            const requiredProgress = project.requiredProgress || 100;
            const progressPercent = Math.min(100, Math.round((project.progress / requiredProgress) * 100));
            
            // Format difficulty as text
            let difficultyText = 'Easy';
            
            if (project.difficulty >= 2.5) {
                difficultyText = 'Very Hard';
            } else if (project.difficulty >= 2) {
                difficultyText = 'Hard';
            } else if (project.difficulty >= 1.5) {
                difficultyText = 'Medium';
            } else if (project.difficulty >= 1.2) {
                difficultyText = 'Easy';
            } else {
                difficultyText = 'Very Easy';
            }
            
            // Create card content
            card.innerHTML = `
                <div class="project-card-header">
                    <div class="project-card-title">${project.name || 'Unnamed Project'}</div>
                    <div class="project-card-type">${project.typeName || project.type || 'Unknown'}</div>
                </div>
                <div class="project-card-details">
                    <div class="project-card-detail">
                        <div class="detail-name">Difficulty:</div>
                        <div class="detail-value">${difficultyText}</div>
                    </div>
                    <div class="project-card-detail">
                        <div class="detail-name">Reward:</div>
                        <div class="detail-value">$${project.reward || 0}</div>
                    </div>
                </div>
                <div class="project-card-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">${progressPercent}% complete</div>
                </div>
            `;
            
            // Add click event to select this project
            const self = this;
            card.addEventListener('click', function() {
                self.selectProject(index);
            });
            
            return card;
        } catch (error) {
            console.error("Error creating project card:", error);
            
            // Return a fallback card on error
            const errorCard = document.createElement('div');
            errorCard.className = 'project-card error';
            errorCard.textContent = "Error creating project card";
            return errorCard;
        }
    }
    
    // Select a project by index
    selectProject(index) {
        console.log(`Selecting project at index: ${index}`);
        
        try {
            // Validate index and game state
            if (!this.gameState || !this.gameState.activeProjects) {
                console.error("Cannot select project: Game state or active projects not available");
                return;
            }
            
            if (index < 0 || index >= this.gameState.activeProjects.length) {
                console.error(`Invalid project index: ${index}, max: ${this.gameState.activeProjects.length - 1}`);
                return;
            }
            
            // Clear previous selection
            const projectCards = document.querySelectorAll('.project-card');
            projectCards.forEach(card => card.classList.remove('selected'));
            
            // Mark selected card
            const selectedCard = document.querySelector(`.project-card[data-project-index="${index}"]`);
            if (selectedCard) {
                selectedCard.classList.add('selected');
            } else {
                console.warn(`Card element for project index ${index} not found in DOM`);
            }
            
            // Get project
            const project = this.gameState.activeProjects[index];
            
            // Update selected project details
            this.updateSelectedProjectDetails(project, index);
            
            // Store the selected project index
            this._selectedProjectIndex = index;
            
            // Show the sprint workspace
            this.showSprintWorkspace();
            
            // Calculate and display success probability
            this.updateSuccessProbability();
        } catch (error) {
            console.error("Error in selectProject:", error);
        }
    }
    
    // Show the sprint workspace
    showSprintWorkspace() {
        try {
            const sprintWorkspace = document.getElementById('sprint-workspace');
            if (sprintWorkspace) {
                sprintWorkspace.classList.remove('hidden');
            } else {
                console.error("Sprint workspace element not found");
            }
        } catch (error) {
            console.error("Error in showSprintWorkspace:", error);
        }
    }
    
    // Update the selected project details display
    updateSelectedProjectDetails(project, index) {
        try {
            if (!project) {
                console.error("Cannot update details for undefined project");
                return;
            }
            
            const detailsContainer = document.getElementById('selected-project-details');
            if (!detailsContainer) {
                console.error("Selected project details container not found");
                return;
            }
            
            // Format difficulty as stars
            let difficultyStars = '';
            const difficulty = Math.min(5, Math.ceil(project.difficulty || 1));
            for (let i = 1; i <= 5; i++) {
                if (i <= difficulty) {
                    difficultyStars += '<span class="star">★</span>';
                } else {
                    difficultyStars += '<span class="star empty">☆</span>';
                }
            }
            
            // Calculate progress percentage
            const requiredProgress = project.requiredProgress || 100;
            const progressPercent = Math.min(100, Math.round((project.progress / requiredProgress) * 100));
            const remainingProgress = Math.max(0, requiredProgress - project.progress);
            
            // Determine project status text
            let statusText = 'Not Started';
            let statusClass = 'not-started';
            
            if (project.completed) {
                statusText = 'Completed';
                statusClass = 'complete';
            } else if (progressPercent >= 75) {
                statusText = 'Advanced';
                statusClass = 'advanced';
            } else if (progressPercent > 0) {
                statusText = 'In Progress';
                statusClass = 'in-progress';
            }
            
            // Format project type
            const projectType = project.typeName || this.getProjectTypeName(project.type) || project.type || 'Unknown';
            
            // Create the detailed view
            detailsContainer.innerHTML = `
                <div class="selected-project-content">
                    <div class="selected-project-header">
                        <div class="selected-project-title">${project.name || 'Unnamed Project'}</div>
                        <div class="selected-project-reward">$${project.reward || 0}</div>
                    </div>
                    
                    <div class="selected-project-metrics">
                        <div class="project-metric">
                            <div class="metric-name">Type</div>
                            <div class="metric-value">${projectType}</div>
                        </div>
                        <div class="project-metric">
                            <div class="metric-name">Difficulty</div>
                            <div class="metric-value difficulty-stars">${difficultyStars}</div>
                        </div>
                        <div class="project-metric">
                            <div class="metric-name">Status</div>
                            <div class="metric-value ${statusClass}">${statusText}</div>
                        </div>
                    </div>
                    
                    ${project.description ? `
                    <div class="selected-project-description">
                        ${project.description}
                    </div>` : ''}
                    
                    <div class="selected-project-progress">
                        <div class="progress-label">
                            <div class="progress-text">Progress: ${progressPercent}%</div>
                            <div class="progress-text">Remaining: ${remainingProgress}/${requiredProgress}</div>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("Error in updateSelectedProjectDetails:", error);
        }
    }

    // Calculate and update success probability display
    updateSuccessProbability() {
        try {
            if (typeof this._selectedProjectIndex === 'undefined') {
                console.error("No project selected for probability calculation");
                return;
            }
            
            // Validate dependencies
            if (!this.projectManager || !this.hardwareManager) {
                console.error("Cannot calculate success probability: Missing managers", {
                    hasProjectManager: !!this.projectManager,
                    hasHardwareManager: !!this.hardwareManager
                });
                return;
            }
            
            // Get selected project index
            const projectIndex = this._selectedProjectIndex;
            
            // Default AI model and prompt technique 
            const aiModelKey = 'gpt-3'; // Use default model
            const promptKey = 'basic-instruction'; // Use basic instruction prompt
            
            // Check if GPU is allocated
            const gpuToggle = document.getElementById('allocate-gpu-toggle');
            const gpuAllocated = gpuToggle && gpuToggle.checked;
            
            try {
                // Calculate success probability
                const probabilityResult = this.projectManager.calculateSuccessProbability(
                    projectIndex,
                    aiModelKey,
                    promptKey,
                    gpuAllocated
                );
                
                if (probabilityResult.success) {
                    // Update probability display
                    const probabilityElement = document.getElementById('sprint-success-prob');
                    if (probabilityElement) {
                        // Format as percentage
                        const probabilityPercentage = Math.round(probabilityResult.probability * 100);
                        probabilityElement.textContent = probabilityPercentage + '%';
                        
                        // Add color class based on probability
                        probabilityElement.className = 'probability-value';
                        if (probabilityPercentage < 40) {
                            probabilityElement.classList.add('low');
                        } else if (probabilityPercentage < 70) {
                            probabilityElement.classList.add('medium');
                        } else {
                            probabilityElement.classList.add('high');
                        }
                    }
                    
                    // Store data for timer completion
                    this._currentSprintData = {
                        projectIndex: projectIndex,
                        aiModelKey: aiModelKey,
                        promptKey: promptKey,
                        gpuAllocated: gpuAllocated,
                        probability: probabilityResult.probability
                    };
                } else {
                    console.error("Error calculating success probability:", probabilityResult.message);
                }
            } catch (e) {
                console.error("Exception in calculateSuccessProbability:", e);
                
                // Set a fallback probability
                const probabilityElement = document.getElementById('sprint-success-prob');
                if (probabilityElement) {
                    probabilityElement.textContent = "40%";
                    probabilityElement.className = 'probability-value medium';
                }
                
                // Set fallback data
                this._currentSprintData = {
                    projectIndex: projectIndex,
                    aiModelKey: aiModelKey,
                    promptKey: promptKey,
                    gpuAllocated: gpuAllocated,
                    probability: 0.4
                };
            }
        } catch (error) {
            console.error("Error in updateSuccessProbability:", error);
        }
    }

    // Handle YOLO button click (immediately finish the sprint)
    handleYolo() {
        try {
            // Just complete the timer right away
            this.completeSprintTimer();
            
            // Add a YOLO-specific notification
            this.showNotification("YOLO! Skipping the timer...", "info");
        } catch (error) {
            console.error("Error handling YOLO click:", error);
        }
    }

    // Remove any debug test elements that shouldn't be in production
    removeDebugElements() {
        console.log("Removing debug elements...");
        
        try {
            // More safely identify and remove the test banner by its style and content
            document.querySelectorAll('div').forEach(div => {
                if (div.style && div.style.background && 
                    div.style.background.includes('rgba(255, 0, 0') && 
                    div.textContent && 
                    div.textContent.includes('TEST SCRIPT SHOWING CODING PANEL')) {
                    console.log("Removing test banner safely");
                    div.remove();
                }
            });
            
            // Remove only the specific test button at the bottom left
            document.querySelectorAll('button').forEach(btn => {
                if (btn.textContent && 
                    btn.textContent.includes('TEST: Show Code Sprint') && 
                    btn.style && 
                    btn.style.position === 'fixed' && 
                    btn.style.bottom && 
                    btn.style.left) {
                    console.log("Removing test button safely");
                    btn.remove();
                }
            });
        } catch (error) {
            console.error("Error removing debug elements:", error);
        }
    }

    // Ensure coding panel is properly initialized and displayed
    ensureCodingPanelVisible() {
        console.log("Ensuring coding panel is visible and initialized...");
        
        try {
            // First check if the computer screen is visible
            if (this.computerScreen && this.computerScreen.classList.contains('hidden')) {
                this.computerScreen.classList.remove('hidden');
                this.computerScreen.style.display = 'block';
                console.log("Computer screen made visible");
            }
            
            // Get the coding panel
            const codingPanel = document.getElementById('coding-panel');
            if (!codingPanel) {
                console.error("CRITICAL ERROR: Coding panel element not found in the document!");
                return false;
            }
            
            // Hide all panels
            document.querySelectorAll('.panel, #main-menu').forEach(panel => {
                panel.classList.add('hidden');
                panel.style.display = 'none';
            });
            
            // Show the coding panel
            codingPanel.classList.remove('hidden');
            codingPanel.style.display = 'block';
            console.log("Coding panel display set to visible");
            
            // Update project selection and initialize listeners
            if (typeof this.updateProjectSelection === 'function') {
                console.log("Calling updateProjectSelection");
                this.updateProjectSelection();
            } else {
                console.error("updateProjectSelection function not found!");
            }
            
            if (typeof this.initCodeSprintListeners === 'function') {
                console.log("Calling initCodeSprintListeners");
                this.initCodeSprintListeners();
            } else {
                console.error("initCodeSprintListeners function not found!");
            }
            
            return true;
        } catch (error) {
            console.error("Error ensuring coding panel is visible:", error);
            return false;
        }
    }

    // Debug method to show the coding panel directly (if debug buttons are still active)
    debugShowCodingPanel() {
        console.log("Debug method to show coding panel directly");
        
        try {
            // Show computer screen
            if (this.computerScreen) {
                this.computerScreen.classList.remove('hidden');
                this.computerScreen.style.display = 'block';
            }
            
            // Hide all panels
            document.querySelectorAll('.panel, #main-menu').forEach(panel => {
                panel.classList.add('hidden');
                panel.style.display = 'none';
            });
            
            // Show coding panel 
            const codingPanel = document.getElementById('coding-panel');
            if (codingPanel) {
                codingPanel.classList.remove('hidden');
                codingPanel.style.display = 'block';
                
                // Try to initialize the panel properly
                if (typeof this.updateProjectSelection === 'function') {
                    this.updateProjectSelection();
                }
                
                if (typeof this.initCodeSprintListeners === 'function') {
                    this.initCodeSprintListeners();
                }
                
                return true;
            } else {
                console.error("Coding panel not found in debug method");
                return false;
            }
        } catch (error) {
            console.error("Error in debug show coding panel:", error);
            return false;
        }
    }

    // Helper to show error results
    showErrorResult(errorMessage) {
        try {
            // Hide the timer container
            document.getElementById('sprint-timer-container')?.classList.add('hidden');
            
            // Show error in the sprint result
            const sprintResult = document.getElementById('sprint-result');
            if (sprintResult) {
                sprintResult.classList.remove('hidden');
                sprintResult.className = 'sprint-result failure';
                sprintResult.innerHTML = `
                    <div id="result-message" style="color: #ff3333;">Error Processing Sprint</div>
                    <div id="result-details">
                        <p>There was an error processing your sprint results:</p>
                        <p><strong>${errorMessage || 'Unknown error'}</strong></p>
                        <p>Please try again.</p>
                    </div>
                    <button id="continue-btn" class="action-button-large">Continue</button>
                `;
                
                // Add event listener to the continue button
                const continueBtn = document.getElementById('continue-btn');
                if (continueBtn) {
                    continueBtn.addEventListener('click', () => {
                        sprintResult.classList.add('hidden');
                        this.showSprintWorkspace();
                    });
                }
            }
        } catch (error) {
            console.error("Error showing error result:", error);
        }
    }

    // Initialize test and debug buttons
    initDebugTools() {
        try {
            console.log("Initializing debug tools...");
            
            // Initialize once the DOM is fully loaded
            const setupDebugPanel = () => {
                // Simple toggle for debug panel collapse
                const debugCollapseBtn = document.getElementById('debug-collapse-btn');
                const debugPanelContent = document.getElementById('debug-panel-content');
                const debugPanelHeader = document.getElementById('debug-panel-header');
                
                if (!debugCollapseBtn || !debugPanelContent || !debugPanelHeader) {
                    console.error("Missing debug panel elements:", {
                        debugCollapseBtn: !!debugCollapseBtn, 
                        debugPanelContent: !!debugPanelContent,
                        debugPanelHeader: !!debugPanelHeader
                    });
                    return;
                }
                
                // Function to toggle debug panel
                const toggleDebugPanel = (event) => {
                    // Prevent any parent handlers from being called
                    if (event) {
                        event.stopPropagation();
                    }
                    
                    console.log("Toggle debug panel clicked");
                    
                    // Toggle collapsed class
                    debugPanelContent.classList.toggle('collapsed');
                    debugCollapseBtn.classList.toggle('collapsed');
                    
                    // Change arrow text based on state
                    if (debugPanelContent.classList.contains('collapsed')) {
                        debugCollapseBtn.textContent = '▲';
                        console.log("Debug panel collapsed");
                    } else {
                        debugCollapseBtn.textContent = '▼';
                        console.log("Debug panel expanded");
                    }
                };
                
                // Add click handlers
                debugCollapseBtn.addEventListener('click', toggleDebugPanel);
                console.log("Added click handler to debug collapse button");
                
                debugPanelHeader.addEventListener('click', (e) => {
                    // Only toggle if clicking on the header itself or the h4, not child buttons
                    if (e.target === debugPanelHeader || e.target.tagName === 'H4') {
                        toggleDebugPanel(e);
                    }
                });
                console.log("Added click handler to debug panel header");
            };
            
            // Check if document is ready
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                setupDebugPanel();
            } else {
                document.addEventListener('DOMContentLoaded', setupDebugPanel);
            }
            
            // Show Computer UI button
            const debugShowComputer = document.getElementById('debug-show-computer');
            if (debugShowComputer) {
                debugShowComputer.addEventListener('click', () => {
                    const computerScreen = document.getElementById('computer-screen');
                    if (computerScreen) {
                        computerScreen.classList.remove('hidden');
                        computerScreen.style.display = 'block';
                        console.log("Computer screen shown from debug panel");
                    }
                });
            }
            
            // Toggle Test Panels button
            const debugTogglePanels = document.getElementById('debug-toggle-panels');
            if (debugTogglePanels) {
                debugTogglePanels.addEventListener('click', () => {
                    const testElements = document.querySelectorAll('.test-element');
                    testElements.forEach(el => {
                        el.classList.toggle('hidden');
                    });
                    console.log("Test panels toggled from debug panel");
                });
            }
            
            // Add Test Project button
            const debugAddTestProject = document.getElementById('debug-add-test-project');
            if (debugAddTestProject) {
                debugAddTestProject.addEventListener('click', () => {
                    if (this.projectManager) {
                        const projectIndex = this.projectManager.addHighDifficultyProject();
                        if (typeof projectIndex === 'number') {
                            this.showNotification("Added high difficulty test project: QuantumAlgorithm", "info");
                            this.updateProjectSelection();
                            this.updateActiveProjectsList();
                            
                            // Also show computer and coding panel
                            const computerScreen = document.getElementById('computer-screen');
                            if (computerScreen) {
                                computerScreen.classList.remove('hidden');
                                computerScreen.style.display = 'block';
                                
                                // Show coding panel
                                this.switchPanel('coding-panel');
                                
                                // Select the new project
                                setTimeout(() => {
                                    this.selectProject(projectIndex);
                                }, 500);
                            }
                            
                            console.log("Test project added successfully, index:", projectIndex);
                        } else {
                            console.error("Failed to add test project, invalid index returned");
                            this.showNotification("Failed to add test project", "error");
                        }
                    } else {
                        console.error("Project manager not available");
                        this.showNotification("Project manager not available", "error");
                    }
                });
            }
            
            // Fix Sprint Error button
            const debugFixSprint = document.getElementById('debug-fix-sprint');
            if (debugFixSprint) {
                debugFixSprint.addEventListener('click', () => {
                    // Reset any broken state that might be causing issues
                    try {
                        // Reset sprint timer
                        this.stopSprintTimer();
                        
                        // Reset current sprint data with defaults
                        if (typeof this._selectedProjectIndex === 'number') {
                            this._currentSprintData = {
                                projectIndex: this._selectedProjectIndex,
                                aiModelKey: 'gpt-3',
                                promptKey: 'basic-instruction',
                                gpuAllocated: false,
                                probability: 0.5
                            };
                        }
                        
                        // Ensure necessary elements are in the correct state
                        const sprintWorkspace = document.getElementById('sprint-workspace');
                        const sprintResult = document.getElementById('sprint-result');
                        const startSprintBtn = document.getElementById('start-sprint-btn');
                        const yoloBtn = document.getElementById('yolo-btn');
                        
                        if (sprintWorkspace) sprintWorkspace.classList.remove('hidden');
                        if (sprintResult) sprintResult.classList.add('hidden');
                        if (startSprintBtn) startSprintBtn.classList.remove('hidden');
                        if (yoloBtn) yoloBtn.classList.add('hidden');
                        
                        this.showNotification("Sprint state reset. Try again.", "info");
                        console.log("Sprint state reset by debug tool");
                    } catch (error) {
                        console.error("Error in sprint fix:", error);
                    }
                });
            }
            
            // Testing Mode selector
            const debugTestingMode = document.getElementById('debug-testing-mode');
            if (debugTestingMode) {
                debugTestingMode.addEventListener('change', () => {
                    const mode = debugTestingMode.value;
                    this._debugTestingMode = mode;
                    console.log("Debug testing mode set to:", mode);
                    this.showNotification(`Testing mode: ${mode}`, "info");
                    
                    // Update any probability calculations
                    if (typeof this.updateSuccessProbability === 'function') {
                        this.updateSuccessProbability();
                    }
                });
            }
            
            console.log("Debug tools initialized successfully");
        } catch (error) {
            console.error("Error initializing debug tools:", error);
        }
    }
} 