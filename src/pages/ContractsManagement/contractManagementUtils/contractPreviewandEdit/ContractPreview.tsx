import { faFileContract } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import IconArrowBackward from '../../../../components/Icon/IconArrowBackward';
import IconArrowLeft from '../../../../components/Icon/IconArrowLeft';
import IconChecks from '../../../../components/Icon/IconChecks';
import IconEdit from '../../../../components/Icon/IconEdit';
import IconLock from '../../../../components/Icon/IconLock';
import IconXCircle from '../../../../components/Icon/IconXCircle';
import { renderStatus } from '../../../../helper/renderStatus';
import { IRootState } from '../../../../store';
import { GetContractsData } from '../../../../store/contractsSlice';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import ShowBeneficiaries from '../../../AlumniGroupManagement/alumniGroupManagementUtils/groupPreviewandEdit/showBeneficiaries';
import ChangeLog from '../../../Amendments/AmendmentUtils/changeLogModal';
import handleMultiContractActivation from '../multiContractActivation';
import RenewContract from './renewContract';

export const THREE_MONTHS_IN_MS = 1000 * 60 * 60 * 24 * 90;

const ContractPreview = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState<boolean>(false);

    const { contract_id } = useParams();
    const { allContracts, error, loading } = useSelector((state: IRootState) => state.allContacts);

    const [showBeneficiariesModal, setShowBeneficiariesModal] = useState<boolean>(false);
    const [benefactorIds, setBenefactorIds] = useState<{ userId: string; memberId: string }>({ userId: '', memberId: '' });
    const contract = Object.values(allContracts).find((contract: any) => contract?.id == contract_id);
    const [changeLog, setChangeLog] = useState<{ newValues: any; oldValues: any }>({ newValues: null, oldValues: null });
    const [showAmendmentModal, setShowAmendmentModal] = useState<boolean>(false);

    useEffect(() => {
        dispatch(setPageTitle('Group Preview'));
    });

    const handleVewBeneficiaries = (user_id: string, member_id: string) => {
        setBenefactorIds({ userId: user_id, memberId: member_id });
        setShowBeneficiariesModal(true);
    };

    useEffect(() => {
        console.log('all contracts', allContracts);
        dispatch(GetContractsData() as any);
    }, [dispatch]);

    const currentDate = new Date(); // Descriptive of the current date
    const contractExpiryDate = new Date(contract?.expiry_date); // Indicates it's related to the contract
    const hasContractExpired = contract?.status === 'EXPIRED' || contract?.status === 'TERMINATED' || contractExpiryDate.getTime() <= currentDate.getTime(); // Clearer condition name
    const isExpiryDateCloseOrExpired = contractExpiryDate.getTime() <= currentDate.getTime() + THREE_MONTHS_IN_MS; // Descriptive condition

    // Log the values for debugging
    console.log('isexpiry close', isExpiryDateCloseOrExpired);
    console.log('is eexpired', hasContractExpired);

    return (
        <div>
            <div className="flex items-center lg:justify-between  flex-wrap gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="btn btn-danger gap-2">
                    <IconArrowBackward />
                    Back
                </button>
                <div className="flex items-center gap-2">
                    {contract?.status === 'ACTIVE' && (
                        <button onClick={() => handleMultiContractActivation([{ id: contract?.id }], dispatch, 'LOCKED')} className="btn btn-outline-warning gap-2">
                            <IconLock />
                            Lock{' '}
                        </button>
                    )}
                    {/* {contract?.status === 'INACTIVE' && (
                        <button onClick={() => handleMultiContractActivation([{ id: contract?.id }], dispatch)} className="btn btn-outline-warning gap-2">
                            <FontAwesomeIcon icon={faUnlockAlt} />
                            Make Active{' '}
                        </button>
                    )} */}
                    {contract?.status === 'LOCKED' && (
                        <button disabled className="btn btn-outline-secondary gap-2">
                            <IconLock />
                            Locked{' '}
                        </button>
                    )}
                    {(contract?.status === 'EXPIRED' || contract?.status === 'TERMINATED') && (
                        <button disabled className="btn btn-outline-secondary gap-2">
                            <IconLock />
                            {contract?.status}{' '}
                        </button>
                    )}
                    <button
                        disabled={contract?.status === 'ACTIVE'}
                        onClick={() => handleMultiContractActivation([{ id: contract?.id }], dispatch, 'ACTIVE')}
                        className="btn btn-outline-warning gap-2"
                    >
                        <IconChecks className="w-5 h-5" />
                        Make Active{' '}
                    </button>
                    <button
                        disabled={contract?.status === 'INACTIVE'}
                        onClick={() => handleMultiContractActivation([{ id: contract?.id }], dispatch, 'INACTIVE')}
                        className="btn btn-outline-danger gap-2"
                    >
                        <IconXCircle />
                        Deactivate{' '}
                    </button>
                    {/* <button onClick={() => handleMultiContractActivation([{ id: contract?.id }], dispatch)} className="btn btn-outline-danger gap-2">
                        <IconX className="w-5 h-5" />
                        Terminate{' '}
                    </button> */}

                    <Link to={`/contracts/edit/${contract?.id}`} className="btn btn-success gap-2">
                        <IconEdit />
                        Amend
                    </Link>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <div className="panel lg:col-span-2">
                    <div className="flex justify-between flex-wrap gap-4 px-4">
                        <div className="flex items-center gap-4">
                            <FontAwesomeIcon icon={faFileContract} className="text-5xl ltr:ml-auto rtl:mr-auto text-green-300" />
                            <div>
                                <div className="text-2xl font-semibold uppercase items-center flex">
                                    {contract?.name}{' '}
                                    <span className={`badge ${contract?.renewal_count > 0 ? 'badge-outline-success' : 'badge-outline-primary'} rounded-full ml-2`}>
                                        {contract?.renewal_count > 0 ? 'Renewed Contract' : 'New Contract'}
                                    </span>{' '}
                                </div>
                                <div className="text-sm font-semibold uppercase text-white-dark">id: {contract?.id}</div>
                                <div className="text-sm font-semibold uppercase text-white-dark">Contract version: {contract?.version}</div>
                            </div>
                        </div>
                        <div className="shrink-0 justify-center items-center flex flex-col ">
                            {isExpiryDateCloseOrExpired && (
                                <button onClick={() => setShowModal(true)} className="btn btn-outline-danger gap-2 text-lg">
                                    Renew{' '}
                                </button>
                            )}
                            <div className="italic text-sm mt-2">
                                {contract?.expiry_date ? (
                                    isExpiryDateCloseOrExpired ? (
                                        <span className="font-semibold text-red-500">{hasContractExpired ? 'expired' : 'expires'}</span>
                                    ) : (
                                        <span className="font-semibold text-green-300">expires</span>
                                    )
                                ) : (
                                    'No expiry date set'
                                )}{' '}
                                on {contract?.expiry_date && <span className="font-semibold">{dayjs(contract?.expiry_date).format('DD MMM YYYY')}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="ltr:text-right rtl:text-left px-4">
                        <div className="space-y-1 mt-6 text-white-dark">
                            <div>{contract?.school}</div>
                        </div>
                    </div>
                    <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <span className="block text-base font-bold dark:text-white">Name</span>
                            <span className="block text-base dark:text-gray-300">{contract?.name}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-base font-bold dark:text-white">Group</span>
                            <Link to={`/groups/preview/${contract?.group?.id}`} className="block text-base dark:text-gray-300 underline underline-offset-2">
                                {contract?.group?.name}
                            </Link>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-base font-bold dark:text-white">Expiry Date</span>
                            <span className="block text-base dark:text-gray-300">{dayjs(contract?.expiry_date).format('DD MMM YYYY')}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-base font-bold dark:text-white">Date Effective</span>
                            <span className="block text-base dark:text-gray-300">{contract?.date_effective ? dayjs(contract?.date_effective).format('DD MMM YYYY') : 'N/A'}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-base font-bold dark:text-white">Signed</span>
                            <span className="block text-base dark:text-gray-300">{contract?.is_signed ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-base font-bold dark:text-white">Signed Date</span>
                            <span className="block text-base dark:text-gray-300">{contract?.signed_date ? dayjs(contract?.signed_date).format('DD MMM YYYY') : 'N/A'}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-base font-bold dark:text-white">Status</span>
                            <span className="block text-base dark:text-gray-300 w-fit">{renderStatus(contract?.status)}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-base font-bold dark:text-white">Underwriter ID</span>
                            <span className="block text-base dark:text-gray-300">{contract?.underwriter?.full_name}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-base font-bold dark:text-white">Insurance Package ID</span>
                            <span className="block text-base dark:text-gray-300">{contract?.insurance_package?.name}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-base font-bold dark:text-white">Description</span>
                            <span className="block text-base dark:text-gray-300">{contract?.description}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-base font-bold dark:text-white">Policy Number</span>
                            <span className="block text-base dark:text-gray-300">{contract?.policy_number}</span>
                        </div>
                    </div>

                    <hr className="border-white-light dark:border-[#1b2e4b] my-6" />

                    <div className="grid xl:grid-cols-1 sm:grid-cols-1 gap-4">
                        <div className="panel h-full w-full">
                            <div className="flex items-center justify-between mb-5">
                                <h5 className="font-semibold text-lg dark:text-white-light">Contract Members</h5>
                            </div>
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="ltr:rounded-l-md rtl:rounded-r-md">Member Name</th>
                                            <th>Email</th>
                                            <th>Phone Number</th>
                                            <th>Policy Number</th>
                                            <th>Nominated Lives</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contract?.contract_members?.map((member: any) => (
                                            <tr key={member?.id} className="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                                <td className="min-w-[150px] text-black dark:text-white">
                                                    <div className="flex items-center">
                                                        <img className="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover" src="/assets/images/profile-6.jpeg" alt="avatar" />
                                                        <span className="whitespace-nowrap">
                                                            {member?.user?.first_name} {member?.user?.last_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="text-primary">{member?.user?.email}</td>
                                                <td>{member?.user?.phone}</td>
                                                <td>{member.policy_number}</td>
                                                <td>
                                                    <p className="ltr:ml-auto rtl:mr-auto text-secondary">
                                                        <button
                                                            type="button"
                                                            className="text-primary font-semibold hover:underline group"
                                                            onClick={() => handleVewBeneficiaries(member.user_id, member?.id)}
                                                        >
                                                            Nominated Lives{' '}
                                                            <IconArrowLeft className="ltr:ml-1 rtl:mr-1 inline-block relative transition-all duration-300 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 rtl:rotate-180" />
                                                        </button>
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="panel h-full lg:col-span-1 w-full">
                    <div className="flex items-center justify-between dark:text-white-light mb-5">
                        <h5 className="font-semibold text-lg">Amendments</h5>
                    </div>
                    <div className="flex flex-col gap-2">
                        {contract?.amendments?.map((amendment: any) => {
                            let sts = amendment?.status;
                            return (
                                <div key={amendment?.id} className={`space-y-6 panel bg-${sts === 'APPROVED' ? 'green-50' : sts === 'PENDING' ? 'yellow-50' : 'red-50'} w-full`}>
                                    <div className="flex md:flex-col md:gap-5 md:items-cnter md:justify-center lg:flex-row">
                                        <span className="shrink-0 grid md:hidden place-content-center text-base w-9 h-9 rounded-md bg-success-light dark:bg-success text-success dark:text-success-light">
                                            <IconEdit />
                                        </span>
                                        <div className="px-3 flex-1">
                                            <div>{amendment?.name}</div>
                                            <div className="text-xs text-white-dark dark:text-gray-500">{dayjs(amendment.change_date).format('ddd, DD MMM YYYY')}</div>
                                            <div className="text-xs text-white-dark dark:text-gray-500">{amendment?.amended_by?.full_name}</div>
                                        </div>
                                        <div className="text-base px-1 ltr:ml-auto rtl:mr-auto whitespace-pre flex flex-col">
                                            <span>{renderStatus(sts)}</span>
                                            {sts !== 'PENDING' && <span className="text-xs text-white-dark italic">by {amendment?.approved_by?.username}</span>}{' '}
                                            <button
                                                onClick={() => {
                                                    setChangeLog({ newValues: amendment?.new_values, oldValues: amendment?.old_values });
                                                    setShowAmendmentModal(true);
                                                }}
                                                className="text-xs text-red-300 dark:text-gray-500 mt-auto ml-auto hover:underline"
                                            >
                                                view more
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {benefactorIds && <ShowBeneficiaries showBeneficiariesModal={showBeneficiariesModal} setShowBeneficiariesModal={setShowBeneficiariesModal} benefactorIds={benefactorIds} edit={false} />}
            {showAmendmentModal && <ChangeLog showModal={showAmendmentModal} setShowModal={setShowAmendmentModal} changeLog={changeLog} />}
            <RenewContract showModal={showModal} setShowModal={setShowModal} contractId={contract_id || ''} />
        </div>
    );
};

export default ContractPreview;
