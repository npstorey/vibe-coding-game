/**
 * Computer Clickability Fix Script
 * 
 * This script provides a targeted fix for the unclickable computer issue.
 * It addresses several potential causes with minimal side effects.
 */

// Wait for the game to initialize fully before attempting any fixes
document.addEventListener('DOMContentLoaded', function() {
    // Wait for 1 second to ensure the main script has initialized
    setTimeout(function() {
        console.log("🔍 Checking if computer fix is needed...");
        applyMinimalFix();
    }, 1000);
});

// Apply only essential fixes with minimal side effects
function applyMinimalFix() {
    console.log("💻 Applying minimal computer clickability fixes");
    
    // 1. Fix CSS issues - use minimal CSS changes
    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer) {
        // Use computed style to check current values before changing
        const computedStyle = window.getComputedStyle(sceneContainer);
        
        // Only change pointer-events if it's currently none
        if (computedStyle.pointerEvents === 'none') {
            sceneContainer.style.pointerEvents = 'auto';
            console.log("✅ Fixed pointer-events on scene-container");
        }
        
        // Only set z-index if needed (don't override existing good values)
        if (computedStyle.zIndex === 'auto' || computedStyle.zIndex === '0') {
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

    // 3. Try to access game instance (may not be available yet)
    if (window.game) {
        ensureComputerInteractivity(window.game);
    } else {
        // Instead of immediately showing emergency overlay, wait for the game to initialize
        console.log("⚠️ Game instance not available yet, will retry shortly");
        
        // Set up a retry mechanism
        let attempts = 0;
        const maxAttempts = 3;
        const checkInterval = setInterval(function() {
            attempts++;
            console.log(`Retry attempt ${attempts}/${maxAttempts} to find game instance`);
            
            if (window.game) {
                clearInterval(checkInterval);
                console.log("✅ Game instance found on retry");
                ensureComputerInteractivity(window.game);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.log("⚠️ Game instance not found after retries");
                // DO NOT create emergency overlay by default - user requested to disable it
            }
        }, 1000);
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

// Helper function to show the computer screen - used only if explicitly called
function showComputerScreen() {
    const computerScreen = document.getElementById('computer-screen');
    if (computerScreen) {
        computerScreen.classList.remove('hidden');
        computerScreen.style.display = 'block';
        console.log("Computer screen displayed");
    }
}

// Only expose the essential functions to the global scope
window.applyMinimalFix = applyMinimalFix;
window.showComputerScreen = showComputerScreen;

console.log("💻 Computer fix script loaded - using minimal approach");
