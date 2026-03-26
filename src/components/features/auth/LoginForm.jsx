import React, { useState } from 'react';
import { Eye, EyeOff } from "lucide-react";
import { Link } from 'react-router-dom';

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex justify-center items-center h-screen w-full p-4 overflow-hidden">
            <div className="w-full max-w-md">
                <section className="bg-brand-gradient shadow-2xl rounded-3xl">
                    <div className="rounded-xl bg-white dark:bg-gray-900 shadow-xl p-6 m-2">
                        <h1 className="text-3xl font-bold mb-2 text-center uppercase cursor-default dark:text-gray-300 text-gray-900">
                            Log in
                        </h1>
                        <form action="#" method="post" className="space-y-3">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold mb-1 text-charcoal dark:text-gray-300">Email</label>
                                <input id="email" autoComplete="email" className="border px-3 py-2 shadow-md dark:bg-[#E8F0FE] dark:text-gray-800 dark:border-gray-700 outline-0 border-gray-300 rounded-lg w-full focus:ring-1 focus:ring-primary/60 transition transform duration-300" type="email" placeholder="Email" required />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold mb-1 text-charcoal dark:text-gray-300">Password</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        className="border px-3 py-2 shadow-md dark:bg-[#E8F0FE] dark:text-gray-800 dark:border-gray-700 outline-0 border-gray-300 rounded-lg w-full focus:ring-1 focus:ring-primary/60 transition transform duration-300 pr-10"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
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
                            </div>
                            <div className="flex justify-end">
                                <Link to="/forgot-password" className="text-primary/80 hover:text-primary text-xs font-medium transition-colors hover:underline">Forget your password?</Link>
                            </div>
                            <button className="w-full p-2 mt-2 text-white bg-brand-gradient rounded-lg transition transform duration-300 shadow-lg focus:outline-none focus:ring-1 focus:ring-blue-500" type="submit">
                                LOG IN
                            </button>
                        </form>
                        <div className="flex flex-col mt-3 text-sm text-center dark:text-gray-300">
                            <p>
                                Don't have an account?
                                <Link to="/register" className="text-primary font-bold hover:underline transition-all"> Sign Up</Link>
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 my-3">
                            <div className="h-px w-full bg-gray-300"></div>
                            <span className="text-gray-500 text-sm">OR</span>
                            <div className="h-px w-full bg-gray-300"></div>
                        </div>
                        <div className="flex justify-center gap-4 mt-5">
                            <button className="w-full cursor-pointer text-charcoal bg-white border border-zinc-300 flex gap-3 items-center justify-center py-2.5 rounded-xl font-semibold text-sm hover:bg-zinc-50 hover:border-zinc-400 transition-all duration-200 shadow-sm">
                                <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-6">
                                    <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107" />
                                    <path d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00" />
                                    <path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" fill="#4CAF50" />
                                    <path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" fill="#1976D2" />
                                </svg>
                                Continue with Google
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default LoginForm;
