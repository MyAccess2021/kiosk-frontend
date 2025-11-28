export function createDeviceWebSocket(deviceToken, { onMessage, onOpen, onClose, onError }) {
  if (!deviceToken) return null;

  const WS_URL = `wss://kiosk-backend.myaccess.cloud/ws/applications/${deviceToken}/?type=web`;


  const socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("[WS] Connected:", deviceToken);
    onOpen && onOpen();

    // Auto Request Initial Payload
    socket.send(JSON.stringify({ action: "get" }));
  };

  socket.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data);
      onMessage && onMessage(data);
    } catch (err) {
      console.error("[WS] Parse Error:", err);
    }
  };

  socket.onclose = () => {
    console.log("[WS] Closed:", deviceToken);
    onClose && onClose();
  };

  socket.onerror = (err) => {
    console.error("[WS] Error:", err);
    onError && onError(err);
  };

  return socket;
}
