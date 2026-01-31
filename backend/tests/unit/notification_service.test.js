const NotificationService = require('../../services/NotificationService');

describe('NotificationService - Unit Tests', () => {
    let notificationService;
    let mockClientsMap;

    beforeEach(() => {
        mockClientsMap = new Map();
        notificationService = new NotificationService(mockClientsMap);
    });

    it('should send message if the user is connected in SSE format', () => {
        const userId = 'user-123';
        const testMessage = { type: 'new_post', text: 'Hello!' };
        
        const mockResponse = {
            write: jest.fn()
        };

        mockClientsMap.set(userId, mockResponse);

        notificationService.send(userId, testMessage);

        const expectedPayload = `data: ${JSON.stringify(testMessage)}\n\n`;
        expect(mockResponse.write).toHaveBeenCalledWith(expectedPayload);
    });

    it('should not throw an error or send anything if the user does not exist in the map', () => {
        const userId = 'non-existent-user';
        const testMessage = { type: 'test' };

        expect(() => {
            notificationService.send(userId, testMessage);
        }).not.toThrow();
    });

    it('should handle multiple clients independently', () => {
        const user1 = 'u1';
        const user2 = 'u2';
        const res1 = { write: jest.fn() };
        const res2 = { write: jest.fn() };

        mockClientsMap.set(user1, res1);
        mockClientsMap.set(user2, res2);

        notificationService.send(user1, { msg: 'for user 1' });

        expect(res1.write).toHaveBeenCalled();
        expect(res2.write).not.toHaveBeenCalled();
    });
});