"use client";

import { socket } from "@/lib/socket";
import { useEffect, useState } from "react";
import classes from "./chat.module.css";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Chat = (userId) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [senderId, setSenderId] = useState("");

  const router = useRouter();

  useEffect(() => {
    getSession().then((session) => {
      if (!session) {
        router.replace(`/auth`);
      } else {
        setSenderId(session.user._id);
      }
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("privateMessage", (message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: message, fromMe: false },
      ]);
    });

    socket.on("message", (message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: message, fromMe: true },
      ]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("privateMessage", {
        senderId: senderId,
        recipientId: senderId,
        input: input,
      });
      setInput("");
    }
  };

  return (
    <div className={classes.chat_container}>
      <div className={classes.friend_list}>Danh sách bạn bè</div>
      <div className={classes.message_section}>
        <div className={classes.messages}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${classes.message_row} ${
                message.fromMe && classes.fromMe
              }`}
            >
              <div key={index} className={classes.message}>
                {message.message}
              </div>
            </div>
          ))}
        </div>
        <div className={classes.send}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
        </div>
      </div>
      <div className={classes.user_info}>Thông tin người nhận</div>
    </div>
  );
};

export default Chat;
