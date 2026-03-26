
import { Plus } from 'lucide-react';

export default function AIVideoEditingHeroHomeSection() {
    return (
        <div className="min-h-screen bg-white shadow-2xl flex items-center justify-center px-4 m-10 rounded-4xl">
            <div className="w-full max-w-4xl">
                {/* Main container */}
                <div className="flex flex-col items-center justify-center gap-8 py-16 md:py-24">

                    {/* Top badge */}
                    <div className="inline-flex items-center justify-center">
                        <div className="bg-brand-gradient rounded-full px-6 py-2.5">
                            <span className="text-white font-numeric text-sm md:text-base tracking-wide">
                                AI VIDEO EDITING
                            </span>
                        </div>
                    </div>

                    {/* Main headline */}
                    <div className="text-center font-restore space-y-6 leading-tight">
                        <h1 className="text-4xl text-shadow-xs  md:text-5xl lg:text-6xl font-black">
                            <span className="text-charcoal">CREATE </span>
                            <span className="bg-brand-gradient bg-clip-text text-transparent">MAGIC</span>
                            <span className="text-charcoal"> IN</span>
                        </h1>
                        <h1 className="text-4xl text-shadow-xs md:text-5xl lg:text-6xl font-black ">
                            <span className="text-charcoal">MINUTES WITH </span>
                            <span className="bg-brand-gradient bg-clip-text text-transparent">AI</span>
                        </h1>
                    </div>

                    {/* Descriptive text */}
                    <div className="text-center max-w-2xl">
                        <p className="text-lg md:text-xl font-semibold text-charcoal font-body">
                            Your personal AI video editor. Turn raw footage into viral content.
                        </p>
                        <p className="text-lg md:text-xl font-semibold text-charcoal font-body">
                            Just ask our AI to clip, caption, Broil, and polish for you.
                        </p>
                    </div>

                    {/* CTA Button */}
                    <button className="inline-flex items-center gap-2 bg-brand-gradient text-white font-bold px-8 py-4 md:px-10 md:py-4 rounded-2xl text-lg md:text-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                        <Plus size={24} className="stroke-[4px]" />
                        <span>Start New Project</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
