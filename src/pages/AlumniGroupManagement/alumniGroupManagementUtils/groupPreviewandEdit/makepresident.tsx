import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Select, { StylesConfig } from 'react-select';
import useSwr, { mutate } from 'swr';
import 'tippy.js/dist/tippy.css';
import IconX from '../../../../components/Icon/IconX';
import axiosInstance from '../../../../helper/axiosInstance';
import fetcher from '../../../../helper/fetcher';
import showMessage from '../../../../helper/showMessage';
import ShowRequestError from '../../../../helper/showRequestError';
import { GetAlumniData } from '../../../../store/alumnigroupSlice';

export const dParams = {
    name: '',
    start_date: '',
    end_date: '',
    school: '',
    status: '',
    package_id: '',
    president_user_id: '',
};

interface MakePresidentProps {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    groupId: string;
}

const MakePresident = ({ showModal, setShowModal, groupId }: MakePresidentProps) => {
    const dispatch = useDispatch();
    const [selectedOptions, setSelectedOptions] = useState<any>(null);
    const { data, error, isLoading } = useSwr(`/group_members`, fetcher);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const { data: group, error: groupError } = useSwr(`/alumni_groups/${groupId}`, fetcher);
    const [disabled, setDisabled] = useState<boolean>(false);

    console.log('admins', group?.admins);
    console.log('admins length', group?.admins.length);

    const ADMINS_COUNT = group?.admins.length;
    const MAX_ADMIN_COUNT = 5;

    useEffect(() => {
        if (ADMINS_COUNT >= MAX_ADMIN_COUNT) {
            setDisabled(true);
        }
        if (ADMINS_COUNT + selectedOptions >= MAX_ADMIN_COUNT) {
            setDisabled(true);
        }
    }, [selectedOptions, ADMINS_COUNT]);

    const groupMembers = data
        ?.filter((member: any) => member?.group_id === groupId && member?.status === 'APPROVED')
        .map((member: any) => ({
            value: member,
            label: `${member?.user_info?.full_name}`,
        }));

    const OptionStyles: StylesConfig<any, true> = {
        menuList: (provided, state) => ({
            ...provided,
            height: '150px',
        }),
    };

    const handleSetPresident = async () => {
        if (!selectedOptions) {
            showMessage('Please Select a Package.', 'error');
            return;
        }

        selectedOptions.map(async (selectedOption: any) => {
            console.log(selectedOption);
            const payload = {
                president_user_id: selectedOption.user_id,
                id: selectedOption.id,
                is_president: true,
            };

            try {
                setIsSaveLoading(true);
                const response = await axiosInstance.post(`/alumni_groups/${groupId}/admins/${selectedOption.value.user_id}`);
                console.log('the response', response);
                if (response.status === 200) {
                    mutate(`/alumni_groups/${groupId}`);
                    setShowModal(false);
                    dispatch(GetAlumniData() as any);
                    setIsSaveLoading(true);
                }
            } catch (error: any) {
                ShowRequestError(error);
            } finally {
                setIsSaveLoading(false);
            }
        });
    };

    return (
        <Transition appear show={showModal} as={Fragment}>
            <Dialog
                as="div"
                open={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedOptions([]);
                }}
                className="relative z-[51]"
            >
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-y-scroll w-full max-w-3xl h-80 text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedOptions([]);
                                    }}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                    <h4>Change President</h4>
                                </div>
                                <div className="px-5 flex flex-col">
                                    <div className="mb-5 mt-5">
                                        <label htmlFor="role">Select President</label>
                                        <Select
                                            id="role"
                                            options={groupMembers}
                                            value={selectedOptions}
                                            isSearchable={true}
                                            hideSelectedOptions={true}
                                            styles={OptionStyles}
                                            isMulti
                                            isOptionDisabled={() => disabled}
                                            onChange={(selected: any) => {
                                                // if (group?.admins?.length >= 3) {
                                                //     showMessage('Only 3 admins can be added per group', 'error');
                                                //     return;
                                                // }
                                                setSelectedOptions(selected);
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-end items-center mt-auto">
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() => {
                                                setShowModal(false);
                                                setSelectedOptions([]);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button type="button" className="btn btn-success ltr:ml-4 rtl:mr-4" onClick={handleSetPresident}>
                                            Make President
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default MakePresident;
