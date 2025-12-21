import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDiscussions, useDiscussionReplies } from '@/hooks/useDiscussions';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Send, Plus, ArrowLeft, Trash2, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'homework', label: 'Homework Help' },
  { id: 'study', label: 'Study Groups' },
  { id: 'events', label: 'Events' },
];

export function DiscussionView() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [category, setCategory] = useState('all');
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { discussions, isLoading, createDiscussion, deleteDiscussion } = useDiscussions(category);

  if (!user) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="font-display text-xl mb-2">Join the Discussion</h2>
        <p className="text-muted-foreground mb-4">Sign in to participate in community discussions</p>
        <Button asChild>
          <a href="/auth">Sign In</a>
        </Button>
      </div>
    );
  }

  if (selectedDiscussion) {
    return (
      <DiscussionThread
        discussionId={selectedDiscussion}
        onBack={() => setSelectedDiscussion(null)}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between gap-4">
        <Tabs value={category} onValueChange={setCategory} className="flex-1">
          <TabsList className="w-full justify-start overflow-x-auto">
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="shrink-0">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Post</DialogTitle>
            </DialogHeader>
            <CreatePostForm
              onSubmit={async (title, content, cat) => {
                await createDiscussion.mutateAsync({ title, content, category: cat });
                setIsCreateOpen(false);
              }}
              isSubmitting={createDiscussion.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : discussions.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No discussions yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Be the first to start a conversation!</p>
          <Button onClick={() => setIsCreateOpen(true)}>Create Post</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {discussions.map((discussion, index) => (
            <Card
              key={discussion.id}
              className="card-interactive cursor-pointer animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setSelectedDiscussion(discussion.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={discussion.author_avatar || undefined} />
                    <AvatarFallback>{discussion.author_name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {discussion.is_pinned && <Pin className="w-3 h-3 text-primary" />}
                      <h3 className="font-medium truncate">{discussion.title || 'Untitled'}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{discussion.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{discussion.author_name}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {discussion.reply_count} replies
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary">{discussion.category}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CreatePostForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (title: string, content: string, category: string) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    await onSubmit(title, content, category);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>
      <div>
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={2000}
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
          <Badge
            key={cat.id}
            variant={category === cat.id ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCategory(cat.id)}
          >
            {cat.label}
          </Badge>
        ))}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting || !title.trim() || !content.trim()}>
        {isSubmitting ? 'Posting...' : 'Post'}
      </Button>
    </form>
  );
}

function DiscussionThread({ discussionId, onBack }: { discussionId: string; onBack: () => void }) {
  const { user } = useAuth();
  const { discussions } = useDiscussions();
  const { replies, isLoading } = useDiscussionReplies(discussionId);
  const { createDiscussion, deleteDiscussion } = useDiscussions();
  const [replyContent, setReplyContent] = useState('');

  const discussion = discussions.find(d => d.id === discussionId);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    await createDiscussion.mutateAsync({
      content: replyContent,
      parent_id: discussionId,
    });
    setReplyContent('');
  };

  if (!discussion) {
    return (
      <div className="text-center py-12">
        <p>Discussion not found</p>
        <Button variant="link" onClick={onBack}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Button>

      <Card className="card-elevated">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={discussion.author_avatar || undefined} />
              <AvatarFallback>{discussion.author_name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="font-display text-lg">{discussion.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {discussion.author_name} • {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
              </p>
            </div>
            {discussion.user_id === user?.id && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  deleteDiscussion.mutate(discussionId);
                  onBack();
                }}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{discussion.content}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-medium text-sm text-muted-foreground">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h3>

        {replies.map((reply, index) => (
          <Card key={reply.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={reply.author_avatar || undefined} />
                  <AvatarFallback>{reply.author_name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{reply.author_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                </div>
                {reply.user_id === user?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => deleteDiscussion.mutate(reply.id)}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <form onSubmit={handleReply} className="flex gap-2">
        <Input
          placeholder="Write a reply..."
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          maxLength={1000}
        />
        <Button type="submit" disabled={!replyContent.trim() || createDiscussion.isPending}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
