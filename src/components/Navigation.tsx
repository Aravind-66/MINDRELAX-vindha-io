import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useWellness } from '../context/WellnessContext';
import {
  Home,
  Smile,
  BookOpen,
  Compass,
  Music,
  Users,
  Gamepad2,
  Sprout,
  Target,
  FileText,
  Video,
  BarChart2,
  User,
  Bot,
  Bell,
  Check,
  Flame,
  Award,
  Menu,
  X
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const {
    profile,
    unreadNotifsCount,
    notifications,
    markNotificationRead,
    triggerMindaModal,
    onlineCount,
    isRealtimeConnected
  } = useWellness();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Mood', path: '/mood', icon: Smile },
    { name: 'Journal', path: '/journal', icon: BookOpen },
    { name: 'Meditate', path: '/meditate', icon: Compass },
    { name: 'Music', path: '/music', icon: Music },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Games', path: '/games', icon: Gamepad2 },
    { name: 'Plant', path: '/plant', icon: Sprout },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Resources', path: '/resources', icon: FileText },
    { name: 'Webinars', path: '/webinars', icon: Video },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  const primaryMobileNav = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Mood', path: '/mood', icon: Smile },
    { name: 'Journal', path: '/journal', icon: BookOpen },
    { name: 'Meditate', path: '/meditate', icon: Compass },
    { name: 'More', path: '#more', icon: Menu }
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 glass-panel text-slate-700 border-r border-slate-200/80 backdrop-blur-2xl min-h-screen fixed left-0 top-0 bottom-0 z-30 shadow-sm">
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-200">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl theme-gradient-btn flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight opacity-95">MindRelax</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-[10px] theme-text-accent font-bold uppercase tracking-wider">
                  LIVE • {onlineCount} {onlineCount === 1 ? 'Member' : 'Members'}
                </span>
              </div>
            </div>
          </NavLink>

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl opacity-75 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 theme-bg-accent rounded-full border-2 border-slate-900" />
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotifOpen && (
              <div className="absolute left-0 mt-2 w-72 glass-modal rounded-2xl shadow-xl border border-slate-300/40 p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/40">
                  <span className="font-bold text-xs uppercase opacity-70">Notifications</span>
                  <span className="text-xs bg-emerald-500/10 theme-text-accent font-bold px-2 py-0.5 rounded-full border theme-border-accent">
                    {unreadNotifsCount} new
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {!Array.isArray(notifications) || notifications.length === 0 ? (
                    <p className="text-xs opacity-60 py-4 text-center">No notifications yet</p>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2.5 rounded-xl text-xs cursor-pointer transition ${n.read ? 'opacity-60 bg-black/5 dark:bg-white/5' : 'glass-card font-semibold border border-slate-300/40'}`}
                      >
                        <p>{n.message}</p>
                        <span className="text-[10px] opacity-60 mt-1 block">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Quick Badges */}
        {profile && (
          <div className="px-5 py-3.5 border-b border-slate-300/30 flex items-center justify-between text-xs font-semibold bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-1.5 text-amber-500">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>{profile.streak} Day Streak</span>
            </div>
            <div className="flex items-center gap-1.5 theme-text-accent">
              <Award className="w-4 h-4" />
              <span>{profile.wellness_points} Pts</span>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'theme-gradient-btn text-white shadow-sm'
                    : 'opacity-85 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Minda AI Button in Sidebar */}
        <div className="p-4 border-t border-white/10 bg-transparent">
          <button
            onClick={triggerMindaModal}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 theme-gradient-btn text-white font-bold rounded-2xl shadow-lg transition scale-100 hover:scale-[1.02]"
          >
            <Bot className="w-5 h-5 text-white" />
            <span>Ask Minda AI</span>
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-panel text-white flex items-center justify-between px-4 z-40 border-b border-white/10 shadow-lg">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl theme-gradient-btn flex items-center justify-center text-white shadow-sm">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">MindRelax</span>
        </NavLink>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-white/10 relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 theme-bg-accent rounded-full border-2 border-slate-900" />
            )}
          </button>

          <button
            onClick={triggerMindaModal}
            className="flex items-center gap-1.5 px-3 py-1.5 theme-gradient-btn text-white text-xs font-semibold rounded-full shadow-sm active:scale-95 transition"
          >
            <Bot className="w-4 h-4" />
            <span>Minda</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/5 border border-white/10"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE NOTIFICATION MODAL */}
      {isNotifOpen && (
        <div className="lg:hidden fixed inset-x-4 top-18 z-50 glass-modal text-slate-100 rounded-2xl shadow-2xl border border-white/15 p-4 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <span className="font-bold text-xs uppercase text-slate-400">Notifications</span>
            <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {!Array.isArray(notifications) || notifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No notifications yet</p>
            ) : (
              notifications.slice(0, 5).map(n => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-3 rounded-xl text-xs cursor-pointer transition ${n.read ? 'bg-slate-900/40 text-slate-400' : 'bg-white/10 text-white font-medium border theme-border-accent'}`}
                >
                  <p>{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MOBILE DRAWER OVERLAY & PANEL */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0 bg-slate-900/10 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative z-10 glass-modal border-b border-slate-200 pt-20 p-6 flex flex-col justify-between max-h-[85vh] overflow-y-auto animate-in slide-in-from-top duration-300 shadow-xl text-slate-900">
            <div className="space-y-3">
              <div className="pb-3 mb-1 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>EXPLORE MINDRELAX</span>
                {profile && (
                  <span className="theme-text-accent bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {profile.wellness_points} Points
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {navItems.map(item => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 p-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
                        isActive ? 'theme-gradient-btn text-white shadow-sm' : 'glass-card text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0 theme-text-accent" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  triggerMindaModal();
                }}
                className="w-full py-3.5 theme-gradient-btn text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition text-sm"
              >
                <Bot className="w-5 h-5 text-white" />
                <span>Ask Minda AI Assistant</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-slate-200 px-2 py-2 flex items-center justify-around z-30 shadow-lg">
        {primaryMobileNav.map(item => {
          if (item.path === '#more') {
            return (
              <button
                key={item.name}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex flex-col items-center justify-center p-1.5 text-slate-500 hover:text-slate-900 transition"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium mt-0.5">{item.name}</span>
              </button>
            );
          }
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-1.5 transition ${
                  isActive ? 'theme-text-accent font-bold scale-105' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-0.5">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* FLOATING ASK MINDA BUTTON FOR ALL SCREENS */}
      <button
        onClick={triggerMindaModal}
        className="fixed bottom-20 lg:bottom-8 right-4 sm:right-6 z-40 group flex items-center gap-2.5 bg-white/95 hover:bg-white text-slate-900 px-4 py-2.5 rounded-full shadow-lg transition hover:scale-[1.03] active:scale-95 border border-slate-300"
        aria-label="Ask Minda AI"
      >
        <div className="p-1 rounded-full bg-emerald-50 theme-text-accent border border-emerald-200">
          <Bot className="w-4 h-4 text-emerald-600" />
        </div>
        <span className="font-bold text-xs sm:text-sm tracking-tight pr-1 text-slate-800">Ask Minda</span>
      </button>
    </>
  );
};
