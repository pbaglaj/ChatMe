const PostService = require('../../services/PostService');

describe('PostService - Unit Tests', () => {
    let postService;
    let mockDb;
    let mockNotificationService;

    beforeEach(() => {
        mockDb = { query: jest.fn() };
        mockNotificationService = { send: jest.fn() };
        postService = new PostService(mockDb, mockNotificationService);
    });

    it('should create post and send notifications to friends', async () => {
        const userId = 1;
        const content = "My new post";

        mockDb.query.mockResolvedValueOnce({ rows: [{ id: 100, content }] });
        mockDb.query.mockResolvedValueOnce({ rows: [{ username: 'testuser' }] });
        mockDb.query.mockResolvedValueOnce({ rows: [{ friend_id: 2 }, { friend_id: 3 }] });

        const result = await postService.createPost(userId, content);

        expect(result.id).toBe(100);
        expect(mockDb.query).toHaveBeenCalledTimes(3);

        expect(mockNotificationService.send).toHaveBeenCalledTimes(2);
        expect(mockNotificationService.send).toHaveBeenCalledWith(2, expect.anything());
    });

    it('should throw a 400 error for empty content', async () => {
        await expect(postService.createPost(1, ""))
            .rejects.toMatchObject({ status: 400 });
    });
});