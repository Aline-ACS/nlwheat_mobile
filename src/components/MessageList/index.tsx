import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { io } from "socket.io-client";
import { ScrollView } from "react-native";

import { Message } from "../Message";
import { MESSAGES_EXAMPLE } from "../../utils/messages";

import { styles } from "./styles";

type MessageProps = {
  id: string;
  text: string;
  user: {
    name: string;
    avatar_url: string;
  };
};

let messagesQueue: MessageProps[] = MESSAGES_EXAMPLE;

const socket = io(String(api.defaults.baseURL));
socket.on("new_message", (newMessage) => {
  messagesQueue.push(newMessage);
});

export function MessageList() {
  const [currentMessages, setCurrentMessages] = useState<MessageProps[]>([]);

  useEffect(() => {
    async function fetchMessages() {
      const messageResponse = await api.get<MessageProps[]>("/messages/last3");
      setCurrentMessages(messageResponse.data);
    }
    fetchMessages();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setCurrentMessages((prevState) => [
          messagesQueue[0],
          prevState[0],
          prevState[1],
        ]);
        messagesQueue.shift();
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="never"
    >
      {currentMessages.map((message) => (
        <Message data={message} key={message.id} />
      ))}
    </ScrollView>
  );
}