import { Dialog, Transition } from '@headlessui/react';
import Tippy from '@tippyjs/react';
import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Select, { StylesConfig } from 'react-select';
import { mutate } from 'swr';
import 'tippy.js/dist/tippy.css';
import IconLoader from '../../../components/Icon/IconLoader';
import IconX from '../../../components/Icon/IconX';
import axiosInstance from '../../../helper/axiosInstance';
import extractErrorMessage from '../../../helper/extractErrorMessage';
import showMessage from '../../../helper/showMessage';
import { IRootState } from '../../../store';
import { GetUsersData } from '../../../store/usersSlice';
import AddUserFromCsvFile from './groupPreviewandEdit/addUsersFromCsvFIle';

interface AddMembersToGroupProps {
    AddMembersToGroupModal: boolean;
    setAddMembersToGroupModal: (value: boolean) => void;
    groups: any;
}

const roles = [
    { value: 'SUPER_ADMIN', label: 'Super Admin', isDisabled: 'option--is-disabled' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'REGULAR', label: 'Regular' },
    { value: 'UNDERWRITER', label: 'Underwriter' },
    { value: 'PREMIUM_ADMIN', label: 'Premium Admin' },
    { value: 'SALES', label: 'Sales' },
    { value: 'MEMBER', label: 'Member' },
    { value: 'UNDERWRITER', label: 'Underwriter' },
    { value: 'PREMIUM_ADMIN', label: 'Premium Admin' },
    { value: 'SALES', label: 'Sales' },
    { value: 'MEMBER', label: 'Member' },
    { value: 'UNDERWRITER', label: 'Underwriter' },
    { value: 'PREMIUM_ADMIN', label: 'Premium Admin' },
    { value: 'SALES', label: 'Sales' },
    { value: 'MEMBER', label: 'Member' },
];

const AddMembersToGroup = ({ AddMembersToGroupModal, setAddMembersToGroupModal, groups }: AddMembersToGroupProps) => {
    const dispatch = useDispatch();
    const usersData = useSelector((state: IRootState) => state.usersdata.usersData);
    const [selectedUsers, setSelectedUsers] = useState<{ value: string; label: string }[]>([]);
    const [usersToAddToALumniGroup, setUsersToAddToALumniGroup] = useState<any>(usersData);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        dispatch(GetUsersData() as any);
        setUsersToAddToALumniGroup(usersData);
    }, [dispatch]);

    useEffect(() => {
        console.log(usersToAddToALumniGroup);
    }, [setUsersToAddToALumniGroup]);

    const colourStyles: StylesConfig<any, true> = {
        menuList: (provided, state) => ({
            ...provided,
            height: '200px',
        }),
    };

    const users = Object.values(usersToAddToALumniGroup)?.map((user: any) => {
        return { value: user.id, label: user.full_name };
    });

    const handleAddMembersToGroup = async () => {
        setIsSaveLoading(true);
        if (selectedUsers.length === 0) {
            setIsSaveLoading(false);
            return;
        }

        const addMemberPromises = selectedUsers.map(({ value: userId }: { value: string }) =>
            groups.map(({ id: groupId }: { id: string }) => axiosInstance.post(`/alumni_groups/${groupId}/members`, { user_id: userId }))
        );

        const responses = await Promise.allSettled(addMemberPromises.flat());

        const failedResponses = responses.filter(({ status }) => status !== 'fulfilled');

        if (failedResponses.length > 0) {
            const errorMessage = failedResponses[0].status === 'rejected' ? extractErrorMessage(failedResponses[0].reason.response.data) : 'An error occurred';
            showMessage(errorMessage || 'An error occurred', 'error');
        }

        setAddMembersToGroupModal(false);
        mutate('/group_members');
        setIsSaveLoading(false);
    };

    return (
        <Transition appear show={AddMembersToGroupModal} as={Fragment}>
            <Dialog as="div" open={AddMembersToGroupModal} onClose={() => setAddMembersToGroupModal(false)} className="relative z-[51]">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8 ">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg  w-full  h-fit max-w-lg text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => setAddMembersToGroupModal(false)}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">{'Add User To An Alumni Group'}</div>
                                <div className="p-5">
                                    Add members to <b>{Array.isArray(groups) && groups?.map((group: any, index) => <p key={index}> {group?.name},</p>)}</b>
                                    <div className="mb-5 mt-5 w-full ">
                                        <label htmlFor="role">Select members to add</label>
                                        <div className="flex flex-row gap-2">
                                            <Select
                                                id="role"
                                                onChange={(selectedValues) => setSelectedUsers(selectedValues as { value: string; label: string }[])}
                                                options={users}
                                                isSearchable={true}
                                                required
                                                styles={colourStyles}
                                                hideSelectedOptions={true}
                                                isMulti
                                                className="w-full"
                                            />

                                            <Tippy content="import user(s) from a csv file">
                                                <button className="btn btn-success min-w-[100px]" onClick={() => setShowModal(true)}>
                                                    Import
                                                </button>
                                            </Tippy>
                                        </div>
                                    </div>
                                    <div>
                                        Can't find the user in the list?{' '}
                                        <Link to="/alumni-group-management/add-user-to-group" className="text-primary-500 hover:text-primary-600">
                                            Add New User
                                        </Link>
                                    </div>
                                    <div className="flex justify-end items-center mt-8">
                                        <button type="button" className="btn btn-outline-danger" onClick={() => setAddMembersToGroupModal(false)}>
                                            Cancel
                                        </button>
                                        <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={handleAddMembersToGroup}>
                                            {!isSaveLoading ? 'Add' : <IconLoader className="animate-[spin_2s_linear_infinite] inline-block align-middle ltr:mr-2 rtl:ml-2 shrink-0" />}
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                    {showModal && <AddUserFromCsvFile showModal={showModal} setShowModal={setShowModal} groups={groups} />}
                </div>
            </Dialog>
        </Transition>
    );
};

export default AddMembersToGroup;
