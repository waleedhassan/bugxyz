import { useState } from 'react';
import { useBugComments, useAddComment } from '@/hooks/useBugs';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { timeAgo } from '@/lib/utils';
import { Send } from 'lucide-react';

interface CommentSectionProps {
  bugId: number;
}

export default function CommentSection({ bugId }: CommentSectionProps) {
  const { data: comments, isLoading } = useBugComments(bugId);
  const addComment = useAddComment();
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addComment.mutate(
      { bugId, data: { content: content.trim() } },
      { onSuccess: () => setContent('') }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar
                alt={comment.authorName}
                src={comment.authorAvatarUrl}
                size="sm"
              />
              <div className="flex-1 rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{comment.authorName}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                  {comment.isInternal && (
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded">
                      Internal
                    </span>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          rows={2}
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!content.trim() || addComment.isPending}
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
