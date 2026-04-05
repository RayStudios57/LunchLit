import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Send, Image as ImageIcon, Smile, Check, CheckCheck, AlertTriangle, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Simple inappropriate content filter
const FLAGGED_WORDS = [
  'fuck', 'shit', 'bitch', 'ass', 'damn', 'dick', 'pussy', 'cock', 'cunt',
  'nigger', 'nigga', 'faggot', 'retard', 'kys', 'kill yourself', 'suicide',
  'nude', 'nudes', 'sext', 'porn', 'xxx',
];

function checkInappropriate(text: string): string | null {
  const lower = text.toLowerCase();
  for (const word of FLAGGED_WORDS) {
    if (lower.includes(word)) return `Contains inappropriate language: "${word}"`;
  }
  return null;
}

const EMOJI_LIST = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💪', '📚', '✨', '😢', '😡', '🤔', '👀', '💯', '🙏', '😎', '🥳', '😴', '🤝', '👋'];

interface FriendChatProps {
  friendUserId: string;
  friendName: string;
  friendAvatar?: string | null;
  onBack: () => void;
}

export function FriendChat({ friendUserId, friendName, friendAvatar, onBack }: FriendChatProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [friendTyping, setFriendTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['direct-messages', user?.id, friendUserId],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${friendUserId}),and(sender_id.eq.${friendUserId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 3000,
  });

  // Mark messages as read
  useEffect(() => {
    if (!user || !messages.length) return;
    const unread = messages.filter(
      m => m.sender_id === friendUserId && m.receiver_id === user.id && !m.read_at
    );
    if (unread.length > 0) {
      const ids = unread.map(m => m.id);
      supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', ids)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['direct-messages', user.id, friendUserId] });
        });
    }
  }, [messages, user, friendUserId, queryClient]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`dm-${user.id}-${friendUserId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'direct_messages',
      }, (payload) => {
        const msg = payload.new as any;
        if (
          msg &&
          ((msg.sender_id === user.id && msg.receiver_id === friendUserId) ||
          (msg.sender_id === friendUserId && msg.receiver_id === user.id))
        ) {
          queryClient.invalidateQueries({ queryKey: ['direct-messages', user.id, friendUserId] });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, friendUserId, queryClient]);

  // Typing indicator via Realtime presence
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`typing-${[user.id, friendUserId].sort().join('-')}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const friendPresence = state[friendUserId];
        if (friendPresence && Array.isArray(friendPresence)) {
          const isTyping = friendPresence.some((p: any) => p.typing === true);
          setFriendTyping(isTyping);
        } else {
          setFriendTyping(false);
        }
      })
      .subscribe();

    typingChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      typingChannelRef.current = null;
    };
  }, [user, friendUserId]);

  // Broadcast typing status
  const broadcastTyping = useCallback((typing: boolean) => {
    if (typingChannelRef.current) {
      typingChannelRef.current.track({ typing });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    broadcastTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => broadcastTyping(false), 2000);
  };

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, friendTyping]);

  const sendMessage = useMutation({
    mutationFn: async (opts?: { imageUrl?: string }) => {
      if (!user) return;
      const content = message.trim();
      const imageUrl = opts?.imageUrl;
      if (!content && !imageUrl) return;

      // Check moderation
      const flagReason = content ? checkInappropriate(content) : null;

      const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id,
        receiver_id: friendUserId,
        content: content || (imageUrl ? '📷 Image' : ''),
        image_url: imageUrl || null,
        is_flagged: !!flagReason,
        flag_reason: flagReason,
      });
      if (error) throw error;

      if (flagReason) {
        toast({ title: '⚠️ Message flagged', description: 'Your message was flagged for inappropriate content and may be reviewed.', variant: 'destructive' });
      }
    },
    onSuccess: () => {
      setMessage('');
      broadcastTyping(false);
      queryClient.invalidateQueries({ queryKey: ['direct-messages', user?.id, friendUserId] });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) sendMessage.mutate({});
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Only images allowed', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image too large', description: 'Max 5MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('chat-images').getPublicUrl(path);
      sendMessage.mutate({ imageUrl: urlData.publicUrl });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojis(false);
  };

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto animate-fade-up">
      <Card className="flex flex-col flex-1 overflow-hidden">
        <CardHeader className="py-3 px-4 border-b flex-row items-center gap-3 space-y-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Avatar className="w-8 h-8">
            <AvatarImage src={friendAvatar || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {friendName?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-medium">{friendName}</CardTitle>
            {friendTyping && (
              <p className="text-xs text-primary animate-pulse">typing...</p>
            )}
          </div>
        </CardHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No messages yet. Say hi! 👋
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              const isFlagged = msg.is_flagged;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isFlagged
                      ? 'bg-destructive/10 border border-destructive/30 text-muted-foreground italic'
                      : isMine
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-secondary text-secondary-foreground rounded-bl-md'
                  }`}>
                    {isFlagged ? (
                      <p className="flex items-center gap-1.5 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        This message was flagged for review
                      </p>
                    ) : (
                      <>
                        {msg.image_url && (
                          <img
                            src={msg.image_url}
                            alt="Shared image"
                            className="rounded-lg max-w-full max-h-48 mb-1 cursor-pointer"
                            onClick={() => window.open(msg.image_url!, '_blank')}
                          />
                        )}
                        {msg.content && msg.content !== '📷 Image' && (
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        )}
                      </>
                    )}
                    <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                      <p className={`text-[10px] ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {isMine && !isFlagged && (
                        <span className={`${msg.read_at ? 'text-blue-400' : isMine ? 'text-primary-foreground/40' : 'text-muted-foreground/40'}`}>
                          {msg.read_at ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {friendTyping && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Emoji picker */}
        {showEmojis && (
          <div className="border-t px-3 py-2 flex flex-wrap gap-1 bg-background">
            {EMOJI_LIST.map(emoji => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="text-xl hover:bg-secondary rounded p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="p-3 border-t flex gap-2 items-center">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send image</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setShowEmojis(!showEmojis)}
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Emojis</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Input
            value={message}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1"
            autoFocus
          />
          <Button type="submit" size="icon" disabled={(!message.trim() && !isUploading) || sendMessage.isPending || isUploading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
