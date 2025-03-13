//default game rules
const defaultRules = {
    playerHealth: 100,
    playerSpeed: 1.0,
    playerAttack: 10,
    enemyHealth: 50,
    enemySpeed: 0.5,
    enemyAttack: 10,
    maxEnemies: 5,
    spawnInterval: 2000
};

//default enemy rules
const defaultEnemyRules = {
    basicEnemyHealth: 50,
    basicEnemyAttack: 10,
    basicEnemyDropRate: 30,
    
    rangedEnemyHealth: 40,
    rangedEnemyAttack: 15,
    rangedEnemyDropRate: 40,
    
    lineEnemyHealth: 50,
    lineEnemyAttack: 10,
    lineEnemyDropRate: 35,
    
    obstacleEnemyHealth: 150,
    obstacleEnemyAttack: 15,
    obstacleEnemyDropRate: 45
};

//add shop default rules
const defaultShopRules = {
    healthPotionCost: 50,
    healthRestoreAmount: 20,
    attackBoostCost: 100,
    attackBoostAmount: 5
};

//load rules when page loads
document.addEventListener('DOMContentLoaded', async () => {
    //load all rules
    const savedRules = JSON.parse(localStorage.getItem('gameRules')) || defaultRules;
    const savedEnemyRules = JSON.parse(localStorage.getItem('enemyRules')) || defaultEnemyRules;
    const savedShopRules = JSON.parse(localStorage.getItem('shopRules')) || defaultShopRules;
    
    //load all rule types
    Object.keys(savedRules).forEach(key => {
        const input = document.getElementById(key);
        if (input) input.value = savedRules[key];
    });
    
    Object.keys(savedEnemyRules).forEach(key => {
        const input = document.getElementById(key);
        if (input) input.value = savedEnemyRules[key];
    });

    Object.keys(savedShopRules).forEach(key => {
        const input = document.getElementById(key);
        if (input) input.value = savedShopRules[key];
    });

    // Load initial data for scores only
    refreshScores();
});

function saveRules() {
    const rules = {};
    Object.keys(defaultRules).forEach(key => {
        const input = document.getElementById(key);
        rules[key] = parseFloat(input.value);
    });

    localStorage.setItem('gameRules', JSON.stringify(rules));
    alert('Game rules have been saved!');
}

function saveEnemyRules() {
    const enemyRules = {};
    Object.keys(defaultEnemyRules).forEach(key => {
        const input = document.getElementById(key);
        enemyRules[key] = parseFloat(input.value);
    });

    localStorage.setItem('enemyRules', JSON.stringify(enemyRules));
    alert('Enemy rules have been saved!');
}

function saveShopRules() {
    const shopRules = {};
    Object.keys(defaultShopRules).forEach(key => {
        const input = document.getElementById(key);
        shopRules[key] = parseFloat(input.value);
    });

    localStorage.setItem('shopRules', JSON.stringify(shopRules));
    alert('Shop rules have been saved!');
}

function resetRules() {
    if (confirm('Are you sure you want to reset all rules to default?')) {
        localStorage.setItem('gameRules', JSON.stringify(defaultRules));
        localStorage.setItem('enemyRules', JSON.stringify(defaultEnemyRules));
        localStorage.setItem('shopRules', JSON.stringify(defaultShopRules));
        
        // Reset all rule inputs
        Object.keys(defaultRules).forEach(key => {
            const input = document.getElementById(key);
            if (input) input.value = defaultRules[key];
        });
        
        Object.keys(defaultEnemyRules).forEach(key => {
            const input = document.getElementById(key);
            if (input) input.value = defaultEnemyRules[key];
        });

        Object.keys(defaultShopRules).forEach(key => {
            const input = document.getElementById(key);
            if (input) input.value = defaultShopRules[key];
        });
        
        alert('All rules have been reset to default values');
    }
}

// Scores Database Functions
async function refreshScores() {
    const scoresTable = document.getElementById('scoresTable').getElementsByTagName('tbody')[0];
    const scoresLoader = document.getElementById('scoresLoader');
    const noScoresData = document.getElementById('noScoresData');
    
    scoresTable.innerHTML = '';
    scoresLoader.style.display = 'block';
    noScoresData.style.display = 'none';
    
    try {
        console.log('Fetching scores data from server...');
        const response = await fetch('/api/scores?limit=100');
        console.log('Server response status:', response.status);
        
        // Try to parse the response as JSON, even if it's an error
        let jsonData;
        try {
            jsonData = await response.json();
            console.log('Response data preview:', 
                jsonData ? `Received ${jsonData.length} scores` : 'No scores data');
        } catch (e) {
            console.error('Failed to parse response as JSON:', e);
            throw new Error('Invalid response from server');
        }
        
        // If the response is not OK, handle the error
        if (!response.ok) {
            const errorMessage = jsonData && jsonData.error 
                ? jsonData.error 
                : `Server responded with status: ${response.status}`;
            throw new Error(errorMessage);
        }
        
        // Process the successful response
        const scores = jsonData || [];
        scoresLoader.style.display = 'none';
        
        if (scores.length === 0) {
            console.log('No scores found in the database');
            noScoresData.style.display = 'block';
            return;
        }
        
        console.log(`Rendering ${scores.length} scores to table`);
        scores.forEach(score => {
            const row = scoresTable.insertRow();
            
            const idCell = row.insertCell(0);
            idCell.textContent = score.id;
            
            const playerCell = row.insertCell(1);
            playerCell.textContent = score.player_name || 'Unknown';
            
            const scoreCell = row.insertCell(2);
            scoreCell.textContent = score.score;
            
            const dateCell = row.insertCell(3);
            // Safely handle date formatting
            let dateText = 'Unknown';
            if (score.date) {
                try {
                    const scoreDate = new Date(score.date);
                    dateText = scoreDate.toLocaleString();
                } catch (e) {
                    console.warn('Failed to format date:', e);
                    dateText = score.date;
                }
            }
            dateCell.textContent = dateText;
            
            const actionsCell = row.insertCell(4);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'button danger';
            deleteButton.onclick = () => deleteScore(score.id);
            actionsCell.appendChild(deleteButton);
        });
    } catch (error) {
        console.error('Error fetching scores:', error);
        scoresLoader.style.display = 'none';
        noScoresData.textContent = `Error loading scores: ${error.message}`;
        noScoresData.style.display = 'block';
    }
}

async function deleteScore(scoreId) {
    if (confirm(`Are you sure you want to delete score ID ${scoreId}?`)) {
        try {
            const response = await fetch(`/api/scores/${scoreId}`, { 
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('Score deleted successfully');
                refreshScores();
            } else {
                alert('Failed to delete score');
            }
        } catch (error) {
            console.error('Error deleting score:', error);
            alert('Error deleting score: ' + error.message);
        }
    }
}

// Update the existing resetScores function to also refresh the scores display
async function resetScores() {
    if (confirm('Are you sure you want to reset all scores?')) {
        try {
            const response = await fetch('/api/scores/clear', { method: 'POST' });
            if (response.ok) {
                alert('Scores have been reset');
                refreshScores(); // Refresh the scores display
            } else {
                alert('Failed to reset scores');
            }
        } catch (error) {
            console.error('Error resetting scores:', error);
            alert('Failed to reset scores');
        }
    }
}

function logout() {
    window.location.href = 'index.html';
}