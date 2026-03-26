import React, { useState, useEffect } from 'react';
import { MailCheck, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Link, useSearchParams } from 'react-router-dom';

const EmailVerificationForm = () => {
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        // Simulating an API call for verification
        // In a real app, you would perform: axios.post('/api/auth/verify-email', { token })
        const verify = async () => {
            try {
                // Simulate network latency
                await new Promise(resolve => setTimeout(resolve, 2000));
                setStatus('success');
            } catch (err) {
                setStatus('error');
            }
        };

        verify();
    }, [token]);

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
                                    Your account is now ready. You can log in and start using Zenxify.
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 w-full justify-center p-3 text-white bg-brand-gradient rounded-lg transition transform duration-300 shadow-lg hover:scale-[1.02] active:scale-[0.98] font-bold uppercase tracking-wider"
                                >
                                    Proceed to Login
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
                                    The verification link is invalid, expired, or has already been used.
                                </p>
                                <div className="space-y-3">
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center gap-2 w-full justify-center p-3 text-white bg-brand-gradient rounded-lg transition transform duration-300 shadow-lg font-bold uppercase tracking-wider"
                                    >
                                        Back to Sign Up
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
}

export default EmailVerificationForm;
