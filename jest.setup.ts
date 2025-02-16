import '@jest/globals';

//mock phaser
global.Phaser = {
  Game: jest.fn(),
  Scene: jest.fn(),
  Physics: {
    Arcade: {
      Sprite: jest.fn(),
      Body: jest.fn()
    }
  },
  GameObjects: {
    Sprite: jest.fn(),
    Text: jest.fn(),
    Graphics: jest.fn()
  },
  Math: {
    Between: jest.fn(),
    Vector2: jest.fn()
  }
} as any; 