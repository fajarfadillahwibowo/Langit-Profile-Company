import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import EducationTrack3DCards from '@/Components/EducationTrack3DCards';
import InteractiveEducationHub from '@/Components/InteractiveEducationHub';
import { GraduationCap, ArrowRight } from 'lucide-react';

export default function EducationView({ service, courses = [] }) {
    return (
        <PublicLayout activeService="langit-education">
            <Head>
                <title>Langit Education & Tech Bootcamp Hub</title>
                <meta name="description" content="Akademi teknologi dan kejuruan praktis Langit: Kursus Coding (Robotik, Web Dev & AI), Kursus Office, dan Perakitan PC Hardware Lab bersama mentor praktisi industri." />
            </Head>

            {/* Atmosphere: Modern Academy & Learning Hub Layout */}
            <div className="bg-slate-50 dark:bg-[#04100D] min-h-screen text-slate-800 dark:text-slate-100 -mt-6 pt-6 transition-colors duration-300">
                {/* Hero Header */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 pb-12 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono tracking-wider">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>MODERN ACADEMY & LEARNING HUB</span>
                    </div>

                    <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
                        Belajar Langsung dari <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 dark:from-emerald-400 dark:via-teal-300 dark:to-white">
                            Praktisi & Proyek Industri Nyata.
                        </span>
                    </h1>

                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                        Bukan teori membosankan. Kurikulum Langit dirancang 80% praktik langsung menggunakan workstation produksi dan penanganan studi kasus komersial.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <a
                            href="#education-hub"
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105 active:scale-95"
                        >
                            <span>Eksplorasi Studio Lab & Kurikulum</span>
                            <ArrowRight className="w-4 h-4" />
                        </a>
                        <Link
                            href="/konsultasi"
                            className="px-5 py-3 rounded-xl bg-slate-200/70 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 text-sm font-semibold transition-colors"
                        >
                            Konsultasi In-House Training
                        </Link>
                    </div>
                </section>

                {/* 3 Colorful 3D Isometric Motion Cards (Reflects User's Claymorphic 3D Reference) */}
                <EducationTrack3DCards />

                {/* Interactive Studio Lab, Curriculum & Career Compass Hub (No Price Figures) */}
                <InteractiveEducationHub courses={courses} />
            </div>
        </PublicLayout>
    );
}
