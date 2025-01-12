import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import CurrencyInput from 'react-currency-input-field';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import IconSave from '../../../components/Icon/IconSave';
import IconTrash from '../../../components/Icon/IconTrash';
import IconX from '../../../components/Icon/IconX';
import axiosInstance from '../../../helper/axiosInstance';
import { GetInsurancePackages } from '../../../store/insurancePackageSlice';
import confirmDeleteInsurance from './confirmDeleteInsurance';
import IconLoader from '../../../components/Icon/IconLoader';
import showMessage from '../../../helper/showMessage';
import { Insurance } from '../../../types/index';


interface EditInsurancePackageProps {
    viewModal: boolean;
    setViewModal: (value: boolean) => void;
    data: Insurance;
}

interface Benefit {
    name: string;
    id: string;
    premium_payable: number;
}

type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

const EditInsurancePackage = ({ viewModal, setViewModal, data }: EditInsurancePackageProps) => {
    const [insurance, setInsurance] = useState<Insurance>(data);
    const [benefits, setBenefits] = useState<Benefit[]>(data.benefits || []);
    const [isDisabled, setIsdisabled] = useState(true);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const dispatch = useDispatch();

    const setDetfault = () => {
        setInsurance(data);
        setBenefits(data.benefits || []);
    };

    useEffect(() => {
        setDetfault();
    }, [data]);

    const handleInputChange = (field: keyof Insurance, value: string | number) => {
        setInsurance((prev) => ({ ...prev, [field]: value }));
        setIsdisabled(false);
    };

    const handleBenefitChange = (name: string, value: string | undefined) => {
        setBenefits((prevBenefits) => prevBenefits.map((benefit) => (benefit.name === name ? { ...benefit, premium_payable: Number(value) } : benefit)));
        setIsdisabled(false);
        console.log(benefits);
    };

    const handleSaveInsurance = async () => {
        try {
            setIsSaveLoading(true);
            const updatedInsurance = { ...insurance, benefits };
            const response = await axiosInstance.put(`/insurance_packages/${insurance.id}`, JSON.stringify(updatedInsurance));
                if (response.status === 200) {
                    dispatch(GetInsurancePackages() as any);
                    setViewModal(false);
                    setIsSaveLoading(false)
                    Swal.fire('package updated', '', 'success');
                }

        } catch (error) {
            console.error('Error saving insurance package:', error);
            
        }
    };

    const handleDeleteInsurance = async () => {
        try {
            const isDeleConfirmed = await confirmDeleteInsurance(dispatch);
            if (isDeleConfirmed) {
                const deleteResponse = await axiosInstance.delete(`/insurance_packages/${insurance.id}`);
                if (deleteResponse.status === 200) {
                    dispatch(GetInsurancePackages() as any);
                    setViewModal(false);
                    Swal.fire('Deleted!', '', 'success');
                }
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
            }
    };

    const handlePackageDeactivation = async (value: string) => {
        const activityStatus = await axiosInstance.put(`/insurance_packages/${insurance.id}`, {
            is_active: value === 'Activate' ? true : value === 'Deactivate' ? false : null,
        });
        if (activityStatus.status === 200) {
            Swal.fire(`${value}d`, '', 'success');
            dispatch(GetInsurancePackages() as any);
            setViewModal(false);
        }
    };

    return (
        <Transition appear show={viewModal} as={Fragment}>
            <Dialog
                as="div"
                open={viewModal}
                onClose={() => {
                    setViewModal(false);
                }}
            >
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0" />
                </Transition.Child>
                <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                    <div className="flex min-h-screen items-center justify-center px-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black bg-[#ecf8ec]">
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <h1 className="text-2xl font-bold mb-4">Edit Insurance Package</h1>
                                    <button
                                        type="button"
                                        className="text-white-dark hover:text-dark"
                                        onClick={() => {
                                            setViewModal(false);
                                        }}
                                    >
                                        <IconX />
                                    </button>
                                </div>
                                <div className="p-5">
                                    {/* Contract Details Section */}

                                    <form>
                                        <div className="flex justify-between items-center mb-2 mt-2">
                                            <label htmlFor="packageName" className="text-gray-600">
                                                Package Name:
                                            </label>
                                            <input
                                                type="text"
                                                id="packageName"
                                                value={insurance.name}
                                                className="font-semibold border border-gray-300 rounded p-1"
                                                placeholder="Enter Package Name"
                                                onChange={(e: InputChangeEvent) => handleInputChange('name', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center mb-2 mt-2">
                                            <label htmlFor="packageDescription" className="text-gray-600">
                                                Description:
                                            </label>
                                            <textarea
                                                id="packageDescription"
                                                className="font-semibold border border-gray-300 rounded p-1"
                                                placeholder="Enter Package Description"
                                                value={insurance.description}
                                                onChange={(e: InputChangeEvent) => handleInputChange('description', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center mb-2 mt-2">
                                            <label htmlFor="sumAssured" className="text-gray-600">
                                                Sum Assured:
                                            </label>
                                            <div className="flex">
                                                <CurrencyInput
                                                    id="sumAssured"
                                                    name="sumAssured"
                                                    prefix="GH₵ "
                                                    defaultValue={0}
                                                    decimalsLimit={2}
                                                    value={insurance.sum_assured}
                                                    onValueChange={(value) => handleInputChange('sum_assured', value ?? '')}
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-xs p-1 font-semibold text-gray-800 mb-3 mt-5 w-full bg-white-light">
                                            <p>Benefits</p>
                                        </div>

                                        {Object.entries(benefits || {}).map(([key, value]) => {
                                            const { name, id, premium_payable } = value as Benefit;
                                            return (
                                                <div key={key} className="flex justify-between items-center mb-2 mt-2">
                                                    <label htmlFor={id} className="text-gray-600">
                                                        {name}
                                                    </label>
                                                    <div className="flex">
                                                        <CurrencyInput
                                                            id={name}
                                                            name={name}
                                                            prefix="GH₵ "
                                                            defaultValue={premium_payable}
                                                            decimalsLimit={2}
                                                            onValueChange={(value) => handleBenefitChange(name, value)}
                                                            placeholder="Enter amount"
                                                            className="form-input"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <div className="text-xs p-1 font-semibold text-gray-800 mb-3 mt-5 w-full bg-white-light">
                                            <p>Payment Terms</p>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 mt-2">
                                            <label htmlFor="monthlyPremium" className="text-gray-600">
                                                Monthly Premium:
                                            </label>
                                            <div className="flex">
                                                <CurrencyInput
                                                    id="monthlyPremium"
                                                    name="monthlyPremium"
                                                    prefix="GH₵ "
                                                    defaultValue={0}
                                                    decimalsLimit={2}
                                                    value={insurance.monthly_premium_ghs}
                                                    onValueChange={(value) => handleInputChange('monthly_premium_ghs', value ?? '')}
                                                    placeholder="Enter amount"
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 mt-2">
                                            <label htmlFor="annualPremium" className="text-gray-600">
                                                Annual Premium:
                                            </label>
                                            <div className="flex">
                                                <CurrencyInput
                                                    id="annualPremium"
                                                    name="annualPremium"
                                                    prefix="GH₵ "
                                                    defaultValue={0}
                                                    decimalsLimit={2}
                                                    value={insurance.annual_premium_ghs}
                                                    onValueChange={(value) => handleInputChange('annual_premium_ghs', value ?? '')}
                                                    placeholder="Enter amount"
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>
                                    </form>

                                    <div className="mt-8 flex items-center justify-end">
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() => {
                                                setViewModal(false);
                                                setDetfault();
                                                setIsdisabled(true);
                                            }}
                                        >
                                            <IconX /> Close
                                        </button>
                                        <button type="button" className="btn btn-danger ltr:ml-4 rtl:mr-4" onClick={handleDeleteInsurance}>
                                            <IconTrash />
                                        </button>
                                        {!insurance.is_active ? (
                                            <button type="button" value="Activate" className="btn btn-warning ltr:ml-4 rtl:mr-4" onClick={(e) => handlePackageDeactivation(e.currentTarget.value)}>
                                                Activate
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                value="Deactivate"
                                                className="btn btn-danger bg-red-700 ltr:ml-4 rtl:mr-4"
                                                onClick={(e) => handlePackageDeactivation(e.currentTarget.value)}
                                            >
                                                Deactivate
                                            </button>
                                        )}
                                        <button type="button" className={`btn btn-success ltr:ml-4 rtl:mr-4 gap-1`} onClick={handleSaveInsurance} disabled={isDisabled}>
                                            <IconSave />
                                            {!isSaveLoading ? 'Save' : <IconLoader className="animate-spin inline-block" />}

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
export default EditInsurancePackage;
