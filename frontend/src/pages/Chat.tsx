import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, TextField, IconButton } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { sendChatRequest, getUserChats, deleteUserChats } from "../helpers/api-communicator";
import ChatItem from "../components/chat/ChatItem";
import { Home, Logout, Delete, Send } from "@mui/icons-material";

interface ChatMessage {
  role: string;
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history when component mounts
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await getUserChats();
        if (data.chats && Array.isArray(data.chats)) {
          setChatMessages(data.chats);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        toast.error("Failed to load chat history");
      }
    };

    fetchChats();
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to the chat
    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Send message to backend
      const data = await sendChatRequest(inputMessage);
      
      // Add AI response to the chat
      if (data.chats && Array.isArray(data.chats) && data.chats.length > 0) {
        const lastMessage = data.chats[data.chats.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          setChatMessages((prev) => [...prev, lastMessage]);
        }
      }
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
      
      // Remove the user message if the request failed
      setChatMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth?.logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleDeleteChats = async () => {
    try {
      await deleteUserChats();
      setChatMessages([]);
      toast.success("Chat history deleted");
    } catch (error) {
      toast.error("Failed to delete chat history");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box
      width="100%"
      height="100vh"
      display="flex"
      flexDirection="column"
      bgcolor="#121212"
      color="white"
    >
      {/* Header with navigation buttons */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={2}
        borderBottom="1px solid #333"
      >
        <Box display="flex" alignItems="center">
          <Typography variant="h5">
            Chat with AI
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<Home />}
            onClick={() => navigate("/")}
          >
            Home
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<Delete />}
            onClick={handleDeleteChats}
          >
            Clear Chat
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<Logout />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Chat messages container */}
      <Box
        flex={1}
        overflow="auto"
        p={2}
        display="flex"
        flexDirection="column"
      >
        {chatMessages.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Typography variant="h6" color="textSecondary">
              No messages yet. Start a conversation!
            </Typography>
          </Box>
        ) : (
          chatMessages.map((message, index) => (
            <ChatItem
              key={index}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))
        )}
        {isLoading && (
          <Box display="flex" justifyContent="flex-start" mb={2}>
            <Box
              maxWidth="70%"
              bgcolor="#1e1e1e"
              color="white"
              p={2}
              borderRadius={2}
            >
              <Typography variant="body1">AI is thinking...</Typography>
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message input */}
      <Box
        display="flex"
        p={2}
        borderTop="1px solid #333"
        bgcolor="#1e1e1e"
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "white",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#555",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#777",
            },
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00fffc",
            },
          }}
          InputProps={{
            style: { color: "white" },
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={isLoading || !inputMessage.trim()}
          sx={{ ml: 1 }}
        >
          <Send />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;