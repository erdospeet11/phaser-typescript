// Default game rules
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

// Load rules when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Load game rules
    const savedRules = JSON.parse(localStorage.getItem('gameRules')) || defaultRules;
    Object.keys(savedRules).forEach(key => {
        const input = document.getElementById(key);
        if (input) input.value = savedRules[key];
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

function resetRules() {
    if (confirm('Are you sure you want to reset all rules to default?')) {
        localStorage.setItem('gameRules', JSON.stringify(defaultRules));
        Object.keys(defaultRules).forEach(key => {
            const input = document.getElementById(key);
            if (input) input.value = defaultRules[key];
        });
        alert('Rules have been reset to default values');
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