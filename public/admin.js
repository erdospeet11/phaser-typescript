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

async function resetScores() {
    if (confirm('Are you sure you want to reset all scores?')) {
        try {
            const response = await fetch('/api/scores/clear', { method: 'POST' });
            if (response.ok) {
                alert('Scores have been reset');
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