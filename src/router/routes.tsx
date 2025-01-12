import { lazy, useEffect, useState } from 'react';
import AlumniGroupManagementpage from '../pages/AlumniGroupManagement/AlumniGroupManagemnetPage';
import GroupEdit from '../pages/AlumniGroupManagement/alumniGroupManagementUtils/groupPreviewandEdit/GroupEdit';
import GroupPreview from '../pages/AlumniGroupManagement/alumniGroupManagementUtils/groupPreviewandEdit/GroupPreview';
import Amendments from '../pages/Amendments/Amendments';
import ResetPassword from '../pages/Authentication/ResetPasssword';
import ContractManagementpage from '../pages/ContractsManagement/Contractsmanagementpage';
import ContractPreview from '../pages/ContractsManagement/contractManagementUtils/contractPreviewandEdit/ContractPreview';
import ContractEdit from '../pages/ContractsManagement/contractManagementUtils/contractPreviewandEdit/contractEdit';
import AdminDashboard from '../pages/Dasboard/AdminDashboard';
import InsurancePacakes from '../pages/InsurancePackageManagement/InsurancePackageManagement';
import AccountSetting from '../pages/MemberOnly/AccountSetting';
import MemberDashboard from '../pages/MemberOnly/MemberDashboard';
import JoinGroup from '../pages/MemberOnly/MyAlumniGroupUtils/joinGroup';
import MemberGroupEdit from '../pages/MemberOnly/MyAlumniGroupUtils/memberGroupEdit';
import MemberGroupPreview from '../pages/MemberOnly/MyAlumniGroupUtils/memberGroupPreview';
import MyGroups from '../pages/MemberOnly/MyAlumniGroups';
import MyContracts from '../pages/MemberOnly/MyContracts';
import MyPayments from '../pages/MemberOnly/MyPayments';
import Profile from '../pages/UserManagement/Profile';
import UserManagement from '../pages/UserManagement/UserManagement';
import { RowContextMenuExample } from '../pages/UserManagement/UserManagement copy';
import Invoices from '../pages/invoices/Invoices';
import PaymentsMangement from '../pages/payments/Payments';
const Index = lazy(() => import('../pages/Index'));

const LoginBoxed = lazy(() => import('../pages/Authentication/LoginBoxed'));
const RegisterBoxed = lazy(() => import('../pages/Authentication/RegisterBoxed'));
const RecoverIdBoxed = lazy(() => import('../pages/Authentication/RecoverIdBox'));
const userRole = localStorage.getItem('userRole') || '';
const adminUsers = ['SUPER_ADMIN', 'ADMIN', 'UNDERWRITER', 'PREMIUM_ADMIN', 'SALES'];
const personalUsers = ['MEMBER', 'REGULAR'];

const ConditionalDashboard = () => {
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const storedUserRole = localStorage.getItem('userRole');
        setUserRole(storedUserRole || '');
    }, []);

    if (!userRole) {
        return <div>Loading...</div>;
    }

    if (adminUsers.includes(userRole)) {
        return <AdminDashboard />;
    }

    if (personalUsers.includes(userRole)) {
        return <MemberDashboard />;
    }

    return <div>Unauthorized Access</div>;
};

const routes = [
    // dashboard
    { path: '/', element: <ConditionalDashboard />, layout: 'default' },

    //Authentication

    {
        path: '/login',
        element: <LoginBoxed />,
        layout: 'blank',
    },
    {
        path: '/register',
        element: <RegisterBoxed />,
        layout: 'blank',
    },
    {
        path: '/users',
        element: <UserManagement />,
    },
    {
        path: '/userAccountSetting/:id',
        element: <AccountSetting />,
    },
    {
        path: '/profile',
        element: <Profile />,
    },
    {
        path: '/contracts',
        element: <ContractManagementpage />,
    },
    {
        path: '/amendments',
        element: <Amendments />,
    },
    {
        path: '/payments',
        element: <PaymentsMangement />,
    },
    {
        path: '/invoices',
        element: <Invoices />,
    },
    {
        path: '/contracts/preview/:contract_id',
        element: <ContractPreview />,
    },
    {
        path: '/contracts/edit/:contract_id',
        element: <ContractEdit />,
    },
    {
        path: '/insurancepackages',
        element: <InsurancePacakes />,
    },
    {
        path: '/alumnigroups/:id',
        element: <AlumniGroupManagementpage />,
    },
    {
        path: '/alumnigroups',
        element: <AlumniGroupManagementpage />,
    },
    {
        path: '/admindashboard',
        element: <AdminDashboard />,
    },
    {
        path: '/member/dashboard',
        element: <MemberDashboard />,
    },
    {
        path: '/member/groups',
        element: <MyGroups />,
    },
    {
        path: '/groups/preview/:group_id',
        element: <GroupPreview />,
    },
    {
        path: '/groups/edit/:group_id',
        element: <GroupEdit />,
    },
    {
        path: '/member/groups/preview/:group_id',
        element: <MemberGroupPreview />,
    },
    {
        path: '/member/groups/edit/:group_id',
        element: <MemberGroupEdit />,
    },
    {
        path: '/member/groups/:group_id/joingroup',
        element: <JoinGroup />,
        layout: 'blank',
    },
    {
        path: '/member/mypayments',
        element: <MyPayments />,
    },
    {
        path: '/member/contracts',
        element: <MyContracts />,
    },
    {
        path: '/test',
        element: <RowContextMenuExample />,
    },
    // {
    //     path: '/auth/boxed-lockscreen',
    //     element: <UnlockBoxed />,
    //     layout: 'blank',
    // },
    {
        path: '/auth/recorver_password',
        element: <RecoverIdBoxed />,
        layout: 'blank',
    },
    {
        path: '/auth/reset_password',
        element: <ResetPassword />,
        layout: 'blank',
    },
];

export { routes };
