import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useDispatch } from 'react-redux';
import Select, { StylesConfig } from 'react-select';
import useSwr, { mutate } from 'swr';
import 'tippy.js/dist/tippy.css';
import IconLoader from '../../../../components/Icon/IconLoader';
import IconX from '../../../../components/Icon/IconX';
import axiosInstance from '../../../../helper/axiosInstance';
import fetcher from '../../../../helper/fetcher';
import showMessage from '../../../../helper/showMessage';
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

interface ChangePacakegeProps {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    groupId: string;
}

const ChangePackage = ({ showModal, setShowModal, groupId }: ChangePacakegeProps) => {
    const dispatch = useDispatch();
    const [selectedOption, setSelectedOption] = useState(null);
    const { data: ins_packages, error: ins_error, isLoading: ins_loadng } = useSwr('/insurance_packages', fetcher);
    const [isSaveLoading, setIsSaveLoading] = useState(false);

    const insurance_packages = ins_packages?.map((pkg: any) => {
        return { value: pkg?.id, label: pkg?.name };
    });

    const OptionStyles: StylesConfig<any, true> = {
        menuList: (provided, state) => ({
            ...provided,
            height: '150px',
        }),
    };

    const handleSetPackage = async () => {
        if (!selectedOption) {
            showMessage('Please Select a Package.', 'error');
            return;
        }
        const payload = {
            package_id: selectedOption,
        };

        try {
            setIsSaveLoading(true);
            const response = await axiosInstance.put(`/alumni_groups/${groupId}`, payload);
            console.log('the response', response);
            if (response.status === 200) {
                mutate(`/alumni_groups/${groupId}`);
                setShowModal(false);
                dispatch(GetAlumniData() as any);
                setIsSaveLoading(true);
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
    }

    return (
        <Transition appear show={showModal} as={Fragment}>
            <Dialog as="div" open={showModal} onClose={() => setShowModal(false)} className="relative z-[51]">
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
                                    onClick={() => setShowModal(false)}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                    <h4>Change Insurance Package</h4>
                                </div>
                                <div className="px-5 flex flex-col">
                                    <div className="mb-5 mt-5">
                                        <label htmlFor="role">Select Package</label>
                                        <Select
                                            id="role"
                                            options={insurance_packages}
                                            isSearchable={true}
                                            required
                                            hideSelectedOptions={true}
                                            styles={OptionStyles}
                                            onChange={(selected: any) => setSelectedOption(selected.value)}
                                        />
                                    </div>
                                    <div className="flex justify-end items-center mt-auto">
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() => {
                                                setShowModal(false);
                                                setSelectedOption(null);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button type="button" className="btn btn-success ltr:ml-4 rtl:mr-4" onClick={handleSetPackage}>
                                            { !isSaveLoading ? 'Save' : <IconLoader className="animate-[spin_2s_linear_infinite] inline-block align-middle ltr:mr-2 rtl:ml-2 shrink-0" />}
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

export default ChangePackage;
