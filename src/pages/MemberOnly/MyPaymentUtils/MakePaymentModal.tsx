import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import Select from 'react-select';
import useSwr from 'swr';
import IconCashBanknotes from '../../../components/Icon/IconCashBanknotes';
import IconX from '../../../components/Icon/IconX';
import Ghc from '../../../helper/CurrencyFormatter';
import fetcher from '../../../helper/fetcher';

interface MakePaymentModalProps {
    isPaymentModalOpened: boolean;
    setIsPaymentModalOpened: (isOpen: boolean) => void;
    paymentData: any;
}
const pars = {
    seleced: '',
};

const MakePaymentModal: React.FC<MakePaymentModalProps> = ({ isPaymentModalOpened, setIsPaymentModalOpened, paymentData }) => {
    const auth = useAuthUser<any>();
    const userId = auth?.id;

    const PaymentTypes = [
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'cash', label: 'Cash' },
        { value: 'cheque', label: 'Cheque' },
        { value: 'Mobile Money', label: 'Mobile Money' },
    ];

    const { data: userGroups, error: userGroupsError } = useSwr(`/alumni_groups/my_groups/${userId}`, fetcher);
    useEffect(() => {
        if (userGroups) {
            console.log('userGroupsError', userGroups);
        }
    });

    const [selectedGroupOption, setSelectedGroupOption] = useState<any>();
    const [selectedPmOption, setSelectedPmOption] = useState<any>();

    const selectedGroup = userGroups?.find((group: any) => group?.id === selectedGroupOption?.value);

    useEffect(() => {
        if (selectedGroup) {
            console.log('selectedGroup', selectedGroup);
        }
    }, [selectedGroup]);


    const reset = () => {
        setIsPaymentModalOpened(false);
        setSelectedGroupOption('');
        selectedGroupOption && setSelectedGroupOption('');
    };

    return (
        <Transition appear show={isPaymentModalOpened} as={Fragment}>
            <Dialog as="div" open={isPaymentModalOpened} onClose={() => reset()}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0" />
                </Transition.Child>
                <div id="login_modal" className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                    <div className="flex min-h-screen items-start justify-center px-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel my-8 w-full max-w-md  h-full rounded-lg border-0 py-1 px-4 text-black dark:text-white-dark">
                                <div className="flex items-center justify-between p-5 text-lg font-semibold dark:text-white">
                                    <h5>Pay Now</h5>
                                    <button type="button" onClick={() => reset()} className="text-white-dark hover:text-dark">
                                        <IconX className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-5 p-5 h-full">
                                    <div className="mt-5">
                                        <label htmlFor="Group" className="block text-sm font-semibold mb-2">
                                            Group
                                        </label>
                                        <Select
                                            id="group"
                                            options={userGroups?.map((group: any) => ({ value: group.id, label: group.name }))}
                                            isSearchable={false}
                                            required
                                            className="w-full"
                                            onChange={(option) => setSelectedGroupOption(option)}
                                            isMulti={false}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <h6 className="text-sm font-semibold">Payment By:</h6>
                                        <p className="text-sm">{auth?.full_name}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <h6 className="text-sm font-semibold">Amount:</h6>
                                        <p className="text-sm">{selectedGroupOption && Ghc(selectedGroup?.current_contract?.total_amount)}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <h6 className="text-sm font-semibold">Description:</h6>
                                        <p className="text-sm">{paymentData?.description}</p>
                                    </div>
                                    <div className="mt-5">
                                        <label htmlFor="Payment Type" className="block text-sm font-semibold mb-2">
                                            Payment Type
                                        </label>
                                        <Select id="role" options={PaymentTypes} isSearchable={false} required className="w-full" onChange={(option) => setSelectedPmOption(option)} isMulti={false} />
                                    </div>
                                </div>
                                <div className="mb-5 flex items-center justify-center gap-3">
                                    {selectedGroupOption && selectedPmOption && (
                                        <button type="button" className="btn btn-outline-success flex gap-1">
                                            <IconCashBanknotes className="w-5 h-5 shrink-0" />

                                            <span>
                                                Pay {selectedPmOption ? <b>{selectedPmOption && Ghc(selectedGroup?.current_contract?.total_amount)}</b> : null} with{' '}
                                                {selectedPmOption?.label}
                                            </span>
                                        </button>
                                    )}
                                    <button type="button" className="btn btn-outline-danger flex gap-1">
                                        <IconX className="w-5 h-5 shrink-0" />
                                        <button onClick={() => reset()}>Cancel</button>
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default MakePaymentModal;
