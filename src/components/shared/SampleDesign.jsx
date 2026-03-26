import moment from 'moment';
import { useTheme } from '../../hooks/useTheme';
import { toast } from '../../utils/toastHandler';
import { formatDate, formatRelativeTime } from '../../utils/date';

const SampleDesign = () => {
    const { isDark, toggleTheme } = useTheme();

    // Examples for toasts
    const handleSuccessToast = () => toast.success("Its Working!", "Action completed successfully.");
    const handleErrorToast = () => toast.error("Error", "Something went wrong.");
    const handleActionToast = () => toast.action("Action Required", "View the details?", "View", () => alert("Viewing..."));

    const handlePromiseToast = () => {
        const fakePromise = new Promise((resolve) => setTimeout(() => resolve("Data loaded!"), 2000));
        toast.promise(fakePromise, "Loading data...", "Success!", "Error loading data");
    };

    return (
        <div className="min-h-screen bg-background dark:bg-background-dark flex flex-col items-center justify-center p-8 transition-colors duration-500">
            <div className="max-w-4xl w-full p-10 rounded-[2.5rem] bg-surface dark:bg-gray-900 border border-border-light dark:border-gray-800 shadow-xl space-y-12">

                <header className="flex justify-between items-center pb-6 border-b border-border-light dark:border-gray-800">
                    <div className="space-y-1">
                        <h1 className="main-heading text-left! text-primary! leading-none!">Zenxify Design</h1>
                        <p className="sub-text uppercase tracking-widest font-medium">Usage Examples & Style Guide</p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-2xl bg-light-purple dark:bg-gray-800 text-primary dark:text-primary-dark transition-all hover:scale-110 active:scale-90 shadow-sm"
                    >
                        {isDark ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                        )}
                    </button>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Colors */}
                    <div className="space-y-6">
                        <h2 className="section-title">Visual Identity</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <ColorBox color="bg-primary" label="Primary" hex="#8c2bee" />
                            <ColorBox color="bg-primary-hover" label="Hover" hex="#7a25d1" />
                            <div className="space-y-1.5 group">
                                <div className="h-16 rounded-xl bg-brand-gradient shadow-sm group-hover:scale-105 transition-transform duration-300" />
                                <div className="px-1 text-center md:text-left">
                                    <p className="text-[10px] font-black text-charcoal/40 dark:text-gray-500 uppercase truncate">Gradient</p>
                                    <p className="text-[10px] font-mono text-charcoal/20 dark:text-gray-600 truncate">Magenta → Purple</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Typography */}
                    <div className="space-y-6">
                        <h2 className="section-title">Typography</h2>
                        <div className="space-y-4 text-left">
                            <div>
                                <p className="main-heading text-left! text-2xl!">Main Heading</p>
                                <p className="sub-text">Used for major page tiles</p>
                            </div>
                            <div>
                                <p className="sub-heading text-left! text-lg!">Sub Heading</p>
                                <p className="sub-text">Used for section descriptors</p>
                            </div>
                            <div>
                                <p className="font-numeric text-3xl text-primary leading-none">1,234.56</p>
                                <p className="sub-text">Numeric display font (Zen Dots)</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Toast Utils */}
                    <div className="space-y-6">
                        <h2 className="section-title">Interactives (Toast)</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleSuccessToast} className="btn btn-primary text-sm!">Success</button>
                            <button onClick={handleErrorToast} className="btn btn-outline text-sm! border-red-500! text-red-500! hover:bg-red-500!">Error</button>
                            <button onClick={handleActionToast} className="btn btn-outline text-sm!">Action</button>
                            <button onClick={handlePromiseToast} className="btn btn-outline text-sm!">Promise</button>
                        </div>
                    </div>

                    {/* Date Utils */}
                    <div className="space-y-6">
                        <h2 className="section-title">Data Utilities</h2>
                        <div className="p-4 rounded-2xl bg-background dark:bg-gray-800/50 border border-border-light dark:border-gray-700">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-charcoal/50 dark:text-gray-500 font-bold uppercase">Formatted Date</span>
                                    <span className="text-charcoal dark:text-white font-mono">{formatDate(new Date())}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-charcoal/50 dark:text-gray-500 font-bold uppercase">Relative Time</span>
                                    <span className="text-charcoal dark:text-white">{formatRelativeTime(moment().subtract(2, 'hours'))}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="pt-6 border-t border-border-light dark:border-gray-800 text-center">
                    <p className="body-text text-sm! opacity-50">Zenxify SDK v1.1.0 • Built with Passion</p>
                </footer>

            </div>
        </div>
    );
};

export default SampleDesign;

/**
 * @param {{ color: string, label: string, hex: string, border?: boolean }} props
 */
function ColorBox({ color, label, hex, border = false }) {
    return (
        <div className="space-y-1.5 group">
            <div className={`h-16 rounded-xl ${color} ${border ? 'border-border-light dark:border-gray-700' : ''} shadow-sm group-hover:scale-105 transition-transform duration-300 cursor-copy`} />
            <div className="px-1 text-center md:text-left">
                <p className="text-[10px] font-black text-charcoal/40 dark:text-gray-500 uppercase truncate">{label}</p>
                <p className="text-[10px] font-mono text-charcoal/20 dark:text-gray-600 truncate">{hex}</p>
            </div>
        </div>
    );
}
