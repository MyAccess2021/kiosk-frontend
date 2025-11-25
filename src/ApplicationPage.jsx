import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Table,
  Tag,
  Tooltip,
  notification,
  Spin,
  Space,
  Typography,
  theme,
  Alert,
  Checkbox,
  Radio,
  Divider,
  Card,
  Descriptions,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  LockOutlined,
  CameraOutlined,
  LinkOutlined,
  CloseOutlined,
  HddOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { getApplications, createApplication, updateApplication, deleteApplication } from './services/applicationService';
import { getCameras } from './services/cameraService';
import { assignCameraToApplication, getApplicationCameras, removeApplicationCamera } from './services/applicationCameraService';
import { createDevice, getDevices, updateDevice, deleteDevice } from './services/deviceService';
import {
  canViewApplication,
  canCreateApplication,
  canUpdateApplication,
  canDeleteApplication,
} from './utils/permissions';
import JsonBuilderComponent from "./JsonBuilderComponent";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ApplicationPage = ({ theme: themeProp }) => {
  const { token } = theme.useToken();
  const [modal, contextHolder] = Modal.useModal();

  const [applications, setApplications] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail View State
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm] = Form.useForm();

  // Application Form (for create only now)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Camera Assignment
  const [isCameraAssignModalOpen, setIsCameraAssignModalOpen] = useState(false);
  const [selectedCameras, setSelectedCameras] = useState([]);
  const [primaryCamera, setPrimaryCamera] = useState(null);
  const [viewingApplicationCameras, setViewingApplicationCameras] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedCameraDetails, setSelectedCameraDetails] = useState(null);

  // Device creation flow
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [deviceSubmitting, setDeviceSubmitting] = useState(false);
  const [deviceForm] = Form.useForm();
  const [pendingDevicePromptAppId, setPendingDevicePromptAppId] = useState(null);
  const [showPayloadBuilder, setShowPayloadBuilder] = useState(false);
  const [payloadObj, setPayloadObj] = useState({});
  const [viewingApplicationDevices, setViewingApplicationDevices] = useState([]);
  const [selectedDeviceDetails, setSelectedDeviceDetails] = useState(null);
  // Add a new modal state for editing
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const hasAnyApplicationPermission =
    canViewApplication() || canCreateApplication() || canUpdateApplication() || canDeleteApplication();

  const fetchApplications = useCallback(async () => {
    if (!canViewApplication()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getApplications();
      const applicationsArray = data?.applications || data || [];
      setApplications(Array.isArray(applicationsArray) ? applicationsArray : []);
    } catch (error) {
      console.error('Fetch error:', error);
      notification.error({
        message: 'Fetch Failed',
        description: error.message || 'Failed to fetch applications.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCameras = useCallback(async () => {
    try {
      const data = await getCameras();
      const camerasArray = data?.cameras || [];
      setCameras(Array.isArray(camerasArray) ? camerasArray : []);
    } catch (error) {
      console.error('Fetch cameras error:', error);
      notification.error({ message: 'Fetch Failed', description: 'Failed to fetch cameras.' });
    }
  }, []);
useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!canViewApplication()) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [appsData, camerasData] = await Promise.all([getApplications(), getCameras()]);
        if (isMounted) {
          const applicationsArray = appsData?.applications || appsData || [];
          setApplications(Array.isArray(applicationsArray) ? applicationsArray : []);
          const camerasArray = camerasData?.cameras || [];
          setCameras(Array.isArray(camerasArray) ? camerasArray : []);
        }
      } catch (error) {
        if (isMounted) {
          notification.error({ message: 'Fetch Failed', description: error.message || 'Failed to fetch data.' });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  // ========= DETAIL VIEW FUNCTIONS =========

  const openDetailView = async (application) => {
    setSelectedApplication(application);
    setViewMode('detail');
    setIsEditing(false);
    editForm.setFieldsValue({
      name: application.name,
      description: application.description,
      publish: application.publish,
      is_active: application.is_active,
    });
    await fetchApplicationDetails(application.id);
  };

  const fetchApplicationDetails = async (applicationId) => {
    setLoading(true);
    try {
      const [cameraResponse, devicesResponse] = await Promise.all([
        getApplicationCameras(applicationId),
        getDevices(`?application=${applicationId}`),
      ]);
      const camerasData = cameraResponse?.links || cameraResponse?.application_cameras || cameraResponse?.data || [];
      setViewingApplicationCameras(Array.isArray(camerasData) ? camerasData : []);
      const devicesData = devicesResponse?.devices || devicesResponse || [];
      setViewingApplicationDevices(Array.isArray(devicesData) ? devicesData : []);
    } catch (error) {
      console.error('Fetch details error:', error);
      notification.error({ message: 'Fetch Failed', description: 'Failed to fetch application details.' });
    } finally {
      setLoading(false);
    }
  };

  const closeDetailView = () => {
  setViewMode('list');
  setSelectedApplication(null);
  setIsEditModalOpen(false); // Changed from setIsEditing
  setViewingApplicationCameras([]);
  setViewingApplicationDevices([]);
  setSelectedCameraDetails(null);
  setSelectedDeviceDetails(null);
};

  const handleEditToggle = () => {
  if (!canUpdateApplication()) {
    notification.warning({
      message: 'Permission Denied',
      description: 'You do not have permission to update applications.',
      icon: <LockOutlined style={{ color: '#faad14' }} />,
    });
    return;
  }
  setIsEditModalOpen(true);
  editForm.setFieldsValue({
    name: selectedApplication.name,
    description: selectedApplication.description,
    publish: selectedApplication.publish,
    is_active: selectedApplication.is_active,
  });
};

 const handleEditSave = async (values) => {
  if (!selectedApplication) return;
  setLoading(true);
  try {
    const changedFields = {};
    Object.keys(values).forEach((key) => {
      if (values[key] !== selectedApplication[key]) {
        changedFields[key] = values[key];
      }
    });

    if (Object.keys(changedFields).length === 0) {
      notification.info({ message: 'No Changes', description: 'No fields were modified.' });
      setIsEditModalOpen(false); // Changed from setIsEditing
      return;
    }

    const response = await updateApplication(selectedApplication.id, changedFields);
    notification.success({
      message: 'Success',
      description: response?.message || 'Application updated successfully!',
    });

    const updatedApp = { ...selectedApplication, ...changedFields };
    setSelectedApplication(updatedApp);
    setApplications((prev) =>
      prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
    );
    setIsEditModalOpen(false); // Changed from setIsEditing
  } catch (error) {
    console.error('Update error:', error);
    let errorMessage = 'Failed to update application.';
    if (typeof error === 'object' && error !== null) {
      const details = [];
      Object.keys(error).forEach((field) => {
        if (Array.isArray(error[field])) {
          error[field].forEach((msg) => details.push(`${field}: ${msg}`));
        }
      });
      if (details.length) errorMessage = details.join('\n');
      else if (error.message) errorMessage = error.message;
    }
    notification.error({ message: 'Update Failed', description: errorMessage, duration: 5 });
  } finally {
    setLoading(false);
  }
};

  const handleDeleteApplication = () => {
    if (!canDeleteApplication()) {
      notification.warning({
        message: 'Permission Denied',
        description: 'You do not have permission to delete applications.',
        icon: <LockOutlined style={{ color: '#faad14' }} />,
      });
      return;
    }

    modal.confirm({
      title: `Delete ${selectedApplication?.name}?`,
      content: 'Are you sure you want to delete this application? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        setLoading(true);
        try {
          await deleteApplication(selectedApplication.id);
          notification.success({ message: 'Success', description: 'Application deleted successfully.' });
          closeDetailView();
          fetchApplications();
        } catch (error) {
          notification.error({ message: 'Delete Failed', description: error.message || 'Failed to delete application.' });
        } finally {
          setLoading(false);
        }
      },
    });
  };
const handleEditDevice = (device) => {
  deviceForm.setFieldsValue({
    device_uid: device.device_uid,
    device_name: device.device_name,
    description: device.description,
    protocol: device.protocol,
    firmware_version: device.firmware_version,
    development_enabled: device.development_enabled,
  });
  setPayloadObj(device.payload || {});
  setSelectedDeviceDetails(device); // Use this to track we're editing
  setIsDeviceModalOpen(true);
};

const handleDeleteDevice = async (deviceId, deviceName) => {
  setLoading(true);
  try {
    await deleteDevice(deviceId);
    notification.success({ 
      message: 'Success', 
      description: `Device "${deviceName}" deleted successfully.` 
    });
    if (selectedDeviceDetails?.id === deviceId) setSelectedDeviceDetails(null);
    if (selectedApplication) await fetchApplicationDetails(selectedApplication.id);
  } catch (error) {
    console.error('Delete device error:', error);
    notification.error({ 
      message: 'Delete Failed', 
      description: error.message || 'Failed to delete device.' 
    });
  } finally {
    setLoading(false);
  }
};

  // ========= DEVICE MODAL =========

 const openDeviceModal = () => {
    deviceForm.resetFields();
    
    // IMPORTANT FIXES:
    setSelectedDeviceDetails(null);   // ← CLEAR EDIT MODE
    setPayloadObj({});                // ← EMPTY PAYLOAD
    setShowPayloadBuilder(false);     // ← RESET MODAL IF OPEN

    // FORCE JsonBuilder to load fresh
    setTimeout(() => setPayloadObj({}), 0);

    setIsDeviceModalOpen(true);
};


 const handleDeviceFormSubmit = async (values) => {
  const appId = selectedApplication?.id || pendingDevicePromptAppId;
  if (!appId) {
    notification.error({ message: 'No Application Selected', description: 'Missing application reference.' });
    return;
  }

  const payload = {
    application: appId,
    device_uid: values.device_uid,
    device_name: values.device_name,
    description: values.description || '',
    protocol: values.protocol || 'websocket',
    firmware_version: values.firmware_version || '',
    development_enabled: typeof values.development_enabled === 'boolean' ? values.development_enabled : true,
    ...(payloadObj && Object.keys(payloadObj).length > 0 ? { payload: payloadObj } : {}),
  };

  setDeviceSubmitting(true);
  try {
    // Check if we're editing (selectedDeviceDetails will be set)
    if (selectedDeviceDetails?.id) {
      await updateDevice(selectedDeviceDetails.id, payload);
      notification.success({ message: 'Device updated successfully' });
    } else {
      await createDevice(payload);
      notification.success({ message: 'Device created successfully' });
    }
    
    setIsDeviceModalOpen(false);
    deviceForm.resetFields();
    setPayloadObj({});
    setSelectedDeviceDetails(null); // Clear editing state
    
    if (viewMode === 'detail' && selectedApplication) {
      await fetchApplicationDetails(selectedApplication.id);
    }
    await fetchApplications();
  } catch (error) {
    console.error('Device operation error:', error);
    let errorMessage = error?.message || 'Failed to save device.';
    if (typeof error === 'object' && error !== null) {
      const details = [];
      Object.keys(error).forEach((field) => {
        if (Array.isArray(error[field])) {
          error[field].forEach((msg) => details.push(`${field}: ${msg}`));
        }
      });
      if (details.length) errorMessage = details.join('\n');
    }
    notification.error({ message: 'Operation Failed', description: errorMessage, duration: 5 });
  } finally {
    setDeviceSubmitting(false);
  }
};

  // ========= APPLICATION CREATE MODAL =========

  const openCreateModal = () => {
    if (!canCreateApplication()) {
      notification.warning({
        message: 'Permission Denied',
        description: 'You do not have permission to create applications.',
        icon: <LockOutlined style={{ color: '#faad14' }} />,
      });
      return;
    }
    form.resetFields();
    form.setFieldsValue({ publish: false, is_active: true });
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await createApplication(values);
      const createdAppId = response?.application?.id || response?.data?.id || response?.id;
      setIsModalOpen(false);
      form.resetFields();

      if (createdAppId) {
        setPendingDevicePromptAppId(createdAppId);
        modal.confirm({
          title: 'Application Created Successfully!',
          content: 'Would you like to assign cameras to this application now?',
          okText: 'Assign Cameras',
          cancelText: 'Skip',
          onOk: () => {
            openCameraAssignModalForNewApp(createdAppId);
          },
          onCancel: async () => {
            notification.success({ message: 'Success', description: 'Application created successfully!' });
            await fetchApplications();
            openDevicePromptForNewApp(createdAppId);
          },
        });
      } else {
        notification.success({ message: 'Success', description: 'Application created successfully!' });
        await fetchApplications();
      }
    } catch (error) {
      console.error('Create error:', error);
      let errorMessage = 'Failed to create application.';
      if (typeof error === 'object' && error !== null) {
        const details = [];
        Object.keys(error).forEach((field) => {
          if (Array.isArray(error[field])) {
            error[field].forEach((msg) => details.push(`${field}: ${msg}`));
          }
        });
        if (details.length) errorMessage = details.join('\n');
        else if (error.message) errorMessage = error.message;
      }
      notification.error({ message: 'Create Failed', description: errorMessage, duration: 5 });
    } finally {
      setLoading(false);
    }
  };

  const openDevicePromptForNewApp = (appId) => {
    modal.confirm({
      title: 'Add Device to Application',
      content: 'Would you like to add a device to this application now?',
      okText: 'Add Device',
      cancelText: 'Skip for now',
      onOk: () => {
        setPendingDevicePromptAppId(appId);
        setIsDeviceModalOpen(true);
      },
      onCancel: () => {
        notification.info({ message: 'Application Created', description: 'You can add devices later.' });
        setPendingDevicePromptAppId(null);
        fetchApplications();
      },
    });
  };

  const openCameraAssignModalForNewApp = (appId) => {
    setPendingDevicePromptAppId(appId);
    setSelectedCameras([]);
    setPrimaryCamera(null);
    setIsCameraAssignModalOpen(true);
  };

  // ========= CAMERA ASSIGNMENT =========

  const openCameraAssignModal = () => {
    setSelectedCameras([]);
    setPrimaryCamera(null);
    setIsCameraAssignModalOpen(true);
  };

  const handleCameraAssignCancel = async () => {
    setIsCameraAssignModalOpen(false);
    setSelectedCameras([]);
    setPrimaryCamera(null);

    if (viewMode === 'detail' && selectedApplication) {
      await fetchApplicationDetails(selectedApplication.id);
    } else if (pendingDevicePromptAppId) {
      await fetchApplications();
      openDevicePromptForNewApp(pendingDevicePromptAppId);
    }
  };

  const handleCameraSelection = (cameraId, checked) => {
    if (checked) {
      const newList = [...selectedCameras, cameraId];
      setSelectedCameras(newList);
      if (selectedCameras.length === 0) setPrimaryCamera(cameraId);
    } else {
      const remaining = selectedCameras.filter((id) => id !== cameraId);
      setSelectedCameras(remaining);
      if (primaryCamera === cameraId) setPrimaryCamera(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handlePrimaryCameraChange = (cameraId) => setPrimaryCamera(cameraId);

  const handleAssignCameras = async () => {
    if (selectedCameras.length === 0) {
      notification.warning({ message: 'No Cameras Selected', description: 'Please select at least one camera.' });
      return;
    }
    if (!primaryCamera) {
      notification.warning({ message: 'No Primary Camera', description: 'Please select a primary camera.' });
      return;
    }

    const appId = selectedApplication?.id || pendingDevicePromptAppId;
    if (!appId) return;

    setAssignLoading(true);
    try {
      const assignPromises = selectedCameras.map((cameraId) => {
        const camera = cameras.find((c) => c.id === cameraId);
        return assignCameraToApplication({
          application: appId,
          camera: cameraId,
          description: camera?.camera_name || '',
          is_primary: cameraId === primaryCamera,
        });
      });
      await Promise.all(assignPromises);
      notification.success({ message: 'Success', description: `${selectedCameras.length} camera(s) assigned!` });

      setIsCameraAssignModalOpen(false);
      setSelectedCameras([]);
      setPrimaryCamera(null);

      if (viewMode === 'detail' && selectedApplication) {
        await fetchApplicationDetails(selectedApplication.id);
      } else if (pendingDevicePromptAppId) {
        await fetchApplications();
        openDevicePromptForNewApp(pendingDevicePromptAppId);
        setPendingDevicePromptAppId(null);
      }
    } catch (error) {
      console.error('Camera assignment error:', error);
      notification.error({ message: 'Assignment Failed', description: error.message || 'Failed to assign cameras.' });
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveAssignedCamera = (assignmentId, cameraName) => {
    modal.confirm({
      title: `Remove ${cameraName}?`,
      content: 'Are you sure you want to remove this camera from the application?',
      okText: 'Remove',
      okType: 'danger',
      onOk: async () => {
        setLoading(true);
        try {
          await removeApplicationCamera(assignmentId);
          notification.success({ message: 'Success', description: 'Camera removed successfully.' });
          if (selectedCameraDetails?.id === assignmentId) setSelectedCameraDetails(null);
          if (selectedApplication) await fetchApplicationDetails(selectedApplication.id);
        } catch (error) {
          console.error('Remove camera error:', error);
          notification.error({ message: 'Remove Failed', description: error.message || 'Failed to remove camera.' });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getAvailableCameras = () => {
    const assignedCameraIds = viewingApplicationCameras.map(
      (ac) => ac.camera_details?.id || ac.camera?.id || ac.camera_id || ac.camera
    );
    return cameras.filter((camera) => !assignedCameraIds.includes(camera.id));
  };

  // ========= TABLE COLUMNS =========

  const columns = [
    {
      title: 'Application Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Published',
      dataIndex: 'publish',
      key: 'publish',
      render: (publish) => <Tag color={publish ? 'success' : 'default'}>{publish ? 'Published' : 'Draft'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => <Tag color={isActive ? 'success' : 'error'}>{isActive ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) =>
        text ? new Date(text).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => openDetailView(record)}>
          View
        </Button>
      ),
    },
  ];

  const viewCamerasColumns = [
    {
      title: 'Camera Name',
      key: 'camera_name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {record.camera_details?.camera_name || record.camera_name || 'Unknown Camera'}
          </div>
          {record.is_primary && <Tag color="blue" style={{ marginTop: 4 }}>Primary</Tag>}
        </div>
      ),
    },
    {
      title: 'Description',
      key: 'description',
      render: (_, record) => record.description || record.camera_details?.description || '-',
    },
    {
      title: 'Status',
      key: 'is_active',
      render: (_, record) => {
        const isActive = record.camera_details?.is_active !== undefined ? record.camera_details.is_active : record.is_active;
        return <Tag color={isActive ? 'success' : 'error'}>{isActive ? 'Active' : 'Inactive'}</Tag>;
      },
    },
   {
  title: 'Actions',
  key: 'actions',
  width: 100,
  render: (_, record) => (
    <Button 
      size="small" 
      danger 
      icon={<DeleteOutlined />}
      onClick={() => handleRemoveAssignedCamera(record.id, record.camera_details?.camera_name || 'Camera')}
    />
  ),
},
  ];

const viewDevicesColumns = [
  {
    title: 'Device Name',
    dataIndex: 'device_name',
    key: 'device_name',
    render: (text, record) => (
      <div>
        <div style={{ fontWeight: 600, wordBreak: 'break-word' }}>{text}</div>
        <div style={{ fontSize: 12, color: token.colorTextSecondary, wordBreak: 'break-all' }}>
          UID: {record.device_uid}
        </div>
      </div>
    ),
  },
  {
    title: 'Protocol',
    dataIndex: 'protocol',
    key: 'protocol',
    responsive: ['md'],
  },
  {
    title: 'Status',
    key: 'status',
    render: (_, record) => (
      <Space direction="vertical" size={4}>
        <Tag color={record.is_active ? 'success' : 'error'}>
          {record.is_active ? 'Active' : 'Inactive'}
        </Tag>
        {/* <Tag color={record.is_connected ? 'blue' : 'default'}>
          {record.is_connected ? 'Online' : 'Offline'}
        </Tag> */}
      </Space>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    // fixed: 'right',
    render: (_, record) => (
      <Space size={4}>
        <Tooltip >
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditDevice(record)}
          />
        </Tooltip>
        <Popconfirm
          title="Delete this device?"
          description="This action cannot be undone."
          onConfirm={() => handleDeleteDevice(record.id, record.device_name)}
          okText="Delete"
          okType="danger"
          cancelText="Cancel"
        >
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  },
];

  // ========= RENDER =========

  if (viewMode === 'detail' && selectedApplication) {
    return (
      <div>
        {contextHolder}
        <Spin spinning={loading}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={closeDetailView}>Back</Button>
              
              
            </Space>
           <Space>
  {canUpdateApplication() && (
    <Button
      icon={<EditOutlined />}
      onClick={handleEditToggle}
    >
      Edit
    </Button>
  )}
  {canDeleteApplication() && (
    <Button danger icon={<DeleteOutlined />} onClick={handleDeleteApplication}>
      Delete
    </Button>
  )}
</Space>
          </div>

          {/* Edit Form or Details */}
      {/* Details Card - Always show details, no inline editing */}
<Card style={{ marginBottom: 24 }}>
  <Descriptions 
    column={{ xs: 1, sm: 1, md: 2 }} 
    bordered 
    size="small"
    labelStyle={{ whiteSpace: 'normal' }}
    contentStyle={{ wordBreak: 'break-word' }}
  >
    <Descriptions.Item label="Name">{selectedApplication.name}</Descriptions.Item>
    <Descriptions.Item label="Status">
      <Tag color={selectedApplication.is_active ? 'success' : 'error'}>
        {selectedApplication.is_active ? 'Active' : 'Inactive'}
      </Tag>
    </Descriptions.Item>
    <Descriptions.Item label="Description" span={2}>
      {selectedApplication.description || '-'}
    </Descriptions.Item>
    <Descriptions.Item label="Published">
      <Tag color={selectedApplication.publish ? 'success' : 'default'}>
        {selectedApplication.publish ? 'Yes' : 'No'}
      </Tag>
    </Descriptions.Item>
    <Descriptions.Item label="Created At">
      {selectedApplication.created_at
        ? new Date(selectedApplication.created_at).toLocaleString('en-IN')
        : '-'}
    </Descriptions.Item>
  </Descriptions>
</Card>

          {/* Cameras Section */}
        {/* Cameras Section */}
<Card
  title={<><CameraOutlined style={{ marginRight: 8 }} />Assigned Cameras ({viewingApplicationCameras.length})</>}
  extra={<Button type="primary" icon={<LinkOutlined />} onClick={openCameraAssignModal}>Assign Cameras</Button>}
  style={{ marginBottom: 24 }}
>
  {viewingApplicationCameras.length === 0 ? (
    <Alert message="No Cameras Assigned" description="This application has no cameras assigned yet." type="info" showIcon />
  ) : (
    <div style={{ display: 'flex', gap: 24, flexDirection: isMobile ? 'column' : 'row' }}>
      <div style={{ width: !isMobile && selectedCameraDetails ? '60%' : '100%', transition: 'width 0.3s' }}>
        <Table
          columns={viewCamerasColumns}
          dataSource={viewingApplicationCameras}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 400 }}
          rowClassName={(record) => selectedCameraDetails?.id === record.id ? 'ant-table-row-selected' : ''}
          onRow={(record) => ({
            onClick: () => setSelectedCameraDetails(record),
            style: { cursor: 'pointer' },
          })}
        />
      </div>
      {!isMobile && selectedCameraDetails && (
        <div style={{ width: '40%', transition: 'width 0.3s' }}>
          <Card
            title={selectedCameraDetails.camera_details?.camera_name || 'Camera View'}
            extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setSelectedCameraDetails(null)} />}
            size="small"
          >
            {selectedCameraDetails.camera_details?.webrtc_url ? (
              <iframe
                src={selectedCameraDetails.camera_details.webrtc_url}
                title="Camera View"
                style={{ width: '100%', aspectRatio: '16/9', border: 'none', backgroundColor: '#000', borderRadius: 8 }}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <Alert message="Live View Not Available" description="WebRTC URL not configured." type="warning" showIcon />
            )}
          </Card>
        </div>
      )}
    </div>
  )}
</Card>

          {/* Devices Section */}
          {/* Devices Section */}
{/* Devices Section */}
<Card
  title={<><HddOutlined style={{ marginRight: 8 }} />Assigned Devices ({viewingApplicationDevices.length})</>}
  extra={<Button type="primary" icon={<PlusOutlined />} onClick={openDeviceModal}>Add Device</Button>}
>
  {viewingApplicationDevices.length === 0 ? (
    <Alert message="No Devices Assigned" description="This application has no devices assigned yet." type="info" showIcon />
  ) : (
    <div style={{ display: 'flex', gap: 16, flexDirection: isMobile ? 'column' : 'row' }}>
      <div style={{ width: !isMobile && selectedDeviceDetails ? '65%' : '100%', transition: 'width 0.3s' }}>
        <Table
          columns={viewDevicesColumns}
          dataSource={viewingApplicationDevices}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 400 }}
          rowClassName={(record) => selectedDeviceDetails?.id === record.id ? 'ant-table-row-selected' : ''}
          onRow={(record) => ({
            onClick: () => setSelectedDeviceDetails(record),
            style: { cursor: 'pointer' },
          })}
        />
      </div>
      {!isMobile && selectedDeviceDetails && (
        <div style={{ width: '35%', transition: 'width 0.3s' }}>
          <Card
            title={selectedDeviceDetails.device_name || 'Device Details'}
            extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setSelectedDeviceDetails(null)} />}
            size="small"
            bodyStyle={{ padding: '12px' }}
          >
            <Descriptions column={1} size="small" bordered colon={false}>
              <Descriptions.Item label="UID" labelStyle={{ width: '40%' }}>
                <Text ellipsis style={{ fontSize: 12 }}>{selectedDeviceDetails.device_uid}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Protocol">{selectedDeviceDetails.protocol}</Descriptions.Item>
              <Descriptions.Item label="Firmware">
                {selectedDeviceDetails.firmware_version || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Dev Mode">
                <Tag color={selectedDeviceDetails.development_enabled ? 'green' : 'default'} style={{ fontSize: 11 }}>
                  {selectedDeviceDetails.development_enabled ? 'ON' : 'OFF'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Last Update">
                {selectedDeviceDetails.last_payload_update
                  ? new Date(selectedDeviceDetails.last_payload_update).toLocaleDateString('en-IN', { 
                      day: '2-digit', 
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Never'}
              </Descriptions.Item>
            </Descriptions>
            {selectedDeviceDetails.payload && Object.keys(selectedDeviceDetails.payload).length > 0 && (
              <div style={{ marginTop: 12 }}>
                <Text strong style={{ fontSize: 12 }}>Payload:</Text>
                <pre style={{
                  background: token.colorBgLayout,
                  padding: 8,
                  borderRadius: 6,
                  fontSize: 11,
                  maxHeight: 150,
                  overflow: 'auto',
                  marginTop: 6,
                  lineHeight: 1.4
                }}>
                  {JSON.stringify(selectedDeviceDetails.payload, null, 2)}
                </pre>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )}
</Card>
        </Spin>
        {/* Camera Details Modal - Mobile Only */}
<Modal
  title={selectedCameraDetails?.camera_details?.camera_name || 'Camera View'}
 open={isMobile && selectedCameraDetails !== null && !isCameraAssignModalOpen}
  onCancel={() => setSelectedCameraDetails(null)}
  footer={[
    <Button key="close" onClick={() => setSelectedCameraDetails(null)}>Close</Button>
  ]}
  width="90%"
  style={{ top: 20 }}
>
  {selectedCameraDetails?.camera_details?.webrtc_url ? (
    <iframe
      src={selectedCameraDetails.camera_details.webrtc_url}
      title="Camera View"
      style={{ width: '100%', aspectRatio: '16/9', border: 'none', backgroundColor: '#000', borderRadius: 8 }}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
    />
  ) : (
    <Alert message="Live View Not Available" description="WebRTC URL not configured." type="warning" showIcon />
  )}
</Modal>

{/* Device Details Modal - Mobile Only */}
<Modal
  title={selectedDeviceDetails?.device_name || 'Device Details'}
 open={isMobile && selectedDeviceDetails !== null && !isDeviceModalOpen}
  onCancel={() => setSelectedDeviceDetails(null)}
  footer={[
    <Button key="close" onClick={() => setSelectedDeviceDetails(null)}>Close</Button>
  ]}
  width="90%"
  style={{ top: 20 }}
>
  <Descriptions column={1} size="small" bordered colon={false}>
    <Descriptions.Item label="UID" labelStyle={{ width: '40%' }}>
      <Text style={{ fontSize: 12, wordBreak: 'break-all' }}>{selectedDeviceDetails?.device_uid}</Text>
    </Descriptions.Item>
    <Descriptions.Item label="Protocol">{selectedDeviceDetails?.protocol}</Descriptions.Item>
    <Descriptions.Item label="Firmware">
      {selectedDeviceDetails?.firmware_version || '-'}
    </Descriptions.Item>
    <Descriptions.Item label="Dev Mode">
      <Tag color={selectedDeviceDetails?.development_enabled ? 'green' : 'default'}>
        {selectedDeviceDetails?.development_enabled ? 'ON' : 'OFF'}
      </Tag>
    </Descriptions.Item>
    <Descriptions.Item label="Status">
      <Space direction="vertical" size={4}>
        <Tag color={selectedDeviceDetails?.is_active ? 'success' : 'error'}>
          {selectedDeviceDetails?.is_active ? 'Active' : 'Inactive'}
        </Tag>
        {/* <Tag color={selectedDeviceDetails?.is_connected ? 'blue' : 'default'}>
          {selectedDeviceDetails?.is_connected ? 'Online' : 'Offline'}
        </Tag> */}
      </Space>
    </Descriptions.Item>
    <Descriptions.Item label="Last Update">
      {selectedDeviceDetails?.last_payload_update
        ? new Date(selectedDeviceDetails.last_payload_update).toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Never'}
    </Descriptions.Item>
  </Descriptions>
  {selectedDeviceDetails?.payload && Object.keys(selectedDeviceDetails.payload).length > 0 && (
    <div style={{ marginTop: 16 }}>
      <Text strong>Payload:</Text>
      <pre style={{
        background: token.colorBgLayout,
        padding: 12,
        borderRadius: 6,
        fontSize: 12,
        maxHeight: 200,
        overflow: 'auto',
        marginTop: 8,
        wordBreak: 'break-all',
        whiteSpace: 'pre-wrap'
      }}>
        {JSON.stringify(selectedDeviceDetails.payload, null, 2)}
      </pre>
    </div>
  )}
</Modal>
{/* Edit Application Modal */}
<Modal
  title="Edit Application"
  open={isEditModalOpen}
  onCancel={() => setIsEditModalOpen(false)}
  footer={null}
  width={600}
>
  <Form form={editForm} layout="vertical" onFinish={handleEditSave} style={{ marginTop: 16 }}>
    <Form.Item
      name="name"
      label="Application Name"
      rules={[{ required: true, message: 'Please enter application name' }, { max: 100 }]}
    >
      <Input placeholder="Application Name" />
    </Form.Item>
    <Form.Item name="description" label="Description" rules={[{ max: 500 }]}>
      <TextArea rows={3} placeholder="Description" />
    </Form.Item>
    <Form.Item name="publish" label="Publish" valuePropName="checked">
      <Switch />
    </Form.Item>
    <Form.Item name="is_active" label="Active" valuePropName="checked">
      <Switch />
    </Form.Item>
    <div style={{ textAlign: 'right' }}>
      <Space>
        <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
          Save Changes
        </Button>
      </Space>
    </div>
  </Form>
</Modal>
        {/* Camera Assignment Modal */}
        <Modal
          title={<Space><CameraOutlined /><span>Assign Cameras</span></Space>}
          open={isCameraAssignModalOpen}
          onCancel={handleCameraAssignCancel}
          width={700}
          footer={[
            <Button key="cancel" onClick={handleCameraAssignCancel}>Cancel</Button>,
            <Button key="assign" type="primary" loading={assignLoading} onClick={handleAssignCameras} disabled={selectedCameras.length === 0}>
              Assign Cameras
            </Button>,
          ]}
        >
          <Spin spinning={assignLoading}>
            <div style={{ marginTop: 24 }}>
              {getAvailableCameras().length === 0 ? (
                <Alert
                  message="No Cameras Available"
                  description={viewingApplicationCameras.length > 0 ? 'All cameras are already assigned.' : 'No cameras available. Please add cameras first.'}
                  type="info"
                  showIcon
                />
              ) : (
                <>
                  <Alert message="Select cameras and choose a primary camera." type="info" showIcon style={{ marginBottom: 16 }} />
                  <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    {getAvailableCameras().map((camera) => (
                      <div
                        key={camera.id}
                        style={{
                          padding: 16,
                          marginBottom: 12,
                          border: `1px solid ${selectedCameras.includes(camera.id) ? token.colorPrimary : token.colorBorder}`,
                          borderRadius: 8,
                          backgroundColor: selectedCameras.includes(camera.id) ? `${token.colorPrimary}10` : 'transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <div style={{ flex: 1 }}>
                            <Checkbox
                              checked={selectedCameras.includes(camera.id)}
                              onChange={(e) => handleCameraSelection(camera.id, e.target.checked)}
                              style={{ marginBottom: 8 }}
                            >
                              <strong>{camera.camera_name}</strong>
                            </Checkbox>
                            <div style={{ marginLeft: 24, fontSize: 13, color: token.colorTextSecondary }}>
                              {camera.description || 'No description'}
                            </div>
                            <div style={{ marginLeft: 24, marginTop: 4 }}>
                              <Tag color={camera.is_active ? 'success' : 'error'}>{camera.is_active ? 'Active' : 'Inactive'}</Tag>
                            </div>
                          </div>
                          {selectedCameras.includes(camera.id) && (
                            <Radio checked={primaryCamera === camera.id} onChange={() => handlePrimaryCameraChange(camera.id)} style={{ marginLeft: 16 }}>
                              Primary
                            </Radio>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedCameras.length > 0 && (
                    <Alert
                      message={`${selectedCameras.length} camera(s) selected${primaryCamera ? '. Primary set.' : '. Select a primary camera.'}`}
                      type={primaryCamera ? 'success' : 'warning'}
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  )}
                </>
              )}
            </div>
          </Spin>
        </Modal>

        {/* Device Modal */}
        <Modal
  title={selectedDeviceDetails?.id ? "Edit Device" : "Create Device"}
  open={isDeviceModalOpen}
  onCancel={() => { 
    setIsDeviceModalOpen(false); 
    deviceForm.resetFields(); 
    setPayloadObj({}); 
    setSelectedDeviceDetails(null); // Clear editing state
  }}
  footer={null}
  width={600}
>
          <Form form={deviceForm} layout="vertical" onFinish={handleDeviceFormSubmit} style={{ marginTop: 16 }}>
            <Form.Item name="device_uid" label="Device UID" rules={[{ required: true, message: 'Please enter device UID' }]}>
              <Input placeholder="ESP32_001" />
            </Form.Item>
            <Form.Item name="device_name" label="Device Name" rules={[{ required: true, message: 'Please enter device name' }]}>
              <Input placeholder="Main Controller" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <TextArea rows={3} placeholder="Controls fan & lights" />
            </Form.Item>
            <Form.Item name="protocol" label="Protocol" initialValue="websocket" rules={[{ required: true }]}>
              <Input placeholder="websocket" />
            </Form.Item>
            <Form.Item name="firmware_version" label="Firmware Version">
              <Input placeholder="v1.0.2" />
            </Form.Item>
            <Form.Item name="development_enabled" label="Development Mode" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Form.Item label="Payload (JSON)">
              <div>
                <Button onClick={() => setShowPayloadBuilder(true)}>Open Payload Builder</Button>
                {Object.keys(payloadObj).length > 0 && (
                  <TextArea rows={4} value={JSON.stringify(payloadObj, null, 2)} readOnly style={{ marginTop: 10, background: '#f5f5f5' }} />
                )}
              </div>
            </Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => { setIsDeviceModalOpen(false); deviceForm.resetFields(); setPayloadObj({}); }}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={deviceSubmitting}>
  {selectedDeviceDetails?.id ? 'Update Device' : 'Create Device'}
</Button>
              </Space>
            </div>
          </Form>
        </Modal>

        {/* JSON Builder Modal */}
        <Modal
          title="Payload Builder"
          open={showPayloadBuilder}
          onCancel={() => setShowPayloadBuilder(false)}
          onOk={() => setShowPayloadBuilder(false)}
          width={700}
        >
          <JsonBuilderComponent jsonData={payloadObj} onChange={(updatedJson) => setPayloadObj(updatedJson)} />
        </Modal>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div>
      {contextHolder}
      <Title level={3} style={{ marginBottom: 24 }}>Application Management</Title>

      {!hasAnyApplicationPermission ? (
        <Alert message="Permission Denied" description="You do not have permissions to manage applications." type="error" showIcon icon={<LockOutlined />} />
      ) : (
        <>
          {canViewApplication() ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>All Applications</Title>
                <Space wrap>
                  <Button icon={<ReloadOutlined spin={loading} />} onClick={fetchApplications} disabled={loading}>Refresh</Button>
                  {canCreateApplication() && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>Add New Application</Button>
                  )}
                </Space>
              </div>
              <Table
                columns={columns}
                dataSource={applications}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} applications` }}
                scroll={{ x: true }}
                onRow={(record) => ({
                  onClick: (e) => { if (!e.target.closest('button')) openDetailView(record); },
                  style: { cursor: 'pointer' },
                })}
              />
            </>
          ) : (
            <Alert message="Permission Denied" description="You do not have permission to view applications." type="warning" showIcon icon={<LockOutlined />} />
          )}
        </>
      )}

      {/* Create Application Modal */}
      <Modal title="Add New Application" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width={600}>
        <Spin spinning={loading}>
          <Form form={form} layout="vertical" onFinish={handleCreateSubmit} style={{ marginTop: 24 }}>
            <Form.Item name="name" label="Application Name" rules={[{ required: true, message: 'Please enter application name' }, { max: 100 }]}>
              <Input placeholder="e.g., Smart Kiosk 1" />
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ max: 500 }]}>
              <TextArea rows={4} placeholder="Describe the application..." />
            </Form.Item>
            <Form.Item name="publish" label="Publish Application" valuePropName="checked" tooltip="Published applications are visible to end users">
              <Switch />
            </Form.Item>
            <Form.Item name="is_active" label="Activate Application" valuePropName="checked" tooltip="Only active applications can be used">
              <Switch />
            </Form.Item>
            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Space>
                <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={loading}>Create</Button>
              </Space>
            </div>
          </Form>
        </Spin>
      </Modal>

      {/* Device Modal for new app flow */}
      <Modal
        title="Create Device for Application"
        open={isDeviceModalOpen && !selectedApplication}
        onCancel={() => { setIsDeviceModalOpen(false); deviceForm.resetFields(); setPayloadObj({}); setPendingDevicePromptAppId(null); }}
        footer={null}
        width={600}
      >
        <Form form={deviceForm} layout="vertical" onFinish={handleDeviceFormSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="device_uid" label="Device UID" rules={[{ required: true }]}>
            <Input placeholder="ESP32_001" />
          </Form.Item>
          <Form.Item name="device_name" label="Device Name" rules={[{ required: true }]}>
            <Input placeholder="Main Controller" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Controls fan & lights" />
          </Form.Item>
          <Form.Item name="protocol" label="Protocol" initialValue="websocket" rules={[{ required: true }]}>
            <Input placeholder="websocket" />
          </Form.Item>
          <Form.Item name="firmware_version" label="Firmware Version">
            <Input placeholder="v1.0.2" />
          </Form.Item>
          <Form.Item name="development_enabled" label="Development Mode" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item label="Payload (JSON)">
            <div>
              <Button onClick={() => setShowPayloadBuilder(true)}>Open Payload Builder</Button>
              {Object.keys(payloadObj).length > 0 && (
                <TextArea rows={4} value={JSON.stringify(payloadObj, null, 2)} readOnly style={{ marginTop: 10, background: '#f5f5f5' }} />
              )}
            </div>
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setIsDeviceModalOpen(false); deviceForm.resetFields(); setPayloadObj({}); setPendingDevicePromptAppId(null); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={deviceSubmitting}>Create Device</Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Camera Assignment Modal for new app flow */}
      <Modal
        title={<Space><CameraOutlined /><span>Assign Cameras</span></Space>}
        open={isCameraAssignModalOpen && !selectedApplication}
        onCancel={handleCameraAssignCancel}
        width={700}
        footer={[
          <Button key="skip" onClick={handleCameraAssignCancel}>Skip</Button>,
          <Button key="assign" type="primary" loading={assignLoading} onClick={handleAssignCameras} disabled={selectedCameras.length === 0}>
            Assign Cameras
          </Button>,
        ]}
      >
        <Spin spinning={assignLoading}>
          <div style={{ marginTop: 24 }}>
            {cameras.length === 0 ? (
              <Alert message="No Cameras Available" description="No cameras available. Please add cameras first." type="info" showIcon />
            ) : (
              <>
                <Alert message="Select cameras and choose a primary camera." type="info" showIcon style={{ marginBottom: 16 }} />
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {cameras.map((camera) => (
                    <div
                      key={camera.id}
                      style={{
                        padding: 16,
                        marginBottom: 12,
                        border: `1px solid ${selectedCameras.includes(camera.id) ? token.colorPrimary : token.colorBorder}`,
                        borderRadius: 8,
                        backgroundColor: selectedCameras.includes(camera.id) ? `${token.colorPrimary}10` : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                          <Checkbox
                            checked={selectedCameras.includes(camera.id)}
                            onChange={(e) => handleCameraSelection(camera.id, e.target.checked)}
                            style={{ marginBottom: 8 }}
                          >
                            <strong>{camera.camera_name}</strong>
                          </Checkbox>
                          <div style={{ marginLeft: 24, fontSize: 13, color: token.colorTextSecondary }}>
                            {camera.description || 'No description'}
                          </div>
                          <div style={{ marginLeft: 24, marginTop: 4 }}>
                            <Tag color={camera.is_active ? 'success' : 'error'}>{camera.is_active ? 'Active' : 'Inactive'}</Tag>
                          </div>
                        </div>
                        {selectedCameras.includes(camera.id) && (
                          <Radio checked={primaryCamera === camera.id} onChange={() => handlePrimaryCameraChange(camera.id)} style={{ marginLeft: 16 }}>
                            Primary
                          </Radio>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedCameras.length > 0 && (
                  <Alert
                    message={`${selectedCameras.length} camera(s) selected${primaryCamera ? '. Primary set.' : '. Select a primary camera.'}`}
                    type={primaryCamera ? 'success' : 'warning'}
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}
              </>
            )}
          </div>
        </Spin>
      </Modal>

      {/* JSON Builder Modal */}
      <Modal
        title="Payload Builder"
        open={showPayloadBuilder}
        onCancel={() => setShowPayloadBuilder(false)}
        onOk={() => setShowPayloadBuilder(false)}
        width={700}
      >
        <JsonBuilderComponent jsonData={payloadObj} onChange={(updatedJson) => setPayloadObj(updatedJson)} />
      </Modal>
    </div>
  );
};

export default ApplicationPage;