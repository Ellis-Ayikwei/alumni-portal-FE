import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import CurrencyInput from 'react-currency-input-field';
import { useDispatch } from 'react-redux';
import IconLoader from '../../../components/Icon/IconLoader';
import IconPlus from '../../../components/Icon/IconPlus';
import IconSave from '../../../components/Icon/IconSave';
import IconTrash from '../../../components/Icon/IconTrash';
import IconX from '../../../components/Icon/IconX';
import axiosInstance from '../../../helper/axiosInstance';
import ConfirmDialog from '../../../helper/confirmDialog';
import showMessage from '../../../helper/showMessage';
import ShowRequestError from '../../../helper/showRequestError';
import { GetInsurancePackages } from '../../../store/insurancePackageSlice';
import { InputChangeEvent, Insurance } from '../../../types';

interface AddInsurancePackageProps {
    viewModal: boolean;
    setViewModal: (value: boolean) => void;
    edit?: boolean;
    setEdit?: (value: boolean) => void;
    addNew?: boolean;
    setAddNew?: (value: boolean) => void;
    data?: Insurance;
}

const AddInsurancePackage = ({ viewModal, setViewModal, edit, setEdit, addNew, setAddNew, data }: AddInsurancePackageProps) => {
    const dispatch = useDispatch();
    const [isSaving, setIsSaving] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);

    const initialInsurance = {
        name: '',
        description: '',
        sum_assured: 0,
        monthly_premium_ghs: 0,
        annual_premium_ghs: 0,
        is_active: false,

        benefits: [],
    };

    const [insurance, setInsurance] = useState<Insurance>(initialInsurance);
    const [benefits, setBenefits] = useState<{ id: string; label: string; value: string | number; name: string }[]>([]);

    const setDefaults = () => {
        if (edit && data) {
            setInsurance(data);
            setBenefits(
                data.benefits
                    ? data.benefits.map((benefit) => ({
                          id: benefit.id,
                          label: benefit.name || '',
                          value: benefit.premium_payable || '',
                          name: benefit.name || '',
                      }))
                    : []
            );
        }
    };

    useEffect(() => {
        if (addNew) {
            setBenefits([
                { id: 'deathMember', label: 'Death (Member):', value: '0', name: 'deathMember' },
                { id: 'deathSpouse', label: 'Death (Spouse):', value: '0', name: 'deathSpouse' },
                { id: 'nominatedLives', label: '2 Nominated Lives (Each):', value: '0', name: 'nominatedLives' },
                { id: 'criticalIllnessMember', label: 'Critical Illness (Member):', value: '0', name: 'criticalIllnessMember' },
                { id: 'permanentDisabilityMember', label: 'Permanent Disability (Member):', value: '0', name: 'permanentDisabilityMember' },
            ]);
        }
    }, [addNew]);

    useEffect(() => {
        if (edit && data) {
            setDefaults();
        } else {
            setInsurance(initialInsurance);
            setBenefits([]);
        }

        return () => {
            setInsurance(initialInsurance);
            setBenefits([]);
        };
    }, [edit]);

    // const handleBenefitChange = (id: string, value: string | undefined) => {
    //     setBenefits({ ...benefits, [id]: value });
    // };

    const handleAddBenefit = () => {
        setBenefits([...benefits, { id: `benefit${benefits.length}`, label: '', value: '', name: `benefit${benefits.length}` }]);
    };

    const handleInputChange = (id: string, value: string | undefined) => {
        if (value && value.trim() !== '') {
            const benefitsObject = benefits.reduce((acc, benefit) => {
                acc[benefit.label] = benefit.value;
                return acc;
            }, {} as { [key: string]: string | number });
            setInsurance({ ...insurance, [id]: value, benefits: benefits.map((benefit) => ({ ...benefit, premium_payable: Number(benefit.value) })) });
        }
        setIsDisabled(false);
    };
    const handleBenefitChange = (index: number, value: string = '') => {
        const updatedBenefits = [...benefits];
        updatedBenefits[index] = { ...updatedBenefits[index], value: value.trim() }; // Trim unnecessary whitespace
        setBenefits(updatedBenefits);

        // const benefitsObject = updatedBenefits.reduce((acc, benefit) => {
        //     if (benefit.label && benefit.value) {
        //         acc[benefit.label] = benefit.value;
        //     }
        //     return acc;
        // }, {} as { [key: string]: string | number });

        setInsurance({ ...insurance, benefits: benefits.map((benefit) => ({ ...benefit, premium_payable: Number(benefit.value) })) });
        setIsDisabled(false);
        console.log('benefits changed:', insurance);
    };

    const handleDeleteBenefit = (index: number) => {
        const updatedBenefits = benefits.filter((_, i) => i !== index);
        setBenefits(updatedBenefits);
        setIsDisabled(false);

        setInsurance({
            ...insurance,
            benefits: updatedBenefits.map((benefit) => ({
                ...benefit,
                premium_payable: Number(benefit.value),
            })),
        });
    };

    const handleDeleteInsurance = async () => {
        console.log('the insure id', insurance);
        try {
            const isDeleConfirmed = await ConfirmDialog({
                title: 'Delete Insurance Package',
                note: 'Are you sure you want to delete this package?',
                finalQuestion: 'Are you sure you want to delete this package?',
            });
            if (isDeleConfirmed) {
                const deleteResponse = await axiosInstance.delete(`/insurance_packages/${insurance.id}`);
                if (deleteResponse.status === 200) {
                    dispatch(GetInsurancePackages() as any);
                    setViewModal(false);
                    showMessage('Deleted!', 'success');
                    reset();
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

    const reset = () => {
        setInsurance(initialInsurance);
        setBenefits([
            { id: 'deathMember', label: 'Death (Member)', value: '0', name: 'deathMember' },
            { id: 'deathSpouse', label: 'Death (Spouse)', value: '0', name: 'deathSpouse' },
            { id: 'nominatedLives', label: '2 Nominated Lives (Each)', value: '0', name: 'nominatedLives' },
            { id: 'criticalIllnessMember', label: 'Critical Illness (Member)', value: '0', name: 'criticalIllnessMember' },
            { id: 'permanentDisabilityMember', label: 'Permanent Disability (Member)', value: '0', name: 'permanentDisabilityMember' },
        ]);
        setEdit && setEdit(false);
        setViewModal(false);
        setIsDisabled(true);
    };

    const [isSaving1, setIsSaving1] = useState(false);
    const handlePackageStatus = async (value: string) => {
        if (value !== 'Activate' && value !== 'Deactivate') {
            showMessage('Invalid value', 'error');
            return;
        }

        setIsSaving1(true);

        try {
            const activityStatus = await axiosInstance.put(`/insurance_packages/${insurance.id}`, {
                is_active: value === 'Activate' ? true : false,
            });

            if (activityStatus.status === 200) {
                setViewModal(false);
                showMessage(`${value}d successfully`, 'success');
                dispatch(GetInsurancePackages() as any);
                reset();
            } else {
                showMessage(`Failed to ${value.toLowerCase()}`, 'error');
                reset();
            }
        } catch (error) {
            ShowRequestError(error);
            reset();
            setIsSaving1(false);
        } finally {
            setIsSaving1(false);
        }
    };

    const handleSaveInsurance = async () => {
        setIsSaving(true);
        const payload = {
            ...insurance,
            benefits: { ...benefits },
        };
        console.log('insurance', payload);

        try {
            const response = edit
                ? await axiosInstance.put(`/insurance_packages/${insurance.id}`, JSON.stringify(insurance))
                : await axiosInstance.post('/insurance_packages', JSON.stringify(insurance));

            if (response.status === 201 || response.status === 200) {
                showMessage(`Insurance package adde`, 'success');
                setViewModal(false);
                dispatch(GetInsurancePackages() as any);
                setIsSaving(false);
                setInsurance(initialInsurance);
                setBenefits([]);
                reset();
            }
        } catch (error) {
            setIsSaving(false);
            ShowRequestError(error);
            reset();
        }
    };

    return (
        <Transition appear show={viewModal} as={Fragment}>
            <Dialog
                as="div"
                open={viewModal}
                onClose={() => {
                    reset();
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
                                    <h1 className="text-2xl font-bold mb-4">{edit ? 'Edit Insurance Package' : 'Add Insurance Package'}</h1>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={reset}>
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
                                                value={insurance.description}
                                                className="font-semibold border border-gray-300 rounded p-1"
                                                placeholder="Enter Package Description"
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
                                                    value={insurance.sum_assured}
                                                    decimalsLimit={2}
                                                    onValueChange={(value) => handleInputChange('sum_assured', value)}
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-xs p-1 font-semibold text-gray-800 mb-3 mt-5 w-full bg-white-light">
                                            <p>Benefits</p>
                                        </div>

                                        <div className="mb-3">
                                            <div className="space-y-3">
                                                {benefits.map((benefit, index) => {
                                                    return (
                                                        <div key={benefit.id} className="flex justify-between items-center mb-2 mt-2">
                                                            <input
                                                                type="text"
                                                                value={benefit.label}
                                                                onChange={(e) => {
                                                                    const updatedBenefits = [...benefits];
                                                                    updatedBenefits[index].label = e.target.value;
                                                                    updatedBenefits[index].name = e.target.value;

                                                                    setBenefits(updatedBenefits);
                                                                    console.log('benefits changed:', updatedBenefits);
                                                                    setIsDisabled(false);

                                                                    setInsurance({ ...insurance, benefits: benefits.map((benefit) => ({ ...benefit, premium_payable: Number(benefit.value) })) });
                                                                }}
                                                                className="form-input w-1/2 mr-2"
                                                                placeholder="Enter benefit name"
                                                            />
                                                            <div className="flex">
                                                                <CurrencyInput
                                                                    id={benefit.id}
                                                                    name={benefit.name}
                                                                    prefix="GH₵ "
                                                                    defaultValue={0}
                                                                    value={benefit.value}
                                                                    decimalsLimit={2}
                                                                    onValueChange={(value) => handleBenefitChange(index, value || '')}
                                                                    placeholder="Enter amount"
                                                                    className="form-input"
                                                                />
                                                                <button type="button" onClick={() => handleDeleteBenefit(index)}>
                                                                    <IconX className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <button type="button" className="btn btn-primary ltr:ml-auto rtl:mr-auto   w-fit" onClick={handleAddBenefit}>
                                                    <IconPlus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
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
                                                    value={insurance.monthly_premium_ghs}
                                                    decimalsLimit={2}
                                                    onValueChange={(value) => handleInputChange('monthly_premium_ghs', value)}
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
                                                    value={insurance.annual_premium_ghs}
                                                    decimalsLimit={2}
                                                    onValueChange={(value) => handleInputChange('annual_premium_ghs', value)}
                                                    placeholder="Enter amount"
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>
                                    </form>

                                    {edit ? (
                                        <div className="mt-8 flex items-center justify-end">
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={() => {
                                                    setViewModal(false);
                                                    setDefaults();
                                                    setIsDisabled(true);
                                                }}
                                            >
                                                <IconX /> Close
                                            </button>
                                            <button type="button" className="btn btn-danger ltr:ml-4 rtl:mr-4" onClick={handleDeleteInsurance}>
                                                <IconTrash />
                                            </button>
                                            {!insurance.is_active ? (
                                                <button type="button" value="Activate" className="btn btn-warning ltr:ml-4 rtl:mr-4" onClick={(e) => handlePackageStatus(e.currentTarget.value)}>
                                                    {!isSaving1 ? 'Activate' : <IconLoader className="animate-spin inline-block" />}
                                                </button>
                                            ) : (
                                                <button type="button" value="Deactivate" className="btn btn-danger  ltr:ml-4 rtl:mr-4" onClick={(e) => handlePackageStatus(e.currentTarget.value)}>
                                                    {!isSaving1 ? 'Deactivate' : <IconLoader className="animate-spin inline-block" />}
                                                </button>
                                            )}
                                            <button type="button" className={`btn btn-success ltr:ml-4 rtl:mr-4 gap-1`} onClick={handleSaveInsurance} disabled={isDisabled}>
                                                <IconSave />
                                                {!isSaving ? 'Save' : <IconLoader className="animate-spin inline-block" />}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-8 flex items-center justify-end">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => reset()}>
                                                Close
                                            </button>
                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={handleSaveInsurance}>
                                                {isSaving ? <IconLoader className="animate-spin inline-block" /> : 'Save'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AddInsurancePackage;
