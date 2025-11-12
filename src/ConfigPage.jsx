import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Input, Select, Table, Tag, Tooltip, theme, notification, Spin, Checkbox, Row, Col, Typography, Space, Tabs } from 'antd';
import { UserOutlined, SafetyOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined, EyeInvisibleOutlined, CheckOutlined, UserAddOutlined } from '@ant-design/icons';
import { getUsers, createUser, updateUser, deleteUser, restoreUser, getRoles, createRole, updateRole, getPermissions } from './services/configService';

const { Option } = Select;
const { Title } = Typography;

const ConfigPage = ({ theme: themeProp }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [modal, contextHolder] = Modal.useModal();
  const { token } = theme.useToken();

  // Users state
  const [users, setUsers] = useState([]);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userForm] = Form.useForm();
   const [activeUserTooltip, setActiveUserTooltip] = useState(null);

  // Roles state
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isRoleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm] = Form.useForm();
const [activeRoleTooltip, setActiveRoleTooltip] = useState(null);
  const roleColors = {
    Administrator: 'purple',
    Manager: 'blue',
    Operator: 'green',
    Viewer: 'gold',
    SuperAdmin: 'red',
    HR: 'cyan'
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, rolesData, permsData] = await Promise.all([
        getUsers(showDeletedUsers),
        getRoles(),
        getPermissions()
      ]);
      setUsers(Array.isArray(usersData) ? usersData.map(u => ({ ...u, key: u.id })) : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permsData) ? permsData : []);
    } catch (error) {
      notification.error({
        message: 'Fetch Failed',
        description: error.message || 'Could not load data.'
      });
    } finally {
      setLoading(false);
    }
  }, [showDeletedUsers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // User Management
  const openUserModal = (user = null) => {
    setActiveUserTooltip(null); // Hide any active user tooltips
    if (user) {
      setEditingUser(user);
      userForm.setFieldsValue({
        ...user,
        roles: user.role_details.map(r => r.id)
      });
    } else {
      setEditingUser(null);
      userForm.resetFields();
    }
    setUserModalOpen(true);
  };
  const handleUserSubmit = async (values) => {
    setLoading(true);
    try {
      // Corrected logic for handling the roles payload
      const rolesPayload = values.roles
          ? (Array.isArray(values.roles) ? values.roles : [values.roles])
          : [];

      const body = {
        ...values,
        roles: rolesPayload
      };

      if (editingUser) {
        await updateUser(editingUser.id, body);
        notification.success({ message: 'User Updated' });
      } else {
        await createUser(body);
        notification.success({ message: 'User Created' });
      }
      setUserModalOpen(false);
      fetchData();
    } catch (error) {
      const errorMsg = error.email
        ? `Email: ${error.email[0]}`
        : (error.message || 'Failed to save user.');
      notification.error({
        message: 'Save Failed',
        description: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserDelete = (id) => {
    modal.confirm({
      title: 'Are you sure?',
      content: 'This will temporarily deactivate the user.',
      okText: 'Deactivate',
      okType: 'danger',
      async onOk() {
        try {
          await deleteUser(id);
          notification.success({ message: 'User Deactivated' });
          fetchData();
        } catch (e) {
          notification.error({ message: 'Failed' })
        }
      }
    });
  };

  const handleUserRestore = (id) => {
    modal.confirm({
      title: 'Are you sure?',
      content: 'This will reactivate the user.',
      async onOk() {
        try {
          await restoreUser(id);
          notification.success({ message: 'User Reactivated' });
          fetchData();
        } catch (e) {
          notification.error({ message: 'Failed' })
        }
      }
    });
  };

 const userColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Mobile',
      key: 'mobile',
      render: (_, r) => r.country_code && r.mobile
        ? `${r.country_code} ${r.mobile}`
        : r.mobile || '-'
    },
    {
      title: 'Role',
      key: 'role',
      render: (_, r) => r.role_details.map(role => (
        <Tag key={role.id} color={roleColors[role.name] || 'default'}>
          {role.name}
        </Tag>
      ))
    },
    {
      title: 'Created At',
      key: 'created_at',
      render: (_, r) => new Date(r.created_at).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, r) => (
        <Tag color={r.deleted_at ? 'error' : 'success'}>
          {r.deleted_at ? 'Inactive' : 'Active'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => (
        <Space>
          <Tooltip
            title="Edit"
            overlayInnerStyle={{ color: token.colorText }}
            open={activeUserTooltip === `edit-${r.id}`}
            onOpenChange={(visible) => setActiveUserTooltip(visible ? `edit-${r.id}` : null)}
          >
            <Button icon={<EditOutlined />} size="small" onClick={() => openUserModal(r)} />
          </Tooltip>

          {r.deleted_at
            ? <Tooltip
              title="Restore"
              overlayInnerStyle={{ color: token.colorText }}
              open={activeUserTooltip === `restore-${r.id}`}
              onOpenChange={(visible) => setActiveUserTooltip(visible ? `restore-${r.id}` : null)}
            >
              <Button icon={<CheckOutlined />} size="small" onClick={() => {
                setActiveUserTooltip(null);
                handleUserRestore(r.id);
              }} />
            </Tooltip>
            : <Tooltip
              title="Deactivate"
              overlayInnerStyle={{ color: token.colorText }}
              open={activeUserTooltip === `deactivate-${r.id}`}
              onOpenChange={(visible) => setActiveUserTooltip(visible ? `deactivate-${r.id}` : null)}
            >
              <Button icon={<DeleteOutlined />} size="small" danger onClick={() => {
                setActiveUserTooltip(null);
                handleUserDelete(r.id);
              }} />
            </Tooltip>
          }
        </Space>
      )
    }
  ];

  const groupPermissionsByCategory = (permissions) => {
    const groups = {};
    permissions.forEach(perm => {
      const category = perm.policy;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(perm);
    });
    return groups;
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Role Management
   const openRoleModal = (role = null) => {
    setActiveRoleTooltip(null); // Hide any active role tooltips
    if (role) {
      setEditingRole(role);
      roleForm.setFieldsValue({
        ...role,
        permissions: role.permission_details.map(p => p.id)
      });
    } else {
      setEditingRole(null);
      roleForm.resetFields();
    }
    setRoleModalOpen(true);
  };

  const handleRoleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, values);
        notification.success({ message: 'Role Updated' });
      } else {
        await createRole(values);
        notification.success({ message: 'Role Created' });
      }
      setRoleModalOpen(false);
      fetchData();
    } catch (error) {
      notification.error({
        message: 'Save Failed',
        description: error.message || 'Failed to save role.'
      });
    } finally {
      setLoading(false);
    }
  };

const roleColumns = [
    { title: 'Role Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_, r) => `${r.permission_details.length} permissions`
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (text) => new Date(text).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => (
        <Tooltip
          title="Edit"
          overlayInnerStyle={{ color: token.colorText }}
          open={activeRoleTooltip === r.id}
          onOpenChange={(visible) => setActiveRoleTooltip(visible ? r.id : null)}
        >
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openRoleModal(r)}
          />
        </Tooltip>
      )
    }
  ];

  const tabItems = [
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          {' User Management'}
        </span>
      ),
      children: (
        <div>
          <Space direction="vertical" style={{ marginBottom: 16, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search users..."
                style={{ maxWidth: 300, flex: '1 1 200px' }}
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
              <Space wrap>
                <Button
                  icon={showDeletedUsers ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={() => setShowDeletedUsers(!showDeletedUsers)}
                >
                  {showDeletedUsers ? 'Hide Inactive' : 'Show Inactive'}
                </Button>
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => openUserModal()}
                >
                  Add User
                </Button>
              </Space>
            </div>
          </Space>
          <Table
            columns={userColumns}
            dataSource={filteredUsers}
            loading={loading}
            scroll={{ x: true }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
          />
        </div>
      ),
    },
    {
      key: 'roles',
      label: (
        <span>
          <SafetyOutlined />
          {' Roles & Permissions'}
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openRoleModal()}
            >
              Create Role
            </Button>
          </div>
          <Table
            columns={roleColumns}
            dataSource={roles}
            loading={loading}
            rowKey="id"
            scroll={{ x: true }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <Title level={3} style={{ marginBottom: 24 }}>
        Settings & Configuration
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={isUserModalOpen}
        onCancel={() => setUserModalOpen(false)}
        footer={null}
      >
        <Spin spinning={loading}>
          <Form
            form={userForm}
            layout="vertical"
            onFinish={handleUserSubmit}
            style={{ marginTop: 24 }}
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter full name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter valid email' }
              ]}
            >
              <Input  />
            </Form.Item>
            <Form.Item name="mobile" label="Phone Number">
              <Input />
            </Form.Item>
            <Form.Item
              name="roles"
              label="Role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select placeholder="Select a role">
                {roles.map(r => (
                  <Option key={r.id} value={r.id}>{r.name}</Option>
                ))}
              </Select>
            </Form.Item>
            {!editingUser && (
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please enter password' }]}
              >
                <Input.Password />
              </Form.Item>
            )}
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setUserModalOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit">Save</Button>
              </Space>
            </div>
          </Form>
        </Spin>
      </Modal>

      {/* Role Modal */}
      <Modal
        title={editingRole ? 'Edit Role' : 'Create Role'}
        open={isRoleModalOpen}
        onCancel={() => setRoleModalOpen(false)}
        footer={null}
        width={600}
      >
        <Spin spinning={loading}>
          <Form
            form={roleForm}
            layout="vertical"
            onFinish={handleRoleSubmit}
            style={{ marginTop: 24 }}
          >
            <Form.Item
              name="name"
              label="Role Name"
              rules={[{ required: true, message: 'Please enter role name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="permissions" label="Permissions">
              <Checkbox.Group style={{ width: '100%' }}>
                {(() => {
                  const groupedPerms = groupPermissionsByCategory(permissions);
                  return (
                    <div>
                      {Object.entries(groupedPerms).map(([category, perms]) => (
                        <div key={category} style={{ marginBottom: 16 }}>
                          <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
                            {category}
                          </Title>
                          <Row gutter={[16, 8]}>
                            {perms.map(p => (
                              <Col xs={24} sm={12} md={8} key={p.id}>
                                <Checkbox value={p.id}>{p.name}</Checkbox>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </Checkbox.Group>
            </Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setRoleModalOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit">Save</Button>
              </Space>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default ConfigPage;