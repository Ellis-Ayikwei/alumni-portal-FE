import Tippy from '@tippyjs/react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RWebShare } from 'react-web-share';
import Swal from 'sweetalert2';
import useSwr, { mutate } from 'swr';
import IconArrowBackward from '../../../../components/Icon/IconArrowBackward';
import IconChecks from '../../../../components/Icon/IconChecks';
import IconEdit from '../../../../components/Icon/IconEdit';
import IconLoader from '../../../../components/Icon/IconLoader';
import IconPencil from '../../../../components/Icon/IconPencil';
import IconPlus from '../../../../components/Icon/IconPlus';
import IconSave from '../../../../components/Icon/IconSave';
import IconShare from '../../../../components/Icon/IconShare';
import IconTrash from '../../../../components/Icon/IconTrash';
import IconUserPlus from '../../../../components/Icon/IconUserPlus';
import IconX from '../../../../components/Icon/IconX';
import IconMenuUsers from '../../../../components/Icon/Menu/IconMenuUsers';
import axiosInstance from '../../../../helper/axiosInstance';
import ConfirmDialog from '../../../../helper/confirmDialog';
import fetcher from '../../../../helper/fetcher';
import showMessage from '../../../../helper/showMessage';
import ShowRequestError from '../../../../helper/showRequestError';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import AddMembersToGroup from '../addMembersToGroup';
import AddNewGroupMember from './AddNewGroupMember';
import ChangePackage from './changeContract';
import MakePresident from './makepresident';
import ShowBeneficiaries from './showBeneficiaries';

const GroupEdit = () => {
    const dispatch = useDispatch();
    const { group_id } = useParams();
    // const alumniData = useSelector((state: IRootState) => state.alumnidata.alumniGroups);
    const { data: alumniData, error: alumniData_error, isLoading: alumniData_loadng } = useSwr(`/alumni_groups/${group_id}`, fetcher);
    const { data: all_members, error: all_members_error, isLoading: all_members_loadng } = useSwr(`/group_members`, fetcher);
    const auth = useAuthUser<{ id: string }>();
    const userId = auth?.id;

    const approved_members = all_members?.filter((group_member: any) => group_member.group_id == group_id && group_member.status === 'APPROVED');
    const other_members = all_members?.filter((group_member: any) => group_member.group_id == group_id && (group_member.status === 'DISAPPROVED' || group_member.status === 'PENDING'));
    const [showBeneficiariesModal, setShowBeneficiariesModal] = useState<boolean>(false);
    const [benefactorIds, setBenefactorIds] = useState<{ userId: string; memberId: string }>({ userId: '', memberId: '' });
    const [group, setGroup] = useState<any>({});

    const group_members = all_members?.filter((group_member: any) => group_member.group_id == group_id);
    const memberId = group_members?.find((grp_md: any) => grp_md.user_id == userId)?.id;

    useEffect(() => {
        dispatch(setPageTitle('Edit Group'));
    }, [dispatch]);

    const [memberApprovalLaoding, setMemberApprovalLaoding] = useState<{ [key: string]: boolean }>({});
    const [makePresidentModal, setMakePresidentModal] = useState<boolean>(false);
    const [changeInsurancePackageModal, setChangeInsurancePackageModal] = useState<boolean>(false);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [addMembersToGroupModal, setAddMembersToGroupModal] = useState<boolean>(false);
    const [discard, setDiscard] = useState<boolean>(false);

    const [AddUserModal, setAddUserModal] = useState(false);
    const [AddNewBeneficiaryModal, setAddNewBeneficiaryModal] = useState(false);
    const [activateSave, setActivateSave] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [inviteLink, setInviteLink] = useState('');

    const navigate = useNavigate();

    const [params, setParams] = useState<{ [key: string]: any }>({});
    useEffect(() => {
        setGroup(alumniData);
    }, [alumniData, refreshData, mutate]);

    useEffect(() => {
        setParams({
            name: group?.name,
            start_date: group?.start_date,
            end_date: group?.end_date,
            school: group?.school,
            status: group?.status,
            package_id: group?.package_id,
            description: group?.description,
            president_user_id: group?.president_user_id,
        });
        console.log('triggered', params);
    }, [group, discard]);

    const [imageSrc, setImageSrc] = useState('/assets/images/logo.svg');

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target && e.target.result) {
                    setImageSrc(e.target.result as string);
                }
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    const [changedParams, setChangedParams] = useState<{ [key: string]: any }>({});

    const handleItemChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        const updatedParams = { ...params };
        const updatedChangedParams = { ...changedParams };

        if (value.trim() !== '') {
            updatedParams[name] = value;
            updatedChangedParams[name] = value;
        } else {
            delete updatedParams[name];
            delete updatedChangedParams[name];
        }

        setParams(updatedParams);
        setChangedParams(updatedChangedParams);
        setActivateSave(true);
    };

    const handleVewBeneficiaries = (user_id: string, member_id: string) => {
        setBenefactorIds({ userId: user_id, memberId: member_id });
        setShowBeneficiariesModal(true);
    };

    const handleGroupInfoSave = async () => {
        try {
            const response = await axiosInstance.put(`/alumni_groups/${group_id}`, JSON.stringify(changedParams));
            if (response.status === 200) {
                Swal.fire('Group Info Updated', '', 'success');
                mutate('/alumni_groups');
                setActivateSave(false);
                setRefreshData(!refreshData);
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                const parser = new DOMParser();
                const errorData = error.response.data;
                const doc = parser.parseFromString(errorData, 'text/html');
                const errorMess = doc.querySelector('body')?.innerText || 'An error occurred';
                const errorMessage = errorMess.split('\n')[1];
                console.error('Error:', errorMessage);
                showMessage(`${errorMessage}`, 'error');
            }
        } finally {
            setIsSaveLoading(false);
        }
    };

    const handleDiscardChanges = () => {
        setChangedParams({});
        setParams({
            name: group?.name,
            start_date: group?.start_date,
            end_date: group?.end_date,
            school: group?.school,
            status: group?.status,
            package_id: group?.package_id,
            description: group?.description,
            president_user_id: group?.president_user_id,
        });
        setDiscard(!discard);
        setActivateSave(false);
    };

    const handleMemberApproval = async (action: string, member_id: string) => {
        try {
            setMemberApprovalLaoding((prevLoading) => ({ ...prevLoading, [member_id]: true }));

            const approvalResponse = await axiosInstance.put(`/group_members/${member_id}`, JSON.stringify({ status: action }));

            if (approvalResponse.status === 200) {
                showMessage(`${action} Successfully`, 'success');
                mutate('/group_members');
                setRefreshData(!refreshData);
            }

            setMemberApprovalLaoding((prevLoading) => ({ ...prevLoading, [member_id]: false }));

            return true;
        } catch (error: any) {
            ShowRequestError(error);
            setMemberApprovalLaoding((prevLoading) => ({ ...prevLoading, [member_id]: false }));
        }
    };
    const handleMemberDeletion = async (member_id: string) => {
        try {
            const confirmDel = await ConfirmDialog({
                title: 'Remove User From Group',
                note: 'This Action annot Be undone.',
                finalQuestion: 'Are you sure you want to remove this user from the group?',
            });

            if (!confirmDel) {
                return false;
            }

            setMemberApprovalLaoding((prevLoading) => ({ ...prevLoading, [member_id]: true }));
            const approvalResponse = await axiosInstance.delete(`/group_members/${member_id}`);

            if (approvalResponse.status === 200) {
                Swal.fire('user removed from group', '', 'success');
                mutate('/group_members');
                mutate(`/alumni_groups/${group_id}`);
                setRefreshData(!refreshData);
            }

            setMemberApprovalLaoding((prevLoading) => ({ ...prevLoading, [member_id]: false }));

            return true;
        } catch (error: any) {
            setMemberApprovalLaoding((prevLoading) => ({ ...prevLoading, [member_id]: false }));
            if (error.response && error.response.data) {
                const parser = new DOMParser();
                const errorData = error.response.data;
                const doc = parser.parseFromString(errorData, 'text/html');
                const errorMess = doc.querySelector('body')?.innerText || 'An error occurred';
                const errorMessage = errorMess.split('\n')[1];
                console.error('Error:', errorMessage);
                showMessage(`${errorMessage}`, 'error');
                setMemberApprovalLaoding((prevLoading) => ({ ...prevLoading, [member_id]: false }));
            }
        }
    };

    useEffect(() => {
        let isMounted = true;
        console.log('useEffect called');

        if (isMounted) {
            const handleInviteCode = async () => {
                try {
                    let payload: any = JSON.stringify({
                        user_id: userId,
                    });

                    const response = await axiosInstance.post(`/alumni_groups/${group_id}/invite_code`, payload);
                    if (response.status === 200) {
                        const inviteLink = `${window.location.origin}/member/groups/${group_id}/joingroup?code=${response.data.code}&inv_id=${response?.data?.id}`;
                        setInviteLink(inviteLink);
                    }
                } catch (error) {}
            };

            handleInviteCode();
        }
        return () => {
            isMounted = false;
        };
    }, []);

    const handleRemoveAdmin = async (adminId: string) => {
        try {
            const confirmDel = await ConfirmDialog({
                title: 'Remove Admin',
                note: 'This action cannot be undone.',
                finalQuestion: 'Are you sure you want to remove this admin from the group?',
            });

            if (!confirmDel) {
                return false;
            }

            const response = await axiosInstance.delete(`/alumni_groups/${group_id}/admins/${adminId}`);

            if (response.status === 200) {
                Swal.fire('Admin removed from group', '', 'success');
                mutate(`/alumni_groups/${group_id}`);
                setRefreshData(!refreshData);
            }

            return true;
        } catch (error: any) {
            ShowRequestError(error);
        }
    };

    return (
        <div className="flex xl:flex-col flex-col gap-2.5">
            <div className="flex items-center lg:justify-between flex-wrap gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="btn btn-danger gap-2">
                    <IconArrowBackward />
                    Back
                </button>
                <div className="flex !gap-2">
                    <button
                        onClick={() => {
                            setAddMembersToGroupModal(true);
                        }}
                        className="btn btn-primary gap-2 bg-blue-500 text-white"
                    >
                        <IconUserPlus />
                        Add Member
                    </button>

                    <div>
                        <RWebShare
                            data={{
                                url: inviteLink,
                                title: 'Join Alumni Group',
                            }}
                        >
                            <button className="btn btn-warning gap-2 bg-yellow-500 text-white ">
                                <IconShare />
                                Invite A member
                            </button>
                        </RWebShare>
                    </div>
                </div>
            </div>
            <div className="panel px-0 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
                <div className="flex justify-between flex-wrap px-4">
                    <div className="mb-6 lg:w-1/2 w-full">
                        <div className="flex items-center text-black dark:text-white shrink-0">
                            <img src={imageSrc} alt="img" className="w-14" />
                            <label htmlFor="imageUpload" className="ml-2 cursor-pointer">
                                <IconPencil className="-mt-5 -ml-5  w-6 h-6 " />
                            </label>
                            <input type="file" id="imageUpload" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                        </div>
                        <div className="mt-6 text-gray-500 dark:text-gray-400 flex gap-2 items-center">
                            <div>
                                <label htmlFor="schoolstartdate" className="ml-2 cursor-pointer">
                                    school start date:
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    id="schoolstartdate"
                                    className="form-input"
                                    onChange={(e) => handleItemChange(e)}
                                    defaultValue={params?.start_date ? dayjs(params.start_date).format('YYYY-MM-DD') : ''}
                                />
                            </div>
                            <div>
                                <label htmlFor="schoolstartdate" className="ml-2 cursor-pointer">
                                    school end date:
                                </label>
                                <input
                                    type="date"
                                    name="end_date"
                                    id="schoolstartdate"
                                    className="form-input"
                                    onChange={(e) => handleItemChange(e)}
                                    defaultValue={params?.end_date ? dayjs(params?.end_date).format('YYYY-MM-DD') : ''}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/2 w-full lg:max-w-fit">
                        <div className="flex items-center">
                            <label htmlFor="Alumni Group Name" className="flex-1 ltr:mr-2 rtl:ml-2 mb-0">
                                Alumni Group Name
                            </label>
                            <input
                                id="number"
                                type="text"
                                name="name"
                                className="form-input lg:w-[250px] w-2/3"
                                placeholder="#8801"
                                defaultValue={params?.name}
                                onChange={(e) => handleItemChange(e)}
                            />
                        </div>
                        <div className="flex items-center mt-2">
                            <label htmlFor="Alumni Group Name" className="flex-1 ltr:mr-2 rtl:ml-2 mb-0">
                                Group Description
                            </label>
                            {/* <input id="number" type="textarea" name="alumni-group-description" className="form-input lg:w-[250px] w-2/3" placeholder="#8801" defaultValue={'group descrition'} /> */}
                            <textarea
                                id="description"
                                name="description"
                                className="form-textarea min-h-[100px]"
                                placeholder="alumni-params-description"
                                onChange={(e) => handleItemChange(e)}
                                defaultValue={params?.description}
                            ></textarea>
                        </div>
                    </div>
                </div>
                {activateSave && (
                    <div className="flex gap-2 px-3 ltr:ml-auto rtl:mr-auto justify-end items-end">
                        <button className={`btn  btn-outline-danger flex items-center gap-2 p-2 rounded `} onClick={handleDiscardChanges}>
                            <IconX className="w-6 h-6" />
                            Discard Changes
                        </button>
                        <button onClick={handleGroupInfoSave} className={`btn  btn-outline-success flex items-center gap-2 p-2 rounded `}>
                            {true ? <IconSave className="w-6 h-6" /> : <IconLoader className="animate-[spin_2s_linear_infinite] inline-block align-middle ltr:mr-2 rtl:ml-2 shrink-0" />}
                            Save Changes
                        </button>
                    </div>
                )}
                <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
                <div className="flex justify-between lg:flex-row flex-col gap-6 flex-wrap p-3">
                    <div className="flex-1">
                        <div className="space-y-1 text-white-dark">
                            <div className="space-y-1 text-white-dark">
                                <div className="flex gap-2">
                                    Admins:
                                    <Tippy content="add an admin">
                                        <button onClick={() => setMakePresidentModal(true)} className="btn bg-success rounded-full px-2 py-1 w-fit text-white" aria-label="make-admin">
                                            <IconPlus className="w-4 h-4" />
                                        </button>
                                    </Tippy>
                                </div>
                                {group?.admins?.map((admin: any) => (
                                    <div key={admin.id} className="flex items-center gap-2">
                                        <div className="text-black dark:text-white font-semibold">{admin.full_name}</div>
                                        <div>{admin.phone}</div>
                                        <Tippy content="Remove Admin">
                                            <button className="hover:text-red-600" onClick={() => handleRemoveAdmin(admin.user_id)}>
                                                <IconX className="w-4 h-4 cursor-pointer" />
                                            </button>
                                        </Tippy>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between sm:flex-row flex-col gap-6 lg:w-2/3">
                        <div className="xl:1/3 lg:w-2/5 sm:w-1/2">
                            <div className="flex items-center w-full justify-between mb-2">
                                <div className="text-white-dark">Insurrance Package :</div>
                                <div className="flex  items-center gap-1">
                                    {group?.insurance_package?.name}{' '}
                                    <button onClick={() => setChangeInsurancePackageModal(true)} className="btn bg-success rounded-full px-2 py-1 w-fit text-white">
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center w-full justify-between mb-2">
                                <div className="text-white-dark">Date Created:</div>
                                <div>{dayjs(group?.created_at).format('DD MMM YYYY')}</div>
                            </div>
                        </div>
                        <div className="xl:1/3 lg:w-2/5 sm:w-1/2">
                            <div className="flex items-center w-full justify-between mb-2">
                                <div className="text-white-dark">Contract Name:</div>
                                <div className="whitespace-nowrap">
                                    {group?.current_contract?.name}
                                    {/* <button onClick={() => setChangeInsurancePackageModal(true)} className="btn bg-success rounded-full px-2 py-1 w-fit text-white">
                                        <IconEdit className="w-4 h-4" />
                                    </button> */}
                                </div>
                            </div>
                            <div className="flex items-center w-full justify-between mb-2">
                                <div className="text-white-dark">Contract Id:</div>
                                <div>{group?.current_contract?.id}</div>
                            </div>
                            <div className="flex items-center w-full justify-between mb-2">
                                <div className="text-white-dark">Contract state:</div>
                                <div>{group?.contract?.is_signed === true ? 'Signed' : 'Not Signed'}</div>
                            </div>
                            <div className="flex items-center w-full justify-between mb-2">
                                <div className="text-white-dark">Group Activity</div>
                                <div>{group?.contract?.status}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid gap-4 w-full ">
                    <div className="panel h-full w-full mb-4">
                        <div className="flex items-center justify-between mb-5">
                            <h5 className="font-semibold text-lg dark:text-white-light">Group Members - Approved</h5>
                            <div className="flex items-center gap-2 rounded-full px-2 py-1 bg-green-200">
                                <IconMenuUsers />
                                <span>{approved_members?.length}</span>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="ltr:rounded-l-md rtl:rounded-r-md">Member Name</th>
                                        <th>Email</th>
                                        <th>Phone Number</th>
                                        <th>DOB</th>
                                        <th>Occupation</th>
                                        <th>Status</th>
                                        <th>Date Joined</th>
                                        <th>Nominated Lives</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approved_members?.map((member: any) => (
                                        <tr key={member?.id} className="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                            <td className="min-w-[150px] text-black dark:text-white">
                                                <div className="flex items-center">
                                                    <img className="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover" src="/assets/images/profile-6.jpeg" alt="avatar" />
                                                    <span className="whitespace-nowrap">
                                                        {member?.user_info?.full_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-primary">{member?.user_info?.email}</td>
                                            <td>{member?.user_info?.phone}</td>
                                            <td>{dayjs(member?.user_info?.dob).format('DD MMM YYYY')}</td>
                                            <td>{member?.user_info?.occupation}</td>
                                            <td>{member?.status}</td>
                                            <td>{dayjs(member?.created_at).format('DD MMM YYYY')}</td>
                                            <td>
                                                <button type="button" className="text-primary font-semibold hover:underline" onClick={() => handleVewBeneficiaries(member?.user_id, member?.id)}>
                                                    Nominated Lives
                                                </button>
                                            </td>
                                            <td className="flex flex-wrap flex-row">
                                                {(member?.status === 'PENDING' || member?.status === 'DISAPPROVED') && (
                                                    <button onClick={() => handleMemberApproval('APPROVED', member?.id)} className="hover:text-green-500 has-tooltip">
                                                        <span className="tooltip rounded shadow-lg p-1 bg-gray-100 text-green-500 -mt-8">Approve</span>
                                                        {memberApprovalLaoding[member?.id] ? (
                                                            <IconLoader className="animate-[spin_2s_linear_infinite] inline-block align-middle ltr:mr-2 rtl:ml-2 shrink-0" />
                                                        ) : (
                                                            <IconChecks />
                                                        )}
                                                    </button>
                                                )}
                                                {(member?.status === 'PENDING' || member?.status === 'APPROVED') && (
                                                    <button onClick={() => handleMemberApproval('DISAPPROVED', member?.id)} className="hover:text-red-800 has-tooltip">
                                                        <span className="tooltip rounded shadow-lg p-1 bg-gray-100 text-red-500 -mt-8">Disapprove</span>
                                                        {memberApprovalLaoding[member?.id] ? (
                                                            <IconLoader className="animate-[spin_2s_linear_infinite] inline-block align-middle ltr:mr-2 rtl:ml-2 shrink-0" />
                                                        ) : (
                                                            <IconX />
                                                        )}
                                                    </button>
                                                )}
                                                <button className="hover:text-red-800 has-tooltip" onClick={() => handleMemberDeletion(member?.id)}>
                                                    <span className="tooltip rounded shadow-lg p-1 bg-gray-100 text-red-500 -mt-16">Delete From Group</span>
                                                    <IconTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="grid gap-4 w-full ">
                    <div className="panel h-full w-full mb-4">
                        <div className="flex items-center justify-between mb-5">
                            <h5 className="font-semibold text-lg dark:text-white-light">Group Members - Pending Approval And Disapproved</h5>
                            <div className="flex items-center gap-2 rounded-full px-2 py-1 bg-red-200">
                                <IconMenuUsers />
                                <span>{other_members?.length}</span>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="ltr:rounded-l-md rtl:rounded-r-md">Member Name</th>
                                        <th>Email</th>
                                        <th>Phone Number</th>
                                        <th>DOB</th>
                                        <th>Occupation</th>
                                        <th>Status</th>
                                        <th>Date Joined</th>
                                        <th>Nominated Lives</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(other_members?.length !== 0 &&
                                        other_members?.map((member: any) => (
                                            <tr key={member?.id} className="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                                <td className="min-w-[150px] text-black dark:text-white">
                                                    <div className="flex items-center">
                                                        <img className="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover" src="/assets/images/profile-6.jpeg" alt="avatar" />
                                                        <span className="whitespace-nowrap">
                                                            {' '}
                                                            {member?.user_info?.first_name} {member?.user_info?.last_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="text-primary">{member?.user_info?.email}</td>
                                                <td>{member?.user_info?.phone}</td>
                                                <td>{dayjs(member?.user_info?.dob).format('DD MMM YYYY')}</td>
                                                <td>{member?.user_info?.occupation}</td>
                                                <td>{member?.status}</td>
                                                <td>{dayjs(member?.created_at).format('DD MMM YYYY')} </td>
                                                <td>
                                                    <p className="ltr:ml-auto rtl:mr-auto text-secondary">
                                                        <button
                                                            type="button"
                                                            className="text-primary font-semibold hover:underline group"
                                                            onClick={() => handleVewBeneficiaries(member?.user_id, member?.id)}
                                                        >
                                                            Nominated Lives{' '}
                                                        </button>
                                                    </p>
                                                </td>
                                                <td className="flex flex-wrap flex-row">
                                                    {(member?.status === 'PENDING' || member?.status === 'DISAPPROVED') && (
                                                        <button onClick={() => handleMemberApproval('APPROVED', member?.id)} className="hover:text-green-500 has-tooltip">
                                                            <span className="tooltip rounded shadow-lg p-1 bg-gray-100 text-green-500 -mt-8">Appprove</span>
                                                            {memberApprovalLaoding[member?.id] ? (
                                                                <IconLoader className="animate-[spin_2s_linear_infinite] inline-block align-middle ltr:mr-2 rtl:ml-2 shrink-0" />
                                                            ) : (
                                                                <IconChecks />
                                                            )}
                                                        </button>
                                                    )}
                                                    {(member?.status === 'PENDING' || member?.status === 'APPROVED') && (
                                                        <button onClick={() => handleMemberApproval('DISAPPROVED', member?.id)} className="hover:text-red-800 has-tooltip">
                                                            <span className="tooltip rounded shadow-lg p-1 bg-gray-100 text-red-500 -mt-8">DISAPPROVE</span>
                                                            {memberApprovalLaoding[member?.id] ? (
                                                                <IconLoader className="animate-[spin_2s_linear_infinite] inline-block align-middle ltr:mr-2 rtl:ml-2 shrink-0" />
                                                            ) : (
                                                                <IconX />
                                                            )}
                                                        </button>
                                                    )}

                                                    <button className="hover:text-red-800 has-tooltip" onClick={() => handleMemberDeletion(member?.id)}>
                                                        <span className="tooltip rounded shadow-lg p-1 bg-gray-100 text-red-500 -mt-16">Delete From Group</span>

                                                        <IconTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))) ||
                                        'No Pending or disapproved members'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* <div className="mt-8 px-4">
                    <label htmlFor="notes">Notes</label>
                    <textarea id="notes" name="notes" className="form-textarea min-h-[130px]" placeholder="Notes...." defaultValue={params.notes}></textarea>
                </div> */}
            </div>

            <AddNewGroupMember AddUserModal={AddUserModal} setAddUserModal={setAddUserModal} />
            <MakePresident showModal={makePresidentModal} setShowModal={setMakePresidentModal} groupId={group?.id} />
            <ChangePackage showModal={changeInsurancePackageModal} setShowModal={setChangeInsurancePackageModal} groupId={group?.id} />
            {benefactorIds && <ShowBeneficiaries showBeneficiariesModal={showBeneficiariesModal} setShowBeneficiariesModal={setShowBeneficiariesModal} benefactorIds={benefactorIds} edit={true} />}
            <AddMembersToGroup AddMembersToGroupModal={addMembersToGroupModal} setAddMembersToGroupModal={setAddMembersToGroupModal} groups={[group]} />
        </div>
    );
};

export default GroupEdit;
