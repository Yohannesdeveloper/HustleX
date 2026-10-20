import { useEffect } from "react";
import { useAppSelector } from "../store/hooks";
import { useWebSocket } from "../context/WebSocketContext";

/**
 * Registers the signed-in user with the socket server on every page.
 * Presence ("online" dots in the freelancer directory and chat) is only true
 * for users who emitted `join` — previously that happened solely on /chat,
 * so anyone browsing elsewhere looked offline.
 */
const PresenceBootstrap: React.FC = () => {
  const userId = useAppSelector((state) => state.auth.user?._id);
  const { joinUser } = useWebSocket();

  useEffect(() => {
    if (!userId) return;
    joinUser(String(userId));
  }, [userId, joinUser]);

  return null;
};

export default PresenceBootstrap;
