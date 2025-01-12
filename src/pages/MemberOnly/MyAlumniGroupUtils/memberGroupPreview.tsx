import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useSwr from 'swr';
import IconArrowBackward from '../../../components/Icon/IconArrowBackward';
import IconArrowLeft from '../../../components/Icon/IconArrowLeft';
import IconEdit from '../../../components/Icon/IconEdit';
import fetcher from '../../../helper/fetcher';
import { renderStatus } from '../../../helper/renderStatus';
import { IRootState } from '../../../store';
import { GetContractsData } from '../../../store/contractsSlice';
import { setPageTitle } from '../../../store/themeConfigSlice';
import ShowBeneficiaries from '../../AlumniGroupManagement/alumniGroupManagementUtils/groupPreviewandEdit/showBeneficiaries';

const adminUsers = ['SUPER_ADMIN', 'ADMIN', 'UNDERWRITER', 'PREMIUM_ADMIN', 'SALES'];

const MemberGroupPreview = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { group_id } = useParams();
    // const alumniData = useSelector((state: IRootState) => state.alumnidata.alumniGroups);
    const { data: alumniData, error: alumniDataError } = useSwr(`/alumni_groups/${group_id}`, fetcher);
    const { data: all_members, error: all_members_error, isLoading: all_members_loadng } = useSwr(`/group_members`, fetcher);
    const group_members = all_members?.filter((group_member: any) => group_member.group_id == group_id);
    const [showBeneficiariesModal, setShowBeneficiariesModal] = useState<boolean>(false);
    const [benefactorIds, setBenefactorIds] = useState<{ userId: string; memberId: string }>({ userId: '', memberId: '' });
    const { data: group, error: all_group_error, isLoading: all_group_loadng } = useSwr(`/alumni_groups/${group_id}`, fetcher);
    const userId = useSelector((state: IRootState) => state.auth.user?.id);

    console.log('group data is ', group);

    useEffect(() => {
        dispatch(setPageTitle('Group Preview'));
    });

    useEffect(() => {
        dispatch(GetContractsData as any);
    }, []);

    const handleVewBeneficiaries = (user_id: string, member_id: string) => {
        setBenefactorIds({ userId: user_id, memberId: member_id });
        setShowBeneficiariesModal(true);
    };


    const memberId = group_members?.find((grp_md: any) => grp_md.user_id == userId)?.id;
    const { data: beneficiariesData, error: beneficiariesError, isLoading: beneficiariesLoading } = useSwr(`/users/${userId}/beneficiaries`, fetcher);
    const usrs_bnfs = beneficiariesData?.filter((beneficiary: any) => {
        return beneficiary?.group_member_id == memberId;
    });

    return (
        <div>
            <div className="flex items-center lg:justify-between  flex-wrap gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="btn btn-danger gap-2">
                    <IconArrowBackward />
                    Back
                </button>
                <Link to={`/member/groups/edit/${group?.id}`} className="btn btn-warning gap-2">
                    <IconEdit />
                    Edit
                </Link>
            </div>
            <div className="panel">
                <div className="flex justify-between flex-wrap gap-4 px-4">
                    <div>
                        <div className="text-2xl font-semibold uppercase">{group?.name}</div>
                        <p className="text-white-dark">{group?.id}</p>
                    </div>
                    <div className="shrink-0">
                        <img src="/assets/images/logo.svg" alt="img" className="w-14 ltr:ml-auto rtl:mr-auto" />
                    </div>
                </div>
                <div className="ltr:text-right rtl:text-left px-4">
                    <div className="space-y-1 mt-6 text-white-dark">
                        <div>{group?.school}</div>
                    </div>
                </div>

                <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
                <div className="flex justify-between lg:flex-row flex-col gap-6 flex-wrap">
                    <div className="flex-1">
                        <div className="space-y-1 text-white-dark">
                            <div>President:</div>
                            <div className="text-black dark:text-white font-semibold">{group?.president?.username}</div>
                            <div>{group?.president?.address}</div>
                            <div>{group?.president?.email}</div>
                            <div>{group?.president?.phone}</div>
                        </div>
                    </div>
                    <div className="flex justify-between sm:flex-row flex-col gap-6 lg:w-2/3">
                        <div className="xl:1/3 lg:w-2/5 sm:w-1/2">
                            <div className="flex items-center w-full justify-between mb-2">
                                <div className="text-white-dark">Insurrance Package :</div>
                                <div>{group?.insurance_package?.name}</div>
                            </div>

                            <div className="flex items-center w-full justify-between mb-2">
                                <div className="text-white-dark">Date Created:</div>
                                <div>{dayjs(group?.created_at).format('DD MMM YYYY')}</div>
                            </div>
                            <div className="flex items-center w-full justify-between mb-2">
                                <div className="text-white-dark">All Contracts:</div>
                                <div>{group?.contracts?.length}</div>
                            </div>
                        </div>
                        <div className="xl:1/3 lg:w-2/5 sm:w-1/2">
                            <div className="flex items-center w-full justify-between mb-2">
                                <div className="text-white-dark">Current Contract Name:</div>
                                <div className="whitespace-nowrap">{group?.current_contract?.name}</div>
                            </div>
                            <div className="flex items-center w-full justify-between mb-2">
                                <div className="text-white-dark">Current Contract Id:</div>
                                <div>{group?.current_contract?.id}</div>
                            </div>
                            <div className="flex items-center w-full justify-between mb-2">
                                <div className="text-white-dark">Contract state:</div>
                                <div>{group?.contract?.is_signed === true ? 'Signed' : 'Not Signed'}</div>
                            </div>
                            <div className="flex items-center w-full justify-between mb-2">
                                <div className="text-white-dark">Group Activity</div>
                                <div>{renderStatus(group?.status)}</div>
                            </div>
                        </div>
                    </div>
                </div>
                {group?.president?.id === userId && (
                    <div className="grid xl:grid-cols-1 sm:grid-cols-1 gap-4">
                        <div className="panel h-full w-full">
                            <div className="flex items-center justify-between mb-5">
                                <h5 className="font-semibold text-lg dark:text-white-light">Group Members</h5>
                            </div>
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="ltr:rounded-l-md rtl:rounded-r-md">Member Name</th>
                                            <th>Email</th>
                                            <th>Phone Number</th>
                                            <th>Beneficiaries</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group_members?.map((member: any) => (
                                            <tr key={member?.id} className="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                                <td className="min-w-[150px] text-black dark:text-white">
                                                    <div className="flex items-center">
                                                        <img className="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover" src="/assets/images/profile-6.jpeg" alt="avatar" />
                                                        <span className="whitespace-nowrap">
                                                            {member?.user_info?.first_name} {member?.user_info?.last_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="text-primary">{member?.user_info?.email}</td>
                                                <td>{member?.user_info?.phone}</td>
                                                <td>
                                                    <p className="ltr:ml-auto rtl:mr-auto text-secondary">
                                                        <button
                                                            type="button"
                                                            className="text-primary font-semibold hover:underline group"
                                                            onClick={() => handleVewBeneficiaries(member?.user_id, member?.id)}
                                                        >
                                                            View beneficiaries{' '}
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
                )}

                <div className="p-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">My Beneficiaries</h5>
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th className="ltr:rounded-l-md rtl:rounded-r-md">Name</th>
                                    <th>Email</th>
                                    <th>Phone Number</th>
                                    <th>Relationship</th>
                                    {/* {edit && <th></th>} */}
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
                                        {/* {edit && (
                                                            <td>
                                                                <Tippy content={'Remove Benficiary'}>
                                                                    <button onClick={() => handleRemoveBeneficiary(beneficiary.id)}>
                                                                        <IconTrashLines className="text-red-300  hover:text-red-500 font-bold text-xl" />
                                                                    </button>
                                                                </Tippy>
                                                            </td>
                                                        )} */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {benefactorIds && <ShowBeneficiaries showBeneficiariesModal={showBeneficiariesModal} setShowBeneficiariesModal={setShowBeneficiariesModal} benefactorIds={benefactorIds} edit={false} />}
        </div>
    );
};

export default MemberGroupPreview;
