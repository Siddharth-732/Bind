import React from "react";
import { Heart } from "lucide-react";
import { Post } from "../store/usePostStore";
import { AuthUser } from "../store/useAuthStore";

interface PostCardProps {
  post: Post;
  authUser: AuthUser | null;
  toggleLike: (postId: string) => void;
}

export default function PostCard({ post, authUser, toggleLike }: PostCardProps) {
  const hasLiked = post.likes.includes(authUser?._id || "");

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm border border-subtle">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-surface-muted overflow-hidden shrink-0">
          {post.author?.avatar ? (
            <img
              src={post.author.avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-brand flex items-center justify-center text-white font-bold">
              {post.author?.displayName?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-bold text-primary">{post.author?.displayName}</p>
          <p className="text-xs text-secondary">
            {new Date(post.createdAt).toLocaleDateString()} at{" "}
            {new Date(post.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <p className="text-primary mb-4 whitespace-pre-wrap">{post.content}</p>

      {post.image && (
        <div className="mb-4 rounded-xl overflow-hidden border border-subtle">
          <img
            src={post.image}
            alt="Post attachment"
            className="w-full max-h-[400px] object-cover"
          />
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-surface-muted text-secondary text-xs font-medium rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-6 pt-4 border-t border-subtle">
        <button
          onClick={() => toggleLike(post._id)}
          className={`flex items-center gap-2 text-sm font-bold transition-colors ${
            hasLiked ? "text-red-500" : "text-secondary hover:text-red-500"
          }`}
        >
          <Heart size={18} className={hasLiked ? "fill-red-500" : ""} />
          {post.likes.length > 0 && <span>{post.likes.length}</span>}
        </button>
      </div>
    </div>
  );
}
