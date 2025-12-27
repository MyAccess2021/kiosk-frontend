import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Input,
  InputNumber,
  Switch,
  Typography,
  Space,
  notification,
  Divider,
  Slider,
  Progress,
  theme,
  Drawer,
  Tooltip,
  Tag
} from 'antd';
import {
  SaveOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  AppstoreAddOutlined,
  PoweroffOutlined,
  LineChartOutlined,
  BarChartOutlined,
  UnorderedListOutlined,
  DashboardOutlined,
  ControlOutlined,
  EditOutlined,
  EyeOutlined,
  PieChartOutlined,
  DragOutlined,
  MinusOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

const { Title, Text } = Typography;

// Detect Mobile
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
};

// --- READ LOGIC ---
function getValueFromPayload(payload, path, fieldName) {
  if (!payload) return undefined;
  let currentObj = payload;

  if (path && path !== "" && path !== "/") {
      const parts = path.split('/').filter(p => p);
      for (const part of parts) {
          if (currentObj && currentObj[part]) {
              if (currentObj[part].value && typeof currentObj[part].value === 'object' && !Array.isArray(currentObj[part].value)) {
                  currentObj = currentObj[part].value;
              } else {
                  currentObj = currentObj[part];
              }
          } else {
              return undefined; 
          }
      }
  }

  if (fieldName === '*') return currentObj;

  if (fieldName && currentObj && currentObj[fieldName]) {
      return currentObj[fieldName].value !== undefined ? currentObj[fieldName].value : currentObj[fieldName];
  }

  return undefined;
}

// --- CONFIGURATION ---
const COMPONENT_TYPES = {
  gauge: { label: 'Gauge', icon: <DashboardOutlined />, defaultDataType: 'float', mode: 'read' },
  slider: { label: 'Smart Slider', icon: <ControlOutlined />, defaultDataType: 'int', mode: 'write' },
  switch: { label: 'Switch', icon: <PoweroffOutlined />, defaultDataType: 'boolean', mode: 'write' },
  button: { label: 'Button', icon: <AppstoreAddOutlined />, defaultDataType: 'boolean', mode: 'write' },
  text_input: { label: 'Input', icon: <EditOutlined />, defaultDataType: 'string', mode: 'write' },
  text_display: { label: 'Display', icon: <EyeOutlined />, defaultDataType: 'string', mode: 'read' },
  line_chart: { label: 'Line Chart', icon: <LineChartOutlined />, defaultDataType: 'dict', mode: 'read' },
  bar_chart: { label: 'Bar Chart', icon: <BarChartOutlined />, defaultDataType: 'dict', mode: 'read' },
  pie_chart: { label: 'Pie Chart', icon: <PieChartOutlined />, defaultDataType: 'dict', mode: 'read' },
  log_viewer: { label: 'Log Viewer', icon: <UnorderedListOutlined />, defaultDataType: 'dict', mode: 'read' },
};

// --- WIDGET PREVIEW ---
const WidgetPreview = ({ component, payload, onValueChange, previewMode }) => {
  const { token } = theme.useToken();
  const [isInteracting, setIsInteracting] = useState(false);
  
  // --- STEP 1: CHECK CONFIGURATION ---
  // If user hasn't entered a Path OR a Field Name, treat as unconfigured.
  const isConfigured = (component.path && component.path.trim() !== '') || 
                       (component.field_name && component.field_name.trim() !== '');

  const isComplexWidget = ['line_chart', 'bar_chart', 'pie_chart', 'log_viewer'].includes(component.type);
  const targetToFetch = isComplexWidget ? '*' : component.field_name;
  
  // Only fetch data if configured
  const rawData = isConfigured 
      ? getValueFromPayload(payload, component.path, targetToFetch)
      : undefined;
  
  const [localValue, setLocalValue] = useState(component.settings?.default || 0);

  // --- SYNC WITH BACKEND ---
  useEffect(() => {
    if (rawData !== undefined && !isComplexWidget && !isInteracting) {
        setLocalValue(rawData);
    }
  }, [rawData, isComplexWidget, isInteracting]);

  // --- WRITE LOGIC ---
  const handleUserAction = (newValue) => {
    setLocalValue(newValue);
    if (onValueChange) {
        console.log(`[WRITE] Sending ${component.alias}:`, newValue); 
        onValueChange(component.id, newValue);
    }
  };

  // --- TIME FORMAT HELPER ---
  const formatTime = (epoch) => {
      if (!epoch) return '';
      return new Date(Number(epoch) * 1000).toLocaleTimeString();
  };

  const processHistoryData = (dataObj, userField) => {
      if (!dataObj || typeof dataObj !== 'object') return [];
      let list = [];
      Object.values(dataObj).forEach(item => {
          const entry = item.value ? item.value : item;
          if (Array.isArray(entry)) {
              entry.forEach(subItem => {
                  const val = subItem[userField]?.value ?? subItem[userField] ?? 0;
                  const time = subItem.time?.value ?? subItem.time ?? 0;
                  list.push({ value: val, time: Number(time) });
              });
          } else {
              const val = entry[userField]?.value ?? entry[userField] ?? 0;
              const time = entry.time?.value ?? entry.time ?? 0;
              list.push({ value: val, time: Number(time) });
          }
      });
      list.sort((a, b) => a.time - b.time);
      return list;
  };

  // --- COMMON CONTAINER ---
  const WidgetContainer = ({ children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '8px', boxSizing: 'border-box' }}>
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );

  // --- NO DATA STATE ---
  // If not configured, show "No Data" immediately.
  if (!isConfigured) {
      return (
          <WidgetContainer>
              <div style={{
                  height: '100%', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  backgroundColor: token.colorFillQuaternary, 
                  borderRadius: 6
              }}>
                  <Text type="secondary" style={{fontSize: 12}}>No Data</Text>
              </div>
          </WidgetContainer>
      );
  }

  // --- DATA PREP (Only runs if configured) ---
  let displayData = [];
  let logs = [];

  if (['line_chart', 'bar_chart'].includes(component.type)) {
      if (Array.isArray(rawData)) {
          displayData = rawData.map((v, i) => ({ value: v, time: i }));
      } else if (rawData && typeof rawData === 'object') {
          displayData = processHistoryData(rawData, component.field_name);
      }
      displayData = displayData.slice(-50); 
  } else if (component.type === 'log_viewer') {
      if (rawData && typeof rawData === 'object') {
          logs = Object.values(rawData).flatMap((item) => {
              const entry = item.value ? item.value : item;
              if(Array.isArray(entry)) {
                  return entry.map(subItem => {
                      const targetKey = component.field_name && component.field_name !== '*' ? component.field_name : 'msg';
                      const msg = subItem[targetKey]?.value ?? subItem[targetKey] ?? JSON.stringify(subItem);
                      const time = subItem.time?.value ?? subItem.time ?? 0;
                      return { time: Number(time), message: msg };
                  });
              } else {
                  const targetKey = component.field_name && component.field_name !== '*' ? component.field_name : 'msg';
                  const msg = entry[targetKey]?.value ?? entry[targetKey] ?? JSON.stringify(entry);
                  const time = entry.time?.value ?? entry.time ?? 0;
                  return [{ time: Number(time), message: msg }];
              }
          });
          logs.sort((a, b) => a.time - b.time);
      }
  }

  // --- RENDER WIDGETS ---
  switch (component.type) {
    case 'gauge':
      const gVal = Number(localValue) || 0;
      const gMin = component.settings?.min || 0;
      const gMax = component.settings?.max || 100;
      const percent = Math.min(Math.max(((gVal - gMin) / (gMax - gMin)) * 100, 0), 100);
      return (
        <WidgetContainer>
          <div style={{ textAlign: 'center', marginTop: -10 }}>
            <Progress 
                type="dashboard" 
                percent={Math.round(percent)} 
                width={80}
                gapDegree={100}
                strokeWidth={8}
                format={() => (
                    <div style={{color: token.colorText, lineHeight: 1}}>
                        <div style={{fontSize: '14px', fontWeight: 'bold'}}>{gVal}</div>
                        <div style={{fontSize: '9px', opacity: 0.6}}>{component.settings?.unit}</div>
                    </div>
                )}
                strokeColor={{ '0%': token.colorPrimary, '100%': '#52c41a' }} 
            />
          </div>
        </WidgetContainer>
      );

    case 'slider':
      const sMin = component.settings?.min || 0;
      const sMax = component.settings?.max || 100;
      
      const increment = () => {
          const newVal = Math.min(Number(localValue) + 1, sMax);
          handleUserAction(newVal);
      };
      
      const decrement = () => {
          const newVal = Math.max(Number(localValue) - 1, sMin);
          handleUserAction(newVal);
      };

      return (
        <WidgetContainer>
          <div 
             style={{width: '100%', display:'flex', flexDirection:'column', gap: 4}}
             // FIX: Prevent HTML5 Drag interference for smooth sliding
             onMouseDown={(e) => e.stopPropagation()} 
             onTouchStart={(e) => e.stopPropagation()}
             onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <Button size="small" icon={<MinusOutlined />} onClick={decrement} />
                   <Text strong style={{fontSize: 14, color: token.colorPrimary}}>
                       {localValue} {component.settings?.unit}
                   </Text>
                   <Button size="small" icon={<PlusOutlined />} onClick={increment} />
              </div>

              <Slider 
                min={sMin} 
                max={sMax} 
                step={1} 
                value={Number(localValue)}
                tooltip={{ open: undefined, color: '#333' }} 
                onChange={(val) => {
                    setIsInteracting(true); 
                    setLocalValue(val);
                }} 
                onAfterChange={(val) => {
                    setIsInteracting(false); 
                    handleUserAction(val);   
                }} 
                trackStyle={{ backgroundColor: token.colorPrimary }}
              />
          </div>
        </WidgetContainer>
      );

    case 'switch':
      return (
        <WidgetContainer>
          <div 
            style={{display:'flex', justifyContent:'center', alignItems:'center'}}
            onMouseDown={(e) => e.stopPropagation()} 
            onTouchStart={(e) => e.stopPropagation()}
          >
            <Switch 
                checked={!!localValue} 
                onChange={(checked) => handleUserAction(checked)} 
                checkedChildren="ON"
                unCheckedChildren="OFF"
            />
          </div>
        </WidgetContainer>
      );

    case 'button':
      return (
        <WidgetContainer>
           <div 
             style={{width:'100%'}} 
             onMouseDown={(e) => e.stopPropagation()} 
             onTouchStart={(e) => e.stopPropagation()}
           >
               <Button type="primary" block size="small" icon={<PoweroffOutlined />} onClick={() => handleUserAction(!localValue)}>
                 {localValue ? 'Turn ON' : 'Turn OFF'}
               </Button>
           </div>
        </WidgetContainer>
      );

    case 'text_input':
      return (
        <WidgetContainer>
          <div 
            style={{width:'100%'}} 
            onMouseDown={(e) => e.stopPropagation()} 
            onTouchStart={(e) => e.stopPropagation()}
          >
              <Input 
                size="small" 
                value={localValue} 
                onChange={(e)=>setLocalValue(e.target.value)} 
                onBlur={()=>handleUserAction(localValue)} 
                onPressEnter={()=>handleUserAction(localValue)} 
                suffix={<span style={{fontSize:10, color:'#999'}}>{component.settings?.unit}</span>}
              />
          </div>
        </WidgetContainer>
      );

    case 'text_display':
      return (
        <WidgetContainer>
          <div style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: token.colorText, 
              textAlign: 'center'
          }}>
            {String(localValue)} <span style={{fontSize:'12px', fontWeight:'normal'}}>{component.settings?.unit}</span>
          </div>
        </WidgetContainer>
      );

    case 'line_chart':
    case 'bar_chart':
        const maxVal = Math.max(...displayData.map(d => Number(d.value)), 100); 
        const pointWidth = 40;
        const totalWidth = Math.max(displayData.length * pointWidth, 100); 
        
        return (
            <WidgetContainer>
                {displayData.length === 0 ? <Text type="secondary" style={{fontSize:10, textAlign:'center', marginTop: 20}}>No Data</Text> : 
                 component.type === 'bar_chart' ? (
                    <div 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'flex-end', 
                            height: '100%', 
                            overflowX: 'auto', 
                            gap: '6px', 
                            paddingBottom: 4
                        }} 
                        className="hide-scrollbar"
                    >
                        {displayData.map((item, idx) => (
                            <div key={idx} style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', height:'100%'}}>
                                <span style={{fontSize: '9px', color: token.colorTextSecondary, marginBottom: 2}}>
                                    {item.value}
                                </span>
                                {/* Tooltip: Time Only */}
                                <Tooltip color="#333" title={formatTime(item.time)}>
                                    <div style={{ 
                                        width: '18px', 
                                        minWidth: '18px',
                                        height: `${Math.max((Number(item.value) / maxVal) * 100, 5)}%`, 
                                        background: '#52c41a',
                                        borderRadius: '2px 2px 0 0',
                                        flexShrink: 0
                                    }} />
                                </Tooltip>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <div 
                        style={{
                            height: '100%', 
                            width: '100%', 
                            overflowX: 'auto', 
                            overflowY: 'hidden',
                            position: 'relative'
                        }}
                    >
                         <svg 
                            width={totalWidth} 
                            height="100%" 
                            viewBox={`0 0 ${totalWidth} 100`} 
                            preserveAspectRatio="none" 
                            style={{overflow: 'visible', display:'block'}}
                        >
                             <defs>
                               <linearGradient id={`grad-${component.id}`} x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="0%" stopColor={token.colorPrimary} stopOpacity="0.3" />
                                 <stop offset="100%" stopColor={token.colorPrimary} stopOpacity="0" />
                               </linearGradient>
                             </defs>
                             
                             <polygon 
                                points={`
                                    0,100 
                                    ${displayData.map((d, i) => {
                                        const x = i * pointWidth + (pointWidth / 2); 
                                        const y = 100 - ((d.value / maxVal) * 80); 
                                        return `${x},${y}`;
                                    }).join(' ')} 
                                    ${displayData.length * pointWidth},100
                                `}
                                fill={`url(#grad-${component.id})`}
                             />

                             <polyline
                                points={displayData.map((d, i) => {
                                    const x = i * pointWidth + (pointWidth / 2);
                                    const y = 100 - ((d.value / maxVal) * 80);
                                    return `${x},${y}`;
                                }).join(' ')}
                                fill="none"
                                stroke={token.colorPrimary}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                             />

                             {displayData.map((d, i) => {
                                 const x = i * pointWidth + (pointWidth / 2);
                                 const y = 100 - ((d.value / maxVal) * 80);
                                 return (
                                    <g key={i}>
                                        <text 
                                            x={x} 
                                            y={y - 5} 
                                            textAnchor="middle" 
                                            fill={token.colorText} 
                                            fontSize="10"
                                            style={{pointerEvents:'none'}}
                                        >
                                            {d.value}
                                        </text>
                                        {/* Tooltip on Dot: Time Only */}
                                        <Tooltip title={formatTime(d.time)} color="#333">
                                            <circle 
                                                cx={x} 
                                                cy={y} 
                                                r="4" 
                                                fill={token.colorBgContainer} 
                                                stroke={token.colorPrimary} 
                                                strokeWidth="2" 
                                                style={{cursor: 'pointer'}}
                                            />
                                        </Tooltip>
                                    </g>
                                 );
                             })}
                         </svg>
                    </div>
                 )
                }
            </WidgetContainer>
        );

    case 'pie_chart':
        return (
            <WidgetContainer>
                 <div style={{
                     width: 60, height: 60, borderRadius: '50%', margin: '0 auto',
                     background: `conic-gradient(${token.colorPrimary} 0% 70%, ${token.colorFillSecondary} 70% 100%)`,
                     border: `2px solid ${token.colorBgContainer}`,
                     boxShadow: '0 0 5px rgba(0,0,0,0.1)'
                 }} />
                 <div style={{textAlign:'center', fontSize: 10, marginTop: 4, color: token.colorTextSecondary}}>
                    {Object.keys(rawData || {}).length > 0 ? 'Data Loaded' : 'No Data'}
                 </div>
            </WidgetContainer>
        );

  // 🔥 LOG VIEWER (Fixed Sorting: Newest on Top)
    case 'log_viewer':
        return (
            <WidgetContainer>
              <div 
                  style={{
                      flex: 1, 
                      overflowY: 'auto', 
                      padding: '4px', 
                      fontSize: '10px',
                      backgroundColor: '#1e1e1e',
                      color: '#00ff00',
                      fontFamily: 'monospace',
                      borderRadius: '4px',
                      height: '0px'
                  }}
              >
                 {logs.length === 0 ? <div style={{opacity:0.5}}>Waiting for logs...</div> : 
                   // 🔥 FIX: Ensure Sorting is DESCENDING (b.time - a.time)
                   logs
                   .sort((a, b) => b.time - a.time) 
                   .map((log, idx) => (
                     <div key={idx} style={{marginBottom: 2, display:'flex', gap: 4, borderBottom: '1px solid #333'}}>
                         <span style={{opacity: 0.6, whiteSpace:'nowrap', color: '#888'}}>
                            {formatTime(log.time)}
                         </span>
                         <span style={{wordBreak: 'break-all'}}>{String(log.message)}</span>
                     </div>
                   ))
                 }
              </div>
            </WidgetContainer>
        );

    default:
      return <WidgetContainer><Text>Unknown</Text></WidgetContainer>;
  }
};

// --- DRAGGABLE COMPONENT ---
const DraggableComponent = ({ component, payload, isSelected, onClick, onMove, previewMode, onValueChange, device }) => {
  const { token } = theme.useToken();
  const dragHandleRef = useRef(null); 
  
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'canvas-component',
    item: { id: component.id, originalX: component.position.x, originalY: component.position.y },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [component.id, component.position.x, component.position.y]);

  if (!previewMode) {
    drag(dragHandleRef); 
  }

  return (
    <div
      ref={preview} 
      onClick={(e) => {
          e.stopPropagation();
          onClick(); 
      }}
      style={{
        position: 'absolute',
        left: component.position.x,
        top: component.position.y,
        width: component.settings?.width || 160,
        height: component.settings?.height || 100,
        background: token.colorBgContainer,
        border: isSelected ? `2px solid ${token.colorPrimary}` : `1px solid ${token.colorBorder}`,
        borderRadius: '8px',
        boxShadow: isDragging ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
        opacity: isDragging ? 0.4 : 1,
        zIndex: isSelected ? 10 : 1,
        overflow: 'hidden',
        transition: isDragging ? 'none' : 'box-shadow 0.2s, border 0.2s',
      }}
    >
      {/* HEADER WITH DRAG HANDLE */}
      <div style={{
          height: '24px', 
          background: token.colorFillTertiary, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 8px',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          cursor: 'default' 
      }}>
          <Text strong style={{ fontSize: '10px', color: token.colorPrimary, textTransform: 'uppercase' }}>
            {component.alias || component.type}
          </Text>

          {/* This Icon is the ONLY place you can drag the widget from */}
          {!previewMode && (
              <div ref={dragHandleRef} style={{cursor: 'move', padding: '0 4px'}}>
                 <DragOutlined style={{fontSize: '12px', color: token.colorTextSecondary}} />
              </div>
          )}
      </div>

      <div style={{height: 'calc(100% - 24px)'}}>
         <WidgetPreview component={component} payload={payload} onValueChange={onValueChange} previewMode={previewMode} device={device} />
      </div>
    </div>
  );
};

// --- PALETTE ITEM ---
const PaletteItem = ({ type, data }) => {
  const { token } = theme.useToken();
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { componentType: type },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));
  return (
    <div ref={drag} style={{ 
        padding: '8px 12px', 
        marginBottom: '8px', 
        background: token.colorBgContainer, 
        border: `1px solid ${token.colorBorder}`, 
        borderRadius: '6px', 
        cursor: 'grab', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s',
        fontSize: '13px'
    }}>
      <span style={{ fontSize: '16px', color: token.colorPrimary }}>{data.icon}</span>
      <span>{data.label}</span>
    </div>
  );
};

// --- CANVAS ---
const ComponentCanvas = ({ components, payload, device, onDrop, onSelect, selectedId, previewMode, onValueChange, onMoveComponent }) => {
  const { token } = theme.useToken();
  
  const [, drop] = useDrop(() => ({
    accept: ['component', 'canvas-component'],
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      
      if (item.componentType) {
        const offset = monitor.getClientOffset();
        const canvasRect = document.getElementById('canvas').getBoundingClientRect();
        const x = Math.max(0, offset.x - canvasRect.left); 
        const y = Math.max(0, offset.y - canvasRect.top);
        onDrop(item.componentType, { x, y });
      } else if (item.id && delta) {
        const x = Math.max(0, item.originalX + delta.x);
        const y = Math.max(0, item.originalY + delta.y);
        onMoveComponent(item.id, { x, y });
      }
    },
  }));

  return (
    <div id="canvas" ref={drop} onClick={() => onSelect(null)} style={{ 
        width: '100%', 
        height: '100%', 
        backgroundColor: token.colorBgLayout, 
        backgroundImage: `radial-gradient(${token.colorFillSecondary} 1px, transparent 1px)`, 
        backgroundSize: '20px 20px', 
        borderRadius: '8px', 
        position: 'relative', 
        overflow: 'hidden' 
    }}>
      {components.map((comp) => (
       <DraggableComponent 
            key={comp.id} 
            component={comp} 
            payload={payload} 
            device={device} 
            isSelected={selectedId === comp.id} 
            onClick={() => onSelect(comp.id)} 
            onMove={onMoveComponent} 
            previewMode={previewMode} 
            onValueChange={onValueChange} 
        />
      ))}
    </div>
  );
};

// --- PROPERTIES PANEL ---
const PropertiesPanel = ({ component, onUpdate, onDelete }) => {
  if (!component) return <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>Select a widget to edit</div>;
  
  const typeLabel = component.data_type || 'unknown';

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={5} style={{ margin: 0 }}>Properties</Title>
        <Button danger type="text" icon={<DeleteOutlined />} onClick={onDelete} />
      </div>
      
      <div style={{marginBottom: 16}}>
         <Tag color="blue" style={{textTransform: 'uppercase', width: '100%', textAlign: 'center'}}>
            Type: {typeLabel}
         </Tag>
      </div>

      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{marginBottom: 8}}>
            <Text type="secondary" style={{fontSize: 12}}>Label (Alias)</Text>
            <Input value={component.alias} onChange={(e) => onUpdate({ alias: e.target.value })} />
        </div>
        
        <div style={{marginBottom: 8}}>
            <div style={{display:'flex', alignItems:'center', gap: 4}}>
                <Text type="secondary" style={{fontSize: 12}}>Path</Text>
                <Tooltip title="Folder name (e.g. motor_logs)" color="blue">
                    <span style={{cursor:'help', fontSize:10}}>?</span>
                </Tooltip>
            </div>
            <Input value={component.path || ""} onChange={(e) => onUpdate({ path: e.target.value })} placeholder="root" />
        </div>

        <div style={{marginBottom: 8}}>
            <div style={{display:'flex', alignItems:'center', gap: 4}}>
                <Text type="secondary" style={{fontSize: 12}}>Field</Text>
                <Tooltip title="Key name (e.g. temperature). Use * for Log Viewer to see all." color="blue">
                    <span style={{cursor:'help', fontSize:10}}>?</span>
                </Tooltip>
            </div>
            <Input value={component.field_name} onChange={(e) => onUpdate({ field_name: e.target.value })} placeholder="field_key" />
        </div>
        
        <Divider style={{margin: '12px 0'}} />
        
        <div style={{display:'flex', gap: 8, marginBottom: 8}}>
            <div style={{flex:1}}>
                <Text style={{fontSize:10}}>Width</Text>
                <InputNumber size="small" style={{width:'100%'}} value={component.settings?.width} onChange={(v) => onUpdate({ settings: { ...component.settings, width: v } })} />
            </div>
            <div style={{flex:1}}>
                <Text style={{fontSize:10}}>Height</Text>
                <InputNumber size="small" style={{width:'100%'}} value={component.settings?.height} onChange={(v) => onUpdate({ settings: { ...component.settings, height: v } })} />
            </div>
        </div>

        {['gauge', 'slider'].includes(component.type) && (
            <div style={{display:'flex', gap: 8}}>
               <div><Text style={{fontSize:10}}>Min</Text><InputNumber size="small" value={component.settings?.min} onChange={(v) => onUpdate({ settings: { ...component.settings, min: v } })} /></div>
               <div><Text style={{fontSize:10}}>Max</Text><InputNumber size="small" value={component.settings?.max} onChange={(v) => onUpdate({ settings: { ...component.settings, max: v } })} /></div>
               <div><Text style={{fontSize:10}}>Unit</Text><Input size="small" value={component.settings?.unit} onChange={(e) => onUpdate({ settings: { ...component.settings, unit: e.target.value } })} /></div>
            </div>
        )}
      </Space>
    </div>
  );
};

// --- MAIN BUILDER ---
const DashboardBuilder = ({ device, onBack, onSave, onWriteData }) => {
  const { token } = theme.useToken();
  const [components, setComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isMobile, setIsMobile] = useState(isMobileDevice());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    if (!device) return;
    if (device?.ui_config?.components?.length > 0) {
      setComponents(device.ui_config.components);
    } else {
      loadLocalConfig();
    }
    setConfigLoaded(true);
  }, [device]);

  useEffect(() => {
    if (!configLoaded) return;
    const id = device && (device.id ?? device.device_uid ?? device.deviceId);
    if (!id) return;
    localStorage.setItem(`ui_config_${id}`, JSON.stringify({ components }));
  }, [components, configLoaded]);

  useEffect(() => {
    const handleResize = () => setIsMobile(isMobileDevice());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
 
  function loadLocalConfig() {
    const id = device && (device.id ?? device.device_uid ?? device.deviceId);
    if (!id) return;
    const stored = localStorage.getItem(`ui_config_${id}`);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      const comps = parsed?.components ?? parsed;
      if (Array.isArray(comps)) setComponents(comps);
    } catch (err) { console.error(err); }
  }

  const handleDrop = (componentType, position) => {
    const newComponent = {
      id: `comp_${Math.floor(Date.now() / 1000)}`,
      type: componentType,
      data_type: COMPONENT_TYPES[componentType].defaultDataType,
      field_name: '',
      path: '', 
      alias: COMPONENT_TYPES[componentType].label,
      position,
      settings: { min: 0, max: 100, unit: '', width: 160, height: 100 }, 
    };
    setComponents(prev => [...prev, newComponent]);
    setSelectedComponentId(newComponent.id);
    if (isMobile) setDrawerOpen(true);
  };

  const handleMoveComponent = (componentId, newPosition) => {
    setComponents(prev => prev.map((c) => (c.id === componentId ? { ...c, position: newPosition } : c)));
  };

  const handleUpdateComponent = (updates) => {
    setComponents(prev => prev.map((c) => (c.id === selectedComponentId ? { ...c, ...updates } : c)));
  };

  const handleDeleteComponent = () => {
    setComponents(prev => prev.filter((c) => c.id !== selectedComponentId));
    setSelectedComponentId(null);
    setDrawerOpen(false);
  };

  const handleValueChange = (componentId, newValue) => {
    const comp = components.find(c => c.id === componentId);
    if(comp && comp.field_name) {
        const targetPath = comp.path || "";
        const updateMessage = {
            action: "patch", 
            path: targetPath,
            payload: {
                [comp.field_name]: {
                    type: comp.data_type || 'string',
                    value: newValue
                }
            }
        };
        if(onWriteData) {
            onWriteData(updateMessage);
        } else {
            notification.warning({ message: "No connection for write operation" });
        }
    }
  };

  const handleSaveConfig = () => {
    const invalid = components.filter(c => !c.field_name && c.type !== 'log_viewer');
    if (invalid.length > 0) {
      notification.error({ message: 'Missing Fields', description: 'Please assign Field Names to widgets.' });
      return;
    }
    const id = device && (device.id ?? device.device_uid ?? device.deviceId);
    if (!id) return;
    try {
      localStorage.setItem(`ui_config_${id}`, JSON.stringify({ components }));
      if(onSave) onSave({ ui_config: { components } });
      notification.success({ message: "Layout Saved" });
    } catch (err) { notification.error({ message: "Save Failed" }); }
  };

  const selectedComponent = components.find((c) => c.id === selectedComponentId);

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: token.colorBgLayout }}>
        {/* Header */}
        <div style={{ padding: '0 16px', height: 50, background: token.colorBgContainer, borderBottom: `1px solid ${token.colorBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack} type="text" />
            <Title level={5} style={{ margin: 0 }}>{device.device_name}</Title>
          </Space>
          <Space>
             <div style={{display: 'flex', alignItems: 'center', gap: 8, marginRight: 16}}>
                <Text style={{fontSize: 12}}>Edit</Text>
                <Switch size="small" checked={previewMode} onChange={setPreviewMode} />
                <Text style={{fontSize: 12}}>Preview</Text>
             </div>
            <Button type="primary" size="small" icon={<SaveOutlined />} onClick={handleSaveConfig}>Save</Button>
          </Space>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Palette (Hidden in Preview) */}
          {!previewMode && !isMobile && (
            <div style={{ width: 200, padding: 12, background: token.colorBgContainer, borderRight: `1px solid ${token.colorBorder}`, overflowY: 'auto' }}>
               <Text type="secondary" style={{fontSize: 11, fontWeight: 600, display:'block', marginBottom: 10}}>WIDGETS</Text>
               {Object.entries(COMPONENT_TYPES).map(([type, data]) => ( <PaletteItem key={type} type={type} data={data} /> ))}
            </div>
          )}

          {/* Canvas */}
          <div style={{ flex: 1, padding: 20, position: 'relative', overflow: 'auto' }}>
             <ComponentCanvas 
                components={components} 
                payload={device.payload} 
                device={device} 
                onDrop={handleDrop} 
                onSelect={(id) => { setSelectedComponentId(id); if(isMobile && !previewMode) setDrawerOpen(true); }} 
                selectedId={selectedComponentId} 
                previewMode={previewMode} 
                onValueChange={handleValueChange} 
                onMoveComponent={handleMoveComponent} 
            />
          </div>

          {/* Properties (Hidden in Preview) */}
          {!previewMode && !isMobile && (
            <div style={{ width: 260, background: token.colorBgContainer, borderLeft: `1px solid ${token.colorBorder}`, overflowY: 'auto' }}>
               <PropertiesPanel component={selectedComponent} onUpdate={handleUpdateComponent} onDelete={handleDeleteComponent} />
            </div>
          )}
        </div>

        <Drawer title="Properties" placement="right" onClose={() => setDrawerOpen(false)} open={drawerOpen && isMobile}>
            <PropertiesPanel component={selectedComponent} onUpdate={handleUpdateComponent} onDelete={handleDeleteComponent} />
        </Drawer>
      </div>
    </DndProvider>
  );
};
export default DashboardBuilder;