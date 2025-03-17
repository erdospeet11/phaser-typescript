import { GameDatabase } from '../services/GameDatabase';
import '@testing-library/jest-dom';

function createMockResponse(options: Partial<Response>): Response {
    return {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        redirected: false,
        type: 'basic',
        url: '',
        clone: jest.fn().mockReturnThis(),
        body: null,
        bodyUsed: false,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
        blob: jest.fn().mockResolvedValue(new Blob()),
        formData: jest.fn().mockResolvedValue(new FormData()),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(''),
        ...options
    } as Response;
}

const originalFetch = window.fetch;
window.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('GameDatabase', () => {
    let db: GameDatabase;
    let mockFetch: jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        mockFetch = window.fetch as jest.MockedFunction<typeof fetch>;
        mockFetch.mockReset();
        
        const defaultResponse = createMockResponse({
            ok: true,
            json: jest.fn().mockResolvedValue([{
                player_name: 'TestPlayer',
                score: 100,
                date: '2023-01-01T12:00:00Z'
            }])
        });
        mockFetch.mockResolvedValue(defaultResponse);
        
        Object.defineProperty(GameDatabase, 'instance', { value: undefined });
        
        db = GameDatabase.getInstance();
    });

    afterAll(() => {
        window.fetch = originalFetch;
    });

    test('should be a singleton', () => {
        const instance1 = GameDatabase.getInstance();
        const instance2 = GameDatabase.getInstance();
        expect(instance1).toBe(instance2);
    });

    test('should initialize without errors', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({
            ok: true,
            json: jest.fn().mockResolvedValue([])
        }));
        
        await expect(db.initialize()).resolves.not.toThrow();
        
        expect(mockFetch).toHaveBeenCalledWith(
            `${(db as any).API_URL}/scores?limit=1`,
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json'
                })
            })
        );
    });

    test('should save a score successfully', async () => {
        const playerName = 'TestPlayer';
        const score = 100;
        
        mockFetch.mockResolvedValueOnce(createMockResponse({
            ok: true,
            json: jest.fn().mockResolvedValue({ id: 1 })
        }));
        
        await expect(db.saveScore(playerName, score)).resolves.not.toThrow();
        
        expect(mockFetch).toHaveBeenCalledWith(
            `${(db as any).API_URL}/scores`,
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({ playerName, score })
            })
        );
    });

    test('should throw an error when score save fails', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            text: jest.fn().mockResolvedValue('Server error')
        }));
        
        await expect(db.saveScore('Player', 100)).rejects.toThrow();
    });

    test('should retrieve top scores', async () => {
        const limit = 5;
        const mockScores = [
            { player_name: 'Player1', score: 500, date: '2023-01-01' },
            { player_name: 'Player2', score: 400, date: '2023-01-02' }
        ];
        
        mockFetch.mockResolvedValueOnce(createMockResponse({
            ok: true,
            json: jest.fn().mockResolvedValue(mockScores)
        }));
        
        const scores = await db.getTopScores(limit);
        
        expect(mockFetch).toHaveBeenCalledWith(
            `${(db as any).API_URL}/scores?limit=${limit}`,
            expect.objectContaining({
                method: 'GET'
            })
        );
        
        expect(scores).toEqual(mockScores);
    });

    test('should return empty array when getTopScores fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));
        
        const scores = await db.getTopScores(10);
        
        expect(scores).toEqual([]);
    });

    test('should clear all scores', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({
            ok: true,
            json: jest.fn().mockResolvedValue({ message: 'All scores cleared' })
        }));
        
        await expect(db.clearScores()).resolves.not.toThrow();
        
        expect(mockFetch).toHaveBeenCalledWith(
            `${(db as any).API_URL}/scores/clear`,
            expect.objectContaining({
                method: 'POST'
            })
        );
    });

    test('should handle errors when clearing scores', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        await expect(db.clearScores()).resolves.not.toThrow();
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
}); 