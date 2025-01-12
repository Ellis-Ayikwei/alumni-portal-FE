import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { Icon } from 'react-icons-kit';
import { eye } from 'react-icons-kit/feather/eye';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import PasswordChecklist from 'react-password-checklist';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useSwr, { mutate } from 'swr';
import IconArrowBackward from '../../components/Icon/IconArrowBackward';
import IconEdit from '../../components/Icon/IconEdit';
import IconHome from '../../components/Icon/IconHome';
import IconLoader from '../../components/Icon/IconLoader';
import IconLock from '../../components/Icon/IconLock';
import IconSave from '../../components/Icon/IconSave';
import IconX from '../../components/Icon/IconX';
import axiosInstance from '../../helper/axiosInstance';
import fetcher from '../../helper/fetcher';
import showRequestError from '../../helper/showRequestError';
import { setPageTitle } from '../../store/themeConfigSlice';
import { Permission, PermissionsResponse } from '../../types';
import showMessage from './MyAlumniGroupUtils/showMessage';
const adminUsers = ['SUPER_ADMIN', 'ADMIN', 'UNDERWRITER', 'PREMIUM_ADMIN', 'SALES'];


const roles = [
    { value: 'SUPER_ADMIN', label: 'Super Admin', isDisabled: 'option--is-disabled' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'REGULAR', label: 'Regular' },
    { value: 'UNDERWRITER', label: 'Underwriter' },
    { value: 'PREMIUM_ADMIN', label: 'Premium Admin' },
    { value: 'SALES', label: 'Sales' },
    { value: 'MEMBER', label: 'Member' },
];

const AccountSetting = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [readOnly, setReadOnly] = useState(true);
    const [onEdit, setOnEdit] = useState(false);
    const [params, setParams] = useState<{ [key: string]: any }>({});
    const [tabs, setTabs] = useState<string>('home');
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [type, setType] = useState('password');
    const [icon, setIcon] = useState(eyeOff);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const authUser = useAuthUser() as { role: string; id: string; permissions: string[] };

    const handleToggle = () => {
        if (type === 'password') {
            setIcon(eye);
            setType('text');
        } else {
            setIcon(eyeOff);
            setType('password');
        }
    };

    const { id: userId } = useParams();
    console.log('userId///././/////.', userId);

    const { data: user, error } = useSwr(`/users/my_profile/${userId}`, fetcher);

    useEffect(() => {
        if (user) {
            setParams({ ...user, dob: dayjs(user.dob).format('YYYY-MM-DD') });
        }
    }, [user]);
    useEffect(() => {}, [params]);

    useEffect(() => {
        dispatch(setPageTitle('Account Setting'));
    });
    const toggleTabs = (name: string) => {
        setTabs(name);
    };

    const handleEdit = () => {
        setOnEdit(!onEdit);
        setReadOnly(!readOnly);
    };

    const handleDiscardChanegs = () => {
        setOnEdit(!onEdit);
        setReadOnly(!readOnly);
    };

    const handleSaveChanges = async () => {
        setOnEdit(!onEdit);
        setReadOnly(!readOnly);
        setIsSaveLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 6000));

            const payload = {
                ...params,
            };
            let userId = localStorage.getItem('userId');

            const response = await axiosInstance.put(`/users/${userId}`, JSON.stringify({ ...params }));

            if (response.status === 200) {
                showMessage('Successfully updated', 'success');
                mutate(`/users/my_profile/${userId}`);
                setIsSaveLoading(false);
            }
        } catch (error: any) {
            showMessage(error);
        } finally {
            setIsSaveLoading(false);
        }
    };

    const resetPassword = async () => {
        setIsSaveLoading(true);
        const requiredFields = [
            { field: 'currentPassword', message: 'Current password is required.' },
            { field: 'password', message: 'New password is required.' },
            { field: 'confirmPassword', message: 'Confirm password is required.' },
        ];

        for (let { field, message } of requiredFields) {
            if (!field) {
                showMessage(message, 'error');
                setIsSaveLoading(false);
                return true;
            }
        }

        if (password !== confirmPassword) {
            setIsSaveLoading(false);
            return showMessage('Password and Confirm Password do not match', 'error');
        }

        const payload = {
            currentPassword,
            newPassword: password,
            confirmPassword,
        };
        try {
            const response = await axiosInstance.put(`/users/reset_password/${userId}`, payload);
            if (response.status === 200) {
                showMessage(`Password Reset Successfully.`, 'success');
                setIsSaveLoading(false);
            }
        } catch (error: any) {
            showRequestError(error);
            setIsSaveLoading(false);
        } finally {
            setIsSaveLoading(false);
        }
    };

    const { data: permissions, error: permissionError } = useSwr<{ [key: string]: string[] }>(`/permissions`, fetcher);
    // const { data: userPermissionsData, error: userPermissionDataError } = useSwr(`/permissions/${userId}`, fetcher);
    const [permissionsState, setPermissionsState] = useState<PermissionsResponse | null>(null);
    const [userPermissions, setUserPermissions] = useState<Set<string>>(new Set());

    // Set the initial permission state on mount
    useEffect(() => {
        if (permissions) {
            console.log('some - data', permissions);
        }
        if (permissions) {
            setPermissionsState(permissions as unknown as PermissionsResponse);
        }
    }, [permissions]);

    const [updatedPermissionIds, setUpdatedPermissionIds] = useState<string[]>([]);
    const handlePermissionChange = (permission: Permission) => {
        setPermissionsState((currentPermissions) => {
            if (!currentPermissions) return null;

            return currentPermissions.map((currentPermission) => {
                const updatedPermission = { ...currentPermission };
                const permissionExists = updatedPermission.permissions.some((perm) => perm.id === permission.id);

                if (permissionExists && userId) {
                    const permissionToUpdate = updatedPermission.permissions.find((perm) => perm.id === permission.id);
                    if (!permissionToUpdate) return updatedPermission;
                    const updatedUsers = permissionToUpdate.users;
                    const userIdIndex = updatedUsers.indexOf(userId);

                    if (userIdIndex !== -1) {
                        // Remove user ID if it already exists
                        updatedPermission.permissions = updatedPermission.permissions.map((perm) =>
                            perm.id === permission.id ? { ...perm, users: updatedUsers.filter((user) => user !== userId) } : perm
                        );
                    } else {
                        // Add user ID if it doesn't exist
                        updatedPermission.permissions = updatedPermission.permissions.map((perm) => (perm.id === permission.id ? { ...perm, users: [...updatedUsers, userId] } : perm));
                    }

                    setUpdatedPermissionIds((prevIds) => {
                        if (!prevIds.includes(permission.id)) {
                            return [...prevIds, permission.id];
                        }
                        return prevIds;
                    });
                }

                return updatedPermission;
            });
        });

        console.log('currentPermissions', permissionsState);
        setEditPemissions(true);
    };

    useEffect(() => {
        console.log('ids', updatedPermissionIds);
    }, [updatedPermissionIds]);

    // Function to update permissions (Send the updated data to the backend)
    interface PermissionsState {
        [key: string]: boolean;
    }

    const updatePermissions = async (): Promise<void> => {
        try {
            setUpdatingPermissions(true);
            const response = await axiosInstance.put(`/permissions/${userId}`, JSON.stringify(updatedPermissionIds));

            if (response.status === 204) {
                showMessage('Permissions updated successfully', 'success');
                mutate(`/permissions`);
            }
        } catch (error) {
            showRequestError(error);
        } finally {
            setUpdatingPermissions(false);
            setUpdatedPermissionIds([]);
        }
    };

    const updateRole = async () => {
        try {
            setUpdatingRole(true);
            const response = await axiosInstance.put(`/users/${user?.id}`, { role: selectedRole });
            if (response.status === 204) {
                showMessage('Role updated successfully', 'success');
                mutate(`/users/my_profile/${userId}`);
                setEdit(false);
                setUpdatingRole(false);
            }
        } catch (error: any) {
            showMessage(error);
            setUpdatingRole(false);
            setEdit(false);
        }
    };

    const [selectedRole, setSelectedRole] = useState(user?.role);
    const [edit, setEdit] = useState<boolean>(false);
    const [editPermissions, setEditPemissions] = useState<boolean>(false);
    const [updatingRole, setUpdatingRole] = useState<boolean>(false);
    const [updatingPermissions, setUpdatingPermissions] = useState<boolean>(false);

    useEffect(() => {
        if (user?.role) {
            setSelectedRole(user?.role);
        }
    }, [user?.role]);

    interface Role {
        value: string;
        label: string;
        isDisabled?: string;
    }

    const handleRoleChange = (roleValue: string) => {
        setSelectedRole(roleValue);
        console.log('.............////....', roleValue);
    };

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="#" className="text-primary hover:underline">
                        Users
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Account Settings</span>
                </li>
            </ul>
            <div className="flex items-center lg:justify-between flex-wrap gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="btn btn-danger gap-2 mt-5">
                    <IconArrowBackward />
                    Back
                </button>
            </div>
            <div className="pt-5">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Settings</h5>
                </div>
                <div>
                    <ul className="sm:flex font-semibold border-b border-[#ebedf2] dark:border-[#191e3a] mb-5 whitespace-nowrap overflow-y-auto">
                        <li className="inline-block">
                            <button
                                onClick={() => toggleTabs('home')}
                                className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'home' ? '!border-primary text-primary' : ''}`}
                            >
                                <IconHome />
                                Home
                            </button>
                        </li>

                        <li className="inline-block">
                            <button
                                onClick={() => toggleTabs('security')}
                                className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'security' ? '!border-primary text-primary' : ''}`}
                            >
                                <IconLock />
                                Security
                            </button>
                        </li>
                       {adminUsers.includes(authUser?.role) && <li className="inline-block">
                            <button
                                onClick={() => toggleTabs('permissions')}
                                className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'permissions' ? '!border-primary text-primary' : ''}`}
                            >
                                <IconLock />
                                Permissions And Previllages
                            </button>
                        </li>}
                    </ul>
                </div>
                {tabs === 'home' ? (
                    <div>
                        <h6 className="text-lg font-bold mb-5">General Information</h6>
                        <div className="flex flex-col">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="Jimmy@gmail.com"
                                        className="form-input"
                                        readOnly={readOnly}
                                        value={params?.email}
                                        onChange={(e) => setParams({ ...params, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="username">Username</label>
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="Username"
                                        className="form-input"
                                        readOnly={readOnly}
                                        value={params?.username}
                                        onChange={(e) => setParams({ ...params, username: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="first_name">First Name</label>
                                    <input
                                        id="first_name"
                                        type="text"
                                        placeholder="First Name"
                                        className="form-input"
                                        readOnly={readOnly}
                                        value={params?.first_name}
                                        onChange={(e) => setParams({ ...params, first_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="last_name">Last Name</label>
                                    <input
                                        id="last_name"
                                        type="text"
                                        placeholder="Last Name"
                                        className="form-input"
                                        readOnly={readOnly}
                                        value={params?.last_name}
                                        onChange={(e) => setParams({ ...params, last_name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="gender">Gender</label>
                                    <input
                                        id="gender"
                                        type="text"
                                        placeholder="Gender"
                                        className="form-input"
                                        readOnly={readOnly}
                                        value={params?.gender}
                                        onChange={(e) => setParams({ ...params, gender: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="dob">Date of Birth</label>
                                    <input
                                        id="dob"
                                        type="date"
                                        className="form-input"
                                        readOnly={readOnly}
                                        value={params?.dob}
                                        placeholder="YYYY-MM-DD"
                                        onChange={(e) => setParams({ ...params, dob: dayjs(e.target.value).format('DD-MM-YYYY') })}
                                        min="1997-01-01"
                                        max={dayjs().format('YYYY-MM-DD')}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone">Phone</label>
                                    <input
                                        id="phone"
                                        type="text"
                                        placeholder="Phone"
                                        className="form-input"
                                        readOnly={readOnly}
                                        value={params?.phone}
                                        onChange={(e) => setParams({ ...params, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="occupation">Occupation</label>
                                    <input
                                        id="occupation"
                                        type="text"
                                        placeholder="Occupation"
                                        className="form-input"
                                        readOnly={readOnly}
                                        value={params?.occupation}
                                        onChange={(e) => setParams({ ...params, occupation: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="address">Address</label>
                                    <textarea
                                        id="address"
                                        placeholder="Address"
                                        className="form-input"
                                        readOnly={readOnly}
                                        value={params?.address}
                                        onChange={(e) => setParams({ ...params, address: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="other_names">Other Names</label>
                                    <input
                                        id="other_names"
                                        type="text"
                                        placeholder="Other Names"
                                        className="form-input"
                                        readOnly={readOnly}
                                        value={params?.other_names}
                                        onChange={(e) => setParams({ ...params, other_names: e.target.value })}
                                    />
                                </div>

                                <div className="sm:col-span-2 mt-3 flex justify-end gap-2">
                                    {onEdit ? (
                                        <button type="button" className="btn btn-danger gap-2" onClick={handleDiscardChanegs}>
                                            <IconX /> Discard Changes
                                        </button>
                                    ) : (
                                        <button type="button" className="btn btn-primary gap-2" disabled={isSaveLoading} onClick={handleEdit}>
                                            <IconEdit /> Edit
                                        </button>
                                    )}
                                    <button type="button" className="btn btn-success " disabled={!onEdit || isSaveLoading} onClick={handleSaveChanges}>
                                        {isSaveLoading ? (
                                            <IconLoader className="animate-[spin_2s_linear_infinite] inline-block align-middle ltr:mr-2 rtl:ml-2 shrink-0" />
                                        ) : (
                                            <div className="flex gap-2">
                                                <IconSave /> Save changes
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    ''
                )}

                {tabs === 'security' ? (
                    <div className="switch">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="panel space-y-5">
                                <h5 className="font-semibold text-lg mb-4">Password Reset</h5>
                                <p>Change your password to secure your account. We suggest you use a strong password.</p>

                                <div>
                                    <label htmlFor="current-password">Current Password</label>
                                    <input id="current-password" type={type} placeholder="Current Password" className="form-input" onChange={(e) => setCurrentPassword(e.target.value)} />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password1">
                                        New Password <span className="text-red-600">*</span>
                                    </label>
                                    <div className="flex">
                                        <input
                                            type={type}
                                            name="password"
                                            id="password"
                                            placeholder="Password"
                                            className="form-input"
                                            value={params.password1}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoComplete="current-password"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-7">
                                    <label htmlFor="password2">
                                        Confirm password <span className="text-red-600">*</span>
                                    </label>
                                    <div className="">
                                        <input
                                            type={type}
                                            name="confirmPassword"
                                            id="confirmPassword"
                                            placeholder="Re-Type Password"
                                            className="form-input w-full"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            autoComplete="current-password"
                                            required
                                        />
                                        <div className="text-right mt-2">
                                            {' '}
                                            <span className="cursor-pointer text-gray-500 flex items-center justify-end" onClick={handleToggle}>
                                                show
                                                <Icon className="ml-1" icon={icon} size={16} />
                                            </span>
                                        </div>
                                    </div>

                                    {password && <PasswordChecklist rules={['minLength', 'specialChar', 'number', 'capital', 'match']} minLength={8} value={password} valueAgain={confirmPassword} />}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button type="button" className="btn btn-success " onClick={resetPassword}>
                                        {isSaveLoading ? (
                                            <IconLoader className="animate-[spin_2s_linear_infinite] inline-block align-middle ltr:mr-2 rtl:ml-2 shrink-0" />
                                        ) : (
                                            <div className="flex gap-2">
                                                <IconSave /> Reset Password
                                            </div>
                                        )}
                                    </button>
                                    <div>
                                        forgot Password?{' '}
                                        <button type="button" className="underline underline-offset-2">
                                            Recorver Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="panel space-y-5">
                                <h5 className="font-semibold text-lg mb-4">Two-Factor Authentication</h5>
                                <p>Enable two-factor authentication to add an extra layer of security to your account.</p>
                                <label htmlFor={`custom_switch_checkbox`} className="w-12 h-6 relative">
                                    <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox7" />
                                    <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                ) : (
                    ''
                )}
                {tabs === 'permissions' ? (
                    <div className="switch">
                        <div className="grid gap-5">
                            <div className="panel space-y-5">
                                <h5 className="font-semibold text-lg mb-4">Roles</h5>
                                <p>Manage roles for this account. You can enable or disable roles for different resources.</p>
                                <div className="space-y-3">
                                    {roles.map(({ value, label, isDisabled }) => (
                                        <div key={value} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="role"
                                                className="mr-3"
                                                id={value}
                                                value={value}
                                                checked={selectedRole === value}
                                                onChange={() => handleRoleChange(value)}
                                                disabled={!edit}
                                            />
                                            <label htmlFor={value}>{label}</label>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-row items-end gap-3  justify-endrtl:ml-auto ltr:mr-auto w-full">
                                    <button type="button" onClick={() => setEdit(true)} className="btn btn-primary" disabled={edit}>
                                        Edit
                                    </button>
                                    {edit && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEdit(false);
                                                setSelectedRole(user?.role);
                                            }}
                                            className="btn btn-outline-danger"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button type="button" className="btn btn-success gap-3" disabled={updatingRole || !edit} onClick={() => updateRole()}>
                                        {updatingRole && <IconLoader className="animate-spin inline-block" />} Save
                                    </button>
                                </div>
                            </div>

                            <div className="panel space-y-5">
                                <h5 className="font-semibold text-lg mb-4">Permissions</h5>
                                <p>Manage permissions for this account. You can enable or disable permissions for different resources.</p>
                                <div className="space-y-5 grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
                                    {permissionsState?.map((resource) => (
                                        <div key={resource.resource_type} className="space-y-3 panel ">
                                            <h3 className="font-semibold text-xl">{resource.resource_type}</h3>
                                            <div className="flex flex-col gap-4">
                                                {resource.permissions.map((permission) => (
                                                    <div className="flex items-center gap-3" key={permission.id}>
                                                        <label className="w-12 h-6 relative" aria-label={`${permission.action} ${permission.resource_type}`}>
                                                            <input
                                                                type="checkbox"
                                                                className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                                                checked={userId ? permission.users.includes(userId) : false}
                                                                onChange={() => handlePermissionChange(permission)}
                                                            />
                                                            <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                                                        </label>
                                                        <span>{permission.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-row items-end gap-3  justify-endrtl:ml-auto ltr:mr-auto w-full">
                                    {/* <button type="button" onClick={() => setEdit(true)} className="btn btn-primary" disabled={edit}>
                                        Edit
                                    </button> */}
                                    {editPermissions && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEdit(false);
                                                setSelectedRole(user?.role);
                                            }}
                                            className="btn btn-outline-danger"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button type="button" className="btn btn-success gap-3" disabled={updatingPermissions || !editPermissions} onClick={() => updatePermissions()}>
                                        {updatingPermissions && <IconLoader className="animate-spin inline-block" />} Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    ''
                )}
            </div>
        </div>
    );
};

export default AccountSetting;
