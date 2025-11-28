
import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Select, Typography, Tooltip, Space } from "antd";
import { PlusOutlined, DeleteOutlined, CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

// New Component to handle List/Dict editing safely
const ComplexInput = ({ value, type, onChange }) => {
  const [text, setText] = useState("");

  // Sync internal text state with the actual node value (from WS or Parent)
  useEffect(() => {
    setText(JSON.stringify(value));
  }, [value]);

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(text);
      // Validate types
      if (type === 'list' && !Array.isArray(parsed)) {
        setText(JSON.stringify(value)); // Revert if not array
        return;
      }
      if (type === 'dict' && (typeof parsed !== 'object' || Array.isArray(parsed))) {
        setText(JSON.stringify(value)); // Revert if not object
        return;
      }
      onChange(parsed);
    } catch (e) {
      // Invalid JSON, revert to last known good value
      setText(JSON.stringify(value));
    }
  };

  return (
    <Input
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      placeholder={type === 'list' ? "[1, 2]" : "{\"key\": \"val\"}"}
      size="small"
      style={{ 
        flex: "1 1 140px",
        minWidth: 100,
        fontFamily: "'Roboto Mono', monospace",
        fontSize: 12,
        color: type === 'list' ? "#f57c00" : "#9c27b0"
      }}
    />
  );
};

const NodeEditor = ({ node, onChange, onDelete, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const updateKey = (newKey) => onChange({ ...node, key: newKey });

  const updateType = (newType) => {
    if (newType === "dict") {
      onChange({ ...node, type: "dict", value: {}, children: null });
      return;
    }
    if (newType === "list") {
      onChange({ ...node, type: "list", value: [], children: null });
      return;
    }
    onChange({ ...node, type: newType, value: newType === "boolean" ? "false" : "", children: null });
  };

  const updateValue = (newValue) => onChange({ ...node, value: newValue });

  const addChild = () => {
    const newChild = { key: "", type: null, value: null, children: null };
    onChange({
      ...node,
      type: null,
      value: null,
      children: [...(node.children || []), newChild],
    });
  };

  const updateChild = (index, updatedChild) => {
    const kids = [...(node.children || [])];
    kids[index] = updatedChild;
    onChange({ ...node, children: kids });
  };

  const removeChild = (index) => {
    const kids = (node.children || []).filter((_, i) => i !== index);
    onChange({ ...node, children: kids.length > 0 ? kids : null });
  };

  const hasChildren = node.children && node.children.length > 0;
  const hasType = node.type !== null && node.type !== undefined;
  
  const isDictType = node.type === "dict";
  const isListType = node.type === "list";
  
  // Untyped objects (containers) can add children
  const canAddChildren = !hasType; 

  return (
    <div style={{ 
      borderLeft: level > 0 ? '2px solid #e8eaed' : 'none',
      paddingLeft: level > 0 ? 16 : 0,
      marginBottom: 4
    }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: isHovered ? "#f8f9fa" : "#fff",
          borderRadius: 4,
          border: `1px solid ${isHovered ? "#dadce0" : "#e8eaed"}`,
          transition: "all 0.2s",
          flexWrap: "wrap",
          minHeight: 48
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {hasChildren ? (
          <Button
            type="text"
            size="small"
            icon={isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ 
              padding: 0, 
              width: 24, 
              height: 24,
              minWidth: 24,
              color: "#5f6368",
              flexShrink: 0
            }}
          />
        ) : (
          <div style={{ width: 24, flexShrink: 0 }} />
        )}

        <Input
          value={node.key}
          onChange={(e) => updateKey(e.target.value)}
          placeholder="key"
          size="small"
          style={{ 
            flex: "1 1 140px",
            minWidth: 100,
            maxWidth: 200,
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 13,
            border: "1px solid #dadce0",
            borderRadius: 4
          }}
        />

        <Text 
          style={{ 
            color: "#5f6368", 
            fontSize: 14,
            flexShrink: 0,
            display: hasType || hasChildren ? "inline" : "none"
          }}
        >
          :
        </Text>

        {hasType && (
          <>
            <Select 
              value={node.type} 
              onChange={updateType} 
              size="small"
              style={{ 
                flex: "0 0 auto",
                minWidth: 90,
                fontFamily: "'Roboto Mono', monospace",
                fontSize: 12
              }}
            >
              <Option value="string">
                <Text style={{ color: "#1a73e8", fontFamily: "'Roboto Mono', monospace" }}>string</Text>
              </Option>
              <Option value="int">
                <Text style={{ color: "#e8710a", fontFamily: "'Roboto Mono', monospace" }}>int</Text>
              </Option>
              <Option value="float">
                <Text style={{ color: "#e8710a", fontFamily: "'Roboto Mono', monospace" }}>float</Text>
              </Option>
              <Option value="boolean">
                <Text style={{ color: "#137333", fontFamily: "'Roboto Mono', monospace" }}>bool</Text>
              </Option>
              <Option value="dict">
                <Text style={{ color: "#9c27b0", fontFamily: "'Roboto Mono', monospace" }}>dict</Text>
              </Option>
              <Option value="list">
                <Text style={{ color: "#f57c00", fontFamily: "'Roboto Mono', monospace" }}>list</Text>
              </Option>
            </Select>

            {/* Controlled Inputs for List/Dict to prevent ghosting */}
            {(isListType || isDictType) ? (
              <ComplexInput 
                value={node.value} 
                type={node.type} 
                onChange={updateValue} 
              />
            ) : node.type === "boolean" ? (
              <Select 
                value={node.value} 
                onChange={updateValue} 
                size="small"
                style={{ 
                  flex: "1 1 100px",
                  minWidth: 80,
                  fontFamily: "'Roboto Mono', monospace"
                }}
              >
                <Option value="true">
                  <Text style={{ color: "#137333", fontFamily: "'Roboto Mono', monospace" }}>true</Text>
                </Option>
                <Option value="false">
                  <Text style={{ color: "#c5221f", fontFamily: "'Roboto Mono', monospace" }}>false</Text>
                </Option>
              </Select>
            ) : (
              <Input
                value={node.value}
                onChange={(e) => updateValue(e.target.value)}
                placeholder={node.type === "string" ? '"value"' : "0"}
                size="small"
                style={{ 
                  flex: "1 1 140px",
                  minWidth: 100,
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: 13,
                  color: node.type === "string" ? "#137333" : "#e8710a"
                }}
              />
            )}
          </>
        )}

        {!hasType && !hasChildren && (
          <Select
            placeholder="+ type"
            onChange={updateType}
            size="small"
            allowClear
            style={{ 
              flex: "1 1 120px",
              minWidth: 100,
              fontFamily: "'Roboto Mono', monospace"
            }}
          >
            <Option value="string">string</Option>
            <Option value="int">int</Option>
            <Option value="float">float</Option>
            <Option value="boolean">boolean</Option>
            <Option value="dict">dict</Option>
            <Option value="list">list</Option>
          </Select>
        )}

        {isHovered && (
          <div style={{ 
            marginLeft: "auto", 
            display: "flex", 
            gap: 6,
            flexShrink: 0
          }}>
            {canAddChildren && (
              <Tooltip title="Add nested field">
                <Button 
                  type="text"
                  icon={<PlusOutlined />} 
                  onClick={addChild}
                  size="small"
                  style={{ 
                    color: "#1a73e8",
                    height: 28,
                    width: 28,
                    padding: 0
                  }}
                />
              </Tooltip>
            )}

            <Tooltip title="Delete field">
              <Button 
                type="text"
                danger 
                icon={<DeleteOutlined />} 
                onClick={onDelete}
                size="small"
                style={{ 
                  height: 28,
                  width: 28,
                  padding: 0
                }}
              />
            </Tooltip>
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div style={{ 
          marginTop: 4,
          marginLeft: 8
        }}>
          {node.children.map((child, index) => (
            <NodeEditor
              key={index}
              node={child}
              level={level + 1}
              onChange={(updated) => updateChild(index, updated)}
              onDelete={() => removeChild(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const JsonBuilderComponent = ({ jsonData, onChange }) => {
  const [nodes, setNodes] = useState([]);
  const prevJsonRef = useRef(null);
  const updateTimeoutRef = useRef(null);

  useEffect(() => {
    // Clear any pending update
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce updates slightly to avoid rapid re-renders
    updateTimeoutRef.current = setTimeout(() => {
      const currentJsonString = JSON.stringify(jsonData);
      const prevJsonString = JSON.stringify(prevJsonRef.current);
      
      // Only update nodes if the incoming JSON is different from what we last saw
      if (currentJsonString !== prevJsonString) {
        prevJsonRef.current = JSON.parse(currentJsonString);

        if (jsonData && typeof jsonData === 'object' && Object.keys(jsonData).length > 0) {
          const converted = Object.keys(jsonData).map((key) =>
            convertJsonToNode(key, jsonData[key])
          );
          setNodes(converted);
        } else {
          setNodes([]);
        }
      }
    }, 50); // 50ms debounce

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [jsonData]);

  const addRootNode = () => {
    const newNode = { key: "", type: null, value: null, children: null };
    const updated = [...nodes, newNode];
    setNodes(updated);
    sendToParent(updated);
  };

  const updateRootNode = (index, updatedNode) => {
    const updated = [...nodes];
    updated[index] = updatedNode;
    setNodes(updated);
    sendToParent(updated);
  };

  const deleteRootNode = (index) => {
    const updated = nodes.filter((_, i) => i !== index);
    setNodes(updated);
    sendToParent(updated);
  };

  const sendToParent = (list) => {
    const json = convertToJson(list);
    onChange(json);
  };

  return (
    <div style={{ 
      padding: "16px 8px",
      maxHeight: 600, 
      overflowY: "auto",
      background: "#fff",
      borderRadius: 8
    }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: "1px solid #e8eaed"
      }}>
        <Text strong style={{ 
          fontSize: 16,
          color: "#202124",
          fontWeight: 500
        }}>
          Payload Structure
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {nodes.length} {nodes.length === 1 ? "field" : "fields"}
        </Text>
      </div>

      {nodes.length === 0 && (
        <div
          style={{
            padding: "40px 20px",
            background: "#f8f9fa",
            borderRadius: 8,
            border: "2px dashed #dadce0",
            textAlign: "center",
            marginBottom: 16
          }}
        >
          <Text type="secondary" style={{ fontSize: 14 }}>
            No fields defined yet
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 13 }}>
            Click below to add your first field
          </Text>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        {nodes.map((node, index) => (
          <NodeEditor
            key={index}
            node={node}
            isRoot={true}
            onChange={(updated) => updateRootNode(index, updated)}
            onDelete={() => deleteRootNode(index)}
          />
        ))}
      </div>

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addRootNode}
        block
        style={{ 
          height: 40,
          borderColor: "#1a73e8",
          color: "#1a73e8",
          fontWeight: 500,
          borderRadius: 4
        }}
      >
        Add Root Field
      </Button>
    </div>
  );
};

// Helper Functions
function convertToJson(nodes) {
  const obj = {};

  nodes.forEach((node) => {
    if (!node.key) return;

    if (node.children && node.children.length > 0) {
      obj[node.key] = convertToJson(node.children);
    } else if (node.type === "list") {
      obj[node.key] = {
        type: "list",
        value: node.value || []
      };
    } else if (node.type) {
      obj[node.key] = {
        type: node.type,
        value: parseValue(node.value, node.type),
      };
    }
  });

  return obj;
}

function parseValue(value, type) {
  if (type === "int") return parseInt(value) || 0;
  if (type === "float") return parseFloat(value) || 0.0;
  if (type === "boolean") return value === "true";
  if (type === "list") return Array.isArray(value) ? value : [];
  if (type === "dict") return (typeof value === 'object' && value !== null) ? value : {};
  return String(value);
}

function convertJsonToNode(key, valueObj) {
  // Handle typed values (string, int, float, boolean, list, dict)
  if (typeof valueObj === "object" && valueObj !== null && valueObj.type !== undefined) {
    if (valueObj.type === "list") {
      return {
        key,
        type: "list",
        value: valueObj.value || [],
        children: null,
      };
    }
    if (valueObj.type === "dict") {
      return {
        key,
        type: "dict",
        value: valueObj.value || {},
        children: null,
      };
    }
    return {
      key,
      type: valueObj.type,
      value: String(valueObj.value),
      children: null,
    };
  }

  // Handle nested objects (untyped dicts)
  if (typeof valueObj === "object" && !Array.isArray(valueObj) && valueObj !== null) {
    return {
      key,
      type: null,
      value: null,
      children: Object.keys(valueObj).map((k) =>
        convertJsonToNode(k, valueObj[k])
      ),
    };
  }

  return { key, type: null, value: null, children: null };
}

export default JsonBuilderComponent;
