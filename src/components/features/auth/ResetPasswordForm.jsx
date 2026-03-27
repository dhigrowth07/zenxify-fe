import React, { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../../services/authServices';
import { toast } from '../../../utils/toastHandler';
import { isValidPassword } from '../../../utils/validationSchema';

const ResetPasswordForm = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate Token
        if (!token) {
            toast.error("Invalid Request", "Reset token is missing. Please check your email link.");
            return;
        }

        // Validate Password Strength
        if (!isValidPassword(newPassword)) {
            toast.error("Weak Password", "Password must be at least 8 characters and include uppercase, lowercase, and numbers.");
            return;
        }

        // Validate Password Matching
        if (newPassword !== confirmPassword) {
            toast.error("Passwords Mismatch", "The passwords you entered do not match. Please try again.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await resetPassword({ token, new_password: newPassword });

            if (result.status === 'success') {
                setIsSubmitted(true);
                toast.success("Password Updated!", "Your password has been reset successfully. Please log in.");
            } else {
                toast.error("Reset Failed", result.message || "The link may be expired or invalid.");
            }
        } catch (err) {
            console.error('Reset password failed:', err);
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
                                        <Lock size={32} />
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold mb-2 text-center uppercase cursor-default dark:text-gray-300 text-gray-900">
                                    Reset Password
                                </h1>
                                <p className="text-center text-gray-500 dark:text-gray-400 text-xs mb-6 px-4">
                                    Choose a strong new password for your account.
                                </p>

                                {!token && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 p-4 rounded-xl text-center mb-4">
                                        <p className="text-red-600 dark:text-red-400 text-xs font-semibold">
                                            Oops! Reset token is missing. Please check your email link and try again.
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="new_password" className="block text-sm font-semibold mb-1 text-charcoal dark:text-gray-300">New Password</label>
                                        <div className="relative">
                                            <input
                                                id="new_password"
                                                autoComplete="new-password"
                                                className="border px-3 py-2 shadow-md dark:bg-[#E8F0FE] dark:text-gray-800 dark:border-gray-700 outline-0 border-gray-300 rounded-lg w-full focus:ring-1 focus:ring-primary/60 transition transform duration-300 pr-10"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="New Password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                disabled={isLoading || !token}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors focus:outline-none"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="confirm_password" className="block text-sm font-semibold mb-1 text-charcoal dark:text-gray-300">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                id="confirm_password"
                                                autoComplete="new-password"
                                                className="border px-3 py-2 shadow-md dark:bg-[#E8F0FE] dark:text-gray-800 dark:border-gray-700 outline-0 border-gray-300 rounded-lg w-full focus:ring-1 focus:ring-primary/60 transition transform duration-300 pr-10"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Confirm New Password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                disabled={isLoading || !token}
                                                required
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2 px-1">Must be at least 8 characters with letters and numbers.</p>
                                    </div>

                                    <button
                                        disabled={isLoading || !token}
                                        className="w-full p-2.5 mt-2 text-white bg-brand-gradient rounded-lg transition transform duration-300 shadow-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold tracking-wider uppercase"
                                        type="submit"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 size={20} className="animate-spin" />
                                                UPDATING...
                                            </div>
                                        ) : (
                                            'Update Password'
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
                                    Password Updated!
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 px-2">
                                    Your password has been changed successfully. You can now use your new password to log in.
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

                        <div className="flex flex-col mt-6 text-sm text-center dark:text-gray-300 border-t border-gray-100 dark:border-gray-800 pt-4">
                            <Link to="/login" className="text-primary font-bold hover:underline transition-all">
                                Back to Log in
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ResetPasswordForm;
