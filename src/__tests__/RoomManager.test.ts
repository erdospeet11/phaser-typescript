import '@testing-library/jest-dom';
import { RoomManager, RoomType } from '../managers/RoomManager';

describe('RoomManager', () => {
    beforeEach(() => {
        // Reset the RoomManager instance before each test
        RoomManager.getInstance().reset();
    });

    test('should be a singleton', () => {
        const instance1 = RoomManager.getInstance();
        const instance2 = RoomManager.getInstance();
        expect(instance1).toBe(instance2);
    });

    test('should set and track the current level', () => {
        const roomManager = RoomManager.getInstance();
        
        // Default level should be 1
        expect((roomManager as any).currentLevel).toBe(1);
        
        // Set to level 2
        roomManager.setCurrentLevel(2);
        expect((roomManager as any).currentLevel).toBe(2);
        
        // Set to level 3
        roomManager.setCurrentLevel(3);
        expect((roomManager as any).currentLevel).toBe(3);
    });

    test('should return the correct room type based on position', () => {
        const roomManager = RoomManager.getInstance();
        
        // For level 1
        roomManager.setCurrentLevel(1);
        expect(roomManager.getRoomType({ x: 0, y: 1 })).toBe('start');
        expect(roomManager.getRoomType({ x: 3, y: 1 })).toBe('boss');
        expect(roomManager.getRoomType({ x: 1, y: 0 })).toBe('normal');
        expect(roomManager.getRoomType({ x: 2, y: 0 })).toBe('item');
        
        // For level 2
        roomManager.setCurrentLevel(2);
        expect(roomManager.getRoomType({ x: 0, y: 1 })).toBe('start');
        expect(roomManager.getRoomType({ x: 3, y: 2 })).toBe('boss');
    });

    test('should track visited rooms correctly', () => {
        const roomManager = RoomManager.getInstance();
        const position = { x: 1, y: 1 };
        
        // Room should not be visited initially
        expect(roomManager.isRoomVisited(position)).toBe(false);
        
        // Mark room as visited by getting available portals
        roomManager.getAvailablePortals(position);
        
        // Room should now be visited
        expect(roomManager.isRoomVisited(position)).toBe(true);
        
        // Reset should clear visited rooms
        roomManager.resetVisitedRooms();
        expect(roomManager.isRoomVisited(position)).toBe(false);
    });

    test('should return available portals for a position', () => {
        const roomManager = RoomManager.getInstance();
        roomManager.setCurrentLevel(1);
        
        // Start position at level 1
        const startPosition = { x: 0, y: 1 };
        const startPortals = roomManager.getAvailablePortals(startPosition);
        
        // Only east portal should be available from start
        expect(startPortals.length).toBe(1);
        expect(startPortals[0].direction).toBe('east');
        
        // After visiting the first room, get portals for the next room
        const nextPosition = { x: 1, y: 1 };
        const nextPortals = roomManager.getAvailablePortals(nextPosition);
        
        // At position (1,1), north, east, and possibly south portals should be available 
        // (not west since it's already visited)
        expect(nextPortals.length).toBe(3);
        const directions = nextPortals.map(p => p.direction);
        expect(directions).toContain('north');
        expect(directions).toContain('east');
        expect(directions).toContain('south');
    });

    test('should return the correct spawn position based on entry direction', () => {
        const roomManager = RoomManager.getInstance();
        
        // Default spawn position
        const defaultSpawn = roomManager.getSpawnPosition();
        expect(defaultSpawn).toEqual({ x: 200, y: 150 });
        
        // Specific entry directions
        expect(roomManager.getSpawnPosition('north')).toEqual({ x: 200, y: 30 });
        expect(roomManager.getSpawnPosition('south')).toEqual({ x: 200, y: 270 });
        expect(roomManager.getSpawnPosition('east')).toEqual({ x: 370, y: 150 });
        expect(roomManager.getSpawnPosition('west')).toEqual({ x: 30, y: 150 });
    });

    test('should return the opposite direction', () => {
        const roomManager = RoomManager.getInstance();
        
        expect(roomManager.getOppositeDirection('north')).toBe('south');
        expect(roomManager.getOppositeDirection('south')).toBe('north');
        expect(roomManager.getOppositeDirection('east')).toBe('west');
        expect(roomManager.getOppositeDirection('west')).toBe('east');
        expect(roomManager.getOppositeDirection('invalid')).toBe('default');
    });

    test('should calculate the next room position based on current position and direction', () => {
        const roomManager = RoomManager.getInstance();
        const currentPosition = { x: 1, y: 1 };
        
        expect(roomManager.getNextRoomPosition(currentPosition, 'north')).toEqual({ x: 1, y: 0 });
        expect(roomManager.getNextRoomPosition(currentPosition, 'south')).toEqual({ x: 1, y: 2 });
        expect(roomManager.getNextRoomPosition(currentPosition, 'east')).toEqual({ x: 2, y: 1 });
        expect(roomManager.getNextRoomPosition(currentPosition, 'west')).toEqual({ x: 0, y: 1 });
    });

    test('should reset all state when reset is called', () => {
        const roomManager = RoomManager.getInstance();
        
        // Set up some state
        roomManager.setCurrentLevel(3);
        roomManager.getAvailablePortals({ x: 1, y: 1 }); // Mark room as visited
        
        // Reset
        roomManager.reset();
        
        // Check state is reset
        expect((roomManager as any).currentLevel).toBe(1);
        expect(roomManager.isRoomVisited({ x: 1, y: 1 })).toBe(false);
    });
}); 