import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useSwr from 'swr';
import fetcher from '../../../helper/fetcher';
import { IRootState } from '../../../store';
import { setPageTitle } from '../../../store/themeConfigSlice';

import sortBy from 'lodash/sortBy';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import 'react-perfect-scrollbar/dist/css/styles.css';
import IconArrowForward from '../../../components/Icon/IconArrowForward';
import IconHome from '../../../components/Icon/IconHome';
import IconLoader from '../../../components/Icon/IconLoader';
import IconMenuUsers from '../../../components/Icon/Menu/IconMenuUsers';
import axiosInstance from '../../../helper/axiosInstance';
import Ghc from '../../../helper/CurrencyFormatter';
import showMessage from '../../../helper/showMessage';

const adminUsers = ['SUPER_ADMIN', 'ADMIN', 'UNDERWRITER', 'PREMIUM_ADMIN', 'SALES'];

const JoinGroup = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useIsAuthenticated();
    const auth = useAuthUser<any>();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');
    const inviteId = queryParams.get('inv_id');

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const { group_id } = useParams();
    // const alumniData = useSelector((state: IRootState) => state.alumnidata.alumniGroups);
    const { data: alumniData, error: alumniDataError } = useSwr(`/alumni_groups/${group_id}`, fetcher);
    const { data: all_members, error: all_members_error, isLoading: all_members_loadng } = useSwr(`/group_members`, fetcher);
    const group_members = all_members?.filter((group_member: any) => group_member.group_id == group_id);
    const [showBeneficiariesModal, setShowBeneficiariesModal] = useState<boolean>(false);
    const [benefactorIds, setBenefactorIds] = useState<{ userId: string; memberId: string }>({ userId: '', memberId: '' });
    const { data: group, error: all_group_error, isLoading: all_group_loadng } = useSwr(`/alumni_groups/${group_id}`, fetcher);
    const { data: InPackage, error: InPackage_error, isLoading: inPackage_loadng } = useSwr(`/insurance_packages/${group?.package_id}`, fetcher);
    const userId = auth?.id;
    const [joinLoading, setJoinLoading] = useState<boolean>(false);

    console.log('group data is ', group);
    console.log('the package', InPackage);

    useEffect(() => {
        dispatch(setPageTitle('Group Preview'));
        checkIfUserIsAlreadyAmember();
    });

    const checkIfUserIsAlreadyAmember = () => {
        const isMember = group_members?.find((grp_md: any) => grp_md.user_id == userId);
        if (isMember) {
            showMessage('You are already a member of this group', 'error');
            navigate(`/member/dashboard`);
        }
    };
    const handleJoinGroup = async () => {
        try {
            if (!isAuthenticated) {
                navigate('/login', { state: { from: location } });
                return;
            }
            setJoinLoading(true);
            const payload = JSON.stringify({
                user_id: userId,
                invite_code: code,
                invite_id: inviteId,
                action: 'join',
            });

            const response = await axiosInstance.post(`/alumni_groups/${group_id}/members`, payload);
            console.log('the response', response);
            if (response.status === 201 || response.status === 409) {
                showMessage('Group Joined Successfully', 'success');
                setJoinLoading(false);
                navigate(`/member/dashboard`);
            }
        } catch (error: any) {
            if (error?.response && error?.response.data) {
                const parser = new DOMParser();
                const errorData = error.response.data;
                // navigate('/member/dashboard');
                const doc = parser.parseFromString(errorData, 'text/html');
                const errorMess = doc.querySelector('body')?.innerText || 'An error occurred';
                const errorMessage = errorMess.split('\n')[1];
                console.error('Error:', error);
                setJoinLoading(false);
                showMessage(`${errorMessage}`, 'error');
            }
        }
    };

    return (
        <div className=" px-4 sm:px-6 lg:px-8 justify-center items-center h-screen">
            <div className="pt-5 flex  flex-col items-center justify-center mt-auto mb-auto h-full">
                {/*  Previous Statement  */}
                <h2 className="text-3xl leading-9 font-bold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-4xl md:leading-none mb-5">{group?.name}</h2>
                <div className="mt-8 md:mt-0 md:ml-4 w-[70%]">
                    <div className="flex gap-2 grid grid-cols-1 md:grid-cols-2">
                        <div className="panel overflow-hidden rounded-lg shadow-lg w-full justify-between">
                            <div className="items-center justify-between">
                                <div>
                                    <div className="flex w-full justify-between">
                                        <div className="text-2xl font-bold">{group?.name}</div>
                                    </div>
                                    <div className="text-white-dark flex">{group?.description}</div>
                                    <div className="text-grey-400 flex items-center gap-2 mt-5">
                                        <b>Starts:</b> {dayjs(group?.start_date).format('ddd, DD MMM, YYYY')}
                                    </div>
                                    <div className="text-grey-400 flex items-center gap-2">
                                        <IconArrowForward className="text-danger opacity-40 w-6 h-6" /> <b>Ends:</b> {dayjs(group?.end_date).format('ddd, DD MMM, YYYY')}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-200 h-1 rounded-full m-4"></div>
                            <div className="relative">
                                <div>
                                    <div className="text-sm text-gray-600 flex items-center gap-1 w-full">
                                        President : <b>{group?.president?.full_name}</b>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-white-dark mt-4">
                                    <div className="flex items-center">
                                        <IconMenuUsers className="" />
                                        <div className="font-semibold text-sm ml-2">{group?.members?.length}</div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="font-semibold text-sm ml-2">Active</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="items-center justify-center w-full ">
                            <div className=" w-full bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] rounded-xl rounded border border-white-light dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
                                <div className="py-7 px-6">
                                    <div className="flex">
                                        <p className="text-black text-xl mb-1.5 font-bold">{InPackage?.name}</p>
                                    </div>
                                    <h5 className="text-white-dark text-sm font-bold mb-4">{InPackage?.description}</h5>
                                    <p className="text-white-dark">Benefits</p>
                                    <div className="gap-2">
                                        {sortBy(InPackage?.benefits, ['name']).map(({ id, name, premium_payable }: { id: string; name: string; premium_payable: string }) => (
                                            <div className="flex justify-between" key={id}>
                                                <span className="text-gray-600">{name}:</span>
                                                <span className="font-semibold">{Ghc(premium_payable)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-white-dark">Payments terms</p>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Monthly Premium GH:</span>
                                            <span className="font-semibold">{Ghc(InPackage?.monthly_premium_ghs)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Annual Premium:</span>
                                            <span className="font-semibold">{Ghc(InPackage?.annual_premium_ghs)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 before:w-[250px] before:h-[1px] before:bg-white-light before:inset-x-0 before:top-0 before:absolute before:mx-auto dark:before:bg-[#1b2e4b]">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-lg">Sum Assured:</span>
                                            <span className="font-bold text-xl">{Ghc(InPackage?.sum_assured)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => navigate('/')} className="btn btn-outline-success mt-5 text-xl font-bold rounded-full gap-2" disabled={joinLoading}>
                            <IconHome duotone fill />
                        </button>
                        <button onClick={handleJoinGroup} className="btn btn-success mt-5 w-full text-xl font-bold gap-2 rounded-full" disabled={joinLoading}>
                            {!joinLoading ? (
                                <>
                                    <IconMenuUsers /> Join Now
                                </>
                            ) : (
                                <IconLoader className="animate-spin inline-block" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinGroup;
