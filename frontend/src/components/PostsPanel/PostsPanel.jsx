import React from "react";
import './PostsPanel.css';

function PostsPanel({ posts = [], formatTime }) {
  return (
      <div className="profile-card">
        <h3 className="profile-card-title">Posts</h3>
        {posts.length === 0 ? (
          <p className="no-content">No posts yet</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-item">
              <p className="post-content">{post.content}</p>
              <span className="post-time">{formatTime(post.time)}</span>
            </div>
          ))
        )}
      </div>
  );
}

export default PostsPanel;