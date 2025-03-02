class Game {
    constructor() {
        console.log("Starting Game initialization");
        
        try {
            // Create game state first
            this.createGameState();
            
            // Then initialize the rest
            this.init();
            console.log("Game initialization completed successfully");
        } catch (error) {
            console.error("Error during Game initialization:", error);
            // Still show a basic UI even on error
            this.createFallbackUI();
            throw error; // Re-throw to allow higher-level handling
        }
    }
    
    // Create game state with error handling
    createGameState() {
        try {
            console.log("Creating GameState");
            this.gameState = new GameState();
            // Make it globally accessible for debugging
            window.gameState = this.gameState;
        } catch (error) {
            console.error("Failed to create GameState:", error);
            // Create a minimal game state
            this.gameState = {
                day: 1,
                timeBlocks: 8,
                timeBlocksUsed: 0,
                money: 1000,
                skills: { coding: 1, prompt: 1 },
                projects: [],
                activeProjects: []
            };
            window.gameState = this.gameState;
        }
    }
    
    // Create a minimal fallback UI
    createFallbackUI() {
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) setTimeout(() => loadingScreen.classList.add('hidden'), 500);
        
        // Show UI overlay
        const uiOverlay = document.getElementById('ui-overlay');
        if (uiOverlay) uiOverlay.classList.remove('hidden');
        
        // Add a simple interactive element
        const sceneContainer = document.getElementById('scene-container');
        if (sceneContainer) {
            sceneContainer.innerHTML = `
                <div style="cursor: pointer; width: 150px; height: 150px; background-color: #333; 
                     position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                     border-radius: 5px; border: 2px solid #555; display: flex;
                     justify-content: center; align-items: center; color: white;
                     box-shadow: 0 0 20px rgba(54, 181, 255, 0.5);">
                    <div>
                        <div style="text-align: center; font-size: 20px;">💻</div>
                        <div style="text-align: center; margin-top: 10px;">Computer</div>
                    </div>
                </div>
            `;
            
            // Add click event listener to open the computer screen
            sceneContainer.querySelector('div').addEventListener('click', () => {
                const computerScreen = document.getElementById('computer-screen');
                if (computerScreen) computerScreen.classList.remove('hidden');
            });
        }
    }

    init() {
        // Initialize the scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x111111);
        document.getElementById('scene-container').appendChild(this.renderer.domElement);

        // Basic lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 10, 10);
        this.scene.add(directionalLight);

        // Initialize the room
        this.createRoom();

        // Position camera
        this.camera.position.set(0, 1.6, 3);
        this.camera.lookAt(0, 1, 0);

        // Set up interaction
        this.setupInteraction();

        // Create game state
        gameState = new GameState();

        // Hide loading screen and show UI after all assets are loaded
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
            document.getElementById('ui-overlay').classList.remove('hidden');
            this.updateUI();
        }, 2000);

        // Start animation loop
        this.animate();
    }

    createRoom() {
        // Simple room with desk and computer
        const roomGeometry = new THREE.BoxGeometry(10, 8, 10);
        const roomMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8d8d8d, 
            side: THREE.BackSide,
            roughness: 0.8,
            metalness: 0.2
        });
        const room = new THREE.Mesh(roomGeometry, roomMaterial);
        this.scene.add(room);

        // Create desk
        const deskGeometry = new THREE.BoxGeometry(2, 0.1, 1);
        const deskMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x5c3c2e,
            roughness: 0.7 
        });
        const desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.set(0, 0.7, -1);
        this.scene.add(desk);

        // Create computer
        const computerBaseGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.5);
        const computerBaseMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            roughness: 0.5
        });
        const computerBase = new THREE.Mesh(computerBaseGeometry, computerBaseMaterial);
        computerBase.position.set(0, 1, -1);
        this.scene.add(computerBase);

        const monitorGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.05);
        const monitorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            roughness: 0.4
        });
        const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
        monitor.position.set(0, 1.5, -1.1);
        this.scene.add(monitor);

        // Add screen as interactive element
        const screenGeometry = new THREE.PlaneGeometry(1.1, 0.7);
        const screenMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x1a1a1a,
            emissive: 0x0f4c81,
            emissiveIntensity: 0.5
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, 1.5, -1.07);
        this.scene.add(screen);
        this.computerScreen = screen;

        // Add ambient effects to the room
        this.addRoomAmbience();
    }

    addRoomAmbience() {
        // Add some small desk items
        const mugGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.15, 16);
        const mugMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
        const mug = new THREE.Mesh(mugGeometry, mugMaterial);
        mug.position.set(0.6, 0.8, -0.8);
        this.scene.add(mug);
        
        // Add small plant
        const potGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.12, 16);
        const potMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
        const pot = new THREE.Mesh(potGeometry, potMaterial);
        pot.position.set(-0.6, 0.8, -0.8);
        this.scene.add(pot);
        
        // Plant leaves (simple shape)
        const plantGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
        const plantTop = new THREE.Mesh(plantGeometry, plantMaterial);
        plantTop.position.set(-0.6, 0.95, -0.8);
        plantTop.scale.set(1, 0.8, 1);
        this.scene.add(plantTop);
        
        // Add lamp
        const lampBaseGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.05, 16);
        const lampPoleMaterial = new THREE.MeshStandardMaterial({ color: 0x616161 });
        const lampBase = new THREE.Mesh(lampBaseGeometry, lampPoleMaterial);
        lampBase.position.set(-0.8, 0.75, -1);
        this.scene.add(lampBase);
        
        // Lamp pole
        const lampPoleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
        const lampPole = new THREE.Mesh(lampPoleGeometry, lampPoleMaterial);
        lampPole.position.set(-0.8, 0.95, -1);
        this.scene.add(lampPole);
        
        // Lamp shade
        const lampShadeGeometry = new THREE.ConeGeometry(0.15, 0.2, 16, 1, true);
        const lampShadeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf5f5f5,
            side: THREE.DoubleSide
        });
        const lampShade = new THREE.Mesh(lampShadeGeometry, lampShadeMaterial);
        lampShade.position.set(-0.8, 1.15, -1);
        lampShade.rotation.x = Math.PI;
        this.scene.add(lampShade);
        
        // Add lamp light
        const lampLight = new THREE.PointLight(0xffeecc, 0.8, 2);
        lampLight.position.set(-0.8, 1.1, -1);
        this.scene.add(lampLight);
        
        // Add subtle pulsing effect to lamp
        this.lampLight = lampLight;
    }

    setupInteraction() {
        // Raycaster for interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Add click event listener
        window.addEventListener('click', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObject(this.computerScreen);

            if (intersects.length > 0) {
                this.openComputer();
            }
        });

        // Add close button functionality
        document.querySelector('.close-button').addEventListener('click', () => {
            this.closeComputer();
        });

        // Add click handlers for menu buttons
        document.querySelectorAll('.menu-button').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.getAttribute('data-action');
                this.handleMenuAction(action);
            });
        });

        // Add handlers for back buttons
        document.querySelectorAll('.back-btn').forEach(button => {
            button.addEventListener('click', () => {
                this.showMainMenu();
            });
        });

        // Setup handlers for other buttons
        document.getElementById('submit-prompt-btn').addEventListener('click', () => {
            this.submitPrompt();
        });

        document.getElementById('new-project-btn').addEventListener('click', () => {
            this.startNewProject();
        });

        document.querySelectorAll('.research-btn').forEach(button => {
            button.addEventListener('click', () => {
                const cost = parseInt(button.closest('.research-option').getAttribute('data-cost'));
                const type = button.closest('.research-option').querySelector('h3').textContent;
                this.conductResearch(type, cost);
            });
        });
    }

    openComputer() {
        const computerScreen = document.getElementById('computer-screen');
        computerScreen.classList.remove('hidden');
        
        // Apply opening animation effect
        computerScreen.classList.add('opening');
        setTimeout(() => {
            computerScreen.classList.remove('opening');
        }, 600);
    }

    closeComputer() {
        const computerScreen = document.getElementById('computer-screen');
        computerScreen.classList.add('closing');
        
        setTimeout(() => {
            computerScreen.classList.remove('closing');
            computerScreen.classList.add('hidden');
        }, 300);
    }

    // Handle menu button clicks
    handleMenuAction(action) {
        // Hide all panels
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.add('hidden');
        });

        // Hide main menu
        document.getElementById('main-menu').classList.add('hidden');

        // Show appropriate panel
        switch (action) {
            case 'code':
                document.getElementById('coding-panel').classList.remove('hidden');
                this.updateProjectInfo();
                break;
            case 'research':
                document.getElementById('research-panel').classList.remove('hidden');
                break;
            case 'projects':
                document.getElementById('projects-panel').classList.remove('hidden');
                this.updateProjects();
                break;
            case 'email':
                document.getElementById('email-panel').classList.remove('hidden');
                this.updateEmails();
                break;
            case 'skills':
                document.getElementById('skills-panel').classList.remove('hidden');
                this.updateSkills();
                break;
            case 'end-day':
                this.endDay();
                break;
        }
    }

    showMainMenu() {
        // Hide all panels
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.add('hidden');
        });

        // Show main menu
        document.getElementById('main-menu').classList.remove('hidden');
    }

    updateUI() {
        // Update the stats panel
        document.getElementById('day-count').textContent = gameState.day;
        document.getElementById('time-blocks').textContent = gameState.timeBlocks;
        document.getElementById('money').textContent = gameState.money;
        document.getElementById('coding-skill').textContent = gameState.skills.coding;
        document.getElementById('prompt-skill').textContent = gameState.skills.prompting;
        
        // Update available AI models in the dropdown
        this.updateAIModelDropdown();
        
        // Apply UI enhancements when interacting
        this.enhanceUIElements();
    }
    
    enhanceUIElements() {
        // Add glow effects to UI based on player progress
        const codingSkill = gameState.skills.coding;
        const promptSkill = gameState.skills.prompting;
        
        // Create dynamic skill level indicators
        this.updateSkillVisualization(codingSkill, promptSkill);
        
        // Add visual feedback for money changes
        const moneyDisplay = document.getElementById('money');
        if (gameState.lastMoneyChange && gameState.lastMoneyChange > 0) {
            showFloatingNumber(moneyDisplay, `+$${gameState.lastMoneyChange}`, 'gain');
            gameState.lastMoneyChange = 0;
        } else if (gameState.lastMoneyChange && gameState.lastMoneyChange < 0) {
            showFloatingNumber(moneyDisplay, `-$${Math.abs(gameState.lastMoneyChange)}`, 'loss');
            gameState.lastMoneyChange = 0;
        }
    }

    updateSkillVisualization(codingSkill, promptSkill) {
        const skillViz = document.querySelector('.skill-visualization');
        if (!skillViz) return;
        
        // Update skill visualization if on the skills panel
        if (!document.getElementById('skills-panel').classList.contains('hidden')) {
            updateSkillVisualization(codingSkill, promptSkill);
        }
    }

    updateAIModelDropdown() {
        const aiModelSelect = document.getElementById('ai-model-select');
        
        // Clear existing options
        aiModelSelect.innerHTML = '';
        
        // Get available models from gameState
        const availableModels = AIModelManager.getAvailableModels(gameState.unlocks);
        
        // Add options for each available model
        availableModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = `${model.name} - $${model.costPerUse} per use`;
            aiModelSelect.appendChild(option);
        });
        
        // Add prompt technique options
        const promptTechniqueSelect = document.getElementById('prompt-technique-select');
        promptTechniqueSelect.innerHTML = '';
        
        // Add basic option (always available)
        const basicOption = document.createElement('option');
        basicOption.value = 'basic';
        basicOption.textContent = 'Basic Instructions';
        promptTechniqueSelect.appendChild(basicOption);
        
        // Add any unlocked prompts from the library
        gameState.promptLibrary.getUnlockedPrompts().forEach(prompt => {
            const option = document.createElement('option');
            option.value = prompt.id;
            option.textContent = prompt.name;
            promptTechniqueSelect.appendChild(option);
        });
    }

    updateProjects() {
        const projectsList = document.getElementById('projects-list');
        projectsList.innerHTML = '';
        
        // Get projects from gameState
        const projects = gameState.projects;
        
        if (projects.length === 0) {
            projectsList.innerHTML = '<p class="empty-state">No active projects. Start a new one!</p>';
            return;
        }
        
        // Create project items
        projects.forEach(project => {
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
                <button class="work-on-project-btn action-button" data-project-id="${project.id}">Work on this Project</button>
            `;
            
            projectsList.appendChild(projectItem);
        });
        
        // Add click handlers for project buttons
        document.querySelectorAll('.work-on-project-btn').forEach(button => {
            button.addEventListener('click', () => {
                const projectId = button.getAttribute('data-project-id');
                this.selectProject(projectId);
            });
        });
    }

    selectProject(projectId) {
        // Set active project in gameState
        gameState.setActiveProject(projectId);
        
        // Switch to coding panel
        this.handleMenuAction('code');
    }

    updateProjectInfo() {
        const projectInfo = document.getElementById('current-project-info');
        const activeProject = gameState.getActiveProject();
        
        if (!activeProject) {
            projectInfo.innerHTML = '<p>No active project selected. Go to Projects to select one.</p>';
            document.getElementById('submit-prompt-btn').disabled = true;
            return;
        }
        
        projectInfo.innerHTML = `
            <h3>${activeProject.name}</h3>
            <div class="project-details">
                <div>Difficulty: ${activeProject.difficulty}</div>
                <div>Reward: $${activeProject.reward}</div>
                <div>Progress: ${activeProject.progress}%</div>
            </div>
            <div class="project-progress">
                <div class="progress-fill" style="width: ${activeProject.progress}%"></div>
            </div>
        `;
        
        document.getElementById('submit-prompt-btn').disabled = false;
    }

    submitPrompt() {
        const promptInput = document.getElementById('prompt-input');
        const aiModelSelect = document.getElementById('ai-model-select');
        const promptTechniqueSelect = document.getElementById('prompt-technique-select');
        
        if (gameState.timeBlocks <= 0) {
            this.showNotification('No time blocks left for today!');
            return;
        }
        
        const prompt = promptInput.value.trim();
        if (prompt === '') {
            this.showNotification('Please enter a prompt!');
            return;
        }
        
        const modelId = aiModelSelect.value;
        const promptTechnique = promptTechniqueSelect.value;
        
        // Get details from AIModelManager
        const model = AIModelManager.getModelById(modelId);
        
        // Check if player can afford this model
        if (gameState.money < model.costPerUse) {
            this.showNotification(`Not enough money! You need $${model.costPerUse}.`);
            return;
        }
        
        // Get prompt from library if using a template
        let promptTemplate = null;
        if (promptTechnique !== 'basic') {
            promptTemplate = gameState.promptLibrary.getPromptById(promptTechnique);
        }
        
        // Process the coding attempt
        const result = this.processCodingAttempt(prompt, model, promptTemplate);
        
        // Display result in the UI with animations
        displayCodingResult(result);
        
        // Update game state
        gameState.useTimeBlock();
        gameState.spendMoney(model.costPerUse);
        this.updateUI();
        
        // Clear prompt input for next attempt
        promptInput.value = '';
    }

    processCodingAttempt(prompt, model, promptTemplate) {
        const activeProject = gameState.getActiveProject();
        
        if (!activeProject) {
            return {
                success: false,
                response: "No project selected!",
                projectProgress: 0
            };
        }
        
        // Calculate base success chance based on difficulty and model
        let successChance = 0.5; // Base 50% chance
        
        // Adjust for project difficulty (higher difficulty = lower chance)
        const difficultyPenalty = {
            'Easy': 0,
            'Medium': 0.1,
            'Hard': 0.2,
            'Very Hard': 0.3
        };
        
        successChance -= difficultyPenalty[activeProject.difficulty] || 0;
        
        // Adjust for model quality
        successChance += model.reasoningBoost;
        
        // Adjust for prompt quality
        const promptQualityBoost = Math.min(0.3, prompt.length / 500 * 0.3); // Up to 30% for long prompts
        successChance += promptQualityBoost;
        
        // Adjust for player skills
        successChance += gameState.skills.coding * 0.03; // 3% per coding level
        successChance += gameState.skills.prompting * 0.03; // 3% per prompting level
        
        // Apply template bonus if applicable
        if (promptTemplate) {
            successChance += promptTemplate.successBoost;
        }
        
        // Cap success chance between 10% and 95%
        successChance = Math.max(0.1, Math.min(0.95, successChance));
        
        // Determine success
        const success = Math.random() < successChance;
        
        // Calculate progress increase
        let progressIncrease = 0;
        if (success) {
            // Base progress on difficulty
            const baseProgress = {
                'Easy': 25,
                'Medium': 20,
                'Hard': 15,
                'Very Hard': 10
            };
            
            progressIncrease = baseProgress[activeProject.difficulty] || 15;
            
            // Add bonuses from skills and model
            progressIncrease += gameState.skills.coding * 2; // +2% per coding level
            progressIncrease += model.reasoningBoost * 10; // Scale reasoning boost to progress
            
            // Apply template bonus if applicable
            if (promptTemplate) {
                progressIncrease += promptTemplate.progressBoost;
            }
        } else {
            // Some small progress even on failure
            progressIncrease = Math.random() * 5 + 1; // 1-6% progress
        }
        
        // Update project progress
        gameState.updateProjectProgress(activeProject.id, progressIncrease);
        
        // Increase skills
        const codingSkillGain = success ? 0.1 : 0.05;
        const promptingSkillGain = success ? 0.15 : 0.07;
        
        gameState.increaseSkill('coding', codingSkillGain);
        gameState.increaseSkill('prompting', promptingSkillGain);
        
        // Check if project is completed
        const projectCompleted = activeProject.progress >= 100;
        
        let result = {
            success: success,
            response: this.generateAIResponse(success, model),
            projectProgress: Math.min(100, activeProject.progress),
            skillGains: {
                'Coding': codingSkillGain.toFixed(2),
                'Prompting': promptingSkillGain.toFixed(2)
            }
        };
        
        // Add project completion info if applicable
        if (projectCompleted) {
            const reward = activeProject.reward;
            gameState.completeProject(activeProject.id);
            gameState.addMoney(reward);
            
            // Sometimes unlock a new prompt
            let promptReward = null;
            if (Math.random() < 0.3) { // 30% chance
                promptReward = gameState.promptLibrary.unlockRandomPrompt();
            }
            
            result.projectCompleted = true;
            result.projectName = activeProject.name;
            result.reward = reward;
            result.promptReward = promptReward;
        }
        
        return result;
    }

    generateAIResponse(success, model) {
        // Generate a simulated AI response
        if (success) {
            const responses = [
                "I've implemented the requested functionality. The code follows best practices and includes error handling.",
                "Task completed successfully. I've optimized the implementation for performance and readability.",
                "Implementation complete. I've included comments to explain the logic and design decisions.",
                "I've finished the implementation with comprehensive test coverage. All edge cases are handled."
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        } else {
            const responses = [
                "I'm having trouble understanding the specific requirements. Could you provide more details?",
                "There seems to be some constraints I'm unsure about. Please clarify the expected behavior.",
                "I'm encountering some issues with the implementation. The approach might need refinement.",
                "The requirements are complex. I've made progress but need more guidance on the edge cases."
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }

    startNewProject() {
        // Generate random projects to choose from
        const projectTypes = [
            { name: "E-commerce Site", difficulty: "Medium", reward: 1000 },
            { name: "Personal Blog", difficulty: "Easy", reward: 500 },
            { name: "Task Manager", difficulty: "Easy", reward: 600 },
            { name: "Social Media Dashboard", difficulty: "Hard", reward: 1500 },
            { name: "Data Visualization Tool", difficulty: "Hard", reward: 1600 },
            { name: "Mobile App", difficulty: "Very Hard", reward: 2000 },
            { name: "API Integration", difficulty: "Medium", reward: 1200 },
            { name: "Authentication System", difficulty: "Medium", reward: 1100 }
        ];
        
        // If player has high coding skill, add more advanced projects
        if (gameState.skills.coding >= 5) {
            projectTypes.push(
                { name: "AI Assistant Integration", difficulty: "Very Hard", reward: 2500 },
                { name: "Real-time Collaboration Tool", difficulty: "Very Hard", reward: 2800 }
            );
        }
        
        // Select 3 random projects to offer
        const offeredProjects = [];
        const usedIndices = new Set();
        
        while (offeredProjects.length < 3 && usedIndices.size < projectTypes.length) {
            const index = Math.floor(Math.random() * projectTypes.length);
            if (!usedIndices.has(index)) {
                usedIndices.add(index);
                offeredProjects.push(projectTypes[index]);
            }
        }
        
        // Randomize project names slightly
        offeredProjects.forEach(project => {
            const variants = [
                `${project.name} for Client A`,
                `${project.name} Redesign`,
                `Modern ${project.name}`,
                `${project.name} v2.0`,
                `${project.name} with React`,
                `${project.name} with Vue.js`,
                `${project.name} with Angular`
            ];
            
            project.name = variants[Math.floor(Math.random() * variants.length)];
            
            // Add small random variation to reward
            const variation = Math.floor(Math.random() * (project.reward * 0.2)) - (project.reward * 0.1);
            project.reward += variation;
        });
        
        // Create project selection UI
        const projectsList = document.getElementById('projects-list');
        projectsList.innerHTML = '<h3>Choose a Project:</h3>';
        
        offeredProjects.forEach((project, index) => {
            const projectItem = document.createElement('div');
            projectItem.className = 'project-item';
            
            projectItem.innerHTML = `
                <div class="project-name">${project.name}</div>
                <div class="project-details">
                    <div>Difficulty: ${project.difficulty}</div>
                    <div>Reward: $${project.reward}</div>
                </div>
                <button class="select-project-btn action-button" data-index="${index}">Select Project</button>
            `;
            
            projectsList.appendChild(projectItem);
        });
        
        // Add click handlers for project selection
        document.querySelectorAll('.select-project-btn').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.getAttribute('data-index'));
                this.createNewProject(offeredProjects[index]);
            });
        });
    }

    createNewProject(projectData) {
        // Add the project to game state
        const projectId = gameState.addProject(projectData.name, projectData.difficulty, projectData.reward);
        
        // Update projects list
        this.updateProjects();
        
        // Select the new project
        this.selectProject(projectId);
        
        // Show notification
        this.showNotification(`Started new project: ${projectData.name}`);
    }

    conductResearch(type, cost) {
        if (gameState.timeBlocks < cost) {
            this.showNotification(`Not enough time blocks! Need ${cost}.`);
            return;
        }
        
        // Use time blocks
        gameState.useTimeBlocks(cost);
        
        // Determine results based on research type
        if (type === 'Browse Forums') {
            // Increase prompting skill
            const skillGain = 0.2 + (Math.random() * 0.3);
            gameState.increaseSkill('prompting', skillGain);
            
            // Show notification
            this.showNotification(`Prompting skill increased by ${skillGain.toFixed(2)}!`);
            
            // Small chance to unlock a new prompt
            if (Math.random() < 0.15) { // 15% chance
                const newPrompt = gameState.promptLibrary.unlockRandomPrompt();
                if (newPrompt) {
                    this.showNotification(`New prompt template unlocked: ${newPrompt.name}`);
                }
            }
        } else if (type === 'Study Documentation') {
            // Increase coding skill
            const skillGain = 0.3 + (Math.random() * 0.4);
            gameState.increaseSkill('coding', skillGain);
            
            // Show notification
            this.showNotification(`Coding skill increased by ${skillGain.toFixed(2)}!`);
        }
        
        // Update UI
        this.updateUI();
    }

    updateEmails() {
        const emailList = document.getElementById('email-list');
        emailList.innerHTML = '';
        
        // Get emails from gameState
        const emails = gameState.emails;
        
        if (emails.length === 0) {
            emailList.innerHTML = '<p class="empty-state">No emails yet.</p>';
            return;
        }
        
        // Create email items
        emails.forEach((email, index) => {
            const emailItem = document.createElement('div');
            emailItem.className = `email-item ${email.read ? '' : 'unread'}`;
            emailItem.setAttribute('data-email-id', index);
            
            emailItem.innerHTML = `
                <div class="email-item-header">
                    <div class="email-subject">${email.subject}</div>
                    <div class="email-date">${email.date}</div>
                </div>
                <div class="email-sender">${email.sender}</div>
            `;
            
            emailList.appendChild(emailItem);
        });
        
        // Add click handlers for email items
        document.querySelectorAll('.email-item').forEach(item => {
            item.addEventListener('click', () => {
                const emailId = parseInt(item.getAttribute('data-email-id'));
                this.openEmail(emailId);
            });
        });
    }

    openEmail(emailId) {
        const email = gameState.emails[emailId];
        if (!email) return;
        
        // Mark as read
        gameState.markEmailAsRead(emailId);
        
        // Update email list to reflect read status
        document.querySelector(`.email-item[data-email-id="${emailId}"]`).classList.remove('unread');
        
        // Show email content
        document.getElementById('email-list').classList.add('hidden');
        document.getElementById('email-content').classList.remove('hidden');
        
        // Populate email content
        document.getElementById('email-subject').textContent = email.subject;
        document.getElementById('email-sender').textContent = `From: ${email.sender}`;
        document.getElementById('email-date').textContent = `Date: ${email.date}`;
        document.getElementById('email-body').textContent = email.body;
        
        // Add email close handler
        document.getElementById('email-close-btn').addEventListener('click', () => {
            this.closeEmail();
        });
    }

    closeEmail() {
        document.getElementById('email-list').classList.remove('hidden');
        document.getElementById('email-content').classList.add('hidden');
    }

    updateSkills() {
        const skillsList = document.querySelector('.skills-list');
        skillsList.innerHTML = '';
        
        // Create skill items
        const skills = [
            { name: 'Coding', level: gameState.skills.coding, description: 'Your ability to write and understand code.' },
            { name: 'Prompting', level: gameState.skills.prompting, description: 'Your ability to effectively instruct AI models.' }
        ];
        
        skills.forEach(skill => {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            
            skillItem.innerHTML = `
                <div class="skill-name">${skill.name}</div>
                <div class="skill-level">Level: ${skill.level.toFixed(1)}</div>
                <div class="skill-description">${skill.description}</div>
            `;
            
            skillsList.appendChild(skillItem);
        });
        
        // Update the skill visualization
        this.updateSkillVisualization(gameState.skills.coding, gameState.skills.prompting);
        
        // Update available upgrades
        this.updateUpgrades();
    }

    updateUpgrades() {
        const upgradesList = document.querySelector('.upgrades-list');
        upgradesList.innerHTML = '';
        
        // Create upgrade items based on player's progress
        const upgrades = [];
        
        // Add AI model upgrades
        if (!gameState.unlocks.includes('gpt-3.5-turbo') && gameState.skills.coding >= 3) {
            upgrades.push({
                name: 'GPT-3.5 Turbo Access',
                cost: 1500,
                description: 'Unlock access to GPT-3.5 Turbo, a faster and more capable AI model.',
                id: 'gpt-3.5-turbo'
            });
        }
        
        if (!gameState.unlocks.includes('bloom') && gameState.skills.prompting >= 3) {
            upgrades.push({
                name: 'Bloom Access',
                cost: 1500,
                description: 'Unlock access to Bloom, an open-source alternative AI model.',
                id: 'bloom'
            });
        }
        
        if (upgrades.length === 0) {
            upgradesList.innerHTML = '<p class="empty-state">No upgrades available. Improve your skills to unlock more!</p>';
            return;
        }
        
        // Create upgrade items
        upgrades.forEach(upgrade => {
            const upgradeItem = document.createElement('div');
            upgradeItem.className = 'upgrade-item';
            
            upgradeItem.innerHTML = `
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-info">Cost: $${upgrade.cost}</div>
                <div class="upgrade-description">${upgrade.description}</div>
                <button class="purchase-upgrade-btn action-button" data-upgrade-id="${upgrade.id}" data-cost="${upgrade.cost}">Purchase</button>
            `;
            
            upgradesList.appendChild(upgradeItem);
        });
        
        // Add click handlers for upgrade buttons
        document.querySelectorAll('.purchase-upgrade-btn').forEach(button => {
            button.addEventListener('click', () => {
                const upgradeId = button.getAttribute('data-upgrade-id');
                const cost = parseInt(button.getAttribute('data-cost'));
                this.purchaseUpgrade(upgradeId, cost);
            });
        });
    }

    purchaseUpgrade(upgradeId, cost) {
        if (gameState.money < cost) {
            this.showNotification(`Not enough money! Need $${cost}.`);
            return;
        }
        
        // Purchase the upgrade
        gameState.spendMoney(cost);
        gameState.unlocks.push(upgradeId);
        
        // Show notification
        this.showNotification(`Purchased ${upgradeId}!`);
        
        // Update UI
        this.updateUI();
        this.updateSkills();
    }

    endDay() {
        // End the day in game state
        gameState.endDay();
        
        // Update UI
        this.updateUI();
        
        // Show notification
        this.showNotification('A new day begins!');
        
        // Close computer screen
        this.closeComputer();
    }

    showNotification(message) {
        const notificationContainer = document.getElementById('notification-container');
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        notificationContainer.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Add subtle pulsing effect to lamp light if exists
        if (this.lampLight) {
            const intensity = 0.8 + Math.sin(Date.now() * 0.002) * 0.1;
            this.lampLight.intensity = intensity;
        }
        
        // Add slight screen glow to computer
        if (this.computerScreen && this.computerScreen.material) {
            const intensity = 0.3 + Math.sin(Date.now() * 0.001) * 0.1;
            this.computerScreen.material.emissiveIntensity = intensity;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
} 