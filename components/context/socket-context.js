import React, { createContext, useContext, useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { getSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState("");
  const [userId, setUserId] = useState(null);
  const pathName = usePathname();
  let notiCount = 0;
  let listenerCount = 0;

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        console.log("joining room");
        setUserId(session.user._id);

        socket.emit("joinRoom", session.user._id);

        // Listener for incoming private messages
        if (listenerCount <= 0) {
          listenerCount = 0;
          socket.on("privateMessage", (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);

            console.log(pathName);
            // Notify user if not on the chat page
            if (!pathName.startsWith("/chat") && notiCount === 0) {
              notiCount++;
              toast("Có tin nhắn mới");
            }

            // Reset notification count after 5 seconds
            setTimeout(() => {
              notiCount = 0;
            }, 5000);
          });
          listenerCount++;

          // Listener for messages sent by the current user
          socket.on("message", (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
          });
          listenerCount++;
        }
      } else console.log("no session");
      return () => {
        // Clean up listeners and close socket on component unmount
        socket.off("privateMessage");
        listenerCount--;
        socket.off("message");
        listenerCount--;
        console.log(listenerCount);
      };
    });
    return () => {
      // Clean up listeners and close socket on component unmount
      socket.off("privateMessage");
      listenerCount--;
      socket.off("message");
      listenerCount--;
      console.log("this is checking from the outer return: " + listenerCount);
      // socket.disconnect();
    };
  }, [connection]);

  return (
    <SocketContext.Provider
      value={{ socket, messages, setMessages, userId, setConnection }}
    >
      <ToastContainer />
      {children}
    </SocketContext.Provider>
  );
};
