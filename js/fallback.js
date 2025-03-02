/**
 * Vibe Coding Simulator - Simple Fallback Version
 * 
 * This file provides a standalone implementation of the core game functionality
 * without any dependencies on modules or localStorage.
 */

// Check if we should use the fallback
(function() {
    console.log("Checking if fallback is needed...");
    
    // Hide the loading screen after a timeout (whether fallback is used or not)
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
            console.log("Loading timeout reached - activating fallback");
            initializeFallbackGame();
        }
    }, 3000); // 3 second fallback timeout
    
    // Try to detect if main game failed to load
    window.addEventListener('error', function(event) {
        console.log("Error detected, might need fallback:", event);
        // Only initialize fallback if we seem to have a loading issue
        if (event.message && (
            event.message.includes("localStorage") || 
            event.message.includes("storage") || 
            event.message.includes("undefined") ||
            event.message.includes("THREE")
        )) {
            console.log("Error related to storage or modules, activating fallback");
            initializeFallbackGame();
        }
    }, true); // Use capture to catch all errors
})();

// Initialize the fallback game
function initializeFallbackGame() {
    console.log("Initializing fallback game");
    
    // Only initialize once
    if (window.fallbackInitialized) return;
    window.fallbackInitialized = true;
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
    
    // Show UI overlay
    const uiOverlay = document.getElementById('ui-overlay');
    if (uiOverlay) {
        uiOverlay.classList.remove('hidden');
    }
    
    // Create a simple 2D computer in the scene
    createSimpleComputer();
    
    // Initialize the game state
    initializeGameState();
    
    // Set up event handlers
    setupEventHandlers();
    
    console.log("Fallback game initialized successfully");
}

// Create a simple 2D computer display
function createSimpleComputer() {
    const sceneContainer = document.getElementById('scene-container');
    if (!sceneContainer) return;
    
    sceneContainer.innerHTML = `
        <div style="width: 100%; height: 100%; background-color: #121212; position: relative; overflow: hidden;">
            <!-- Simple computer representation -->
            <div id="simple-computer" style="
                cursor: pointer;
                width: 200px;
                height: 150px;
                background: linear-gradient(to bottom, #333, #222);
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border-radius: 5px;
                box-shadow: 0 0 30px rgba(54, 181, 255, 0.5);
                border: 2px solid #444;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <!-- Monitor screen -->
                <div style="
                    flex: 1;
                    background-color: #0a2a3a;
                    margin: 10px;
                    border-radius: 3px;
                    border: 1px solid #555;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #36b5ff;
                    font-family: monospace;
                    font-size: 14px;
                    text-shadow: 0 0 5px #36b5ff;
                ">
                    &gt;_
                </div>
                <!-- Base -->
                <div style="
                    height: 15px;
                    background-color: #444;
                    border-top: 1px solid #555;
                "></div>
            </div>
            
            <!-- Label -->
            <div style="
                position: absolute;
                top: 65%;
                left: 50%;
                transform: translateX(-50%);
                color: white;
                font-size: 16px;
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            ">
                Click to interact
            </div>
            
            <!-- Ambient effects -->
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at center, #1a3a4a 0%, transparent 70%);
                opacity: 0.2;
                pointer-events: none;
            "></div>
        </div>
    `;
}

// Initialize minimal game state (in memory only, no localStorage)
function initializeGameState() {
    window.gameState = {
        day: 1,
        timeBlocks: 8,
        timeBlocksUsed: 0,
        money: 1000,
        skills: {
            coding: 1,
            prompt: 1
        },
        unlockedModels: ['gpt-3'], // Starting with basic model
        dailyEvents: [], // Track events that happened during the day
        projects: [
            {
                name: "Personal Blog",
                type: "b2c",
                typeName: "B2C App",
                description: "A simple personal blog website",
                reward: 500,
                difficulty: 1,
                progress: 0,
                completed: false,
                workedOnToday: false
            }
        ],
        activeProjects: [],
        completedProjects: [],
        
        // Add a project to active projects
        addProject: function(project) {
            if (!this.activeProjects) this.activeProjects = [];
            this.activeProjects.push(project);
            
            // Log this event
            this.addDailyEvent({
                type: 'project_started',
                projectName: project.name,
                reward: project.reward
            });
            
            updateUI();
        },
        
        // Use time blocks
        useTimeBlock: function(amount) {
            if (this.timeBlocks - this.timeBlocksUsed < amount) return false;
            this.timeBlocksUsed += amount;
            
            // Log this event
            this.addDailyEvent({
                type: 'time_used',
                amount: amount
            });
            
            updateUI();
            return true;
        },
        
        // Increase skills
        increaseSkill: function(skillName, amount) {
            if (!this.skills[skillName]) this.skills[skillName] = 0;
            const oldLevel = Math.floor(this.skills[skillName]);
            this.skills[skillName] += amount;
            const newLevel = Math.floor(this.skills[skillName]);
            
            // Log this event
            this.addDailyEvent({
                type: 'skill_increased',
                skillName: skillName,
                amount: amount
            });
            
            // If level increased (whole number), add a separate event
            if (newLevel > oldLevel) {
                this.addDailyEvent({
                    type: 'level_up',
                    skillName: skillName,
                    newLevel: newLevel
                });
                
                // Check for model unlocks based on level
                if (skillName === 'prompt') {
                    if (newLevel === 3 && !this.unlockedModels.includes('gpt-3.5-turbo')) {
                        this.unlockModel('gpt-3.5-turbo', 'Prompt Engineering Level 3');
                    } else if (newLevel === 5 && !this.unlockedModels.includes('gpt-4')) {
                        this.unlockModel('gpt-4', 'Prompt Engineering Level 5');
                    }
                }
            }
            
            updateUI();
        },
        
        // Unlock a new AI model
        unlockModel: function(modelKey, reason) {
            if (!this.unlockedModels) this.unlockedModels = ['gpt-3'];
            
            if (!this.unlockedModels.includes(modelKey)) {
                this.unlockedModels.push(modelKey);
                
                // Log this event
                this.addDailyEvent({
                    type: 'model_unlocked',
                    modelName: getModelDisplayName(modelKey),
                    reason: reason
                });
                
                // Show notification
                showNotification(`New AI model unlocked: ${getModelDisplayName(modelKey)}!`, 'success');
                
                // Update the model dropdown
                updateAIModelSelection();
            }
        },
        
        // End the day
        endDay: function() {
            // Calculate daily finances
            const dailyExpenses = 50; // Basic living expenses
            this.money -= dailyExpenses;
            
            // Log daily expenses
            this.addDailyEvent({
                type: 'expense',
                amount: dailyExpenses,
                description: 'Daily living expenses'
            });
            
            // Show end of day summary
            showDaySummary();
            
            // Reset for the new day
            this.day++;
            this.timeBlocksUsed = 0;
            this.dailyEvents = []; // Clear events for the new day
            
            // Update UI
            updateUI();
            
            // Show notification for the new day
            showNotification("Day " + this.day + " begins! You have 8 new time blocks.", "info");
        },
        
        // Add an event to the daily log
        addDailyEvent: function(event) {
            if (!this.dailyEvents) this.dailyEvents = [];
            
            // Add timestamp
            event.time = new Date().toLocaleTimeString();
            
            this.dailyEvents.push(event);
        }
    };
    
    // Add starter project to active projects
    window.gameState.addProject(window.gameState.projects[0]);
    
    // Update UI with initial values
    updateUI();
}

// Set up event handlers
function setupEventHandlers() {
    // Computer click opens the main screen
    const computer = document.getElementById('simple-computer');
    if (computer) {
        computer.addEventListener('click', function() {
            const computerScreen = document.getElementById('computer-screen');
            if (computerScreen) {
                computerScreen.classList.remove('hidden');
            }
        });
    }
    
    // Close button
    const closeButton = document.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            const computerScreen = document.getElementById('computer-screen');
            if (computerScreen) {
                computerScreen.classList.add('hidden');
            }
        });
    }
    
    // Menu buttons
    document.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', function() {
            const action = button.getAttribute('data-action');
            
            // Hide all panels
            document.querySelectorAll('.panel').forEach(panel => {
                panel.classList.add('hidden');
                panel.style.display = 'none';
            });
            
            // Hide main menu
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('main-menu').style.display = 'none';
            
            // Show the appropriate panel
            if (action === 'code') {
                document.getElementById('coding-panel').classList.remove('hidden');
                document.getElementById('coding-panel').style.display = 'block';
                updateProjectInfo();
            } else if (action === 'research') {
                document.getElementById('research-panel').classList.remove('hidden');
                document.getElementById('research-panel').style.display = 'block';
                updateResearchPanel();
            } else if (action === 'projects') {
                document.getElementById('projects-panel').classList.remove('hidden');
                document.getElementById('projects-panel').style.display = 'block';
                updateProjectsList();
            } else if (action === 'skills') {
                document.getElementById('skills-panel').classList.remove('hidden');
                document.getElementById('skills-panel').style.display = 'block';
                updateSkillsPanel();
            } else if (action === 'email') {
                document.getElementById('email-panel').classList.remove('hidden');
                document.getElementById('email-panel').style.display = 'block';
            } else if (action === 'end-day') {
                window.gameState.endDay();
            }
        });
    });
    
    // Back buttons
    document.querySelectorAll('.back-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Hide all panels
            document.querySelectorAll('.panel').forEach(panel => {
                panel.classList.add('hidden');
                panel.style.display = 'none';
            });
            
            // Show main menu
            document.getElementById('main-menu').classList.remove('hidden');
            document.getElementById('main-menu').style.display = 'grid';
        });
    });
    
    // Research buttons
    document.querySelectorAll('.research-btn').forEach(button => {
        button.addEventListener('click', function() {
            const researchOption = button.closest('.research-option');
            if (!researchOption) return;
            
            const cost = parseInt(researchOption.getAttribute('data-cost'), 10);
            const type = researchOption.querySelector('h3').textContent;
            
            // Check if player has enough time blocks
            if (window.gameState.timeBlocks - window.gameState.timeBlocksUsed < cost) {
                showNotification("Not enough time blocks!", "error");
                return;
            }
            
            // Show researching animation
            button.disabled = true;
            button.innerHTML = `<span class="spinner-small"></span> Researching...`;
            
            setTimeout(() => {
                // Use time blocks
                window.gameState.useTimeBlock(cost);
                
                // Research effect
                conductResearch(type, cost, button);
            }, 1000);
        });
    });
    
    // Submit prompt button
    const submitPromptBtn = document.getElementById('submit-prompt-btn');
    if (submitPromptBtn) {
        submitPromptBtn.addEventListener('click', function() {
            handlePromptSubmission();
        });
    }
    
    // New project button
    const newProjectBtn = document.getElementById('new-project-btn');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', function() {
            createNewProject();
        });
    }
}

// Update the UI with current game state
function updateUI() {
    // Update stats panel
    document.getElementById('day-count').textContent = window.gameState.day;
    document.getElementById('time-blocks').textContent = window.gameState.timeBlocks - window.gameState.timeBlocksUsed;
    document.getElementById('money').textContent = window.gameState.money;
    document.getElementById('coding-skill').textContent = window.gameState.skills.coding.toFixed(1);
    document.getElementById('prompt-skill').textContent = window.gameState.skills.prompt.toFixed(1);
}

// Update projects list
function updateProjectsList() {
    const projectsList = document.getElementById('projects-list');
    if (!projectsList) return;
    
    // Clear existing projects
    projectsList.innerHTML = '';
    
    // Check if there are any active projects
    if (!window.gameState.activeProjects || window.gameState.activeProjects.length === 0) {
        projectsList.innerHTML = '<p class="empty-state">No active projects. Start a new project!</p>';
        return;
    }
    
    // Create project items
    window.gameState.activeProjects.forEach((project, index) => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        
        projectItem.innerHTML = `
            <div class="project-name">${project.name}</div>
            <div class="project-details">
                <div>Difficulty: ${project.difficulty}</div>
                <div>Reward: $${project.reward}</div>
                <div>Progress: ${project.progress}%</div>
            </div>
            <div class="project-progress">
                <div class="progress-fill" style="width: ${project.progress}%"></div>
            </div>
            <button class="work-on-project-btn action-button" data-index="${index}">Work on this Project</button>
        `;
        
        projectsList.appendChild(projectItem);
    });
    
    // Add event listeners to work-on-project buttons
    document.querySelectorAll('.work-on-project-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(button.getAttribute('data-index'), 10);
            window.gameState.selectedProjectIndex = index;
            
            // Switch to coding panel
            document.querySelectorAll('.panel').forEach(panel => {
                panel.classList.add('hidden');
                panel.style.display = 'none';
            });
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('main-menu').style.display = 'none';
            document.getElementById('coding-panel').classList.remove('hidden');
            document.getElementById('coding-panel').style.display = 'block';
            
            updateProjectInfo();
        });
    });
}

// Update current project info in coding panel
function updateProjectInfo() {
    const currentProjectInfo = document.getElementById('current-project-info');
    if (!currentProjectInfo) return;
    
    // Check if a project is selected
    if (window.gameState.selectedProjectIndex === undefined || window.gameState.selectedProjectIndex === null) {
        currentProjectInfo.innerHTML = '<p>No project selected. Go to Projects to select one.</p>';
        return;
    }
    
    // Get the selected project
    const project = window.gameState.activeProjects[window.gameState.selectedProjectIndex];
    if (!project) {
        currentProjectInfo.innerHTML = '<p>Selected project not found.</p>';
        return;
    }
    
    // Update project info
    currentProjectInfo.innerHTML = `
        <h3>${project.name}</h3>
        <div class="project-details">
            <div>Type: ${project.typeName || project.type}</div>
            <div>Difficulty: ${project.difficulty}</div>
            <div>Reward: $${project.reward}</div>
            <div>Progress: ${project.progress}%</div>
        </div>
        <div class="project-progress">
            <div class="progress-fill" style="width: ${project.progress}%"></div>
        </div>
    `;
    
    // Update dropdowns
    updateAIModelSelection();
    updatePromptTechniques();
}

// Handle prompt submission
function handlePromptSubmission() {
    const promptInput = document.getElementById('prompt-input');
    if (!promptInput) return;
    
    const promptText = promptInput.value.trim();
    if (promptText === '') {
        showNotification("Please enter a prompt", "warning");
        return;
    }
    
    // Check if we have enough time blocks
    if (window.gameState.timeBlocks - window.gameState.timeBlocksUsed < 1) {
        showNotification("Not enough time blocks!", "error");
        return;
    }
    
    // Check if a project is selected
    if (window.gameState.selectedProjectIndex === undefined || window.gameState.selectedProjectIndex === null) {
        showNotification("No project selected", "warning");
        return;
    }
    
    // Get the selected project
    const project = window.gameState.activeProjects[window.gameState.selectedProjectIndex];
    if (!project) {
        showNotification("Selected project not found", "error");
        return;
    }
    
    // Use a time block
    window.gameState.useTimeBlock(1);
    
    // Get model and technique selection
    const aiModelSelect = document.getElementById('ai-model-select');
    const promptTechniqueSelect = document.getElementById('prompt-technique-select');
    
    const modelName = aiModelSelect ? aiModelSelect.value : 'gpt-3';
    const techniqueName = promptTechniqueSelect ? promptTechniqueSelect.value : 'basic-instruction';
    
    // Add a visual effect to the submit button
    const submitBtn = document.getElementById('submit-prompt-btn');
    if (submitBtn) {
        submitBtn.classList.add('processing');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Processing...';
    }
    
    // Show processing indicator in coding results
    const codingResults = document.getElementById('coding-results');
    if (!codingResults) {
        // Create coding results if it doesn't exist
        const codingPanel = document.getElementById('coding-panel');
        if (codingPanel) {
            const newResultsDiv = document.createElement('div');
            newResultsDiv.id = 'coding-results';
            codingPanel.appendChild(newResultsDiv);
        }
    }
    
    // Show processing indicator
    const resultsContainer = document.getElementById('coding-results');
    if (resultsContainer) {
        // Create a new result card instead of replacing all content
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card processing';
        resultCard.innerHTML = `
            <div class="loading-indicator">
                <div class="spinner"></div>
                <p>AI is processing your prompt using ${modelName}...</p>
            </div>
        `;
        
        // Add to the beginning (newest on top)
        if (resultsContainer.firstChild) {
            resultsContainer.insertBefore(resultCard, resultsContainer.firstChild);
        } else {
            resultsContainer.appendChild(resultCard);
        }
        
        // Make sure results are visible
        resultsContainer.style.display = 'block';
    }
    
    // Calculate effectiveness based on model and technique
    const baseEffectiveness = 1.0;
    let modelMultiplier = 1.0;
    let techniqueMultiplier = 1.0;
    
    // Better models provide better results
    if (modelName === 'gpt-3.5-turbo') {
        modelMultiplier = 1.3;
    } else if (modelName === 'gpt-4') {
        modelMultiplier = 1.6;
    }
    
    // Better techniques provide better results
    if (techniqueName === 'chain-of-thought') {
        techniqueMultiplier = 1.4;
    } else if (techniqueName === 'few-shot') {
        techniqueMultiplier = 1.3;
    } else if (techniqueName === 'persona') {
        techniqueMultiplier = 1.2;
    } else if (techniqueName === 'recursive') {
        techniqueMultiplier = 1.5;
    }
    
    // Final effectiveness calculation
    const effectiveness = baseEffectiveness * modelMultiplier * techniqueMultiplier;
    
    // Generate response (simulated)
    setTimeout(() => {
        // Update project progress based on effectiveness
        const baseProgress = Math.floor(Math.random() * 10) + 5; // 5-15%
        const progressGain = Math.floor(baseProgress * effectiveness);
        
        const oldProgress = project.progress;
        project.progress += progressGain;
        if (project.progress > 100) project.progress = 100;
        
        // Track project progress in daily events
        window.gameState.addDailyEvent({
            type: 'project_progress',
            projectName: project.name,
            amount: progressGain,
            newProgress: project.progress
        });
        
        // Generate a response
        let response = '';
        response += `I've analyzed your prompt for the ${project.name} project:\n\n`;
        response += `"${promptText}"\n\n`;
        
        // Random helpful message based on project type
        const messages = getResponseMessages(project.type);
        response += messages[Math.floor(Math.random() * messages.length)];
        
        if (techniqueName !== 'basic-instruction') {
            response += `\n\nUsing the ${techniqueName} technique was ${getEffectivenessText(techniqueMultiplier)} for this task.`;
        }
        
        response += `\n\nProject progress increased by ${progressGain}%. Current progress: ${project.progress}%`;
        
        // Calculate skill gains based on model and technique
        const baseGain = 0.1;
        const codingSkillGain = baseGain + (Math.random() * 0.2);
        const promptSkillGain = baseGain + (Math.random() * 0.3);
        
        // Format for display
        const formattedResponse = response.replace(/\n/g, '<br>');
        const skillGainsHtml = `
            <div class="skill-gains">
                <h4>Skills Improved</h4>
                <ul>
                    <li>Coding: +${codingSkillGain.toFixed(1)}</li>
                    <li>Prompting: +${promptSkillGain.toFixed(1)}</li>
                </ul>
            </div>
        `;
        
        // Update the result card
        const resultsContainer = document.getElementById('coding-results');
        if (resultsContainer) {
            const processingCard = resultsContainer.querySelector('.result-card.processing');
            if (processingCard) {
                processingCard.classList.remove('processing');
                processingCard.classList.add('success');
                processingCard.innerHTML = `
                    <h3>✓ Success!</h3>
                    <div class="ai-response">${formattedResponse}</div>
                    ${skillGainsHtml}
                    <div class="progress-info">
                        <p>Project Progress:</p>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${project.progress}%"></div>
                        </div>
                        <p>${project.progress}% Complete</p>
                    </div>
                `;
                
                // Animation effect
                setTimeout(() => {
                    processingCard.classList.add('highlight');
                    setTimeout(() => {
                        processingCard.classList.remove('highlight');
                    }, 500);
                }, 10);
            }
        }
        
        // Clear the input
        promptInput.value = '';
        
        // Update project info
        updateProjectInfo();
        
        // Increase skills
        window.gameState.increaseSkill('coding', codingSkillGain);
        window.gameState.increaseSkill('prompt', promptSkillGain);
        
        // Show notification
        showNotification(`Made ${progressGain}% progress on the project!`, "success");
        
        // Reset submit button
        if (submitBtn) {
            submitBtn.classList.remove('processing');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Execute Prompt <span class="cost-indicator">(1 Time Block)</span>';
        }
        
        // Check if project is complete
        if (project.progress >= 100) {
            completeProject(project);
        }
    }, 1500);
}

// Get effectiveness text based on multiplier
function getEffectivenessText(multiplier) {
    if (multiplier >= 1.5) return "extremely effective";
    if (multiplier >= 1.3) return "very effective";
    if (multiplier >= 1.1) return "quite effective";
    return "somewhat effective";
}

// Complete a project
function completeProject(project) {
    // Complete the project
    window.gameState.money += project.reward;
    
    // Track completion in daily events
    window.gameState.addDailyEvent({
        type: 'project_completed',
        projectName: project.name,
        reward: project.reward
    });
    
    // Find project index
    const projectIndex = window.gameState.activeProjects.indexOf(project);
    
    // Show completion message
    const resultsContainer = document.getElementById('coding-results');
    if (resultsContainer) {
        const completionCard = document.createElement('div');
        completionCard.className = 'result-card project-completed';
        completionCard.innerHTML = `
            <h3>🎉 Project Completed!</h3>
            <div class="project-completed">
                <h4>Project "${project.name}" Completed!</h4>
                <p>Reward: $${project.reward}</p>
            </div>
        `;
        
        // Add to the beginning
        if (resultsContainer.firstChild) {
            resultsContainer.insertBefore(completionCard, resultsContainer.firstChild);
        } else {
            resultsContainer.appendChild(completionCard);
        }
    }
    
    showNotification(`Project "${project.name}" completed! You earned $${project.reward}!`, "success");
    
    // Move project to completed projects
    if (!window.gameState.completedProjects) window.gameState.completedProjects = [];
    window.gameState.completedProjects.push(project);
    
    // Remove from active projects
    if (projectIndex !== -1) {
        window.gameState.activeProjects.splice(projectIndex, 1);
    }
    
    // Clear selected project if it was this one
    if (window.gameState.selectedProjectIndex === projectIndex) {
        window.gameState.selectedProjectIndex = null;
    }
    
    // Update UI
    updateUI();
    updateProjectsList();
    
    // Check if we should show empty project info
    if (window.gameState.activeProjects.length === 0 || window.gameState.selectedProjectIndex === null) {
        updateProjectInfo();
    }
}

// Get response messages based on project type
function getResponseMessages(projectType) {
    const messages = {
        'b2c': [
            "I've created a user-friendly interface with intuitive navigation and responsive design.",
            "The user authentication system has been implemented with proper security measures.",
            "I've optimized the database queries to ensure fast loading times for users.",
            "The payment processing system has been integrated with proper error handling."
        ],
        'b2b': [
            "I've implemented robust data validation for the enterprise API endpoints.",
            "The reporting dashboard now includes customizable visualization options.",
            "I've enhanced the multi-tenant architecture for better resource isolation.",
            "The batch processing system has been optimized for handling large datasets."
        ],
        'game': [
            "I've implemented the game mechanics with smooth physics and collision detection.",
            "The character movement system now includes animation state management.",
            "I've optimized the rendering pipeline for better performance on various devices.",
            "The level generation algorithm has been enhanced for more variety."
        ],
        'default': [
            "I've implemented the requested functionality with good structure and error handling.",
            "I've created the feature you asked for, with clean code and proper documentation.",
            "The implementation is complete and follows best practices for maintainability.",
            "I've built what you asked for, optimizing for both performance and readability."
        ]
    };
    
    return messages[projectType] || messages.default;
}

// Create a new project
function createNewProject() {
    // Project types
    const projectTypes = [
        { name: "Personal Blog", type: "b2c", typeName: "B2C App", difficulty: 1, reward: 500 },
        { name: "E-commerce Site", type: "b2c", typeName: "B2C App", difficulty: 1.5, reward: 1000 },
        { name: "Task Manager", type: "b2c", typeName: "B2C App", difficulty: 1.2, reward: 800 }
    ];
    
    // Pick a random project type
    const randomType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
    
    // Create the project
    const newProject = {
        name: randomType.name,
        type: randomType.type,
        typeName: randomType.typeName,
        description: "A coding project",
        reward: randomType.reward,
        difficulty: randomType.difficulty,
        progress: 0,
        completed: false,
        workedOnToday: false
    };
    
    // Add to active projects
    window.gameState.activeProjects.push(newProject);
    
    // Update projects list
    updateProjectsList();
    
    // Show notification
    showNotification(`Started new project: ${newProject.name}`, "success");
}

// Update skills panel
function updateSkillsPanel() {
    const skillsList = document.querySelector('.skills-list');
    if (!skillsList) return;
    
    // Clear existing skills
    skillsList.innerHTML = '';
    
    // Create skill items
    const skills = [
        { name: 'Coding', level: window.gameState.skills.coding, description: 'Your ability to write and understand code.' },
        { name: 'Prompting', level: window.gameState.skills.prompt, description: 'Your ability to effectively instruct AI models.' }
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
}

// Show a notification
function showNotification(message, type = "info", duration = 3000) {
    const notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">${getNotificationIcon(type)}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Slide in animation
    setTimeout(() => {
        notification.classList.add('notification-show');
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
        notification.classList.add('notification-hide');
        notification.classList.remove('notification-show');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Get icon for notification type
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✓';
        case 'error': return '✗';
        case 'warning': return '⚠';
        case 'info':
        default: return 'ℹ';
    }
}

// Update research panel
function updateResearchPanel() {
    // Dynamically update research options based on player skills and progress
    const researchPanel = document.getElementById('research-panel');
    if (!researchPanel) return;
    
    // Get research options container
    const researchOptions = researchPanel.querySelector('.research-options');
    if (!researchOptions) return;
    
    // Check if we need to add any additional research options
    if (window.gameState.skills.coding >= 2 && !document.querySelector('[data-research-type="advanced-algorithms"]')) {
        // Add advanced algorithms research option
        const advancedOption = document.createElement('div');
        advancedOption.className = 'research-option';
        advancedOption.setAttribute('data-cost', '3');
        advancedOption.setAttribute('data-research-type', 'advanced-algorithms');
        
        advancedOption.innerHTML = `
            <div class="research-icon">🧠</div>
            <h3>Advanced Algorithms</h3>
            <p>Study complex algorithms and data structures</p>
            <div class="cost-tag">3 Time Blocks</div>
            <button class="research-btn action-button">Research</button>
        `;
        
        researchOptions.appendChild(advancedOption);
        
        // Add event listener
        const newButton = advancedOption.querySelector('.research-btn');
        if (newButton) {
            newButton.addEventListener('click', function() {
                const cost = 3;
                
                // Check if player has enough time blocks
                if (window.gameState.timeBlocks - window.gameState.timeBlocksUsed < cost) {
                    showNotification("Not enough time blocks!", "error");
                    return;
                }
                
                // Show researching animation
                newButton.disabled = true;
                newButton.innerHTML = `<span class="spinner-small"></span> Researching...`;
                
                setTimeout(() => {
                    // Use time blocks
                    window.gameState.useTimeBlock(cost);
                    
                    // Research effect
                    conductResearch("Advanced Algorithms", cost, newButton);
                }, 1000);
            });
        }
    }
    
    if (window.gameState.skills.prompt >= 2 && !document.querySelector('[data-research-type="prompt-engineering"]')) {
        // Add prompt engineering research option
        const promptOption = document.createElement('div');
        promptOption.className = 'research-option';
        promptOption.setAttribute('data-cost', '3');
        promptOption.setAttribute('data-research-type', 'prompt-engineering');
        
        promptOption.innerHTML = `
            <div class="research-icon">🤖</div>
            <h3>Prompt Engineering</h3>
            <p>Learn advanced techniques for AI prompting</p>
            <div class="cost-tag">3 Time Blocks</div>
            <button class="research-btn action-button">Research</button>
        `;
        
        researchOptions.appendChild(promptOption);
        
        // Add event listener
        const newButton = promptOption.querySelector('.research-btn');
        if (newButton) {
            newButton.addEventListener('click', function() {
                const cost = 3;
                
                // Check if player has enough time blocks
                if (window.gameState.timeBlocks - window.gameState.timeBlocksUsed < cost) {
                    showNotification("Not enough time blocks!", "error");
                    return;
                }
                
                // Show researching animation
                newButton.disabled = true;
                newButton.innerHTML = `<span class="spinner-small"></span> Researching...`;
                
                setTimeout(() => {
                    // Use time blocks
                    window.gameState.useTimeBlock(cost);
                    
                    // Research effect
                    conductResearch("Prompt Engineering", cost, newButton);
                }, 1000);
            });
        }
    }
}

// Conduct research with improved outcomes
function conductResearch(type, cost, buttonElement) {
    console.log(`Conducting research: ${type}, cost: ${cost}`);
    
    // Initialize discoveries if not exists
    if (!window.gameState.discoveries) {
        window.gameState.discoveries = [];
    }
    
    // Research outcomes based on type
    let skillGain = 0;
    let skillType = '';
    let discoveryChance = 0.3; // 30% chance of discovery by default
    let discoveryText = '';
    let discoveryType = '';
    
    if (type === 'Browse Forums') {
        skillType = 'prompt';
        skillGain = 0.2 + (Math.random() * 0.3);
        discoveryChance = 0.35; // 35% chance of prompt technique discovery
        discoveryType = 'prompt-technique';
    } else if (type === 'Study Documentation') {
        skillType = 'coding';
        skillGain = 0.3 + (Math.random() * 0.4);
        discoveryChance = 0.3; // 30% chance of coding pattern discovery
        discoveryType = 'coding-pattern';
    } else if (type === 'Advanced Algorithms') {
        skillType = 'coding';
        skillGain = 0.5 + (Math.random() * 0.5);
        discoveryChance = 0.4; // 40% chance of algorithm discovery
        discoveryType = 'algorithm';
    } else if (type === 'Prompt Engineering') {
        skillType = 'prompt';
        skillGain = 0.5 + (Math.random() * 0.5);
        discoveryChance = 0.45; // 45% chance of advanced prompt discovery
        discoveryType = 'advanced-prompt';
    } else {
        // Generic research - both skills
        window.gameState.increaseSkill('coding', 0.1 + (Math.random() * 0.2));
        window.gameState.increaseSkill('prompt', 0.1 + (Math.random() * 0.2));
        showNotification(`General knowledge increased!`, "success");
        
        // Reset button
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.textContent = 'Research';
        }
        
        return;
    }
    
    // Increase the relevant skill
    window.gameState.increaseSkill(skillType, skillGain);
    
    // Check for discovery
    let madeDiscovery = Math.random() < discoveryChance;
    
    // Get appropriate discovery text
    if (madeDiscovery) {
        discoveryText = getDiscoveryText(discoveryType);
        
        // Add to discoveries
        window.gameState.discoveries.push({
            type: discoveryType,
            text: discoveryText,
            date: window.gameState.day
        });
        
        // Special effects based on discovery type
        applyDiscoveryEffects(discoveryType, discoveryText);
    }
    
    // Show research results
    showResearchResults(type, skillType, skillGain, madeDiscovery, discoveryText);
    
    // Reset button
    if (buttonElement) {
        buttonElement.disabled = false;
        buttonElement.textContent = 'Research';
    }
    
    // Update UI
    updateUI();
}

// Show research results with a popup
function showResearchResults(researchType, skillType, skillGain, madeDiscovery, discoveryText) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'research-results-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';
    
    // Create results container
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'research-results';
    resultsContainer.style.backgroundColor = '#1a2c45';
    resultsContainer.style.color = 'white';
    resultsContainer.style.padding = '20px';
    resultsContainer.style.borderRadius = '10px';
    resultsContainer.style.maxWidth = '600px';
    resultsContainer.style.maxHeight = '80vh';
    resultsContainer.style.overflowY = 'auto';
    resultsContainer.style.boxShadow = '0 0 20px rgba(54, 181, 255, 0.3)';
    resultsContainer.style.border = '1px solid #36b5ff';
    
    // Create header
    const header = document.createElement('h2');
    header.textContent = 'Research Results';
    header.style.textAlign = 'center';
    header.style.marginTop = '0';
    
    // Create content
    const content = document.createElement('div');
    
    // Research description
    const description = document.createElement('p');
    description.innerHTML = getResearchDescription(researchType);
    
    // Skills gained
    const skillsGained = document.createElement('div');
    skillsGained.style.margin = '20px 0';
    skillsGained.style.padding = '10px';
    skillsGained.style.backgroundColor = '#0f1a2b';
    skillsGained.style.borderRadius = '5px';
    
    const skillName = skillType === 'coding' ? 'Coding' : 'Prompting';
    skillsGained.innerHTML = `
        <h3 style="margin-top: 0;">Skills Improved</h3>
        <p>${skillName} skill increased by ${skillGain.toFixed(1)}!</p>
    `;
    
    // Discovery section (if applicable)
    let discoverySection = document.createElement('div');
    if (madeDiscovery) {
        discoverySection.style.margin = '20px 0';
        discoverySection.style.padding = '10px';
        discoverySection.style.backgroundColor = '#2a3b55';
        discoverySection.style.borderRadius = '5px';
        discoverySection.style.border = '1px solid #ffcc36';
        
        discoverySection.innerHTML = `
            <h3 style="color: #ffcc36; margin-top: 0;">Discovery!</h3>
            <p>${discoveryText}</p>
        `;
    }
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Continue';
    closeButton.style.display = 'block';
    closeButton.style.margin = '20px auto 0';
    closeButton.style.padding = '10px 20px';
    closeButton.style.backgroundColor = '#36b5ff';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    
    closeButton.addEventListener('click', function() {
        document.body.removeChild(overlay);
    });
    
    // Assemble the results container
    resultsContainer.appendChild(header);
    resultsContainer.appendChild(description);
    resultsContainer.appendChild(skillsGained);
    if (madeDiscovery) {
        resultsContainer.appendChild(discoverySection);
    }
    resultsContainer.appendChild(closeButton);
    
    overlay.appendChild(resultsContainer);
    document.body.appendChild(overlay);
    
    // Show notification
    showNotification(`${skillType === 'coding' ? 'Coding' : 'Prompting'} skill increased by ${skillGain.toFixed(1)}!`, "success");
    
    if (madeDiscovery) {
        setTimeout(() => {
            showNotification("You made a discovery!", "success");
        }, 1000);
    }
}

// Get research description based on type
function getResearchDescription(researchType) {
    const descriptions = {
        'Browse Forums': `
            <p>You spent time browsing developer forums and AI communities, looking for insights on prompt engineering techniques.</p>
            <p>You found several interesting discussions about how to structure prompts for different types of tasks, along with examples of successful and unsuccessful approaches.</p>
        `,
        'Study Documentation': `
            <p>You carefully read through documentation for various programming languages and frameworks, focusing on best practices and patterns.</p>
            <p>The technical documentation provided valuable insights into system design, error handling, and optimization techniques.</p>
        `,
        'Advanced Algorithms': `
            <p>You studied complex algorithms and data structures, working through examples and implementation details.</p>
            <p>This deep dive into computational theory has given you insights into solving difficult technical problems more efficiently.</p>
        `,
        'Prompt Engineering': `
            <p>You analyzed advanced prompt engineering strategies used by experts in the field.</p>
            <p>Through careful study of various techniques like chain-of-thought prompting and context management, you've gained new insights into AI interaction.</p>
        `
    };
    
    return descriptions[researchType] || `<p>You conducted research on ${researchType}, learning useful information about the topic.</p>`;
}

// Get discovery text based on type
function getDiscoveryText(discoveryType) {
    const discoveries = {
        'prompt-technique': [
            "You discovered the 'Chain of Thought' technique, which helps AI models reason step-by-step through complex problems.",
            "You learned about 'Few-Shot Prompting', where providing examples guides the AI to produce more relevant outputs.",
            "You found information about 'Context Setting', which helps establish clear roles and expectations for the AI.",
            "You discovered 'Constraint Specification', a technique for explicitly defining limitations and requirements in prompts."
        ],
        'coding-pattern': [
            "You learned the 'Observer Pattern', which establishes a one-to-many dependency between objects for event notifications.",
            "You discovered the 'Factory Method Pattern', which provides an interface for creating objects without specifying their concrete classes.",
            "You found information about 'Dependency Injection', a technique for reducing coupling between components.",
            "You learned about 'Immutable Objects', which can simplify concurrent programming and improve security."
        ],
        'algorithm': [
            "You discovered 'Dijkstra's Algorithm' for finding shortest paths in weighted graphs with non-negative weights.",
            "You learned about 'A* Search Algorithm', which uses heuristics to efficiently find paths in graphs.",
            "You found information about 'Dynamic Programming', a method for solving complex problems by breaking them down into simpler subproblems.",
            "You discovered 'MapReduce', a programming model for processing large data sets with parallel, distributed algorithms."
        ],
        'advanced-prompt': [
            "You discovered 'Persona-Based Prompting', which creates a specific character role for the AI to enhance response consistency.",
            "You learned about 'Multi-Step Decomposition', breaking complex tasks into sequential prompts for better results.",
            "You found information about 'Recursive Refinement', a technique that iteratively improves outputs through self-critique.",
            "You discovered 'Meta-Prompting', where prompts are designed to elicit prompt improvements from the AI itself."
        ]
    };
    
    const typeDiscoveries = discoveries[discoveryType] || discoveries['prompt-technique'];
    return typeDiscoveries[Math.floor(Math.random() * typeDiscoveries.length)];
}

// Apply effects based on discovery type
function applyDiscoveryEffects(discoveryType, discoveryText) {
    // Add to daily events
    window.gameState.addDailyEvent({
        type: 'discovery',
        discoveryType: discoveryType,
        text: discoveryText
    });
    
    if (discoveryType === 'prompt-technique' || discoveryType === 'advanced-prompt') {
        // Unlock a new prompt technique
        if (!window.gameState.unlockedPrompts) {
            window.gameState.unlockedPrompts = [];
        }
        
        // Add new prompt techniques if not already unlocked
        const possiblePrompts = [
            { key: 'chain-of-thought', name: 'Chain of Thought' },
            { key: 'few-shot', name: 'Few-Shot Prompting' },
            { key: 'persona', name: 'Persona-Based' },
            { key: 'recursive', name: 'Recursive Refinement' }
        ];
        
        // Filter to only prompts not already unlocked
        const availablePrompts = possiblePrompts.filter(prompt => 
            !window.gameState.unlockedPrompts.some(p => p.key === prompt.key)
        );
        
        if (availablePrompts.length > 0) {
            // Unlock a random new prompt
            const newPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
            window.gameState.unlockedPrompts.push(newPrompt);
            
            console.log(`Unlocked new prompt technique: ${newPrompt.name}`);
            
            // Update prompt techniques dropdown if it exists
            updatePromptTechniques();
        }
    } else if (discoveryType === 'coding-pattern' || discoveryType === 'algorithm') {
        // Coding discoveries give a permanent coding skill bonus
        window.gameState.codingBonus = (window.gameState.codingBonus || 0) + 0.1;
        console.log(`Permanent coding bonus increased to ${window.gameState.codingBonus.toFixed(1)}`);
    }
}

// Update prompt techniques dropdown
function updatePromptTechniques() {
    const promptTechniqueSelect = document.getElementById('prompt-technique-select');
    if (!promptTechniqueSelect) return;
    
    // Clear existing options
    promptTechniqueSelect.innerHTML = '';
    
    // Add basic instruction (always available)
    const basicOption = document.createElement('option');
    basicOption.value = 'basic-instruction';
    basicOption.textContent = 'Basic Instruction';
    promptTechniqueSelect.appendChild(basicOption);
    
    // Add unlocked techniques
    if (window.gameState.unlockedPrompts && window.gameState.unlockedPrompts.length > 0) {
        window.gameState.unlockedPrompts.forEach(prompt => {
            const option = document.createElement('option');
            option.value = prompt.key;
            option.textContent = prompt.name;
            promptTechniqueSelect.appendChild(option);
        });
    }
}

// Update AI model selection dropdown
function updateAIModelSelection() {
    const aiModelSelect = document.getElementById('ai-model-select');
    if (!aiModelSelect) return;
    
    // Clear existing options
    aiModelSelect.innerHTML = '';
    
    // Get unlocked models
    const unlockedModels = window.gameState.unlockedModels || ['gpt-3'];
    
    // Add options for each unlocked model
    unlockedModels.forEach(modelKey => {
        const option = document.createElement('option');
        option.value = modelKey;
        option.textContent = getModelDisplayName(modelKey);
        aiModelSelect.appendChild(option);
    });
}

// Get display name for a model key
function getModelDisplayName(modelKey) {
    const modelNames = {
        'gpt-3': 'GPT-3 (Basic)',
        'gpt-3.5-turbo': 'GPT-3.5 Turbo',
        'gpt-4': 'GPT-4 (Advanced)'
    };
    
    return modelNames[modelKey] || modelKey;
}

// Show end of day summary
function showDaySummary() {
    // Create summary overlay
    const overlay = document.createElement('div');
    overlay.className = 'day-summary-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';
    
    // Create summary container
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'day-summary';
    summaryContainer.style.backgroundColor = '#1a2c45';
    summaryContainer.style.color = 'white';
    summaryContainer.style.padding = '30px';
    summaryContainer.style.borderRadius = '10px';
    summaryContainer.style.maxWidth = '700px';
    summaryContainer.style.maxHeight = '80vh';
    summaryContainer.style.overflowY = 'auto';
    summaryContainer.style.boxShadow = '0 0 30px rgba(54, 181, 255, 0.4)';
    summaryContainer.style.border = '1px solid #36b5ff';
    summaryContainer.style.position = 'relative';
    
    // Create header with day information
    const header = document.createElement('div');
    header.innerHTML = `
        <h2 style="text-align: center; margin-top: 0; color: #36b5ff;">Day ${window.gameState.day} Summary</h2>
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; background-color: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px;">
            <div>
                <strong>Money:</strong> $${window.gameState.money}
                <span style="color: #f44336;"> -$50</span>
            </div>
            <div>
                <strong>Coding Skill:</strong> ${window.gameState.skills.coding.toFixed(1)}
            </div>
            <div>
                <strong>Prompt Skill:</strong> ${window.gameState.skills.prompt.toFixed(1)}
            </div>
        </div>
    `;
    
    // Create activity log section
    const activitySection = document.createElement('div');
    activitySection.innerHTML = `<h3>Daily Activities</h3>`;
    
    // Group events by type
    const events = window.gameState.dailyEvents || [];
    
    // Create events container
    const eventsContainer = document.createElement('div');
    eventsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    eventsContainer.style.padding = '15px';
    eventsContainer.style.borderRadius = '8px';
    eventsContainer.style.marginBottom = '20px';
    
    if (events.length === 0) {
        eventsContainer.innerHTML = '<p style="color: #aaa; text-align: center;">No activities recorded today.</p>';
    } else {
        // Skill increases
        const skillEvents = events.filter(e => e.type === 'skill_increased');
        if (skillEvents.length > 0) {
            const skillSummary = document.createElement('div');
            skillSummary.style.marginBottom = '15px';
            skillSummary.innerHTML = `<h4>Skills Improved</h4>`;
            
            // Calculate total gains for each skill
            const skillGains = {};
            skillEvents.forEach(event => {
                const skill = event.skillName;
                if (!skillGains[skill]) skillGains[skill] = 0;
                skillGains[skill] += event.amount;
            });
            
            // Create skill gains list
            const skillList = document.createElement('ul');
            skillList.style.marginTop = '5px';
            
            for (const skill in skillGains) {
                const skillName = skill === 'coding' ? 'Coding' : 'Prompting';
                const listItem = document.createElement('li');
                listItem.innerHTML = `${skillName}: +${skillGains[skill].toFixed(1)}`;
                skillList.appendChild(listItem);
            }
            
            skillSummary.appendChild(skillList);
            eventsContainer.appendChild(skillSummary);
        }
        
        // Level ups
        const levelEvents = events.filter(e => e.type === 'level_up');
        if (levelEvents.length > 0) {
            const levelSummary = document.createElement('div');
            levelSummary.style.marginBottom = '15px';
            levelSummary.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            levelSummary.style.padding = '10px';
            levelSummary.style.borderRadius = '5px';
            levelSummary.innerHTML = `<h4 style="color: #4CAF50; margin-top: 0;">Level Ups</h4>`;
            
            const levelList = document.createElement('ul');
            levelEvents.forEach(event => {
                const skillName = event.skillName === 'coding' ? 'Coding' : 'Prompting';
                const listItem = document.createElement('li');
                listItem.innerHTML = `${skillName} reached level ${event.newLevel}!`;
                levelList.appendChild(listItem);
            });
            
            levelSummary.appendChild(levelList);
            eventsContainer.appendChild(levelSummary);
        }
        
        // Project progress
        const projectEvents = events.filter(e => e.type === 'project_started' || e.type === 'project_progress' || e.type === 'project_completed');
        if (projectEvents.length > 0) {
            const projectSummary = document.createElement('div');
            projectSummary.style.marginBottom = '15px';
            projectSummary.innerHTML = `<h4>Project Updates</h4>`;
            
            const projectList = document.createElement('ul');
            projectEvents.forEach(event => {
                const listItem = document.createElement('li');
                if (event.type === 'project_started') {
                    listItem.innerHTML = `Started new project: ${event.projectName} (Reward: $${event.reward})`;
                } else if (event.type === 'project_progress') {
                    listItem.innerHTML = `Made ${event.amount}% progress on ${event.projectName}`;
                } else if (event.type === 'project_completed') {
                    listItem.innerHTML = `<strong>Completed ${event.projectName}!</strong> Earned $${event.reward}`;
                    listItem.style.color = '#4CAF50';
                }
                projectList.appendChild(listItem);
            });
            
            projectSummary.appendChild(projectList);
            eventsContainer.appendChild(projectSummary);
        }
        
        // Discoveries
        const discoveryEvents = events.filter(e => e.type === 'discovery');
        if (discoveryEvents.length > 0) {
            const discoverySummary = document.createElement('div');
            discoverySummary.style.marginBottom = '15px';
            discoverySummary.style.backgroundColor = 'rgba(255, 204, 54, 0.1)';
            discoverySummary.style.padding = '10px';
            discoverySummary.style.borderRadius = '5px';
            discoverySummary.innerHTML = `<h4 style="color: #ffcc36; margin-top: 0;">Discoveries</h4>`;
            
            const discoveryList = document.createElement('ul');
            discoveryEvents.forEach(event => {
                const listItem = document.createElement('li');
                listItem.textContent = event.text;
                discoveryList.appendChild(listItem);
            });
            
            discoverySummary.appendChild(discoveryList);
            eventsContainer.appendChild(discoverySummary);
        }
    }
    
    activitySection.appendChild(eventsContainer);
    
    // Create project status section
    const projectsSection = document.createElement('div');
    projectsSection.innerHTML = `<h3>Project Status</h3>`;
    
    const projectsContainer = document.createElement('div');
    projectsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    projectsContainer.style.padding = '15px';
    projectsContainer.style.borderRadius = '8px';
    
    if (window.gameState.activeProjects.length === 0) {
        projectsContainer.innerHTML = '<p style="color: #aaa; text-align: center;">No active projects.</p>';
    } else {
        const projectsList = document.createElement('div');
        projectsList.style.display = 'grid';
        projectsList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        projectsList.style.gap = '10px';
        
        window.gameState.activeProjects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.style.backgroundColor = 'rgba(26, 54, 95, 0.5)';
            projectCard.style.padding = '10px';
            projectCard.style.borderRadius = '5px';
            projectCard.style.border = '1px solid rgba(54, 181, 255, 0.3)';
            
            projectCard.innerHTML = `
                <div style="font-weight: bold; color: #36b5ff;">${project.name}</div>
                <div style="font-size: 0.9em; margin: 5px 0;">${project.typeName || project.type}</div>
                <div style="margin: 8px 0;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.9em;">
                        <span>Progress: ${project.progress}%</span>
                        <span>Reward: $${project.reward}</span>
                    </div>
                    <div style="height: 8px; background-color: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; margin-top: 5px;">
                        <div style="height: 100%; width: ${project.progress}%; background: linear-gradient(to right, #36b5ff, #5e64ff);"></div>
                    </div>
                </div>
            `;
            
            projectsList.appendChild(projectCard);
        });
        
        projectsContainer.appendChild(projectsList);
    }
    
    projectsSection.appendChild(projectsContainer);
    
    // Next day preview section
    const previewSection = document.createElement('div');
    previewSection.style.marginTop = '20px';
    previewSection.style.textAlign = 'center';
    previewSection.innerHTML = `
        <h3>Day ${window.gameState.day + 1} Preview</h3>
        <div style="background-color: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 8px; text-align: center;">
            <p>You'll have 8 time blocks to use for coding and research.</p>
            <p style="color: #aaa; font-style: italic;">Get rest and prepare for another productive day of development!</p>
        </div>
    `;
    
    // Continue button
    const continueButton = document.createElement('button');
    continueButton.textContent = 'Start Next Day';
    continueButton.style.display = 'block';
    continueButton.style.margin = '30px auto 0';
    continueButton.style.padding = '12px 25px';
    continueButton.style.backgroundColor = '#36b5ff';
    continueButton.style.color = 'white';
    continueButton.style.border = 'none';
    continueButton.style.borderRadius = '5px';
    continueButton.style.cursor = 'pointer';
    continueButton.style.fontSize = '16px';
    continueButton.style.fontWeight = 'bold';
    continueButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
    continueButton.style.transition = 'all 0.3s ease';
    
    continueButton.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#2196f3';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 15px rgba(33, 150, 243, 0.4)';
    });
    
    continueButton.addEventListener('mouseout', function() {
        this.style.backgroundColor = '#36b5ff';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
    });
    
    continueButton.addEventListener('click', function() {
        document.body.removeChild(overlay);
    });
    
    // Assemble the summary container
    summaryContainer.appendChild(header);
    summaryContainer.appendChild(activitySection);
    summaryContainer.appendChild(projectsSection);
    summaryContainer.appendChild(previewSection);
    summaryContainer.appendChild(continueButton);
    
    overlay.appendChild(summaryContainer);
    document.body.appendChild(overlay);
}
