# Device Payload API Documentation

## Overview

Each device has a **ROOT object** (example: `projects`).

Under this root, multiple **paths** exist (such as `temperature`, `fan_speed`, etc.).

Every path contains **three standard blocks**:

1. **payload** → Live data
2. **config** → UI settings
3. **logs (optional)** → History data + chart configuration

The API supports two main operations:

* **POST** — Create or append data (used only by embedded team)
* **PUT** — Replace the entire `payload` object
* **PATCH** — Update part of config/payload
* **GET** — Read full device state
* **WebSocket** — Realtime updates

---
# 0. How Backend Identifies Logs vs Payload
Backend decides the behavior using data.type:
```
If data.type == "log":
    → Treat as log append
    → Append data.value into <path>.logs.data[]

Else:
    → Treat as payload update
    → Update <path>.payload.value
```
### Supported payload types:

int, float, string, boolean, dict, list

### Supported log type:

log


# 1. POST — Push New Data

POST is used ** by the embedded team**.


### POST Characteristics

* **Creates or updates data** under the specified path

* **Does NOT modify config**

* **`type` and `value` are mandatory**
* **If type == "log" → append to logs**  
* **Otherwise → update payload**

---

## 1.1 POST — Live Data Update

### Endpoint

```
POST /applications/push/<device_token>/projects/temperature/
```

### Body

```json
{
  "key": "live_update",
  "data": {
    "type": "float",
    "value": 31.2
  }
}
```

### Behavior

* Updates **only** `payload.value`
* Keeps `config` unchanged
* Keeps `logs` intact
* Does not reset any structure

### Example Response

```json
{
  "temperature": {
    "payload": { "type": "float", "value": 31.2 },
    "config": { ...same... },
    "logs": { ...same... }
  }
}
```

## When first POST happens to a path with no config & no logs
Incoming POST:
```json
{
  "key": "live_update",
  "data": {
    "type": "float",
    "value": 31.2
  }
}
```
### Backend sees:

* projects.temperature does NOT exist

* So backend must create the path with only payload
### Stored result:
```json
"temperature": {
  "payload": { "type": "float", "value": 31.2 }
}
```
###  Backend response:
``` json
{
  "message": "Path created",
  "path": "projects/temperature",
  "payload": { "type": "float", "value": 31.2 },
  "config_exists": false,
  "logs_exists": false
}
```
## 1.2 POST — Log Entry

Used when embedded team sends **historical data**.

### Endpoint

```
POST /applications/push/<device_token>/projects/temperature/
```

### Body

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
### Example 2
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
### Behavior

* Backend checks
   * `data.type == "log" → Treat as log entry`

* Appends data.value into:
  * `projects.temperature.logs.data[]`
* Does **not** touch:

  * `payload`
  * `config`
* If the path has no logs, backend must create
```json
"logs": {
  "data": []
}
and then append.
```
### Example Response

```json
{
  "message": "Log appended",
  "path": "projects/temperature/logs",
  "appended": {
    "time": "2025-07-01T10:15:00Z",
    "value": 30.8
  },
  "config_exists": true,
  "logs_exists": true,
  "temperature": {
    "payload": { "type": "float", "value": 30.5 },
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
        { "time": "2025-07-01T10:15:00Z", "value": 30.8 }
      ],
      "config": {
        "type": "log",
        "component": {
          "type": "linechart",
          "label": "Temperature History"
        }
      }
    }
  }
}

```
## Example Response (Batch Log Appended)
```json
{
  "message": "Logs appended",
  "path": "projects/temperature/logs",
  "appended_count": 2,
  "config_exists": true,
  "logs_exists": true,
  "temperature": {
    "payload": { "type": "float", "value": 30.5 },
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
        { "time": "2025-07-01T09:00:00Z", "value": 29.8 },
        { "time": "2025-07-01T09:05:00Z", "value": 30.0 }
      ],
      "config": {
        "type": "log",
        "component": {
          "type": "linechart",
          "label": "Temperature History"
        }
      }
    }
  }
}
```
---
## 1.3 POST — Multi-Path Push
Used when embedded wants to send payload/log updates to multiple paths in one single request.
## Endpoint
```
POST /applications/push/<device_token>/
```
### Body Structure
``` json
Example-1

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

Example-2

{
  "paths": {
    "<path1>": {
      "key": "<string>",
      "data": { "type": "<type>", "value": <value> }
    },
    "<path2>": {
      "key": "<string>",
      "data": { "type": "<type>", "value": <value> }
    }
  }
}

```
### Backend Behavior
* For each entry inside "paths":

  * If data.type != "log" → update payload

   * If data.type == "log" → append to logs

   * If path does NOT exist → create path with
```
payload only  (if type != log)
OR
logs only     (if type == log)
```
* Backend must process each path independently

  * Even if one fails → others must still apply.

```json
Example Response
{
  "message": "Multi-path update completed",
  "updated": 3,
  "results": {
    "temperature": {
      "status": "ok",
      "action": "payload_updated",
      "config_exists": true,
      "logs_exists": false
    },
    "humidity": {
      "status": "ok",
      "action": "log_appended",
      "config_exists": true,
      "logs_exists": true
    },
    "fan_speed": {
      "status": "ok",
      "action": "payload_updated",
      "config_exists": true,
      "logs_exists": false
    }
  }
}

Example 2 Responce
{
  "message": "Multi-path update completed",
  "updated": <count>,
  "results": {
    "<path>": {
      "status": "ok",
      "action": "payload_updated | log_appended",
      "config_exists": true,
      "logs_exists": false
    }
  }
}

```
## 1.4 POST — Multi-Operation Push (Payload + Logs for SAME path)
* Used when the embedded team wants to update:
  * payload
   * logs
   * (optional future: log-config)
## Endpoint
```
POST /applications/push/<device_token>/
```
### Body Structure
``` json
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
### Backend Behavior
 * For each <path> inside paths:

### If operations.payload exists → update payload
```
payload = operations.payload.data
```
### If operations.logs exists → append logs
```
logs.data.push(...)
```

### If path does not exist → backend must create it
```
<path>: {
  payload: {},
  logs: { data: [] }
}
```
### Every operation inside a path must be processed independently

Even if:

payload update fails

logs append must still succeed

```json
{
  "message": "Multi-operation push completed",
  "results": {
    "temperature": {
      "payload": {
        "status": "ok",
        "action": "payload_updated"
      },
      "logs": {
        "status": "ok",
        "action": "log_appended",
        "count": 1
      },
      "config_exists": true,
      "logs_exists": true
    },
    "humidity": {
      "payload": {
        "status": "ok",
        "action": "payload_updated"
      },
      "config_exists": true,
      "logs_exists": false
    },
    "fan_speed": {
      "logs": {
        "status": "ok",
        "action": "log_appended",
        "count": 2
      },
      "config_exists": true,
      "logs_exists": true
    }
  }
}


```

# 2. PUT — Replace Payload

PUT is used when the **device/backend** wants to **replace the entire `payload` object** for a specific path.

### PUT Rules

* Replaces **only** the `payload` object
* Does **not** modify or delete `config` or `logs`
* If the path does **not exist**, it creates it with only `payload`

---

## 2.1 PUT Example case-1 path exist
```
PUT /applications/push/<device_token>/projects/temperature/

```
```json
{
  "payload": {
    "type": "float",
    "value": 0.0
  }
}
```
* If projects.temperature exists:

   * Replace the entire payload object

   * Keep config as-is

    * keep logs as-is
```json
{
  "message": "Payload replaced",
  "path": "projects/temperature",

  "payload": { "type": "float", "value": 0.0 },

  "config_exists": true,
  "logs_exists": true,

  "temperature": {
    "payload": { "type": "float", "value": 0.0 },

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
        { "time": "2025-07-01T10:00:00Z", "value": 29.1 }
      ],
      "config": {
        "type": "log",
        "component": {
          "type": "linechart",
          "label": "Temperature History"
        }
      }
    }
  }
}
```
### Example case2-path not exist
### Endpoint

```
PUT /applications/push/<device_token>/projects/temperature/
```

### Body

```json
{
  "payload": {
    "type": "float",
    "value": 0.0
  }
}
```

### Behavior

* If the path exists logs not exist → **replace payload** only
* If it does not exist → create path with payload
* Config and logs remain untouched

### Response

```json
{
  "message": "Payload replaced",
  "path": "projects/temperature",
  "payload": { "type": "float", "value": 0.0 },
  
  "config_exists": true,
  "logs_exists": false
}

```


# 3. Patch — partial update

### PATCH is used when the **device/backend** wants to 


Modify a part of payload or config without replacing the whole object.

UI uses PATCH to edit config (label, component type, min/max, etc.).

Devices can use PATCH to update only value or a nested field


## 3.1 PATCH Example

### Endpoint

```
PATCH /applications/devices/<device_id>/projects/<path>/

```

### Body

```json
{
  "config": {
    "component": {
      "label": "Room Temperature"
    }
  }
}

```

### Behavior

 Merge incoming fields into existing object.

If the field does not exist, it is created.

### Response

```json
{
  "message": "Config updated",
  "path": "projects/temperature",
  "config": { ...updated config... }
}

```
### 3.2 PATCH Example — Partial Payload Update
Endpoint
```
PATCH 
/applications/devices/<device_id>/projects/<path>/
```
```json
{
  "payload": {
    "value": 32.5
  }
}
```
* Behavior
  * Only the provided field (value) will be updated

  * Does NOT replace the entire payload

  * Does NOT affect config

   * Does NOT affect logs
### Example Response
```json
{
  "message": "Payload partially updated",
  "path": "projects/temperature",
  "payload": {
    "type": "float",
    "value": 32.5
  }
}
```
# 4. Get — read

### GET is used when the **device/backend** wants to 


UI retrieves the full device object (payload + config + logs)

Health checks / diagnostics


## 24.1 PUT Example

### Endpoint

```
GET /applications/devices/<device_id>/


```

### Responce

```json
{
  "projects": {
    "temperature": {
      "payload": {
        "type": "float",
        "value": 31.2
      },
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

    "fan_control": {
      "fan1": {
        "payload": { "type": "int", "value": 1200 },
        "config": {
          "type": "int",
          "component": {
            "type": "gauge",
            "label": "Fan1 RPM",
            "min": 0,
            "max": 3000
          }
        },
        "logs": {
          "data": [
            { "time": "2025-07-01T10:00:00Z", "value": 1100 }
          ],
          "config": {
            "type": "list",
            "component": { "type": "linechart", "label": "Fan1 RPM History" }
          }
        }
      },

      "fan2": {
        "payload": { "type": "int", "value": 900 },
        "config": {
          "type": "int",
          "component": {
            "type": "gauge",
            "label": "Fan2 RPM",
            "min": 0,
            "max": 3000
          }
        }
      }
    }
  }
}


```
## Path Creation Rules
### When embedded sends POST/PUT to a NEW path:
Backend must create the path automatically

Only add payload

Do NOT auto-create config

Do NOT auto-create logs
```json
Example

POST /applications/push/<token>/projects/humidity/
Body:

{
  "key": "live",
  "data": { "type": "float", "value": 45.0 }
}
Backend must create:

"humidity": {
  "payload": { "type": "float", "value": 45.0 }
}
Response
{
  "message": "Path created",
  "path": "projects/humidity",
  "config_exists": false
}
```
## Path Mismatch Rules

If embedded sends data to a path that UI does NOT have a config for:

Backend must:

Create the path

Insert payload/logs

Do NOT remove or modify other existing paths

Return config_exists:false

## Config Preservation Rules

POST → never touches config

PUT → only replaces payload, not config

PATCH → only way to update config

DELETE → only admin can delete config

## WebSocket — Real-time updates

Devices and backend can publish real-time updates over WebSocket.

### Connect
Client connects using device metadata:
wss://<host>/ws/applications/<device_token>/

On connect the server **may** send the full device state (GET-like snapshot) as:
``` json
{
  "event": "initial_state",
  "path": "projects",
  "data": { ... full device JSON ... },
  "timestamp": "2025-07-01T10:00:00Z"
}
```
> ⚠️ Note: The backend enforces a fixed event name set. Do not invent new event types. The common event used here is `value_changed`. UI should detect message semantics by looking at the `path` field, not by a custom event name.

### Message types (server sends)

#### 1) Payload update (live widget)
Used when a payload value changes.
```json
Example:
{
  "event": "value_changed",
  "path": "projects/temperature/payload",
  "data": { "type": "float", "value": 31.2 },
  "timestamp": "2025-07-01T10:30:00Z"
}
```
UI behavior:
- If the `path` ends with `/payload` → update the UI widget for `projects.temperature` (read config to render).
- Do not modify `config` or `logs`.

#### 2) Log append (history entry)
Because the backend does not allow a custom `log_added` event name, log entries are sent using the same `value_changed` event but with a path pointing into logs.
```json
Example:
{
  "event": "value_changed",
  "path": "projects/temperature/logs/data",
  "data": {
    "type": "log",
    "value": { "time": "2025-07-01T10:35:00Z", "value": 31.4 }
  },
  "timestamp": "2025-07-01T10:35:00Z"
}
```
UI behavior:
- If `path` contains `/logs/` (e.g. `/logs/data`) → treat incoming `data.value` as a log entry and append it to `projects.temperature.logs.data[]`.
- If `logs.config` exists → update chart immediately.

### Additional notes
- WS messages MUST include ISO8601 `timestamp`.
- On reconnect the client should request the latest full state via GET or rely on server `initial_state`.
- Do not send or expect `config` changes from devices via WS. Config updates must use PATCH (UI).
## Logs — append examples (POST + WebSocket)

This section shows how logs are appended either by HTTP POST (embedded) or received in real-time via WebSocket.

### 1) Append log via POST (embedded)
Endpoint:
POST /applications/push/<device_token>/projects/temperature/
```json
Body:
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
Behavior:
- Backend appends `{ time, value }` into `projects.temperature.logs.data[]`.
- Response: 200 OK and the updated `logs.data[]` (or minimally confirm success).
```json
Example response:
{
  "message": "Log appended",
  "path": "projects/temperature/logs",
  "appended": { "time": "2025-07-01T10:15:00Z", "value": 30.8 }
}
```
### 2) Append log via WebSocket (realtime)
```json
Server emits:
{
  "event": "value_changed",
  "path": "projects/temperature/logs/data",
  "data": { "type": "log", "value": { "time": "2025-07-01T10:35:00Z", "value": 31.4 } },
  "timestamp": "2025-07-01T10:35:00Z"
}
```
Behavior:
- Client appends `data.value` to `projects.temperature.logs.data[]`.
- If `logs.config` exists → update chart.

### 3) Bulk log push (optional)
If embedded wants to push several log entries at once, allow `type: list` with an array:
```json
POST body:
{
  "key": "2025-07-01-batch",
  "data": {
    "type": "log",
    "value": [
      { "time": "2025-07-01T09:00:00Z", "value": 29.1 },
      { "time": "2025-07-01T09:05:00Z", "value": 29.6 }
    ]
  }
}
```
Behavior:
- Backend appends all entries to `projects.<path>.logs.data[]` in order.
## Key naming for log entries 
Embedded may optionally provide a `key` string in the POST body. Behavior:

* If embedded provides `key`:
  - Backend stores that key along with the log entry (useful for grouping, day keys, or human-readable IDs).
  - Example: `"key": "01_Monday_July_2025"`.

* If embedded does NOT provide `key`:
```json
  - Backend MUST generate a unique key (e.g. UUID or timestamp-based unique string) and return it in the response:
    {
      "message": "Log appended",
      "path": "projects/temperature/logs",
      "appended_key": "auto-20250701T103500Z-uuid"
    }
  - This guarantees every log entry has an identifier.
```
Notes:
* The `key` is not the path name. The path (e.g., `projects/temperature`) is the location; `key` is a per-entry identifier.
* UI and backend can use `key` for grouping or batch operations (e.g., export by `key`).
##  Final full JSON example 
```json
Final full example (nested, payload + config + logs)

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
    "fan_control": {
      "fan1": {
        "payload": { "type": "int", "value": 1200 },
        "config": {
          "type": "int",
          "component": {
            "type": "gauge",
            "label": "Fan1 RPM",
            "min": 0,
            "max": 3000
          }
        },
        "logs": {
          "data": [
            { "time": "2025-07-01T10:00:00Z", "value": 1100 }
          ],
          "config": {
            "type": "list",
            "component": { "type": "linechart", "label": "Fan1 RPM History" }
          }
        }
      },
      "fan2": {
        "payload": { "type": "int", "value": 900 },
        "config": {
          "type": "int",
          "component": {
            "type": "gauge",
            "label": "Fan2 RPM",
            "min": 0,
            "max": 3000
          }
        }
      }
    }
  }
}

```
##  Final notes
- Embedded should only send `payload` updates and `logs`. They must never send `config`.
- Backend must always preserve `config` and return `config_exists:false` for newly created paths.
- UI reads `config` to render widgets; logs are appended into `...logs.data[]` and use `logs.config` for charts.
- WebSocket messages use fixed event names (e.g. `value_changed`) — clients must inspect `path` to decide whether message is a payload update or a logs append.
