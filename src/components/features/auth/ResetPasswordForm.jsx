import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { Link, useSearchParams } from 'react-router-dom';

const ResetPasswordForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // In a real app, you would handle token validation or submission logic here.
    // We'll focus on the UI/UX as requested.

    return (
        <div className="flex justify-center items-center h-screen w-full p-4 overflow-hidden">
            <div className="w-full max-w-md">
                <section className="bg-brand-gradient shadow-2xl rounded-3xl">
                    <div className="rounded-xl bg-white dark:bg-gray-900 shadow-xl p-6 m-2">
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

                        {!token ? (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 p-4 rounded-xl text-center mb-4">
                                <p className="text-red-600 dark:text-red-400 text-xs font-semibold">
                                    Oops! Reset token is missing or invalid. Please check your email link and try again.
                                </p>
                            </div>
                        ) : (
                            <form action="#" method="post" className="space-y-4">
                                {/* Token is hidden as it should not be entered manually by user */}
                                <input type="hidden" name="token" value={token} />

                                <div>
                                    <label htmlFor="new_password" className="block text-sm font-semibold mb-1 text-charcoal dark:text-gray-300">New Password</label>
                                    <div className="relative">
                                        <input
                                            id="new_password"
                                            name="new_password"
                                            autoComplete="new-password"
                                            className="border px-3 py-2 shadow-md dark:bg-[#E8F0FE] dark:text-gray-800 dark:border-gray-700 outline-0 border-gray-300 rounded-lg w-full focus:ring-1 focus:ring-primary/60 transition transform duration-300 pr-10"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="New Password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary/80 focus:outline-none transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 px-1">Must be at least 8 characters with letters and numbers.</p>
                                </div>

                                <button className="w-full p-2.5 mt-2 text-white bg-brand-gradient rounded-lg transition transform duration-300 shadow-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold tracking-wider uppercase" type="submit">
                                    Update Password
                                </button>
                            </form>
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
}

export default ResetPasswordForm;
