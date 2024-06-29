"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getSession } from "next-auth/react";
import defaultProfile from "@/assets/default_profile.svg";
import { useSocket } from "../context/socket-context";
import classes from "./chat.module.css";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Chat = ({ userId, receiverImage, username, history, convoList }) => {
  const [input, setInput] = useState("");
  const [conversationList, setConversationList] = useState(convoList);
  const [senderId, setSenderId] = useState("");
  const [senderImage, setSenderImage] = useState("");

  const router = useRouter();
  const { socket, messages, setMessages } = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getSession().then(async (session) => {
      console.log(session);
      if (!session) {
        router.replace(`/auth`);
      } else {
        setSenderId(session.user._id);
        setSenderImage(session.user.image);
        setMessages(history);
        let result = await fetch("/api/readMessages", {
          method: "POST",
          body: JSON.stringify({
            senderId: session.user._id,
            recipientId: userId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        result = await result.json();

        // Update the conversation list to set unreadCount to 0 for the correct sender
        if (result.modifiedCount > 0) {
          setConversationList((prevConvoList) =>
            prevConvoList.map((convo) =>
              convo.user_info._id === userId
                ? { ...convo, unreadCount: 0 }
                : convo
            )
          );
        }
      }
    });
  }, [history, userId, router, setMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (socket && senderId && input.trim()) {
      socket.emit("privateMessage", {
        senderId,
        recipientId: userId,
        input,
      });
      setInput("");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={classes.chat_container}>
      <div className={classes.friend_list}>
        {conversationList?.map((convo) => (
          <Link href={`/chat/${convo.user_info._id}`} key={convo.user_info._id}>
            <div
              className={`${classes.convo_link} ${
                convo.user_info._id === userId ? classes.current_chat : ""
              }`}
            >
              <Image
                src={
                  convo.user_info.image
                    ? `https://dungbui1110-nextjs-foodies-image.s3.ap-southeast-1.amazonaws.com/${convo.user_info.image}`
                    : defaultProfile
                }
                alt="anh dai dien"
                width={30}
                height={30}
              />
              {convo.user_info.name || convo.user_info.email}
              {convo.unreadCount > 0 && (
                <span className={classes.unread_count}>
                  {convo.unreadCount}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
      <div className={classes.message_section}>
        <div className={classes.messages}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${classes.message_row} ${
                message.recipientId === senderId ? "" : classes.fromMe
              }`}
            >
              <div>
                <div className={classes.basic_info}>
                  {message.recipientId === senderId && (
                    <Image
                      src={
                        receiverImage
                          ? `https://dungbui1110-nextjs-foodies-image.s3.ap-southeast-1.amazonaws.com/${receiverImage}`
                          : defaultProfile
                      }
                      alt="anh dai dien"
                      width={30}
                      height={30}
                    />
                  )}
                  <div className={classes.message}>{message.input}</div>
                  {message.recipientId !== senderId && (
                    <Image
                      src={
                        senderImage
                          ? `https://dungbui1110-nextjs-foodies-image.s3.ap-southeast-1.amazonaws.com/${senderImage}`
                          : defaultProfile
                      }
                      alt="anh dai dien"
                      width={30}
                      height={30}
                    />
                  )}
                </div>
                <p className={classes.time}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
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
      <div className={classes.user_info}>
        <Image
          src={
            receiverImage
              ? `https://dungbui1110-nextjs-foodies-image.s3.ap-southeast-1.amazonaws.com/${receiverImage}`
              : defaultProfile
          }
          alt="anh dai dien"
          width={300}
          height={300}
        />
        <h1>{username}</h1>
        <Link href={`/profile/${userId}`}>Hồ sơ</Link>
      </div>
    </div>
  );
};

export default Chat;
