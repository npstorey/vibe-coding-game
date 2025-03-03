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
        
        // Stats elements
        this.dayCount = document.getElementById('day-count');
        this.timeBlocks = document.getElementById('time-blocks');
        this.money = document.getElementById('money');
        this.codingSkill = document.getElementById('coding-skill');
        this.promptSkill = document.getElementById('prompt-skill');
        
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
        
        // Close computer button
        var closeButton = document.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                self.computerScreen.classList.add('hidden');
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
        if (this.dayCount) {
            this.dayCount.textContent = this.gameState.day;
        }
        
        if (this.timeBlocks) {
            this.timeBlocks.textContent = this.gameState.getAvailableTimeBlocks();
        }
        
        if (this.money) {
            this.money.textContent = this.gameState.money;
        }
        
        if (this.codingSkill) {
            this.codingSkill.textContent = Math.floor(this.gameState.skills.coding);
        }
        
        if (this.promptSkill) {
            this.promptSkill.textContent = Math.floor(this.gameState.skills.prompt);
        }
    }
    
    // Switch to a specific panel
    switchPanel(panelName) {
        console.log("Switching to panel: " + panelName);
        
        try {
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
        
        this.gameState.endDay();
        this.showNotification("Day ended. A new day begins!", "info");
        this.updateStats();
    }
    
    // Handle prompt submission
    handlePromptSubmission() {
        console.log("Handling prompt submission");
        
        var projectSelect = document.getElementById('project-select');
        var aiModelSelect = document.getElementById('ai-model-select');
        var promptInput = document.getElementById('prompt-input');
        
        if (!projectSelect || !aiModelSelect || !promptInput) {
            this.showNotification("Missing UI elements for prompt submission", "error");
            return;
        }
        
        if (!promptInput.value.trim()) {
            this.showNotification("Please enter a prompt first", "warning");
            return;
        }
        
        // Simplified for now
        this.showNotification("Processing your prompt...", "info");
        
        // Simulate processing delay for better UX
        var self = this;
        setTimeout(function() {
            self.showNotification("Code generated successfully!", "success");
            
            // Update coding results
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
        }, 1500);
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
        console.log("Setting up main menu");
        
        var mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            // Hide all panels
            var panels = document.querySelectorAll('.panel');
            for (var i = 0; i < panels.length; i++) {
                panels[i].classList.add('hidden');
            }
            
            // Show main menu
            mainMenu.classList.remove('hidden');
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
        
        // Mock data for now
        var mockEmails = [
            {
                subject: "Welcome to Vibe Coding!",
                sender: "Tutorial Bot",
                day: 1,
                read: false,
                content: "<p>Welcome to Vibe Coding Simulator! This is your first day as an indie developer.</p><p>Use the computer to work on projects and earn money.</p>"
            },
            {
                subject: "Your First Project Opportunity",
                sender: "ProjectFinder",
                day: 1,
                read: false,
                content: "<p>We've found a perfect first project for you: a simple landing page.</p><p>Click 'Accept Project' to get started!</p><div class='project-offer'><h4>Simple Landing Page</h4><p>Difficulty: 1/5</p><p>Reward: $200</p><button class='accept-project-btn'>Accept Project</button></div>"
            }
        ];
        
        // Create placeholder if no emails
        if (!this.gameState.emails) {
            this.gameState.emails = mockEmails;
        }
        
        // Add each email to the list
        this.gameState.emails.forEach(function(email, index) {
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
            
            // Add click handler
            emailItem.addEventListener('click', function() {
                self.showEmailContent(index);
            });
            
            emailList.appendChild(emailItem);
        });
    }
    
    // Show email content when clicked
    showEmailContent(index) {
        if (!this.gameState.emails || !this.gameState.emails[index]) {
            return;
        }
        
        var email = this.gameState.emails[index];
        email.read = true; // Mark as read
        
        // Get DOM elements
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
        
        // Update content
        emailSubject.textContent = email.subject;
        emailSender.textContent = email.sender;
        emailDate.textContent = 'Day ' + email.day;
        emailBody.innerHTML = email.content;
        
        // Show content, hide list
        emailList.classList.add('hidden');
        emailContent.classList.remove('hidden');
        
        // Add handlers for any accept project buttons
        var self = this;
        var acceptButtons = emailBody.querySelectorAll('.accept-project-btn');
        for (var i = 0; i < acceptButtons.length; i++) {
            acceptButtons[i].addEventListener('click', function() {
                var projectTitle = this.parentNode.querySelector('h4').textContent;
                var difficultyText = this.parentNode.querySelector('p').textContent;
                var difficulty = parseInt(difficultyText.match(/\d+/)[0], 10);
                var rewardText = this.parentNode.querySelectorAll('p')[1].textContent;
                var reward = parseInt(rewardText.match(/\d+/)[0], 10);
                
                // Create and add the project
                if (self.projectManager) {
                    self.projectManager.addProject({
                        name: projectTitle,
                        difficulty: difficulty,
                        reward: reward,
                        type: 'email',
                        progress: 0,
                        completed: false
                    });
                    self.showNotification("Project accepted: " + projectTitle, "success");
                } else {
                    console.error("Project Manager not available");
                    self.showNotification("Couldn't add project: system error", "error");
                }
            });
        }
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
        
        var projectName = document.createElement('div');
        projectName.className = 'project-name';
        projectName.textContent = project.name;
        
        var projectDifficulty = document.createElement('div');
        projectDifficulty.className = 'project-difficulty';
        projectDifficulty.textContent = 'Difficulty: ' + project.difficulty + '/5';
        
        var projectReward = document.createElement('div');
        projectReward.className = 'project-reward';
        projectReward.textContent = 'Reward: $' + project.reward;
        
        var projectProgress = document.createElement('div');
        projectProgress.className = 'project-progress';
        
        var progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        
        var progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressFill.style.width = project.progress + '%';
        
        var progressText = document.createElement('div');
        progressText.className = 'progress-text';
        progressText.textContent = Math.round(project.progress) + '%';
        
        // Assemble elements
        progressBar.appendChild(progressFill);
        projectProgress.appendChild(progressBar);
        projectProgress.appendChild(progressText);
        
        projectCard.appendChild(projectName);
        projectCard.appendChild(projectDifficulty);
        projectCard.appendChild(projectReward);
        projectCard.appendChild(projectProgress);
        
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
        
        var socialPostsList = document.getElementById('social-posts-list');
        if (!socialPostsList) {
            console.error("Social posts list container not found");
            return;
        }
        
        // Clear current list
        socialPostsList.innerHTML = '';
        
        // Create mock social media posts
        var mockPosts = [
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
                author: "DevLifestyle",
                time: "2 days ago",
                content: "Working on a simple landing page for a client using AI assistance. Completed in 1 hour what would have taken a day before! Share your AI productivity wins. #DevLife #Productivity",
                tags: ["DevLife", "Productivity"],
                trending: false
            }
        ];
        
        // Add each post to the list
        for (var i = 0; i < mockPosts.length; i++) {
            var post = mockPosts[i];
            
            var postElement = document.createElement('div');
            postElement.className = 'social-post';
            
            var postHeader = document.createElement('div');
            postHeader.className = 'post-header';
            
            var postAuthor = document.createElement('div');
            postAuthor.className = 'post-author';
            postAuthor.textContent = post.author;
            
            var postTime = document.createElement('div');
            postTime.className = 'post-time';
            postTime.textContent = post.time;
            
            postHeader.appendChild(postAuthor);
            postHeader.appendChild(postTime);
            
            var postContent = document.createElement('div');
            postContent.className = 'post-content';
            postContent.textContent = post.content;
            
            var postTags = document.createElement('div');
            postTags.className = 'post-tags';
            
            // Add tags
            for (var j = 0; j < post.tags.length; j++) {
                var tag = document.createElement('span');
                tag.className = 'post-tag' + (post.trending ? ' trending' : '');
                tag.textContent = '#' + post.tags[j];
                postTags.appendChild(tag);
            }
            
            postElement.appendChild(postHeader);
            postElement.appendChild(postContent);
            postElement.appendChild(postTags);
            
            socialPostsList.appendChild(postElement);
        }
        
        // Set up scroll social button
        var scrollSocialBtn = document.getElementById('scroll-social-btn');
        if (scrollSocialBtn) {
            var self = this;
            scrollSocialBtn.addEventListener('click', function() {
                // Check if player has enough time blocks
                if (self.gameState.getAvailableTimeBlocks() < 1) {
                    self.showNotification("Not enough time blocks remaining today", "error");
                    return;
                }
                
                // Use a time block
                self.gameState.useTimeBlock(1);
                
                // Generate a new post
                var newPost = self.generateRandomSocialPost();
                
                // Add the new post to the beginning of the list
                var socialPostsList = document.getElementById('social-posts-list');
                if (socialPostsList && socialPostsList.firstChild) {
                    socialPostsList.insertBefore(newPost, socialPostsList.firstChild);
                } else if (socialPostsList) {
                    socialPostsList.appendChild(newPost);
                }
                
                // Small chance to gain a skill point
                if (Math.random() < 0.3) { // 30% chance
                    var skillType = Math.random() < 0.5 ? 'coding' : 'prompt';
                    var skillGain = 0.1 + (Math.random() * 0.2); // 0.1 to 0.3
                    
                    if (self.gameState.increaseSkill) {
                        self.gameState.increaseSkill(skillType, skillGain);
                        self.showNotification("You learned something new! " + skillType.charAt(0).toUpperCase() + skillType.slice(1) + " skill increased by " + skillGain.toFixed(1), "success");
                    }
                }
                
                // Update stats
                self.updateStats();
                self.showNotification("You scrolled social media and found new posts", "info");
            });
        }
    }
    
    // Generate a random social media post
    generateRandomSocialPost() {
        var authors = ["AIDevPro", "CodeMaster", "PromptEngineer", "TechGuru", "WebWizard"];
        var topics = [
            "Just found a way to create responsive layouts with a single AI prompt. Game changer!",
            "Optimized my workflow by using templates with my AI assistant. Productivity up 300%!",
            "The secret to good prompts is being specific about the output format you want.",
            "Don't tell AI to 'make a website'. Instead, specify components, colors, and functionality.",
            "Today's client was amazed at how quickly I delivered their landing page. Thanks AI!",
            "Learning to collaborate with AI rather than just use it has transformed my coding."
        ];
        var tags = [
            ["AIPrompting", "Productivity"],
            ["CodingTips", "AITools"],
            ["WebDev", "AIAssistant"],
            ["FreelanceTips", "RemoteWork"],
            ["FrontendDev", "AIDesign"],
            ["PromptEngineering", "AITips"]
        ];
        
        // Randomly select content
        var author = authors[Math.floor(Math.random() * authors.length)];
        var contentIndex = Math.floor(Math.random() * topics.length);
        var content = topics[contentIndex];
        var postTags = tags[contentIndex % tags.length];
        var trending = Math.random() < 0.2; // 20% chance to be trending
        
        // Create post element
        var postElement = document.createElement('div');
        postElement.className = 'social-post';
        
        var postHeader = document.createElement('div');
        postHeader.className = 'post-header';
        
        var postAuthor = document.createElement('div');
        postAuthor.className = 'post-author';
        postAuthor.textContent = author;
        
        var postTime = document.createElement('div');
        postTime.className = 'post-time';
        postTime.textContent = "Just now";
        
        postHeader.appendChild(postAuthor);
        postHeader.appendChild(postTime);
        
        var postContent = document.createElement('div');
        postContent.className = 'post-content';
        postContent.textContent = content;
        
        var postTagsElement = document.createElement('div');
        postTagsElement.className = 'post-tags';
        
        // Add tags
        for (var i = 0; i < postTags.length; i++) {
            var tag = document.createElement('span');
            tag.className = 'post-tag' + (trending ? ' trending' : '');
            tag.textContent = '#' + postTags[i];
            postTagsElement.appendChild(tag);
        }
        
        postElement.appendChild(postHeader);
        postElement.appendChild(postContent);
        postElement.appendChild(postTagsElement);
        
        return postElement;
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
                projectType.textContent = project.type || 'Web';
                
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
                difficultyStars.textContent = '★'.repeat(project.difficulty) + '☆'.repeat(5 - project.difficulty);
                
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
} 