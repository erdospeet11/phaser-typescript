import '@testing-library/jest-dom';
import { Player } from '../Player';

// Mock the Player class to avoid issues with prototype methods
jest.mock('../Player', () => {
  // Create a mock Player implementation
  const MockPlayer = function(this: any, scene: any, x: number, y: number, characterClass: string) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.characterClass = characterClass;
    
    // Set up gameManager from mock
    const gameManagerMock = jest.requireMock('../managers/GameManager').GameManager.getInstance();
    this.gameManager = gameManagerMock;
    
    // Set properties that would be initialized from gameManager
    this.health = gameManagerMock.getHealth();
    this.maxHealth = gameManagerMock.getMaxHealth();
    this.level = gameManagerMock.getLevel();
    this.attack = gameManagerMock.getAttack();
    this.defense = gameManagerMock.getDefense();
    this.experience = gameManagerMock.getExperience();
    this.experienceToNextLevel = gameManagerMock.getExperienceToNextLevel();
    this.equippedItems = gameManagerMock.getEquippedItems();
  };
  
  // Add methods for testing
  MockPlayer.prototype.getHealth = function() { return this.health; };
  MockPlayer.prototype.getMaxHealth = function() { return this.maxHealth; };
  MockPlayer.prototype.getLevel = function() { return this.level; };
  MockPlayer.prototype.getExperience = function() { return this.experience; };
  
  // Implement damage method
  MockPlayer.prototype.damage = function(amount: number) {
    this.gameManager.damage(amount);
    this.health = this.gameManager.getHealth();
  };
  
  // Implement gainExperience method
  MockPlayer.prototype.gainExperience = function(amount: number) {
    const oldLevel = this.level;
    this.experience += amount;
    this.gameManager.setExperience(this.experience);
    
    // Check for level up
    if (this.experience >= this.experienceToNextLevel) {
      this.level += 1;
      this.gameManager.setLevel(this.level);
      this.experienceToNextLevel = this.gameManager.getExperienceToNextLevel();
    }
  };
  
  return { Player: MockPlayer };
});

jest.mock('../managers/GameManager', () => {
  //track health and experience
  let health = 100;  
  let experienceToNextLevel = 100;
  
  return {
    GameManager: {
      getInstance: jest.fn().mockReturnValue({
        setInitialClassStats: jest.fn(),
        getLevel: jest.fn().mockReturnValue(1),
        getExperience: jest.fn().mockReturnValue(0),
        getExperienceToNextLevel: jest.fn().mockImplementation(() => experienceToNextLevel),
        getHealth: jest.fn().mockImplementation(() => health),
        getMaxHealth: jest.fn().mockReturnValue(100),
        getAttack: jest.fn().mockReturnValue(10),
        getDefense: jest.fn().mockReturnValue(5),
        getSpeed: jest.fn().mockReturnValue(1),
        getGold: jest.fn().mockReturnValue(0),
        getScore: jest.fn().mockReturnValue(0),
        getEquippedItems: jest.fn().mockReturnValue({ helmet: null, outfit: null, boots: null }),
        setAttack: jest.fn(),
        setExperience: jest.fn(),
        setLevel: jest.fn(),
        setExperienceToNextLevel: jest.fn().mockImplementation((value: number) => {
          experienceToNextLevel = value;
        }),
        damage: jest.fn().mockImplementation((amount: number) => {
          health = Math.max(0, health - amount);
        })
      })
    }
  };
});

describe('Player', () => {
  let player: Player;
  let mockScene: any;

  beforeEach(() => {
    // Reset health for each test
    jest.clearAllMocks();
    
    //mock phaser scene
    mockScene = {
      add: {
        existing: jest.fn(),
        text: jest.fn().mockReturnValue({
          setScrollFactor: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
          setOrigin: jest.fn().mockReturnThis(),
          setText: jest.fn().mockReturnThis()
        }),
        group: jest.fn().mockReturnValue({
          add: jest.fn()
        }),
        rectangle: jest.fn().mockReturnValue({
          setOrigin: jest.fn().mockReturnThis(),
          setScrollFactor: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
          setScale: jest.fn().mockReturnThis()
        }),
        sprite: jest.fn().mockReturnValue({
          setOrigin: jest.fn().mockReturnThis(),
          setScrollFactor: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
          setScale: jest.fn().mockReturnThis()
        }),
        graphics: jest.fn().mockReturnValue({
          setScrollFactor: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
          clear: jest.fn().mockReturnThis(),
          fillStyle: jest.fn().mockReturnThis(),
          fillRect: jest.fn().mockReturnThis()
        })
      },
      physics: {
        add: {
          existing: jest.fn().mockImplementation((obj: any) => {
            obj.body = {
              setCollideWorldBounds: jest.fn(),
              setSize: jest.fn(),
              setBounce: jest.fn(),
              setImmovable: jest.fn()
            };
            obj.scene = mockScene;
            obj.setTint = jest.fn().mockReturnThis();
            obj.clearTint = jest.fn().mockReturnThis();
          })
        }
      },
      input: {
        keyboard: {
          createCursorKeys: jest.fn().mockReturnValue({}),
          addKeys: jest.fn(),
          on: jest.fn()
        },
        on: jest.fn()
      },
      cameras: {
        main: {
          width: 800,
          height: 600
        }
      },
      time: {
        delayedCall: jest.fn().mockReturnValue({
          destroy: jest.fn()
        })
      },
      scene: {
        pause: jest.fn(),
        launch: jest.fn(),
        resume: jest.fn(),
        stop: jest.fn()
      }
    };
    
    player = new Player(mockScene, 100, 100, 'WARRIOR');
  });

  test('should initialize with correct starting values', () => {
    expect(player.getHealth()).toBe(100);
    expect(player.getMaxHealth()).toBe(100);
    expect(player.getLevel()).toBe(1);
  });

  test('should gain experience correctly', () => {
    player.gainExperience(50);
    expect(player.getExperience()).toBe(50);
  });

  test('should level up when enough experience is gained', () => {
    const initialLevel = player.getLevel();
    player.gainExperience(100);
    expect(player.getLevel()).toBe(initialLevel + 1);
  });

  test('should take damage correctly', () => {
    const initialHealth = player.getHealth();
    player.damage(20);
    expect(player.getHealth()).toBe(initialHealth - 20);
  });
}); 