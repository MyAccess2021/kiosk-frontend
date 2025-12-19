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

  // Identify Types
  const isIoTField = typeof data === 'object' && data !== null && 'type' in data && 'value' in data;
  const isFolder = typeof data === 'object' && data !== null && !Array.isArray(data) && !isIoTField;
  const isList = Array.isArray(data);
  const isNeutral = !isIoTField && !isFolder && !isList;

  // Check if the IoT Field holds complex data (Dict/List)
  const isComplexIoTValue = isIoTField && (data.type === 'dict' || data.type === 'list');

  const indentSize = 24; 
  const currentIndent = depth * indentSize;

  // Handlers
  const handleTypeSelect = (type) => {
      let defaultValue = "";
      if (type === 'int' || type === 'float') defaultValue = 0;
      if (type === 'boolean') defaultValue = false;
      if (type === 'dict') defaultValue = {}; // Initialize as empty object
      if (type === 'list') defaultValue = []; // Initialize as empty array
      
      onUpdate({ type: type, value: defaultValue });
  };

  const handleIoTValueChange = (val) => {
      const newType = data.type;
      let finalVal = val;
      if (newType === 'int' || newType === 'float') {
          if (!isNaN(val) && val !== '') finalVal = Number(val);
      }
      onUpdate({ ...data, value: finalVal });
  };

  const handlePlusClick = () => {
      setExpanded(true);
      if (isFolder) {
          const newKey = `prop_${Object.keys(data).length + 1}`;
          onUpdate({ ...data, [newKey]: "" });
      } else if (isList) {
          onUpdate([...data, ""]);
      } else {
          const newKey = "prop_1";
          onUpdate({ [newKey]: "" }); 
      }
  };

  return (
    <div style={{ position: 'relative', minWidth: 'fit-content' }}>
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

        {/* Expander */}
        <div 
            style={{ width: 20, cursor: 'pointer', display: 'flex', justifyContent: 'center', marginRight: 4, flexShrink: 0 }}
            onClick={() => setExpanded(!expanded)}
        >
            {(isFolder || isList || isComplexIoTValue) && (
                expanded ? <CaretDownOutlined style={{fontSize: 10, color: '#999'}} /> : <CaretRightOutlined style={{fontSize: 10, color: '#999'}} />
            )}
        </div>

        {/* Key Name */}
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 8, flexShrink: 0 }}>
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

        {/* Value / Type Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            
            {(isFolder || isList) && (
                <Tag color={isList ? "orange" : "blue"} style={{fontSize: 10}}>
                    {isList ? 'List' : 'Folder'}
                </Tag>
            )}

            {isIoTField && (
                <>
                    <Tag color="green" style={{fontSize: 10}}>Field</Tag>
                    <Select 
                        size="small" 
                        value={data.type} 
                        style={{width: 90}} 
                        onChange={(val) => handleTypeSelect(val)}
                    >
                        <Option value="string">string</Option>
                        <Option value="int">int</Option>
                        <Option value="float">float</Option>
                        <Option value="boolean">boolean</Option>
                        <Option value="dict">dict</Option>
                        <Option value="list">list</Option>
                    </Select>

                    {/* 🔥 FIX: If type is dict/list, SHOW TEXT instead of Input to avoid [object Object] */}
                    {isComplexIoTValue ? (
                        <Text type="secondary" style={{fontSize: 12}}>
                            {data.type === 'list' ? '[ ... ]' : '{ ... }'}
                        </Text>
                    ) : data.type === 'boolean' ? (
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

            {isNeutral && (
                <>
                    <Select 
                        size="small" 
                        placeholder="Select Type" 
                        style={{width: 120}} 
                        onChange={handleTypeSelect}
                    >
                        <Option value="string">string</Option>
                        <Option value="int">int</Option>
                        <Option value="float">float</Option>
                        <Option value="boolean">boolean</Option>
                        <Option value="dict">dict</Option>
                    </Select>
                    <Input disabled size="small" placeholder="Value" style={{width: 120, opacity: 0.5}} />
                </>
            )}
        </div>

        {/* Actions */}
        <div style={{ width: 60, marginLeft: 10, opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s', flexShrink: 0 }}>
            <Space size={2}>
                {!isIoTField && (
                    <Tooltip title={isNeutral ? "Convert to Folder" : "Add Child"}>
                        <Button 
                            size="small" 
                            type="text" 
                            icon={isNeutral ? <FolderOutlined style={{color: '#1890ff'}} /> : <PlusOutlined style={{color: '#1890ff'}} />} 
                            onClick={handlePlusClick} 
                        />
                    </Tooltip>
                )}
                <Tooltip title="Delete">
                    <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={onDelete} />
                </Tooltip>
            </Space>
        </div>
      </div>

      {/* Recursive Children */}
      {expanded && (
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'absolute',
                left: currentIndent + 9, 
                top: 0,
                bottom: 12,
                borderLeft: '1px dashed #d9d9d9',
                zIndex: 0
            }} />
            
            {/* If it's a Complex IoT Field, we need to iterate over its VALUE keys too */}
            {(isFolder || isList || isComplexIoTValue) && Object.entries(isComplexIoTValue ? data.value : data).map(([key, val], index) => (
                <JsonNode 
                    key={index}
                    name={isList ? null : key} // Don't show key name for Array items
                    data={val}
                    depth={depth + 1}
                    onUpdate={(newVal) => {
                        let newData;
                        if (isComplexIoTValue) {
                            // Update inside value object
                            const newValueObj = Array.isArray(data.value) ? [...data.value] : { ...data.value };
                            newValueObj[key] = newVal;
                            newData = { ...data, value: newValueObj };
                        } else {
                            newData = isList ? [...data] : { ...data };
                            newData[key] = newVal;
                        }
                        onUpdate(newData);
                    }}
                    onRename={(newKey) => {
                        if(isList) return;
                        let newData;
                        if (isComplexIoTValue) {
                             const newValueObj = { ...data.value };
                             const temp = newValueObj[key];
                             delete newValueObj[key];
                             newValueObj[newKey] = temp;
                             newData = { ...data, value: newValueObj };
                        } else {
                            newData = { ...data };
                            const temp = newData[key];
                            delete newData[key];
                            newData[newKey] = temp;
                        }
                        onUpdate(newData);
                    }}
                    onDelete={() => {
                        let newData;
                        if (isComplexIoTValue) {
                            const newValueObj = Array.isArray(data.value) ? [...data.value] : { ...data.value };
                            if (Array.isArray(newValueObj)) newValueObj.splice(key, 1);
                            else delete newValueObj[key];
                            newData = { ...data, value: newValueObj };
                        } else {
                            newData = isList ? [...data] : { ...data };
                            if (isList) newData.splice(key, 1);
                            else delete newData[key];
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
      const newKey = `root_${Object.keys(localJson).length + 1}`;
      setLocalJson({ ...localJson, [newKey]: "" });
  };

  const saveChanges = () => {
      onChange(localJson);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* <Text strong>Payload Structure</Text> */}
          <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={handleRootAdd}>
              Add Root Field
          </Button>
      </div>

      {/* Scrollable Container */}
      <div style={{ 
          flex: 1,
          height: '400px', 
          overflow: 'auto', 
          background: '#fff', 
          border: '1px solid #d9d9d9', 
          padding: 16, 
          borderRadius: 4,
          fontFamily: 'monospace'
      }}>
        {Object.keys(localJson).length === 0 ? (
            <div style={{textAlign:'center', marginTop: 150, color: '#ccc'}}>
                <FileOutlined style={{fontSize: 24, marginBottom: 8}} />
                <div>Empty Payload. Add fields to start.</div>
            </div>
        ) : (
            <div style={{ minWidth: '100%', display: 'inline-block' }}>
                {Object.entries(localJson).map(([key, val], index) => (
                    <JsonNode 
                        key={index}
                        name={key}
                        data={val}
                        depth={0}
                        onUpdate={(newVal) => {
                            const newData = { ...localJson };
                            newData[key] = newVal;
                            setLocalJson(newData);
                            onChange(newData); 
                        }}
                        onRename={(newKey) => {
                            const newData = { ...localJson };
                            const temp = newData[key];
                            delete newData[key];
                            newData[newKey] = temp;
                            setLocalJson(newData);
                            onChange(newData);
                        }}
                        onDelete={() => {
                            const newData = { ...localJson };
                            delete newData[key];
                            setLocalJson(newData);
                            onChange(newData);
                        }}
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default JsonBuilderComponent;