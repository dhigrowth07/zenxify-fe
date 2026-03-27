import React, { useState, useEffect, useRef } from 'react';
import { MailCheck, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyEmail } from '../../../services/authServices';
import { loginSuccess } from '../../../redux/auth/authSlice';
import { toast } from '../../../utils/toastHandler';

const EmailVerificationForm = () => {
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState('');
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // Prevent double execution in Strict Mode
    const hasCalledRef = useRef(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage("No verification token was found in the link.");
            return;
        }

        // Only run if not already called
        if (hasCalledRef.current) return;

        const runVerification = async () => {
            hasCalledRef.current = true; // Guard it immediately
            try {
                const result = await verifyEmail(token);

                if (result.status === 'success') {
                    setStatus('success');

                    // Auto-Login Logic
                    if (result.data && result.data.accessToken) {
                        dispatch(loginSuccess({
                            accessToken: result.data.accessToken,
                            refreshToken: result.data.refreshToken,
                            user: result.data.user
                        }));

                        toast.success("Account Verified!", "Logging you in automatically...");

                        // Redirect after a short delay so user sees the success state
                        setTimeout(() => {
                            navigate('/');
                        }, 2000);
                    }
                } else {
                    setStatus('error');
                    setErrorMessage(result.message || "Verification failed. The link might be expired.");
                }
            } catch (err) {
                console.error('Verification failed:', err);
                setStatus('error');
                setErrorMessage("An unexpected error occurred. Please try again later.");
            }
        };

        runVerification();
    }, [token, dispatch, navigate]);

    return (
        <div className="flex justify-center items-center h-screen w-full p-4 overflow-hidden">
            <div className="w-full max-w-md">
                <section className="bg-brand-gradient shadow-2xl rounded-3xl">
                    <div className="rounded-xl bg-white dark:bg-gray-900 shadow-xl p-8 m-2 text-center">

                        {status === 'verifying' && (
                            <div className="py-4">
                                <div className="mb-6 flex justify-center">
                                    <div className="p-4 rounded-full bg-primary/10 text-primary animate-pulse">
                                        <MailCheck size={48} />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold mb-2 dark:text-gray-300 text-gray-900">
                                    Verifying Your Email
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                    Please wait while we confirm your email address...
                                </p>
                                <div className="flex justify-center">
                                    <Loader2 className="animate-spin text-primary" size={32} />
                                </div>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="py-4">
                                <div className="mb-6 flex justify-center">
                                    <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                        <CheckCircle2 size={48} />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold mb-2 dark:text-gray-300 text-gray-900">
                                    Email Verified!
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                                    Your account is now ready. We are logging you in...
                                </p>
                                <div className="flex justify-center mb-4">
                                    <Loader2 className="animate-spin text-green-500" size={24} />
                                </div>
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-2 w-full justify-center p-3 text-white bg-brand-gradient rounded-lg transition transform duration-300 shadow-lg hover:scale-[1.02] active:scale-[0.98] font-bold uppercase tracking-wider"
                                >
                                    Go to Dashboard
                                    <ArrowRight size={20} />
                                </Link>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="py-4">
                                <div className="mb-6 flex justify-center">
                                    <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                        <AlertCircle size={48} />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold mb-2 dark:text-gray-300 text-gray-900">
                                    Verification Failed
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                                    {errorMessage}
                                </p>
                                <div className="space-y-3">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 w-full justify-center p-3 text-white bg-brand-gradient rounded-lg transition transform duration-300 shadow-lg font-bold uppercase tracking-wider"
                                    >
                                        Back to Login
                                    </Link>
                                    <p className="text-xs text-gray-400">
                                        Need help? <a href="#" className="text-primary hover:underline">Contact Support</a>
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </section>
            </div>
        </div>
    );
};

export default EmailVerificationForm;
