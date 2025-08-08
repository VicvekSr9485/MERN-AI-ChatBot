import React from "react";
import { Box, Typography } from "@mui/material";
import { formatTimestamp } from "../../utils/helpers";

interface ChatItemProps {
  role: string;
  content: string;
  timestamp?: Date;
}

const ChatItem = ({ role, content, timestamp }: ChatItemProps) => {
  return (
    <Box
      display="flex"
      justifyContent={role === "user" ? "flex-end" : "flex-start"}
      mb={2}
    >
      <Box
        maxWidth="70%"
        bgcolor={role === "user" ? "#00fffc" : "#1e1e1e"}
        color={role === "user" ? "black" : "white"}
        p={2}
        borderRadius={2}
      >
        <Typography variant="body1">{content}</Typography>
        {timestamp && (
          <Typography variant="caption" display="block" mt={1} textAlign="right">
            {formatTimestamp(timestamp)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ChatItem;