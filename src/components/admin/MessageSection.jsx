import MessageCard from "../common/MessageCard";
import { useContactStore } from "../../store/useContactStore";
import { useEffect } from "react";

const MessageSection = () => {
  const { messages, getMessages, deleteMessage } = useContactStore();

  useEffect(() => {
    getMessages();
  }, [getMessages]);

  return (
    <div className="grid min-[1024px]:max-[1120px]:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {messages.map((msg) => (
        <MessageCard
          key={msg._id}
          message={msg}
          onDelete={deleteMessage}
        />
      ))}
    </div>
  );
};

export default MessageSection;