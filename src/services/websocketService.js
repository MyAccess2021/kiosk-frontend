// --- WebSocket Service ---
let activeSocket = null;

export function createDeviceWebSocket(deviceToken, { onMessage, onOpen, onClose, onError }) {
  if (!deviceToken) return null;

  // 1. Construct URL (As per backend doc)
  const WS_URL = `wss://kiosk-backend.myaccess.cloud/ws/applications/${deviceToken}/?type=web`;

  console.log("[WS] Connecting to:", WS_URL);
  const socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("[WS] Connected successfully");
    
    // 2. Auto-Subscribe to Root Path (As per doc)
    // Doc says: connecting by default subscribes to root, but sending explicit subscribe is safer.
    const subscribeMsg = {
        "action": "subscribe",
        "paths": ["/"] 
    };
    socket.send(JSON.stringify(subscribeMsg));
    
    // 3. Request Initial Data (GET)
    const getMsg = {
        "action": "get",
        "path": "/"
    };
    socket.send(JSON.stringify(getMsg));

    if (onOpen) onOpen();
  };

  socket.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data);
      // console.log("[WS] Received:", data); // Uncomment for debug
      if (onMessage) onMessage(data);
    } catch (err) {
      console.error("[WS] Parse Error:", err);
    }
  };

  socket.onclose = (e) => {
    console.log("[WS] Closed", e.reason);
    activeSocket = null;
    if (onClose) onClose();
  };

  socket.onerror = (err) => {
    console.error("[WS] Error:", err);
    if (onError) onError(err);
  };

  activeSocket = socket;
  return socket;
}

// Function to send data (PUT/WRITE)
export function sendToDevice(message) {
  if (!activeSocket || activeSocket.readyState !== WebSocket.OPEN) {
    console.warn("[WS] Cannot send, socket not open");
    return;
  }
  console.log("[WS -> Device] Sending:", message);
  activeSocket.send(JSON.stringify(message));
}