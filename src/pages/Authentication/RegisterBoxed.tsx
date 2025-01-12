import { ChangeEvent, useEffect, useState } from 'react';
import PasswordChecklist from 'react-password-checklist';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { eye } from 'react-icons-kit/feather/eye';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import Select from 'react-select';
import axiosInstance from '../../helper/axiosInstance';
import showMessage from '../../helper/showMessage';
import { IRootState } from '../../store';
import { setPageTitle, toggleRTL } from '../../store/themeConfigSlice';
import sanitizeHtml from 'sanitize-html';

const RegisterBoxed = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Register Boxed'));
    });
    const navigate = useNavigate();
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [params, setParams] = useState<any>({});
    const [type, setType] = useState('password');
    const [icon, setIcon] = useState(eyeOff);

    const handleToggle = () => {
        if (type === 'password') {
            setIcon(eye);
            setType('text');
        } else {
            setIcon(eyeOff);
            setType('password');
        }
    };

    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };
    const [flag, setFlag] = useState(themeConfig.locale);

    const submitForm = () => {
        navigate('/');
    };

    function changeValue(e: ChangeEvent<HTMLInputElement>): void {
        const { id, value } = e.target;
        setParams((prevParams: any) => ({
            ...prevParams,
            [id]: value,
        }));
    }

    const saveNewUser = async () => {
        console.log('params', params);

        const requiredFields = [
            { field: 'first_name', message: 'First Name is required.' },
            { field: 'last_name', message: 'Last Name is required.' },
            { field: 'email', message: 'Email is required.' },
            { field: 'phone', message: 'Phone is required.' },
            { field: 'username', message: 'Username is required.' },
            { field: 'password', message: 'Password is required.' },
            { field: 'dob', message: 'Date of Birth is required.' },
            { field: 'occupation', message: 'Occupation is required.' },
        ];

        for (let { field, message } of requiredFields) {
            if (!params[field]) {
                showMessage(message, 'error');
                return true;
            }
        }

        if (params.password !== params.password1) {
            showMessage('Passwords do not match.', 'error');
            return true;
        }
        const payload = JSON.stringify({ ...params });

        try {
            const response = await axiosInstance.post('/users', payload);
            if (response.status === 201) {
                showMessage(`registered successfully.`, 'success');
                setParams({});
                navigate('/login');
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
            // setParams(defaultParams);
        }
    };

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />

                <div className="relative w-full rounded-md max-w-[940px] bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[758px] py-20">
                        <div className="mx-auto w-full max-w-[740px]">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-success md:text-4xl">Register</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your email and password to register</p>
                            </div>
                            <form className="space-y-5 dark:text-white flex flex-wrap gap-5 items-start justify-start" onSubmit={submitForm}>
                                <div className="w-full flex flex-wrap md:flex-nowrap gap-5">
                                    <div className="mb-5 w-full">
                                        <label htmlFor="first_name">
                                            First Name <span className="text-red-600">*</span>
                                        </label>
                                        <input id="first_name" type="text" placeholder="Enter First Name" className="form-input" value={params?.first_name} onChange={(e) => changeValue(e)} required />
                                    </div>
                                    <div className="mb-5 w-full">
                                        <label htmlFor="last_name">
                                            Last Name <span className="text-red-600">*</span>
                                        </label>
                                        <input id="last_name" type="text" placeholder="Enter Last Name" className="form-input" value={params?.last_name} onChange={(e) => changeValue(e)} required />
                                    </div>
                                    <div className="mb-5 w-full">
                                        <label htmlFor="other_names">Other Names</label>
                                        <input id="other_names" type="text" placeholder="Enter Other Names" className="form-input" value={params?.other_names} onChange={(e) => changeValue(e)} />
                                    </div>
                                </div>
                                <div className="w-full flex flex-wrap md:flex-nowrap gap-5">
                                    <div className="mb-5 w-full">
                                        <label htmlFor="username">
                                            Username <span className="text-red-600">*</span>
                                        </label>
                                        <input id="username" type="text" placeholder="Enter Username" className="form-input" value={params?.username} onChange={(e) => changeValue(e)} required />
                                    </div>
                                    <div className="mb-5 w-full">
                                        <label htmlFor="email">
                                            Email <span className="text-red-600">*</span>
                                        </label>
                                        <input id="email" type="email" placeholder="Enter Email" className="form-input" value={params?.email} onChange={(e) => changeValue(e)} required />
                                    </div>
                                </div>
                                <div className="flex flex-wrap md:flex-nowrap gap-5">
                                    <div>
                                        <label htmlFor="dateOfBirth">
                                            Date Of Birth: <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            id="dob"
                                            type="date"
                                            name="dob"
                                            className="form-input"
                                            placeholder="Date Of Birth"
                                            value={params?.dob || ''}
                                            onChange={(event: any) => changeValue(event)}
                                            required
                                        />
                                        <div className="text-danger mt-2" id="startDateErr"></div>
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="gender">
                                            Gender <span className="text-red-600">*</span>
                                        </label>
                                        <Select
                                            id="gender"
                                            options={[
                                                { value: 'Male', label: 'Male' },
                                                { value: 'Female', label: 'Female' },
                                            ]}
                                            isSearchable={false}
                                            onChange={(e) => setParams({ ...params, gender: e?.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="w-full flex flex-wrap gap-5 md:flex-nowrap">
                                    <div className="mb-4 w-full">
                                        <label htmlFor="password1">
                                            Password <span className="text-red-600">*</span>
                                        </label>
                                        <div className="flex">
                                            <input
                                                type={type}
                                                name="password1"
                                                id="password1"
                                                placeholder="Password"
                                                className="form-input"
                                                value={params?.password1}
                                                onChange={(e) => changeValue(e)}
                                                autoComplete="current-password"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-7 w-full">
                                        <label htmlFor="password2">
                                            Confirm password <span className="text-red-600">*</span>
                                        </label>
                                        <div className="">
                                            <input
                                                type={type}
                                                name="password2"
                                                id="password2"
                                                placeholder="Re-Type Password"
                                                className="form-input w-full"
                                                value={params?.password2}
                                                onChange={(e) => changeValue(e)}
                                                autoComplete="current-password"
                                                required
                                            />
                                            <div className="text-right mt-2">
                                                {' '}
                                                <span className="cursor-pointer text-gray-500 flex items-center justify-end" onClick={handleToggle}>
                                                    show
                                                </span>
                                            </div>
                                        </div>
                                        {params?.password1 && (
                                            <PasswordChecklist
                                                rules={['minLength', 'specialChar', 'number', 'capital', 'match']}
                                                minLength={8}
                                                value={params?.password1}
                                                valueAgain={params?.password2}
                                                onChange={() => setParams({ ...params, password: params?.password1 })}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="w-full flex flex-wrap md:flex-nowrap gap-5">
                                    <div className="mb-5">
                                        <label htmlFor="phone">
                                            Phone Number <span className="text-red-600">*</span>
                                        </label>
                                        <input id="phone" type="text" placeholder="Enter Phone Number" className="form-input" value={params?.phone} onChange={(e) => changeValue(e)} required />
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="role">
                                            Occupation <span className="text-red-600">*</span>
                                        </label>
                                        <input id="occupation" type="text" placeholder="Enter Occupation" className="form-input" value={params?.occupation} onChange={(e) => changeValue(e)} required />
                                    </div>
                                </div>
                                <div className="mb-5 w-full">
                                    <label htmlFor="location">
                                        Address <span className="text-red-600">*</span>
                                    </label>
                                    <textarea
                                        id="address"
                                        rows={3}
                                        placeholder="Enter Address"
                                        className="form-textarea resize-none min-h-[130px]"
                                        value={params?.address}
                                        onChange={(e) => changeValue(e)}
                                        required
                                    ></textarea>
                                </div>
                                <div className="flex  items-center mt-8">
                                    <button type="button" className="btn btn-success ltr:ml-4 rtl:mr-4" onClick={saveNewUser}>
                                        Register
                                    </button>
                                </div>
                            </form>
                            <div className="relative my-7 text-center md:mb-9">
                                <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
                                <span className="relative bg-white px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light">or</span>
                            </div>
                            <div className="mb-4">
                                <button type="submit" className="btn !mt-6 w-fit bg-black text-white border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                    Sign In With Azure
                                </button>
                            </div>
                            <div className="dark:text-white">
                                Already have an account ?&nbsp;
                                <Link to="/login" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                    SIGN IN
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterBoxed;

