import React, { useState } from "react";
import api from '../../services/api';
import './PostsPanel.css';

function PostsPanel({ posts = [], formatTime, isOwnProfile, onPostCreated, onPostDeleted }) {
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/posts', { content: newPostContent });
      setNewPostContent('');
      if (onPostCreated) onPostCreated(response.data.post);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      if (onPostDeleted) onPostDeleted(postId);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  return (
      <div className="profile-card">
        <h3 className="profile-card-title">Posts</h3>
        
        {isOwnProfile && (
          <form onSubmit={handleCreatePost} className="create-post-form">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
            />
            <button type="submit" disabled={isSubmitting || !newPostContent.trim()}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </form>
        )}

        {posts.length === 0 ? (
          <p className="no-content">No posts yet</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-item">
              <p className="post-content">{post.content}</p>
              <div className="post-footer">
                <span className="post-time">{formatTime(post.created_at)}</span>
                {isOwnProfile && (
                  <button 
                    className="delete-post-btn" 
                    onClick={() => handleDeletePost(post.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
  );
}

export default PostsPanel;