import React, { useState, useEffect } from "react";
import { Button, Input, Select, Space, Typography, Divider } from "antd";
import { PlusOutlined, DeleteOutlined, DownOutlined, RightOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

//
// RECURSIVE NODE EDITOR - Firebase Style
//
const NodeEditor = ({ node, onChange, onDelete, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateKey = (newKey) => {
    onChange({ ...node, key: newKey });
  };

  const updateType = (newType) => {
    // When type is selected, clear children
    onChange({ ...node, type: newType, value: "", children: null });
  };

  const updateValue = (newValue) => {
    onChange({ ...node, value: newValue });
  };

  const clearTypeValue = () => {
    onChange({ ...node, type: null, value: null });
  };

  const addChild = () => {
    const newChild = {
      key: "",
      type: null,
      value: null,
      children: null
    };
    // When adding a child, clear type/value
    onChange({ 
      ...node, 
      type: null,
      value: null,
      children: [...(node.children || []), newChild] 
    });
  };

  const updateChild = (index, updatedChild) => {
    const updatedChildren = [...(node.children || [])];
    updatedChildren[index] = updatedChild;
    onChange({ ...node, children: updatedChildren });
  };

  const removeChild = (index) => {
    const updatedChildren = (node.children || []).filter((_, i) => i !== index);
    onChange({ ...node, children: updatedChildren.length > 0 ? updatedChildren : null });
  };

  const hasChildren = node.children && node.children.length > 0;
  const hasTypeValue = node.type !== null && node.type !== undefined;
  const canAddChildren = !hasTypeValue; // Can only add children if no type/value set

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Node Header */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 8,
        padding: "12px 16px",
        background: level === 0 ? "#e6f7ff" : level === 1 ? "#f0f0f0" : "#fafafa",
        borderRadius: 6,
        border: "1px solid #d9d9d9",
        marginLeft: level * 32
      }}>
        {/* Expand/Collapse Arrow - only show if has children */}
        {hasChildren ? (
          <Button
            type="text"
            size="small"
            icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ padding: 0, width: 24, height: 24, minWidth: 24 }}
          />
        ) : (
          <div style={{ width: 24 }} /> // Spacer
        )}

        {/* Key Input */}
        <Input
          value={node.key}
          onChange={(e) => updateKey(e.target.value)}
          placeholder="field_name"
          style={{ width: 180 }}
          size="middle"
        />

        {/* Type and Value - Only show if type is selected */}
        {hasTypeValue && (
          <>
            <Select
              value={node.type}
              onChange={updateType}
              style={{ width: 110 }}
              size="middle"
            >
              <Option value="string">String</Option>
              <Option value="int">Int</Option>
              <Option value="float">Float</Option>
              <Option value="boolean">Boolean</Option>
            </Select>

            {node.type === "boolean" ? (
              <Select
                value={node.value}
                onChange={updateValue}
                style={{ width: 110 }}
                size="middle"
                placeholder="value"
              >
                <Option value="true">true</Option>
                <Option value="false">false</Option>
              </Select>
            ) : (
              <Input
                value={node.value}
                onChange={(e) => updateValue(e.target.value)}
                placeholder="value"
                style={{ width: 180 }}
                size="middle"
              />
            )}
          </>
        )}

        {/* Type Selector - Only show if NO type selected yet and NO children */}
        {!hasTypeValue && !hasChildren && (
          <Select
            placeholder="Select type"
            onChange={updateType}
            style={{ width: 130 }}
            size="middle"
            allowClear
          >
            <Option value="string">String</Option>
            <Option value="int">Int</Option>
            <Option value="float">Float</Option>
            <Option value="boolean">Boolean</Option>
          </Select>
        )}

        {/* Actions */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {/* Add Button - only show if can add children (no type/value set) */}
          {canAddChildren && (
            <Button
              type="primary"
              size="middle"
              icon={<PlusOutlined />}
              onClick={addChild}
            >
              Add
            </Button>
          )}
          
          <Button
            danger
            size="middle"
            icon={<DeleteOutlined />}
            onClick={onDelete}
          />
        </div>
      </div>

      {/* Children - only show if expanded and has children */}
      {hasChildren && isExpanded && (
        <div style={{ marginTop: 8 }}>
          {node.children.map((child, index) => (
            <NodeEditor
              key={index}
              node={child}
              level={level + 1}
              onChange={(updatedChild) => updateChild(index, updatedChild)}
              onDelete={() => removeChild(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

//
// MAIN JSON BUILDER COMPONENT
//
const JsonBuilderComponent = ({ jsonData, onChange }) => {
  const [nodes, setNodes] = useState([]);

  // Initialize from jsonData prop
  useEffect(() => {
    if (jsonData && Object.keys(jsonData).length > 0) {
      const converted = Object.keys(jsonData).map((key) => 
        convertJsonToNode(key, jsonData[key])
      );
      setNodes(converted);
    }
  }, []);

  const addRootNode = () => {
    const newNode = {
      key: "",
      type: null,
      value: null,
      children: null
    };
    const updated = [...nodes, newNode];
    setNodes(updated);
    sendJsonToParent(updated);
  };

  const updateRootNode = (index, updatedNode) => {
    const updated = [...nodes];
    updated[index] = updatedNode;
    setNodes(updated);
    sendJsonToParent(updated);
  };

  const deleteRootNode = (index) => {
    const updated = nodes.filter((_, i) => i !== index);
    setNodes(updated);
    sendJsonToParent(updated);
  };

  const sendJsonToParent = (structure) => {
    const json = convertToJson(structure);
    onChange(json);
  };

  return (
    <div style={{ padding: 16, maxHeight: 600, overflowY: "auto" }}>
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16 }}>Payload Structure Builder</Text>
        <Divider style={{ margin: "12px 0" }} />
        <Text type="secondary" style={{ fontSize: 13 }}>
          • Add a field with just a name to create nested objects<br />
          • Or select a type and value to create a leaf field
        </Text>
      </div>

      {nodes.length === 0 && (
        <div style={{ 
          padding: 40, 
          textAlign: "center", 
          background: "#fafafa", 
          borderRadius: 8,
          marginBottom: 16,
          border: "2px dashed #d9d9d9"
        }}>
          <Text type="secondary">No fields yet. Click "Add Root Field" to start building.</Text>
        </div>
      )}
      
      {nodes.map((node, index) => (
        <NodeEditor
          key={index}
          node={node}
          level={0}
          onChange={(updated) => updateRootNode(index, updated)}
          onDelete={() => deleteRootNode(index)}
        />
      ))}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addRootNode}
        style={{ marginTop: 16, width: "100%", height: 40 }}
      >
        Add Root Field
      </Button>
    </div>
  );
};

//
// CONVERT NODE STRUCTURE TO JSON OUTPUT
//
function convertToJson(nodes) {
  const obj = {};

  nodes.forEach((node) => {
    if (!node.key) return;

    // If has children, recursively build nested object
    if (node.children && node.children.length > 0) {
      obj[node.key] = convertToJson(node.children);
    } 
    // If has type and value, it's a leaf node
    else if (node.type && node.value !== null && node.value !== undefined && node.value !== "") {
      obj[node.key] = {
        type: node.type,
        value: parseValue(node.value, node.type)
      };
    }
  });

  return obj;
}

function parseValue(value, type) {
  if (type === "int") return parseInt(value) || 0;
  if (type === "float") return parseFloat(value) || 0.0;
  if (type === "boolean") return value === "true" || value === true;
  return String(value);
}

//
// CONVERT JSON TO NODE STRUCTURE
//
function convertJsonToNode(key, valueObj) {
  // If has 'type' and 'value', it's a leaf node
  if (valueObj && typeof valueObj === "object" && valueObj.type !== undefined) {
    return {
      key,
      type: valueObj.type,
      value: String(valueObj.value),
      children: null
    };
  }

  // If it's an object, it's a parent node
  if (typeof valueObj === "object" && valueObj !== null) {
    const childKeys = Object.keys(valueObj);
    
    return {
      key,
      type: null,
      value: null,
      children: childKeys.length > 0 
        ? childKeys.map((k) => convertJsonToNode(k, valueObj[k]))
        : null
    };
  }

  return {
    key,
    type: null,
    value: null,
    children: null
  };
}

export default JsonBuilderComponent;