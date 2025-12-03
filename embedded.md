# 1. Single Path — Payload Update JSON
### Endpoint
``` POST /applications/push/<device_token>/projects/<path>/```
```json
{
  "key": "live",
  "data": {
    "type": "float",
    "value": 31.2
  }
}
```
# 2. Single Path — Log Update JSON
### Endpoint
``` POST /applications/push/<device_token>/projects/<path>/```
```json
{
  "key": "2025-07-01",
  "data": {
    "type": "log",
    "value": {
      "time": "2025-07-01T10:15:00Z",
      "value": 30.8
    }
  }
}
```
### Batch log push
```json
{
  "key": "batch",
  "data": {
    "type": "log",
    "value": [
      { "time": "2025-07-01T09:00:00Z", "value": 29.8 },
      { "time": "2025-07-01T09:05:00Z", "value": 30.0 }
    ]
  }
}
```
# 3. Multi-Path Push (different paths in one request)
### Endpoint
``` POST /applications/push/<device_token>/```
```json
{
  "paths": {
    "temperature": {
      "key": "live",
      "data": { "type": "float", "value": 31.2 }
    },
    "humidity": {
      "key": "2025-07-02",
      "data": {
        "type": "log",
        "value": {
          "time": "2025-07-02T10:00:00Z",
          "value": 45.1
        }
      }
    },
    "fan_speed": {
      "key": "live",
      "data": { "type": "int", "value": 70 }
    }
  }
}
```
# 4. Multi-Operation Push (Payload + Logs for SAME path)
### Endpoint
``` POST /applications/push/<device_token>/```
```json
{
  "paths": {
    "temperature": {
      "operations": {
        "payload": {
          "key": "live",
          "data": { "type": "float", "value": 31.2 }
        },
        "logs": {
          "key": "2025-07-02",
          "data": {
            "type": "log",
            "value": {
              "time": "2025-07-02T10:00:00Z",
              "value": 45.1
            }
          }
        }
      }
    },

    "humidity": {
      "operations": {
        "payload": {
          "key": "live",
          "data": { "type": "float", "value": 70.1 }
        }
      }
    },

    "fan_speed": {
      "operations": {
        "logs": {
          "key": "batch",
          "data": {
            "type": "log",
            "value": [
              { "time": "2025-07-02T10:00:00Z", "value": 900 },
              { "time": "2025-07-02T10:05:00Z", "value": 950 }
            ]
          }
        }
      }
    }
  }
}
```
# 5. Final Device JSON (backend stores internally)
Note: This is refrence only donot push like that
```json
{
  "projects": {
    "temperature": {
      "payload": { "type": "float", "value": 31.2 },
      "config": {
        "type": "float",
        "component": {
          "type": "gauge",
          "label": "Temperature (°C)",
          "min": 0,
          "max": 100
        }
      },
      "logs": {
        "data": [
          { "time": "2025-07-01T10:00:00Z", "value": 29.1 },
          { "time": "2025-07-01T10:10:00Z", "value": 31.2 }
        ],
        "config": {
          "type": "list",
          "component": {
            "type": "linechart",
            "label": "Temperature History"
          }
        }
      }
    },

    "fan_speed": {
      "payload": { "type": "int", "value": 70 },
      "config": {
        "type": "int",
        "component": {
          "type": "slider",
          "label": "Fan Speed",
          "min": 0,
          "max": 100
        }
      }
    }
  }
}
```
# 6.WebSocket — How Embedded Should Push Data (Same as POST)
### WebSocket URL
```ws://kiosk-backend.myaccess.cloud/ws/applications/<device_token>/?type=hardware```
## 6.1 WS — Payload Update (same as POST #1)
```json
Client → Server

{
  "action": "put",
  "path": "projects/temperature",
  "payload": {
    "type": "float",
    "value": 31.2
  }
}
```
```json
Server → Web UI + Hardware subscribers

{
  "event": "value_changed",
  "path": "projects/temperature/payload",
  "data": { "type": "float", "value": 31.2 },
  "timestamp": "2025-07-01T10:30:00Z"
}
```
## 6.2 WS — Log Append (same as POST log)
```json
Client → Server

{
  "action": "post",
  "path": "projects/temperature",
  "key": "2025-07-01",
  "data": {
    "type": "log",
    "value": {
      "time": "2025-07-01T10:15:00Z",
      "value": 30.8
    }
  }
}

```
```json
Server → Broadcast

{
  "event": "value_changed",
  "path": "projects/temperature/logs/data",
  "data": {
    "type": "log",
    "value": {
      "time": "2025-07-01T10:15:00Z",
      "value": 30.8
    }
  },
  "timestamp": "2025-07-01T10:15:00Z"
}

```
## 6.3 WS — Multi-Path Push (same as POST #3)
```json
Client → Server

{
  "action": "post",
  "paths": {
    "temperature": {
      "key": "live",
      "data": { "type": "float", "value": 31.2 }
    },
    "humidity": {
      "key": "2025-07-02",
      "data": {
        "type": "log",
        "value": {
          "time": "2025-07-02T10:00:00Z",
          "value": 45.1
        }
      }
    }
  }
}


```

### Server → UI

Sends one WS event per updated field:
```json
{
  "event": "value_changed",
  "path": "projects/temperature/payload",
  "data": { "type": "float", "value": 31.2 }
}

```
```json
{
  "event": "value_changed",
  "path": "projects/humidity/logs/data",
  "data": {
    "type": "log",
    "value": { "time": "2025-07-02T10:00:00Z", "value": 45.1 }
  }
}

```
## 6.4 WS — Multi-Operation Push (same as POST #4)
```json
Client → Server

{
  "action": "post",
  "paths": {
    "temperature": {
      "operations": {
        "payload": {
          "key": "live",
          "data": { "type": "float", "value": 31.2 }
        },
        "logs": {
          "key": "2025-07-02",
          "data": {
            "type": "log",
            "value": {
              "time": "2025-07-02T10:00:00Z",
              "value": 45.1
            }
          }
        }
      }
    }
  }
}

```
Server Splits Into 2 WS Events
* 1️⃣ Payload update
```json
{
  "event": "value_changed",
  "path": "projects/temperature/payload",
  "data": { "type": "float", "value": 31.2 }
}
```
* 2️⃣ Log append
```json
{
  "event": "value_changed",
  "path": "projects/temperature/logs/data",
  "data": {
    "type": "log",
    "value": {
      "time": "2025-07-02T10:00:00Z",
      "value": 45.1
    }
  }
}
```
