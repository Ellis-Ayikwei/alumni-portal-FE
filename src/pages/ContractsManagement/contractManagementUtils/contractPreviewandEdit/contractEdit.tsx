import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import useSwr, { mutate } from 'swr';
import IconArrowBackward from '../../../../components/Icon/IconArrowBackward';
import axiosInstance from '../../../../helper/axiosInstance';
import fetcher from '../../../../helper/fetcher';
import showMessage from '../../../../helper/showMessage';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import AddNewGroupMember from '../../../AlumniGroupManagement/alumniGroupManagementUtils/groupPreviewandEdit/AddNewGroupMember';

import { faFileContract } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import Select, { StylesConfig } from 'react-select';
import IconSave from '../../../../components/Icon/IconSave';
import IconX from '../../../../components/Icon/IconX';
import { IRootState } from '../../../../store';
import { GetInsurancePackages } from '../../../../store/insurancePackageSlice';
import AddMembersToGroup from '../../../AlumniGroupManagement/alumniGroupManagementUtils/addMembersToGroup';
import ChangePackage from './changePackage';

import isEqual from 'lodash/isEqual';
import { useMemo, useRef } from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { GetContractsData } from '../../../../store/contractsSlice';

const ContractEdit = () => {
    const dispatch = useDispatch();
    const { contract_id } = useParams();
    // const contractData = useSelector((state: IRootState) => state.alumnidata.alumniGroups);
    const { data: contractData, error: contractData_error, isLoading: contractData_loadng } = useSwr(`/contracts/${contract_id}`, fetcher);
    const usersData = useSelector((state: IRootState) => state.usersdata.usersData);

    const userDataIsLoadingStatus = useSelector((state: IRootState) => state.usersdata.loading);
    const { insurancePackages, loading, error } = useSelector((state: IRootState) => state.insurancePackages) || { insurancePackages: [] };

    const [showBeneficiariesModal, setShowBeneficiariesModal] = useState<boolean>(false);
    const [benefactorIds, setBenefactorIds] = useState<{ userId: string; memberId: string }>({ userId: '', memberId: '' });
    const [contract, setContract] = useState<any>({});

    useEffect(() => {
        dispatch(setPageTitle('Edit Contract'));
    });

    useEffect(() => {
        dispatch(GetInsurancePackages() as any);
    }, [dispatch]);

    const OptionStyles: StylesConfig<any, true> = {
        menuList: (provided, state) => ({
            ...provided,
            height: '150px',
        }),
    };

    const [changeInsurancePackageModal, setChangeInsurancePackageModal] = useState<boolean>(false);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [addMembersToGroupModal, setAddMembersToGroupModal] = useState<boolean>(false);
    const [discard, setDiscard] = useState<boolean>(false);

    const [AddUserModal, setAddUserModal] = useState(false);
    const [AddNewBeneficiaryModal, setAddNewBeneficiaryModal] = useState(false);
    const [deactivateSave, setDeactivateSave] = useState(true);
    const [oldValues, setOldValues] = useState<any>();
    const [refreshData, setRefreshData] = useState(false);
    const auth = useAuthUser<{ id: string }>();
    const userId = auth?.id;

    const navigate = useNavigate();

    const [params, setParams] = useState<{ [key: string]: any }>({});
    useEffect(() => {
        console.log('befor', contract);
        setContract(contractData);
        console.log('after', contract);
        console.log('packages', insurancePackages);
    }, [contractData, refreshData, mutate]);

    useEffect(() => {
        setParams({ ...contractData });
        setOldValues({
            description: contractData?.description,
            name: contractData?.name,
            expiry_date: contractData?.expiry_date,
            is_signed: contractData?.is_signed,
            signed_date: contractData?.signed_date,
            date_effective: contractData?.date_effective,
            status: contractData?.status,
            insurance_package_id: contractData?.insurance_package_id,
            insurance_package: contractData?.insurance_package,
            policy_number: contractData?.policy_number,
        });
    }, [contractData]);

    useEffect(() => {
        console.log('triggered1', params);
        console.log('triggered2', contractData);
    }, [params]);

    const handleSaveAmendments = async () => {
        try {
            const payload = {
                ...params,
                new_values: {
                    description: params?.description,
                    name: params?.name,
                    expiry_date: params?.expiry_date,
                    is_signed: params?.is_signed,
                    signed_date: params?.signed_date,
                    date_effective: params?.date_effective,
                    status: params?.status,
                    insurance_package_id: params?.insurance_package_id,
                    insurance_package: params?.insurance_package,
                    policy_number: params?.policy_number,
                },
                old_values: oldValues,
                name: 'update contract',
                amender_user_id: userId,
            };

            const response = await axiosInstance.post(`/amendments`, JSON.stringify(payload));
            if (response.status === 201) {
                Swal.fire({
                    title: 'Amendment Saved Successfully',
                    html: 'waiting for approval to update contract. <a href="/amendments" className="underline"><u>Go to Amendments</u> </a>',
                    icon: 'success',
                });
                mutate('/alumni_groups');
                dispatch(GetContractsData() as any);
                setDeactivateSave(true);
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
        setDiscard(!discard);
        setParams({ ...contractData });
        setDeactivateSave(false);
    };

    // detecting change in the object
    const prevObjectRef = useRef({ ...contractData });
    const memoizedObject = useMemo(() => {
        if (!isEqual(prevObjectRef.current, params)) {
            prevObjectRef.current = params;
        }
        return prevObjectRef.current;
    }, [params]);

    useEffect(() => {
        if (isEqual(memoizedObject, contractData)) {
            setDeactivateSave(true);
        } else {
            setDeactivateSave(false);
        }
        console.log('Object deeply changed');
        console.log('is the value the same?', isEqual(memoizedObject, contractData));
    }, [memoizedObject]);

    return (
        <div className="flex xl:flex-col flex-col gap-2.5">
            <div className="flex items-center lg:justify-between flex-wrap gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="btn btn-danger gap-2">
                    <IconArrowBackward />
                    Back
                </button>
                <div className="flex !gap-2 ">
                    <button onClick={handleDiscardChanges} className="btn btn-outline-danger gap-2" disabled={deactivateSave}>
                        <IconX />
                        Discard Changes
                    </button>
                    <button onClick={handleSaveAmendments} className="btn btn-primary gap-2 bg-blue-500 text-white" disabled={deactivateSave}>
                        <IconSave />
                        Save Amendments
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="panel bg-white dark:bg-gray-900 rounded-lg shadow-md md:col-span-2">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4 ">
                            <div className="text-2xl font-semibold text-gray-800 dark:text-white w-96">
                                <input
                                    type="text"
                                    value={params?.name || ''}
                                    onChange={(e) => setParams((prev) => ({ ...prev, name: e.target.value }))}
                                    className="bg-transparent border-b-2 border-gray-300 focus:border-primary outline-none w-full text-gray-800 dark:text-white"
                                />
                            </div>
                            <div className="shrink-0">
                                <FontAwesomeIcon icon={faFileContract} className="text-5xl text-green-500" />
                            </div>
                        </div>
                        <hr className="border-gray-300 dark:border-gray-700 my-6" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-700 dark:text-white" htmlFor="underwriter">
                                    Alumni Group
                                </label>
                                <input type="text" value={params?.group?.name || ''} readOnly className="form-input" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-700 dark:text-white" htmlFor="expiry_date">
                                    Expiry Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        id="expiry_date"
                                        value={params?.expiry_date ? dayjs(params?.expiry_date).format('YYYY-MM-DD') : ''}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            setParams((prev) => ({
                                                ...prev,
                                                expiry_date: newValue ? new Date(newValue).toUTCString() : null,
                                            }));
                                        }}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 dark:text-gray-300 focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-700 dark:text-white" htmlFor="date_effective">
                                    Date Effective
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        id="date_effective"
                                        className="form-input"
                                        value={params?.date_effective ? dayjs(params?.date_effective).format('YYYY-MM-DD') : ''}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            setParams((prev) => ({
                                                ...prev,
                                                date_effective: newValue ? new Date(newValue).toUTCString() : null,
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-700 dark:text-white" htmlFor="signed">
                                    Signed
                                </label>
                                <Select
                                    id="signed"
                                    options={[
                                        { value: true, label: 'Yes' },
                                        { value: false, label: 'No' },
                                    ]}
                                    value={{ value: params?.is_signed, label: params?.is_signed ? 'Yes' : 'No' }}
                                    onChange={(selected: any) => setParams((prev) => ({ ...prev, is_signed: selected.value }))}
                                    isSearchable={true}
                                    required
                                    hideSelectedOptions={true}
                                    styles={OptionStyles}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-700 dark:text-white" htmlFor="signed_date">
                                    Signed Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        id="signed_date"
                                        value={params?.signed_date ? dayjs(params?.signed_date).format('YYYY-MM-DD') : ''}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            setParams((prev) => ({
                                                ...prev,
                                                signed_date: newValue ? new Date(newValue).toUTCString() : null,
                                            }));
                                        }}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 dark:text-gray-300 focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-700 dark:text-white" htmlFor="status">
                                    Status
                                </label>
                                <Select
                                    id="status"
                                    options={[
                                        { value: 'ACTIVE', label: 'Active' },
                                        { value: 'INACTIVE', label: 'Inactive' },
                                        { value: 'LOCKED', label: 'Locked' },
                                        { value: 'EXPIRED', label: 'Expired' },
                                        { value: 'TERMINATED', label: 'Terminated' },
                                    ]}
                                    value={{ value: params?.status, label: params?.status }}
                                    onChange={(selected: any) => setParams((prev) => ({ ...prev, status: selected.value }))}
                                    isSearchable={true}
                                    required
                                    hideSelectedOptions={true}
                                    styles={OptionStyles}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-700 dark:text-white" htmlFor="insurance_package">
                                    Insurance Package
                                </label>
                                <Select
                                    id="insurance_package"
                                    options={Object.values(insurancePackages)?.map((insurancePackage: { id: string; name: string }) => ({
                                        value: insurancePackage?.id,
                                        label: insurancePackage?.name,
                                    }))}
                                    value={{ value: params?.insurance_package?.id, label: params?.insurance_package?.name }}
                                    onChange={(selected: any) =>
                                        setParams((prev) => ({ ...prev, insurance_package_id: selected.value, insurance_package: { id: selected.value, name: selected.label } }))
                                    }
                                    isSearchable={true}
                                    required
                                    hideSelectedOptions={true}
                                    styles={OptionStyles}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-700 dark:text-white" htmlFor="description">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={params.description || ''}
                                    onChange={(e) => setParams((prev) => ({ ...prev, description: e.target.value }))}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 dark:text-gray-300 focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-base font-bold text-gray-700 dark:text-white" htmlFor="policy_number">
                                    Policy Number
                                </label>
                                <input
                                    type="text"
                                    id="policy_number"
                                    value={params.policy_number || ''}
                                    onChange={(e) => setParams((prev) => ({ ...prev, policy_number: e.target.value }))}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 dark:text-gray-300 focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AddNewGroupMember AddUserModal={AddUserModal} setAddUserModal={setAddUserModal} />
            <ChangePackage showModal={changeInsurancePackageModal} setShowModal={setChangeInsurancePackageModal} groupId={contract?.id} />
            <AddMembersToGroup AddMembersToGroupModal={addMembersToGroupModal} setAddMembersToGroupModal={setAddMembersToGroupModal} groups={[contract]} />
        </div>
    );
};

export default ContractEdit;
