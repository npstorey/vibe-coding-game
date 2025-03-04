/**
 * Debug script to fix Code Sprint button clickability
 */
(function() {
    console.log("🔍 Debug script for Code Sprint button loaded");

    // Wait for game initialization with retries
    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = 500; // 500ms between retries
    
    function waitForGameAndFixButton() {
        if (retryCount >= maxRetries) {
            console.error("❌ Max retries exceeded waiting for game instance");
            return;
        }
        
        retryCount++;
        
        // Check if game instance exists
        if (!window.game) {
            console.log(`⏳ Game instance not found, retrying (${retryCount}/${maxRetries})...`);
            setTimeout(waitForGameAndFixButton, retryInterval);
            return;
        }
        
        // Game instance exists, now fix the button
        fixCodeSprintButton();
    }
    
    // Function to fix the Code Sprint button
    function fixCodeSprintButton() {
        console.log("🔧 Applying Code Sprint button fix...");
        
        // Get the Code Sprint button
        const codeBtn = document.getElementById('code-btn');
        
        if (!codeBtn) {
            console.error("❌ Code Sprint button not found!");
            return;
        }
        
        console.log("✅ Found Code Sprint button:", codeBtn);
        
        // Get game instance (should exist at this point)
        const game = window.game;
        
        // Check again to be sure
        if (!game) {
            console.error("❌ Game instance not found even after waiting!");
            return;
        }
        
        console.log("✅ Found game instance");
        
        // Create new event handler that ensures the correct panel is displayed
        codeBtn.addEventListener('click', function directCodeBtnHandler(event) {
            console.log("🖱️ Code Sprint button clicked directly from debug script");
            
            // We won't stop propagation to allow other handlers to work too
            // event.stopImmediatePropagation();
            
            try {
                // Check if we have enough time blocks
                if (!game.gameState || game.gameState.getAvailableTimeBlocks() <= 0) {
                    console.log("Not enough time blocks");
                    return;
                }
                
                // Show the computer screen if it's not already visible
                const computerScreen = document.getElementById('computer-screen');
                if (computerScreen && computerScreen.classList.contains('hidden')) {
                    computerScreen.classList.remove('hidden');
                    computerScreen.style.display = 'block';
                }
                
                // Always switch to the coding panel
                if (game.ui && typeof game.ui.switchPanel === 'function') {
                    console.log("Calling game.ui.switchPanel('coding-panel')");
                    game.ui.switchPanel('coding-panel');
                } else {
                    console.warn("⚠️ game.ui.switchPanel function not available, using fallback");
                    
                    // Hide all panels and main menu
                    document.querySelectorAll('.panel, #main-menu').forEach(panel => {
                        panel.classList.add('hidden');
                        panel.style.display = 'none';
                    });
                    
                    // Show coding panel
                    const codingPanel = document.getElementById('coding-panel');
                    if (codingPanel) {
                        codingPanel.classList.remove('hidden');
                        codingPanel.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error("❌ Error in direct Code Sprint button handler:", error);
            }
        });
        
        console.log("✅ Added direct event listener to Code Sprint button");
    }

    // Start waiting for the game to initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForGameAndFixButton);
    } else {
        // If DOMContentLoaded has already fired, start waiting immediately
        waitForGameAndFixButton();
    }
})();
