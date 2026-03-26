import React from 'react';
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';

const ForgotPasswordForm = () => {
    return (
        <div className="flex justify-center items-center h-screen w-full p-4 overflow-hidden">
            <div className="w-full max-w-md">
                <section className="bg-brand-gradient shadow-2xl rounded-3xl">
                    <div className="rounded-xl bg-white dark:bg-gray-900 shadow-xl p-6 m-2">
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

                        <form action="#" method="post" className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold mb-1 text-charcoal dark:text-gray-300">Email Address</label>
                                <input
                                    id="email"
                                    name="email"
                                    autoComplete="email"
                                    className="border px-3 py-2 shadow-md dark:bg-[#E8F0FE] dark:text-gray-800 dark:border-gray-700 outline-0 border-gray-300 rounded-lg w-full focus:ring-1 focus:ring-primary/60 transition transform duration-300"
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <button className="w-full p-2.5 mt-2 text-white bg-brand-gradient rounded-lg transition transform duration-300 shadow-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold tracking-wider uppercase" type="submit">
                                Send Reset Link
                            </button>
                        </form>

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
}

export default ForgotPasswordForm;
