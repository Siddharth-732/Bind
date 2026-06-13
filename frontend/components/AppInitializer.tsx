"use client";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useConnectionStore } from "../store/useConnectionStore";
import { useLodgeStore } from "../store/useLodgeStore";
import { useStatusStore } from "../store/useStatusStore";

export default function AppInitializer() {
  const { authUser, connectSocket, disconnectSocket } = useAuthStore();
  const { getPeers, getPeerRequests, getDiscoverUsers } = useConnectionStore();
  const { getPublicLodges, getMyLodges } = useLodgeStore();
  const { getStatuses, subscribeToStatuses, unsubscribeFromStatuses } = useStatusStore();

  useEffect(() => {
    if (authUser) {
      connectSocket();
      getPeers();
      getPeerRequests();
      getDiscoverUsers();
      getPublicLodges();
      getMyLodges();
      getStatuses();
      subscribeToStatuses();
    } else {
      disconnectSocket();
      unsubscribeFromStatuses();
    }
    
    return () => {
      disconnectSocket();
      unsubscribeFromStatuses();
    };
  }, [
    authUser,
    connectSocket,
    disconnectSocket,
    getPeers,
    getPeerRequests,
    getDiscoverUsers,
    getPublicLodges,
    getMyLodges,
    getStatuses,
    subscribeToStatuses,
    unsubscribeFromStatuses
  ]);

  return null;
}
