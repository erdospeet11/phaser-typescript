import { GameManager } from '../managers/GameManager';

describe('GameManager', () => {
  beforeEach(() => {
    GameManager.destroyInstance();
  });

  test('should be a singleton', () => {
    const instance1 = GameManager.getInstance();
    const instance2 = GameManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  test('should initialize with correct class stats', () => {
    const gameManager = GameManager.getInstance();
    gameManager.setInitialClassStats('WARRIOR');
    expect(gameManager.getSpeed()).toBe(1);
  });

  test('should track player stats correctly', () => {
    const gameManager = GameManager.getInstance();
    gameManager.setAttack(10);
    gameManager.setDefense(5);
    expect(gameManager.getAttack()).toBe(10);
    expect(gameManager.getDefense()).toBe(5);
  });

  test('should handle score management', () => {
    const gameManager = GameManager.getInstance();
    expect(gameManager.getScore()).toBe(0);
    
    gameManager.addScore(100);
    expect(gameManager.getScore()).toBe(100);
  });

  test('should handle gold management', () => {
    const gameManager = GameManager.getInstance();
    expect(gameManager.getGold()).toBe(0);
    
    gameManager.addGold(50);
    expect(gameManager.getGold()).toBe(50);
    
    const canSpend = gameManager.spendGold(30);
    expect(canSpend).toBe(true);
    expect(gameManager.getGold()).toBe(20);
  });

  test('should prevent spending more gold than available', () => {
    const gameManager = GameManager.getInstance();
    gameManager.addGold(20);
    
    const canSpend = gameManager.spendGold(30);
    expect(canSpend).toBe(false);
    expect(gameManager.getGold()).toBe(20);
  });

  test('should handle experience and leveling', () => {
    const gameManager = GameManager.getInstance();
    expect(gameManager.getLevel()).toBe(1);
    expect(gameManager.getExperience()).toBe(0);
    
    gameManager.setExperience(50);
    expect(gameManager.getExperience()).toBe(50);
    
    gameManager.setLevel(2);
    expect(gameManager.getLevel()).toBe(2);
  });

  test('should reset stats correctly', () => {
    const gameManager = GameManager.getInstance();
    gameManager.addScore(100);
    gameManager.addGold(50);
    
    gameManager.reset();
    
    expect(gameManager.getScore()).toBe(0);
    expect(gameManager.getGold()).toBe(0);
    expect(gameManager.getHealth()).toBe(gameManager.getMaxHealth());
  });
}); 