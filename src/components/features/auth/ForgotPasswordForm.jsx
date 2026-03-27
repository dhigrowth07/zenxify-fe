import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../../services/authServices';
import { toast } from '../../../utils/toastHandler';
import { isValidEmail } from '../../../utils/validationSchema';

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!isValidEmail(email)) {
            toast.error("Invalid Email", "Please enter a valid email address.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await forgotPassword(email);

            if (result.status === 'success') {
                setIsSubmitted(true);
                toast.success("Reset Link Sent!", "Please check your email to reset your password.");
            } else {
                toast.error("Error", result.message || "Failed to send reset link.");
            }
        } catch (err) {
            console.error('Forgot password failed:', err);
            toast.error("System Error", "An unexpected error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen w-full p-4 overflow-hidden">
            <div className="w-full max-w-md">
                <section className="bg-brand-gradient shadow-2xl rounded-3xl">
                    <div className="rounded-xl bg-white dark:bg-gray-900 shadow-xl p-8 m-2">

                        {!isSubmitted ? (
                            <>
                                <div className="mb-4 flex justify-center">
                                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                                        <Mail size={32} />
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold mb-2 text-center uppercase cursor-default dark:text-gray-300 text-gray-900">
                                    Forgot Password
                                </h1>
                                <p className="text-center text-gray-500 dark:text-gray-400 text-xs mb-6 px-4">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold mb-1 text-charcoal dark:text-gray-300">Email Address</label>
                                        <input
                                            id="email"
                                            autoComplete="email"
                                            className="border px-3 py-2 shadow-md dark:bg-[#E8F0FE] dark:text-gray-800 dark:border-gray-700 outline-0 border-gray-300 rounded-lg w-full focus:ring-1 focus:ring-primary/60 transition transform duration-300"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>

                                    <button
                                        disabled={isLoading}
                                        className="w-full p-2.5 mt-2 text-white bg-brand-gradient rounded-lg transition transform duration-300 shadow-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold tracking-wider uppercase"
                                        type="submit"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 size={20} className="animate-spin" />
                                                SENDING LINK...
                                            </div>
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <div className="mb-6 flex justify-center">
                                    <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                        <CheckCircle2 size={48} />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold mb-2 dark:text-gray-300 text-gray-900">
                                    Check Your Email
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 px-2">
                                    We've sent a password reset link to <span className="font-semibold text-charcoal dark:text-gray-200">{email}</span>. Please check your inbox and spam folder.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col mt-6 text-sm text-center dark:text-gray-300 border-t border-gray-100 dark:border-gray-800 pt-4">
                            <Link to="/login" className="flex items-center justify-center gap-2 text-primary font-bold hover:underline transition-all">
                                <ArrowLeft size={16} />
                                Back to Log in
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
