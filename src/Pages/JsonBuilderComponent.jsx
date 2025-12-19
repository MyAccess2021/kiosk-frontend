import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Space, Typography, Tooltip, Tag } from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  CaretRightOutlined, 
  CaretDownOutlined, 
  SaveOutlined,
  FileOutlined,
  FolderOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

// --- RECURSIVE NODE COMPONENT ---
const JsonNode = ({ name, data, depth = 0, onUpdate, onDelete, onRename }) => {
  const [expanded, setExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // 1. CHECK TYPE OF DATA
  // Is it a completed IoT Field? (Has 'type' and 'value')
  const isIoTField = typeof data === 'object' && data !== null && 'type' in data && 'value' in data;
  
  // Is it a Folder? (Object but NOT an IoT Field)
  const isFolder = typeof data === 'object' && data !== null && !Array.isArray(data) && !isIoTField;
  
  // Is it a List?
  const isList = Array.isArray(data);

  // Is it a fresh/primitive node? (String/Number/Null) -> User hasn't decided yet
  const isNeutral = !isIoTField && !isFolder && !isList;

  const indentSize = 24; 
  const currentIndent = depth * indentSize;

  // --- HANDLERS ---

  // User Selects a Type -> Convert to IoT Field Structure
  const handleTypeSelect = (type) => {
      let defaultValue = "";
      if (type === 'int' || type === 'float') defaultValue = 0;
      if (type === 'boolean') defaultValue = false;
      
      // Update data to { type: "...", value: ... }
      onUpdate({ type: type, value: defaultValue });
  };

  // User Changes Value inside IoT Field
  const handleIoTValueChange = (val) => {
      const newType = data.type;
      let finalVal = val;

      if (newType === 'int' || newType === 'float') {
          if (!isNaN(val) && val !== '') finalVal = Number(val);
      } else if (newType === 'boolean') {
          // Antd Select handles boolean value directly usually, but input returns string
          // We will handle boolean via Select in UI
      }

      onUpdate({ ...data, value: finalVal });
  };

  // User Clicks (+) -> Convert to Folder OR Add Child
  const handlePlusClick = () => {
      setExpanded(true);
      if (isFolder) {
          // Add child to existing folder
          const newKey = `prop_${Object.keys(data).length + 1}`;
          onUpdate({ ...data, [newKey]: "" });
      } else if (isList) {
          // Add item to list
          onUpdate([...data, ""]);
      } else {
          // 🔥 NEUTRAL STATE: Convert Primitive to Folder
          // User chose (+) instead of Type. So it becomes a Folder.
          const newKey = "prop_1";
          onUpdate({ [newKey]: "" }); 
      }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* ROW */}
      <div 
        style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '6px 0', 
            paddingLeft: currentIndent,
            backgroundColor: isHovered ? '#f9f9f9' : 'transparent',
            borderRadius: 4,
            whiteSpace: 'nowrap'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Connector Line */}
        {depth > 0 && (
            <div style={{
                position: 'absolute',
                left: currentIndent - 12,
                top: 0,
                bottom: 0,
                borderLeft: '1px dashed #d9d9d9'
            }} />
        )}

        {/* Expander Icon (Only for Folders/Lists) */}
        <div 
            style={{ width: 20, cursor: 'pointer', display: 'flex', justifyContent: 'center', marginRight: 4 }}
            onClick={() => setExpanded(!expanded)}
        >
            {(isFolder || isList) && (
                expanded ? <CaretDownOutlined style={{fontSize: 10, color: '#999'}} /> : <CaretRightOutlined style={{fontSize: 10, color: '#999'}} />
            )}
        </div>

        {/* KEY NAME INPUT */}
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
            {name !== null ? (
                <>
                    <Input 
                        size="small"
                        value={name}
                        onChange={(e) => onRename(e.target.value)}
                        style={{ 
                            width: 140, 
                            fontWeight: 600, 
                            color: isIoTField ? '#52c41a' : '#1890ff', 
                            border: isHovered ? '1px solid #d9d9d9' : '1px solid transparent', 
                            background: 'transparent',
                            marginRight: 4
                        }}
                    />
                    <Text type="secondary">:</Text>
                </>
            ) : (
                <Text type="secondary" style={{marginRight: 8}}>-</Text> 
            )}
        </div>

        {/* MIDDLE SECTION: TYPE & VALUE */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            
            {/* Case 1: FOLDER or LIST */}
            {(isFolder || isList) && (
                <Tag color={isList ? "orange" : "blue"} style={{fontSize: 10}}>
                    {isList ? 'List' : 'Folder'}
                </Tag>
            )}

            {/* Case 2: IOT FIELD (Type Selected) */}
            {isIoTField && (
                <>
                    <Tag color="green" style={{fontSize: 10}}>Field</Tag>
                    {/* Read-Only Type Display or Editable if needed */}
                    <Select 
                        size="small" 
                        value={data.type} 
                        style={{width: 90}} 
                        onChange={(val) => handleTypeSelect(val)} // Allow changing type
                    >
                        <Option value="string">string</Option>
                        <Option value="int">int</Option>
                        <Option value="float">float</Option>
                        <Option value="boolean">boolean</Option>
                    </Select>

                    {/* Value Input */}
                    {data.type === 'boolean' ? (
                        <Select 
                            size="small" 
                            value={data.value} 
                            style={{width: 80}}
                            onChange={(val) => onUpdate({...data, value: val})}
                        >
                            <Option value={true}>true</Option>
                            <Option value={false}>false</Option>
                        </Select>
                    ) : (
                        <Input 
                            size="small"
                            value={data.value}
                            onChange={(e) => handleIoTValueChange(e.target.value)}
                            style={{ width: 150 }}
                            placeholder="Value"
                        />
                    )}
                </>
            )}

            {/* Case 3: NEUTRAL (User needs to decide) */}
            {isNeutral && (
                <>
                    <Select 
                        size="small" 
                        placeholder="Select Type" 
                        style={{width: 120}} 
                        onChange={handleTypeSelect}
                        dropdownMatchSelectWidth={false}
                    >
                        <Option value="string">string</Option>
                        <Option value="int">int</Option>
                        <Option value="float">float</Option>
                        <Option value="boolean">boolean</Option>
                    </Select>
                    <Input disabled size="small" placeholder="Value" style={{width: 120, opacity: 0.5}} />
                </>
            )}
        </div>

        {/* ACTIONS */}
        <div style={{ width: 60, marginLeft: 10, opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }}>
            <Space size={2}>
                {/* (+) Button: Hidden if it is an IoT Field */}
                {!isIoTField && (
                    <Tooltip >
                        <Button 
                            size="small" 
                            type="text" 
                            icon={isNeutral ? <FolderOutlined style={{color: '#1890ff'}} /> : <PlusOutlined style={{color: '#1890ff'}} />} 
                            onClick={handlePlusClick} 
                        />
                    </Tooltip>
                )}
                
                <Tooltip >
                    <Button 
                        size="small" 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={onDelete} 
                    />
                </Tooltip>
            </Space>
        </div>
      </div>

      {/* RECURSIVE CHILDREN RENDER */}
      {expanded && (isFolder || isList) && (
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'absolute',
                left: currentIndent + 9, 
                top: 0,
                bottom: 12,
                borderLeft: '1px dashed #d9d9d9',
                zIndex: 0
            }} />
            
            {Object.entries(data).map(([key, val], index) => (
                <JsonNode 
                    key={index}
                    name={isList ? null : key}
                    data={val}
                    depth={depth + 1}
                    onUpdate={(newVal) => {
                        const newData = isList ? [...data] : { ...data };
                        newData[key] = newVal;
                        onUpdate(newData);
                    }}
                    onRename={(newKey) => {
                        if(isList) return;
                        const newData = { ...data };
                        const temp = newData[key];
                        delete newData[key];
                        newData[newKey] = temp;
                        onUpdate(newData);
                    }}
                    onDelete={() => {
                        const newData = isList ? [...data] : { ...data };
                        if (isList) {
                            newData.splice(key, 1);
                        } else {
                            delete newData[key];
                        }
                        onUpdate(newData);
                    }}
                />
            ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN WRAPPER ---
const JsonBuilderComponent = ({ jsonData, onChange }) => {
  const [localJson, setLocalJson] = useState(jsonData || {});

  useEffect(() => {
    setLocalJson(jsonData || {});
  }, [jsonData]);

  const handleRootAdd = () => {
      // Add a neutral field at root
      const newKey = `root_${Object.keys(localJson).length + 1}`;
      setLocalJson({ ...localJson, [newKey]: "" });
  };

  const saveChanges = () => {
      onChange(localJson);
  };

  return (
    <div style={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Payload Structure</Text>
          <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={handleRootAdd}>
              Add Root Field
          </Button>
      </div>

      {/* Tree Area */}
      <div style={{ 
          flex: 1, 
          overflow: 'auto', 
          background: '#fff', 
          border: '1px solid #d9d9d9', 
          padding: 16, 
          borderRadius: 4,
          fontFamily: 'monospace'
      }}>
        {Object.keys(localJson).length === 0 ? (
            <div style={{textAlign:'center', marginTop: 40, color: '#ccc'}}>
                <FileOutlined style={{fontSize: 24, marginBottom: 8}} />
                <div>Empty Payload. Add fields to start.</div>
            </div>
        ) : (
            Object.entries(localJson).map(([key, val], index) => (
                <JsonNode 
                    key={index}
                    name={key}
                    data={val}
                    depth={0}
                    onUpdate={(newVal) => {
                        const newData = { ...localJson };
                        newData[key] = newVal;
                        setLocalJson(newData);
                    }}
                    onRename={(newKey) => {
                        const newData = { ...localJson };
                        const temp = newData[key];
                        delete newData[key];
                        newData[newKey] = temp;
                        setLocalJson(newData);
                    }}
                    onDelete={() => {
                        const newData = { ...localJson };
                        delete newData[key];
                        setLocalJson(newData);
                    }}
                />
            ))
        )}
      </div>

      <div style={{ marginTop: 16, textAlign: 'right', borderTop: '1px solid #f0f0f0', paddingTop: 10 }}>
        <Space>
            <Text type="secondary" style={{fontSize: 12}}>
               Select a Type to create a Field, or click (+) to create a Folder.
            </Text>
            <Button type="primary" icon={<SaveOutlined />} onClick={saveChanges}>
            Save & Push to Device
            </Button>
        </Space>
      </div>
    </div>
  );
};

export default JsonBuilderComponent;