import { useEffect, useState } from 'react';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import IconLockDots from '../../components/Icon/IconLockDots';
import IconUser from '../../components/Icon/IconUser';
import { IRootState } from '../../store';
import { LoginUser } from '../../store/authSlice';
import { setPageTitle } from '../../store/themeConfigSlice';

import { Icon } from 'react-icons-kit';
import { eye } from 'react-icons-kit/feather/eye';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import IconLoader from '../../components/Icon/IconLoader';
import IconX from '../../components/Icon/IconX';
import showMessage from '../../helper/showMessage';

const LoginBoxed = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Login Boxed'));
    });

    const signIn = useSignIn();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userNameOrEmail, setUserNameOrEmail] = useState('');
    const [error, setError] = useState('');
    const [isSaveLoading, setIsSaveLoading] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        console.log('submit');
        setIsSaveLoading(true);
        e.preventDefault();
        setError('');

        const input = userNameOrEmail;
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isUsername = /^[a-zA-Z0-9_.-]{3,}$/;
        let userOrEmail: { email?: string; username?: string } = {};

        if (isEmail.test(input)) {
            userOrEmail.email = input;
        } else if (isUsername.test(input)) {
            userOrEmail.username = input;
        } else {
            setError('Invalid input. Please enter a valid username or email.');
            setIsSaveLoading(false);
            return;
        }

        if (!password) {
            setError('Please fill in all fields');
            setIsSaveLoading(false);
            return;
        }

        try {
            const response = await dispatch(LoginUser({ userOrEmail, password, extra: { signIn } }) as any);
            const loginResponse = response;
            console.log('loginResponse', loginResponse);

            if (response.meta.requestStatus === 'fulfilled') {
                console.log('logged in');
                setIsSaveLoading(false);
                showMessage('Login successful', 'success');
                navigate(from, { replace: true });
            } else {
                throw new Error(response.payload);
            }
        } catch (error: any) {
            setError(`${error}`);
            setIsSaveLoading(false);
        } finally {
            setIsSaveLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigate('/auth/recorver_password');
    };

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-5 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
                <div className="relative w-full max-w-[570px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-1 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6  py-10">
                        <div className="mx-auto w-full max-w-[440px]">
                            <div className="mb-5">
                                <h1 className="text-2xl font-extrabold uppercase !leading-snug text-success md:text-2xl">Sign in</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your email and password to login</p>
                            </div>
                            {error && (
                                <div className="text-red-500 text-lg font-semibold mb-5 bg-red-100 flex items-center gap-3 rounded-md">
                                    {' '}
                                    <IconX />
                                    {error}
                                </div>
                            )}
                            <form className="space-y-5 dark:text-white" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="usernameOrEmail">Username or Email</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="Email"
                                            type="text"
                                            name="usernameOrEmail"
                                            placeholder="Enter Username or Email"
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            value={userNameOrEmail}
                                            onChange={(e) => setUserNameOrEmail(e.target.value)}
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconUser fill={true} />
                                        </span>
                                    </div>{' '}
                                </div>
                                <div>
                                    <label htmlFor="Password">Password</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="Password"
                                            type={type}
                                            placeholder="Enter Password"
                                            className="form-input ps-10 pe-10 placeholder:text-white-dark"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <span className="absolute end-4 top-1/2 -translate-y-1/2">
                                            <Icon className="cursor-pointer" icon={icon} size={16} onClick={handleToggle} />
                                        </span>
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                </div>
                                <div className="ltr:mr-auto rtl:ml-auto">
                                    <button type="button" className=" text-xs uppercase" onClick={handleForgotPassword}>
                                        Forgot password?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-success ml-auto mr-auto !mt-6 w-fit border-0  justify-center items-center uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)] font-bold"
                                >
                                    {!isSaveLoading ? 'Sign In' : <IconLoader className="animate-[spin_2s_linear_infinite] inline-block font-extrabold align-middle  shrink-0" />}
                                </button>
                            </form>
                            <div className="relative my-7 text-center md:mb-9">
                                <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
                                <span className="relative bg-white px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light">or</span>
                            </div>
                            <div className="mb-4">
                                <button type="submit" className="btn !mt-6 w-fit ml-auto mr-auto bg-black text-white border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                    Sign In With Azure
                                </button>
                            </div>
                            <div className="text-center dark:text-white">
                                Don't have an account ?&nbsp;
                                <Link to="/register" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                    SIGN UP
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginBoxed;
