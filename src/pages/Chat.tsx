import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  user_id: string;
  provider_id: string;
  service_request_id: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [otherUserName, setOtherUserName] = useState("User");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUserId(user.id);
      await loadOrCreateConversation(user.id);
    };

    initChat();
  }, [requestId]);

  useEffect(() => {
    if (conversation) {
      loadMessages();
      subscribeToMessages();
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadOrCreateConversation = async (userId: string) => {
    // Check if conversation exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("service_request_id", requestId)
      .single();

    if (existing) {
      setConversation(existing);
      loadOtherUserName(existing, userId);
    } else {
      // Create new conversation
      const { data: request } = await supabase
        .from("service_requests")
        .select("user_id, service_provider_id")
        .eq("id", requestId)
        .single();

      if (request) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({
            service_request_id: requestId,
            user_id: request.user_id,
            provider_id: request.service_provider_id,
          })
          .select()
          .single();

        if (newConv) {
          setConversation(newConv);
          loadOtherUserName(newConv, userId);
        }
      }
    }
  };

  const loadOtherUserName = async (conv: Conversation, currentUserId: string) => {
    const otherUserId = conv.user_id === currentUserId ? conv.provider_id : conv.user_id;
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", otherUserId)
      .single();

    if (data?.full_name) {
      setOtherUserName(data.full_name);
    }
  };

  const loadMessages = async () => {
    if (!conversation) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
      markMessagesAsRead(data);
    }
  };

  const markMessagesAsRead = async (msgs: Message[]) => {
    const unreadIds = msgs
      .filter(m => m.sender_id !== currentUserId && !m.read)
      .map(m => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from("messages")
        .update({ read: true })
        .in("id", unreadIds);
    }
  };

  const subscribeToMessages = () => {
    if (!conversation) return;

    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: currentUserId,
      content: newMessage.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } else {
      setNewMessage("");
      
      // Create notification for other user
      const otherUserId = conversation.user_id === currentUserId 
        ? conversation.provider_id 
        : conversation.user_id;
      
      await supabase.from("notifications").insert({
        user_id: otherUserId,
        type: "message",
        title: "New Message",
        message: `You have a new message: ${newMessage.substring(0, 50)}...`,
        related_id: conversation.id,
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar>
              <AvatarFallback>{otherUserName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold">{otherUserName}</h1>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Video className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isMine = message.sender_id === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[70%] p-3 ${
                  isMine
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </Card>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-card">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon" className="rounded-full">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
