export type RoomType = 'start' | 'normal' | 'boss';
type RoomLayout = (RoomType | null)[][];
type LevelLayouts = { [key: number]: RoomLayout };
type PortalPosition = { direction: string, x: number, y: number };
type SpawnPosition = { x: number, y: number };

export class RoomManager {
    private static instance: RoomManager;
    private visitedRooms: Set<string> = new Set();
    private currentLevel: number = 1;
    
    // Static room layouts
    //TODO: Add more level type
    private readonly levelLayouts: LevelLayouts = {
        1: [
            [null,    'normal', 'normal', null],
            ['start', 'normal', 'normal', 'boss'],
            [null,    'normal', 'normal', null]
        ],
        2: [
            [null,    'normal', 'normal', 'normal'],
            ['start', 'normal', 'normal', 'normal'],
            [null,    'normal', 'normal', 'boss']
        ],
        3: [
            ['normal', 'normal', 'normal', 'boss'],
            ['normal', 'normal', 'normal', 'normal'],
            ['start',  'normal', 'normal', 'normal']
        ]
    };

    private readonly portalPositions: { [key: string]: PortalPosition } = {
        'north': { direction: 'north', x: 200, y: 30 },
        'south': { direction: 'south', x: 200, y: 270 },
        'east': { direction: 'east', x: 370, y: 150 },
        'west': { direction: 'west', x: 30, y: 150 }
    };

    private readonly spawnPositions: { [key: string]: SpawnPosition } = {
        'north': { x: 200, y: 30 },
        'south': { x: 200, y: 270 },
        'east': { x: 370, y: 150 },
        'west': { x: 30, y: 150 },
        'default': { x: 200, y: 150 }
    };

    public static getInstance(): RoomManager {
        if (!RoomManager.instance) {
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }

    public setCurrentLevel(level: number): void {
        this.currentLevel = level;
        this.resetVisitedRooms();
    }

    private get roomLayout() {
        return this.levelLayouts[this.currentLevel];
    }

    public getRoomType(position: { x: number, y: number }): RoomType {
        return this.roomLayout[position.y][position.x] as RoomType;
    }

    public getAvailablePortals(position: { x: number, y: number }): PortalPosition[] {
        const portals: PortalPosition[] = [];
        const { x, y } = position;

        this.visitedRooms.add(`${x},${y}`);

        // Check each direction for unvisited rooms
        if (y > 0 && this.roomLayout[y-1][x] && !this.visitedRooms.has(`${x},${y-1}`)) {
            portals.push(this.portalPositions['north']);
        }
        if (y < this.roomLayout.length-1 && this.roomLayout[y+1][x] && !this.visitedRooms.has(`${x},${y+1}`)) {
            portals.push(this.portalPositions['south']);
        }
        if (x > 0 && this.roomLayout[y][x-1] && !this.visitedRooms.has(`${x-1},${y}`)) {
            portals.push(this.portalPositions['west']);
        }
        if (x < this.roomLayout[0].length-1 && this.roomLayout[y][x+1] && !this.visitedRooms.has(`${x+1},${y}`)) {
            portals.push(this.portalPositions['east']);
        }

        return portals;
    }

    public getSpawnPosition(entryDirection?: string): SpawnPosition {
        if (!entryDirection) {
            return this.spawnPositions['default'];
        }
        return this.spawnPositions[entryDirection];
    }

    public getOppositeDirection(direction: string): string {
        const oppositeDirections: { [key: string]: string } = {
            'north': 'south',
            'south': 'north',
            'east': 'west',
            'west': 'east'
        };
        return oppositeDirections[direction] || 'default';
    }

    public getNextRoomPosition(currentPosition: { x: number, y: number }, direction: string): { x: number, y: number } {
        const newPosition = { ...currentPosition };
        switch (direction) {
            case 'north': newPosition.y--; break;
            case 'south': newPosition.y++; break;
            case 'east': newPosition.x++; break;
            case 'west': newPosition.x--; break;
        }
        return newPosition;
    }

    public resetVisitedRooms(): void {
        this.visitedRooms.clear();
    }

    public isRoomVisited(position: { x: number, y: number }): boolean {
        return this.visitedRooms.has(`${position.x},${position.y}`);
    }

    public reset(): void {
        this.resetVisitedRooms();
        this.currentLevel = 1;
    }
} 