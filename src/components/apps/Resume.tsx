'use client';
import { useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function Resume() {
  const { themeMode, accentColor } = useSettingsStore();
  const isLight = themeMode === 'light';
  const [activeTab, setActiveTab] = useState<'summary' | 'experience' | 'projects' | 'education'>('summary');

  const activeTabClass = isLight ? 'bg-indigo-100 text-indigo-700 shadow-inner' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 shadow-inner';
  const inactiveTabClass = isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/5 text-slate-400';

  return (
    <div className={`flex h-full transition-colors ${isLight ? 'bg-slate-50/90 text-slate-900' : 'bg-slate-900/40 text-white'}`}>
      {/* Sidebar */}
      <div className={`w-64 border-r p-6 flex flex-col shadow-2xl transition-colors shrink-0 ${isLight ? 'bg-white/60 border-slate-200' : 'bg-black/60 border-white/5'}`}>
        <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${accentColor} mx-auto mb-4 p-1 shadow-lg relative overflow-hidden`}>
          <img src="/profile.jpeg" alt="Rohit Pancholi" className="w-full h-full rounded-full object-cover object-top" />
        </div>
        <h2 className="text-center font-bold text-lg tracking-wide">Rohit Pancholi</h2>
        <p className={`text-center text-[10px] font-bold tracking-[0.2em] uppercase mb-8 mt-1 ${isLight ? 'text-indigo-600' : 'text-indigo-300'}`}>Senior Developer</p>

        <nav className="space-y-1.5 text-sm font-medium">
          <button
            onClick={() => setActiveTab('summary')}
            className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${activeTab === 'summary' ? activeTabClass : inactiveTabClass}`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('experience')}
            className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${activeTab === 'experience' ? activeTabClass : inactiveTabClass}`}
          >
            Experience
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${activeTab === 'projects' ? activeTabClass : inactiveTabClass}`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${activeTab === 'education' ? activeTabClass : inactiveTabClass}`}
          >
            Education
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">

        {activeTab === 'summary' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className={`text-4xl font-extrabold mb-2 ${isLight ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400'}`}>Professional Summary</h1>
            <div className={`w-16 h-1.5 rounded-full mb-8 bg-gradient-to-r ${accentColor}`}></div>

            <p className={`text-lg leading-relaxed mb-6 ${isLight ? 'text-slate-700 font-medium' : 'text-slate-300 font-light'}`}>
              Senior Developer with <span className={`font-semibold ${isLight ? 'text-indigo-700' : 'text-white'}`}>5 years of experience</span> delivering scalable, production-grade web applications across Insurance, Fintech, ERP, HRMS, Education, and iGaming domains. Expert in Angular version migrations, RxJS-driven state management, and reusable component architecture.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <h3 className={`font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>Frontend Mastery</h3>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Angular (v11–Latest), React, Next.js, RxJS, Redux, TypeScript, Tailwind CSS, Angular Material.</p>
              </div>
              <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <h3 className={`font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>Core Concepts & Tools</h3>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>RBAC, SSR, Lazy Loading, Git, Jira, Agile/Scrum, Firebase, RTL/LTR Localisation.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className={`text-4xl font-extrabold mb-2 ${isLight ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400'}`}>Experience</h1>
            <div className={`w-16 h-1.5 rounded-full mb-8 bg-gradient-to-r ${accentColor}`}></div>

            <div className="space-y-8">
              <div className={`relative border-l-2 ml-3 pl-8 pb-2 ${isLight ? 'border-slate-300' : 'border-white/10'}`}>
                <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1.5 ring-4 bg-gradient-to-br ${accentColor} ${isLight ? 'ring-slate-50' : 'ring-slate-900 shadow-[0_0_15px_rgba(99,102,241,0.8)]'}`}></div>
                <h3 className="text-xl font-bold">Senior Software Developer</h3>
                <p className={`text-sm font-bold tracking-wide uppercase mt-1 mb-3 ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>Iwin Labs | Nov 2025 – Present</p>
                <p className={`leading-relaxed ${isLight ? 'text-slate-600 font-medium' : 'text-slate-300 font-light'}`}>
                  Lead and mentor a team of 5+ engineers, delivering 6+ production iGaming applications. Architected React/Next.js projects using AI-assisted tools ensuring 99% uptime and zero critical security incidents.
                </p>
              </div>

              <div className={`relative border-l-2 ml-3 pl-8 pb-2 ${isLight ? 'border-slate-300' : 'border-white/10'}`}>
                <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1.5 ring-4 bg-slate-400 ${isLight ? 'ring-slate-50' : 'ring-slate-900'}`}></div>
                <h3 className="text-xl font-bold">Software Developer</h3>
                <p className={`text-sm font-bold tracking-wide uppercase mt-1 mb-3 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Centricity Wealth Tech Pvt. Ltd. | Apr 2024 – Oct 2025</p>
                <p className={`leading-relaxed mb-3 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-300 font-light'}`}>
                  Built the One-Sure application from scratch, replacing DevExtreme with a custom grid. Developed a speech-enabled chatbot (One Digital) and executed Angular version migrations, improving load time by 30%.
                </p>
              </div>

              <div className={`relative border-l-2 ml-3 pl-8 pb-2 ${isLight ? 'border-slate-300' : 'border-white/10'}`}>
                <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1.5 ring-4 bg-slate-400 ${isLight ? 'ring-slate-50' : 'ring-slate-900'}`}></div>
                <h3 className="text-xl font-bold">Software Developer</h3>
                <p className={`text-sm font-bold tracking-wide uppercase mt-1 mb-3 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Amstech Incorporation Pvt. Ltd. | Aug 2021 – Feb 2024</p>
                <p className={`leading-relaxed ${isLight ? 'text-slate-600 font-medium' : 'text-slate-300 font-light'}`}>
                  Developed scalable Angular applications across ERP, HRMS, and Education domains. Migrated apps from v11 to v13 and built multilingual (Arabic/English) applications with RTL/LTR handling.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'education' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className={`text-4xl font-extrabold mb-2 ${isLight ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400'}`}>Education</h1>
            <div className={`w-16 h-1.5 rounded-full mb-8 bg-gradient-to-r ${accentColor}`}></div>

            <div className={`relative border-l-2 ml-3 pl-8 pb-2 ${isLight ? 'border-slate-300' : 'border-white/10'}`}>
              <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1.5 ring-4 bg-gradient-to-br ${accentColor} ${isLight ? 'ring-slate-50' : 'ring-slate-900 shadow-[0_0_15px_rgba(99,102,241,0.8)]'}`}></div>
              <h3 className="text-xl font-bold">Bachelor of Engineering, IT</h3>
              <p className={`text-sm font-bold tracking-wide uppercase mt-1 mb-3 ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>Swami Vivekananda College of Engineering, Indore</p>
              <p className={`leading-relaxed ${isLight ? 'text-slate-600 font-medium' : 'text-slate-300 font-light'}`}>
                2016 – 2020
              </p>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className={`text-4xl font-extrabold mb-2 ${isLight ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400'}`}>Projects</h1>
            <div className={`w-16 h-1.5 rounded-full mb-8 bg-gradient-to-r ${accentColor}`}></div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-12">
              {[
                {
                  name: 'Rush Of Gold Sweeps Casino',
                  type: 'iGaming • Sweepstakes',
                  desc: 'Developed a comprehensive sweepstakes casino platform with secure sharing database.',
                  tech: 'React, Next.js, Node.js, PostgreSQL'
                },
                {
                  name: 'Bare Knuckle Fight Club',
                  type: 'iGaming • BKFC Casino',
                  desc: 'Developed the official BKFC sweeps casino platform with dedicated admin panels.',
                  tech: 'React, Next.js, Node.js, PostgreSQL'
                },
                {
                  name: 'Cosmos.Fx',
                  type: 'AI • Social Media',
                  desc: 'Built a powerful social media AI post generation platform.',
                  tech: 'React, Next.js, Node.js, PostgreSQL'
                },
                {
                  name: 'Lady Lucka Sweeps Casino',
                  type: 'iGaming • Sweepstakes',
                  desc: 'Sweepstakes casino platform with complex user flows and integrated secure backend.',
                  tech: 'React, Next.js, Node.js, PostgreSQL'
                },
                {
                  name: 'WiseXbet Crypto Casino',
                  type: 'iGaming • Crypto • Agents',
                  desc: 'Crypto casino platform featuring an integrated Agent system and customized admin panels.',
                  tech: 'React, Next.js, Node.js, PostgreSQL'
                },
                {
                  name: 'NoLimit Crypto Casino',
                  type: 'iGaming • Crypto',
                  desc: 'Secure and scalable crypto casino platform with dedicated administrative features.',
                  tech: 'React, Next.js, Node.js, PostgreSQL'
                },
                {
                  name: 'NoLimit Sweeps Casino',
                  type: 'iGaming • Sweepstakes',
                  desc: 'Full-featured sweeps casino built on a modern React/Next.js frontend.',
                  tech: 'React, Next.js, Node.js, PostgreSQL'
                },
                {
                  name: 'Nio Play Sweep Casino',
                  type: 'iGaming • Affiliates',
                  desc: 'Sweepstakes casino application with a robust, integrated affiliate module.',
                  tech: 'React, Next.js, Node.js, PostgreSQL'
                },
                {
                  name: 'One Sure',
                  type: 'Fintech • Insurance',
                  desc: 'Insurance platform (Health, Life, Vehicle) managing agent systems, customer fetching, and bulk db insertion tracking.',
                  tech: 'Angular, .NET, SQL, RBAC'
                },
                {
                  name: 'One Digital',
                  type: 'Fintech • AI • Brokerage',
                  desc: 'Investment product (Mutual Funds, Bonds, SIP) featuring STT/TTS translation, onboarding, and agent/brokerage systems.',
                  tech: 'Angular, .NET, SQL, RBAC'
                },
                {
                  name: 'Amstech Inc Website',
                  type: 'Corporate • Static',
                  desc: 'Developed the static corporate website for Amstech Incorporation.',
                  tech: 'Angular'
                },
                {
                  name: 'HRMS',
                  type: 'Enterprise • HR Tech',
                  desc: 'Custom HRMS featuring Attendance, Timesheet, Project/Leave/Document management, and full Onboarding to Offboarding process.',
                  tech: 'Angular, Spring Boot, MySQL, RBAC'
                },
                {
                  name: 'Complaint Management System',
                  type: 'Education • CMS',
                  desc: 'CMS for IIM Indore to efficiently manage and track campus complaints.',
                  tech: 'Angular, Spring Boot, MySQL, RBAC'
                },
                {
                  name: 'OfferSA',
                  type: 'InsurTech • Multilingual',
                  desc: 'Insurance tech platform for Saudi Arabia supporting comprehensive multilingual and RTL/LTR features.',
                  tech: 'Angular, Spring Boot, MySQL, RBAC'
                },
                {
                  name: 'Learning 1080',
                  type: 'EdTech • E-Learning',
                  desc: 'EdTech platform featuring assignments, live video classes, lectures, and quiz courses.',
                  tech: 'Angular, Spring Boot, MySQL, RBAC'
                }
              ].map((project, i) => (
                <div key={i} className={`p-5 rounded-xl border flex flex-col justify-between ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{project.name}</h3>
                    <p className={`text-xs mb-3 ${isLight ? 'text-indigo-600 font-semibold' : 'text-indigo-400'}`}>{project.type}</p>
                    <p className={`leading-relaxed text-sm mb-4 ${isLight ? 'text-slate-600' : 'text-slate-300 font-light'}`}>
                      {project.desc}
                    </p>
                  </div>
                  <div className={`text-xs font-medium px-3 py-1.5 rounded-md inline-block w-fit ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-slate-300'}`}>
                    {project.tech}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
