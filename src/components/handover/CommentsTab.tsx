'use client';

import { useState } from 'react';

interface CommentsTabProps {
  id: string;
  comments: any[];
  userName: string;
  userRole: string;
  onAddComment: (content: string) => void;
}

export default function CommentsTab({ id, comments, userName, userRole, onAddComment }: CommentsTabProps) {
  const [newComment, setNewComment] = useState('');

  const handleAdd = () => {
    if (!newComment.trim() || !userName) return;
    onAddComment(newComment.trim());
    setNewComment('');
  };

  return (
    <div className="space-y-4">
      {/* Add comment */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-6">
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder={userName ? "写下你的评论..." : "请先在上方确认身份"}
          className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 focus:border-orange-400 outline-none resize-none text-sm"
          disabled={!userName}
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleAdd}
            disabled={!newComment.trim() || !userName}
            className="px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发表评论
          </button>
        </div>
      </div>

      {/* Comments list */}
      {comments.map((c, i) => (
        <div key={i} className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-stone-300">{c.user_name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              c.user_role === 'departing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
              c.user_role === 'manager' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
              'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            }`}>
              {c.user_role === 'departing' ? '🚪 离职人' : c.user_role === 'manager' ? '👔 管理者' : '🤝 接手人'}
            </span>
            <span className="text-xs text-gray-400 dark:text-stone-500">{new Date(c.created_at).toLocaleString('zh-CN')}</span>
          </div>
          <p className="text-gray-700 dark:text-stone-300 text-sm whitespace-pre-wrap">{c.content}</p>
        </div>
      ))}
      {comments.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl shadow-lg">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-gray-500 dark:text-stone-400">还没有评论</p>
        </div>
      )}
    </div>
  );
}
