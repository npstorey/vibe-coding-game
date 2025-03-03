/**
 * Computer Clickability Fix Script
 * 
 * This script provides a comprehensive fix for the unclickable computer issue.
 * It addresses all known causes with robust error handling.
 */

// Debug flag to control console output
var DEBUG = true;

// Wait for the game to initialize fully before attempting any fixes
document.addEventListener('DOMContentLoaded', function() {
    console.log("🔍 Computer fix script loaded");
    
    // Apply immediate CSS fixes
    applyImmediateCSSFixes();
    
    // Try first fix after a small delay
    setTimeout(function() {
        console.log("🔧 Applying initial computer fixes...");
        applyMinimalFix();
    }, 500);
    
    // Apply a more comprehensive fix after the game has had time to fully initialize
    setTimeout(function() {
        console.log("🔧 Applying comprehensive computer fixes...");
        applyComprehensiveFix();
    }, 2000);
    
    // Set up periodic check to ensure computer stays clickable
    setInterval(function() {
        // Only log when actual fixes are applied
        const fixesApplied = ensureComputerClickability();
        if (fixesApplied) {
            console.log("🔄 Periodic computer fix applied");
        }
    }, 5000);

    // Don't wait for the game to fully load - add listeners immediately
    var directUITest = document.getElementById('direct-ui-test');
    if (directUITest) {
        directUITest.addEventListener('click', function() {
            enableUIDebugMode();
        });
    }
    
    var directComputerTest = document.getElementById('direct-computer-test');
    if (directComputerTest) {
        directComputerTest.addEventListener('click', function() {
            showComputerScreenDirectly();
        });
    }
    
    var debugShowComputer = document.getElementById('debug-show-computer');
    if (debugShowComputer) {
        debugShowComputer.addEventListener('click', function() {
            showComputerScreenDirectly();
        });
    }
    
    // Add special debug key combinations
    document.addEventListener('keydown', function(e) {
        // Ctrl+Shift+D for debug mode
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            enableUIDebugMode();
        }
        
        // Ctrl+Shift+C for computer screen
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            showComputerScreenDirectly();
        }
    });
});

// Apply immediate CSS fixes without waiting
function applyImmediateCSSFixes() {
    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer) {
        // Always ensure scene container has proper event handling
        sceneContainer.style.pointerEvents = 'auto';
        sceneContainer.style.zIndex = '1';
    }
}

// Apply minimal fixes to ensure basic clickability
function applyMinimalFix() {
    console.log("💻 Applying minimal computer clickability fixes");
    
    // 1. Fix CSS issues
    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer) {
        // Use computed style to check current values before changing
        const computedStyle = window.getComputedStyle(sceneContainer);
        
        // Only change pointer-events if it's currently none
        if (computedStyle.pointerEvents === 'none') {
            sceneContainer.style.pointerEvents = 'auto';
            console.log("✅ Fixed pointer-events on scene-container");
        }
        
        // Only set z-index if needed
        if (computedStyle.zIndex === 'auto' || parseInt(computedStyle.zIndex) < 1) {
            sceneContainer.style.zIndex = '1';
            console.log("✅ Set minimal z-index on scene-container");
        }
    }
    
    // 2. Ensure loading screen is hidden properly
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        loadingScreen.classList.add('hidden');
        console.log("✅ Hiding loading screen that was still visible");
    }

    // 3. Try to access game instance
    if (window.game) {
        ensureComputerInteractivity(window.game);
    } else {
        console.log("⚠️ Game instance not available yet, will retry shortly");
    }
}

// Apply a more comprehensive fix that addresses all known issues
function applyComprehensiveFix() {
    // Try to access the game instance
    if (!window.game) {
        console.warn("⚠️ Game instance not available for comprehensive fix");
        return;
    }
    
    const game = window.game;
    
    // 1. Fix computer interactivity
    if (game.computer) {
        console.log("✅ Found computer object, ensuring interactivity");
        
        // Ensure it has proper userData
        if (!game.computer.userData) {
            game.computer.userData = {};
        }
        
        // Set all possible interaction flags (for compatibility)
        game.computer.userData.isInteractive = true;
        game.computer.userData.interactive = true;
        game.computer.userData.objectType = 'computer';
        game.computer.userData.type = 'computer';
        
        // Add click handler directly to computer
        if (game.renderer && game.renderer.domElement) {
            console.log("✅ Adding direct click handler to canvas");
            game.renderer.domElement.addEventListener('click', function(event) {
                // Only if we have the necessary components
                if (game.raycaster && game.camera && game.computer) {
                    // Calculate mouse position
                    const rect = game.renderer.domElement.getBoundingClientRect();
                    const mouse = new THREE.Vector2();
                    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                    
                    // Set up the raycaster
                    game.raycaster.setFromCamera(mouse, game.camera);
                    
                    // Check for intersections with the computer
                    const intersects = game.raycaster.intersectObject(game.computer, true);
                    if (intersects.length > 0) {
                        console.log("✅ Direct computer click detected");
                        showComputerScreen();
                    }
                }
            });
        }
    } else {
        console.warn("⚠️ Computer object not found");
    }
    
    // 2. Ensure computer is in the interactiveObjects array
    if (game.interactiveObjects && game.computer) {
        if (!game.interactiveObjects.includes(game.computer)) {
            game.interactiveObjects.push(game.computer);
            console.log("✅ Added computer to interactiveObjects array");
        }
    }
    
    // 3. Add backup click handler to entire UI
    const uiOverlay = document.getElementById('ui-overlay');
    if (uiOverlay) {
        console.log("✅ Setting up backup UI click handler");
        uiOverlay.addEventListener('click', function(event) {
            // Check if the click was on the computer screen or a UI element
            if (event.target.closest('#computer-screen')) {
                // Click was on the computer screen, ignore
                return;
            }
            
            // Check if the user is clicking in the 3D scene area (might be trying to click the computer)
            const rect = game.renderer.domElement.getBoundingClientRect();
            if (
                event.clientX >= rect.left && 
                event.clientX <= rect.right && 
                event.clientY >= rect.top && 
                event.clientY <= rect.bottom
            ) {
                // Forward the click to the canvas handler
                const canvasEvent = new MouseEvent('click', {
                    clientX: event.clientX,
                    clientY: event.clientY,
                    bubbles: true
                });
                game.renderer.domElement.dispatchEvent(canvasEvent);
            }
        });
    }
}

// Function to ensure the computer object is properly interactive
function ensureComputerInteractivity(game) {
    if (!game.computer) {
        console.log("⚠️ Computer object not found - cannot fix interactivity");
        return;
    }
    
    console.log("Checking computer interactivity settings...");
    
    // Ensure computer has userData object
    if (!game.computer.userData) {
        game.computer.userData = {};
    }
    
    // Set essential interactive properties
    game.computer.userData.isInteractive = true;
    game.computer.userData.interactive = true; // Redundant but ensures compatibility
    game.computer.userData.objectType = 'computer';
    game.computer.userData.type = 'computer';
    
    // Make sure computer is in the interactiveObjects array
    if (game.interactiveObjects && !game.interactiveObjects.includes(game.computer)) {
        game.interactiveObjects.push(game.computer);
        console.log("✅ Added computer to interactiveObjects array");
    }
    
    console.log("✅ Computer interactivity properties verified and fixed");
}

// Ensure computer is consistently clickable, returns true if fixes were applied
function ensureComputerClickability() {
    if (!window.game) return false;
    
    const game = window.game;
    let fixesApplied = false;
    
    // 1. Check if computer is in interactiveObjects array
    if (game.computer && game.interactiveObjects && !game.interactiveObjects.includes(game.computer)) {
        game.interactiveObjects.push(game.computer);
        fixesApplied = true;
    }
    
    // 2. Check if computer has proper userData
    if (game.computer && (!game.computer.userData || !game.computer.userData.isInteractive)) {
        if (!game.computer.userData) {
            game.computer.userData = {};
        }
        game.computer.userData.isInteractive = true;
        game.computer.userData.interactive = true;
        game.computer.userData.objectType = 'computer';
        game.computer.userData.type = 'computer';
        fixesApplied = true;
    }
    
    // 3. Check scene container CSS
    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer) {
        const computedStyle = window.getComputedStyle(sceneContainer);
        if (computedStyle.pointerEvents === 'none') {
            sceneContainer.style.pointerEvents = 'auto';
            fixesApplied = true;
        }
    }
    
    return fixesApplied;
}

// Helper function to show the computer screen - used only if explicitly called
function showComputerScreen() {
    const computerScreen = document.getElementById('computer-screen');
    if (computerScreen) {
        computerScreen.classList.remove('hidden');
        computerScreen.style.display = 'block';
        console.log("Computer screen displayed");
        
        // Make sure UI overlay is also visible
        const uiOverlay = document.getElementById('ui-overlay');
        if (uiOverlay) {
            uiOverlay.classList.remove('hidden');
        }
        
        // Update resources if resourceManager exists
        if (window.game && window.game.resourceManager) {
            window.game.resourceManager.updateResourcesDisplay();
        }
    }
}

// Enable UI debug mode - allows testing UI components without the 3D scene
function enableUIDebugMode() {
    console.log("🐞 Enabling UI Debug Mode");
    
    // Show UI overlay
    var uiOverlay = document.getElementById('ui-overlay');
    if (uiOverlay) {
        uiOverlay.classList.remove('hidden');
        logDebug("UI overlay displayed");
    }
    
    // Hide loading screen
    var loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        logDebug("Loading screen hidden");
    }
    
    // Show debug info
    showDebugPanel();
    
    // Try to initialize with available objects if game is loaded
    if (window.game) {
        logDebug("Game object found, connecting to it");
        
        // Ensure basic managers exist even if not fully initialized
        ensureBasicManagers();
        
        // Try to trigger any initialization methods
        if (window.game.ui) {
            logDebug("UI object found, trying to initialize");
            // Try to initialize UI events
            if (typeof window.game.ui.initEvents === 'function') {
                try {
                    window.game.ui.initEvents(
                        window.game.projectManager || {},
                        window.game.socialMediaManager || {},
                        window.game.hardwareManager || {},
                        window.game.shopManager || {},
                        window.game.resourceManager || {}
                    );
                    logDebug("UI.initEvents called successfully");
                } catch (err) {
                    console.error("Error initializing UI events:", err);
                }
            }
            
            // Update UI stats
            if (typeof window.game.ui.updateStats === 'function') {
                try {
                    window.game.ui.updateStats();
                    logDebug("UI stats updated");
                } catch (err) {
                    console.error("Error updating UI stats:", err);
                }
            }
        } else {
            console.warn("Game object exists but UI object not found");
        }
    } else {
        logDebug("Game object not found. Running in standalone mode.");
        // Create minimal objects needed for UI testing
        window.game = window.game || {};
        window.game.gameState = window.game.gameState || {
            day: 1,
            money: 1000,
            skills: { coding: 1, prompt: 1 },
            timeBlocks: 8,
            timeBlocksUsed: 0,
            getAvailableTimeBlocks: function() { return this.timeBlocks - this.timeBlocksUsed; },
            activeProjects: [],
            completedProjects: [],
            emails: [],
            addMoney: function(amount) { this.money += amount; }
        };
    }
}

// Ensure basic managers exist for testing
function ensureBasicManagers() {
    if (!window.game) return;
    
    // Ensure project manager
    if (!window.game.projectManager) {
        window.game.projectManager = {
            addProject: function(project) {
                logDebug("Mock projectManager.addProject called:", project);
                if (!window.game.gameState.activeProjects) {
                    window.game.gameState.activeProjects = [];
                }
                window.game.gameState.activeProjects.push(project);
                return project;
            },
            getActiveProjects: function() {
                return window.game.gameState.activeProjects || [];
            },
            getCompletedProjects: function() {
                return window.game.gameState.completedProjects || [];
            }
        };
    }
    
    // Ensure AI model manager
    if (!window.game.aiModelManager) {
        window.game.aiModelManager = {
            getAvailableModels: function() {
                return [
                    { key: "gpt-3", name: "GPT-3", tier: "Basic" },
                    { key: "bloom", name: "BLOOM", tier: "Basic" }
                ];
            }
        };
    }
}

// Show the computer screen directly
function showComputerScreenDirectly() {
    console.log("🖥️ Showing computer screen directly");
    
    // Show UI overlay
    var uiOverlay = document.getElementById('ui-overlay');
    if (uiOverlay) {
        uiOverlay.classList.remove('hidden');
    }
    
    // Show computer screen
    var computerScreen = document.getElementById('computer-screen');
    if (computerScreen) {
        computerScreen.classList.remove('hidden');
        computerScreen.style.display = 'block';
    }
    
    // Hide loading screen
    var loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
    
    // Enable debug mode to initialize UI
    enableUIDebugMode();
}

// Show a debug panel with useful information
function showDebugPanel() {
    var debugPanel = document.getElementById('ui-debug-panel');
    
    // Create debug panel if it doesn't exist
    if (!debugPanel) {
        debugPanel = document.createElement('div');
        debugPanel.id = 'ui-debug-panel';
        debugPanel.style.position = 'fixed';
        debugPanel.style.bottom = '10px';
        debugPanel.style.right = '10px';
        debugPanel.style.backgroundColor = 'rgba(0,0,0,0.8)';
        debugPanel.style.color = 'white';
        debugPanel.style.padding = '10px';
        debugPanel.style.borderRadius = '5px';
        debugPanel.style.zIndex = '10000';
        debugPanel.style.maxHeight = '300px';
        debugPanel.style.overflowY = 'auto';
        
        document.body.appendChild(debugPanel);
    }
    
    // Update debug info
    updateDebugInfo(debugPanel);
}

// Update the debug panel with current state
function updateDebugInfo(panel) {
    if (!panel) return;
    
    var info = "<h3 style='margin-top:0'>UI Debug Info</h3>";
    
    // Add game state info
    if (window.game && window.game.gameState) {
        info += "<p><strong>Game Day:</strong> " + window.game.gameState.day + "</p>";
        info += "<p><strong>Money:</strong> $" + window.game.gameState.money + "</p>";
        info += "<p><strong>Time Blocks:</strong> " + 
            (window.game.gameState.timeBlocks - window.game.gameState.timeBlocksUsed) + 
            "/" + window.game.gameState.timeBlocks + "</p>";
    } else {
        info += "<p>Game state not available</p>";
    }
    
    // Add button to refresh info
    info += "<button id='refresh-debug' style='padding:5px 10px; margin-top:10px; width:100%'>Refresh Info</button>";
    
    panel.innerHTML = info;
    
    // Add event listener to refresh button
    var refreshBtn = document.getElementById('refresh-debug');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            updateDebugInfo(panel);
        });
    }
}

// Utility function for debug logging
function logDebug(message, data) {
    if (!DEBUG) return;
    
    if (data) {
        console.log("🔍 DEBUG:", message, data);
    } else {
        console.log("🔍 DEBUG:", message);
    }
}

// Expose the essential functions to the global scope
window.applyMinimalFix = applyMinimalFix;
window.applyComprehensiveFix = applyComprehensiveFix;
window.showComputerScreen = showComputerScreen;
window.ensureComputerClickability = ensureComputerClickability;

console.log("💻 Comprehensive computer fix script loaded");
