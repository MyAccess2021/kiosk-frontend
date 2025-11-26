import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Select, Typography, Tooltip, Space } from "antd";
import { PlusOutlined, DeleteOutlined, CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

const NodeEditor = ({ node, onChange, onDelete, level = 0, isRoot = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateKey = (newKey) => onChange({ ...node, key: newKey });

  const updateType = (newType) => {
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
          background: "#fff",
          borderRadius: 4,
          border: "1px solid #e8eaed",
          transition: "all 0.2s",
          flexWrap: "wrap",
          minHeight: 48
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f8f9fa";
          e.currentTarget.style.borderColor = "#dadce0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.borderColor = "#e8eaed";
        }}
      >
        {/* Expand/Collapse Toggle */}
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

        {/* Key Input */}
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

        {/* Type Selector & Value Input */}
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
            </Select>

            {node.type === "boolean" ? (
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

        {/* Type Selector for New Nodes */}
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
          </Select>
        )}

        {/* Action Buttons */}
        <div style={{ 
          marginLeft: "auto", 
          display: "flex", 
          gap: 6,
          flexShrink: 0
        }}>
          {canAddChildren && (
            <Tooltip >
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

          <Tooltip >
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
      </div>

      {/* Children */}
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

  useEffect(() => {
    const changed = JSON.stringify(jsonData) !== JSON.stringify(prevJsonRef.current);

    if (changed) {
      prevJsonRef.current = jsonData;

      if (jsonData && Object.keys(jsonData).length > 0) {
        const converted = Object.keys(jsonData).map((key) =>
          convertJsonToNode(key, jsonData[key])
        );
        setNodes(converted);
      } else {
        setNodes([]);
      }
    }
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
  return String(value);
}

function convertJsonToNode(key, valueObj) {
  if (typeof valueObj === "object" && valueObj.type !== undefined) {
    return {
      key,
      type: valueObj.type,
      value: String(valueObj.value),
      children: null,
    };
  }

  if (typeof valueObj === "object") {
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