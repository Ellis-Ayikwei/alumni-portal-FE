import { faHeartCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, Transition } from '@headlessui/react';
import Tippy from '@tippyjs/react';
import { Fragment, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import useSwr, { mutate } from 'swr';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '../../../../components/Icon/IconTrashLines';
import IconX from '../../../../components/Icon/IconX';
import axiosInstance from '../../../../helper/axiosInstance';
import confirmDialog from '../../../../helper/confirmDialog';
import fetcher from '../../../../helper/fetcher';
import showMessage from '../../../UserManagement/userManagementUtils/showMessage';
import AddNewBeneficiaries from './addNewBeficiaries';

export const dParams = {
    name: '',
    start_date: '',
    end_date: '',
    school: '',
    status: '',
    package_id: '',
    president_user_id: '',
};

interface showBeneficiariesProps {
    showBeneficiariesModal: boolean;
    setShowBeneficiariesModal: (value: boolean) => void;
    benefactorIds: {
        userId: string;
        memberId: string;
    };
    edit: boolean;
}

const ShowBeneficiaries = ({ showBeneficiariesModal, setShowBeneficiariesModal, benefactorIds, edit }: showBeneficiariesProps) => {
    const { userId, memberId } = benefactorIds;
    const dispatch = useDispatch();

   

    const { data: beneficiariesData, error: beneficiariesError, isLoading: beneficiariesLoading } = useSwr(showBeneficiariesModal ? `/users/${userId}/beneficiaries` : null, fetcher);
    const { data: user, error: usernameError, isLoading: usernameLoading } = useSwr(showBeneficiariesModal ? `/users/${userId}` : null, fetcher);

    const usrs_bnfs = beneficiariesData?.filter((beneficiary: any) => {
        return beneficiary?.group_member_id == memberId;
    });

    useEffect(() => {
        console.log('user bnfs', usrs_bnfs);
        console.log('some bnfs', beneficiariesData);
        console.log('usr', user);
        console.log('username', user?.first_name, user?.last_name);
    }, [beneficiariesData]);

    const [showAddBeneficiaryModal, setShowAddBeneficiaryModal] = useState(false);

    const handleRemoveBeneficiary = async (beneficiaryId: string) => {
        try {
            const confrim = await confirmDialog({ title: 'Remove Beneficiary', note: 'This Cannot be Undone', finalQuestion: 'Do you want to remove beneficiary?' });
            if (confrim) {
                const response = await axiosInstance.delete(`/beneficiaries/${beneficiaryId}`);
                if (response.status === 200) {
                    showMessage(`Beneficiary Added Successfully.`, 'success');
                    mutate(`/users/${userId}/beneficiaries`);
                }
            }
        } catch (error: any) {
            if (error.response?.data) {
                const parser = new DOMParser();
                const errorData = error.response.data;
                const doc = parser.parseFromString(errorData, 'text/html');
                const errorMess = doc.querySelector('body')?.innerText || 'An error occurred';
                const errorMessage = errorMess.split('\n')[1];
                console.error('Error:', errorMessage);
                showMessage(`${errorMessage}`, 'error');
            }
        }
    };

    return (
        <Transition appear show={showBeneficiariesModal} as={Fragment}>
            <Dialog as="div" open={showBeneficiariesModal} onClose={() => setShowBeneficiariesModal(false)} className="relative z-[51]">
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
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-y-scroll w-full max-w-3xl text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => setShowBeneficiariesModal(false)}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                <div className="flex justify-between text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                    <h4>
                                        Nominated Lives for{' '}
                                        <b>
                                            {user?.first_name} {user?.last_name}
                                        </b>
                                    </h4>
                                    {edit && (
                                        <button onClick={() => setShowAddBeneficiaryModal(true)} className="btn btn-info gap-2 bg-teal-500 text-white">
                                            <FontAwesomeIcon icon={faHeartCirclePlus} />
                                            Nominate A Life
                                        </button>
                                    )}
                                </div>
                                <div className="p-5">
                                    <div className="table-responsive">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th className="ltr:rounded-l-md rtl:rounded-r-md">Name</th>
                                                    <th>Email</th>
                                                    <th>Phone Number</th>
                                                    <th>Relationship</th>
                                                    {edit && <th></th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {usrs_bnfs?.map((beneficiary: any) => (
                                                    <tr className="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                                        <td className="min-w-[150px] text-black dark:text-white">
                                                            <div className="flex items-center">
                                                                <span className="whitespace-nowrap">
                                                                    {beneficiary.first_name} {beneficiary.last_name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="text-primary">{beneficiary.email}</td>
                                                        <td>{beneficiary.phone}</td>
                                                        <td>{beneficiary.relationship_type}</td>
                                                        {edit && (
                                                            <td>
                                                                <Tippy content={'Remove Benficiary'}>
                                                                    <button onClick={() => handleRemoveBeneficiary(beneficiary.id)}>
                                                                        <IconTrashLines className="text-red-300  hover:text-red-500 font-bold text-xl" />
                                                                    </button>
                                                                </Tippy>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                    <AddNewBeneficiaries showModal={showAddBeneficiaryModal} setShowModal={setShowAddBeneficiaryModal} benefactorIds={benefactorIds} />
                </div>
            </Dialog>
        </Transition>
    );
};

export default ShowBeneficiaries;
