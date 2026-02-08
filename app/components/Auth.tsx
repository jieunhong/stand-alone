import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'signin') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success('로그인되었습니다!');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL,
                    }
                });
                if (error) throw error;
                toast.success('회원가입이 완료되었습니다! 이메일을 확인해주세요.');
            }
        } catch (error: any) {
            toast.error(error.message || '오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] via-[#F8F9FA] to-[#E8F5E9] flex items-center justify-center px-5 max-w-md mx-auto relative overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            {/* Background Decor */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #A8E6A3 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="relative bg-white/80 backdrop-blur-md rounded-[32px] shadow-2xl p-8 border-2 border-white/50 w-full animate-in fade-in zoom-in duration-500">
                <div className="flex items-center justify-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] rounded-[22px] flex items-center justify-center shadow-lg">
                        {mode === 'signin' ? (
                            <LogIn className="w-8 h-8 text-white" />
                        ) : (
                            <UserPlus className="w-8 h-8 text-white" />
                        )}
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                    {mode === 'signin' ? '반가워요!' : '환영합니다!'}
                </h1>
                <p className="text-center text-gray-500 text-sm mb-8 leading-relaxed">
                    {mode === 'signin'
                        ? '계정에 로그인하고 여정을 이어가세요'
                        : '새로운 시작을 위한 계정을 만들어보세요'}
                </p>

                <form onSubmit={handleAuth} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">이메일</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="example@email.com"
                                className="w-full pl-11 pr-4 py-3.5 bg-white/90 border-2 border-gray-100 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-[#A8E6A3] focus:border-transparent text-base transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">비밀번호</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full pl-11 pr-4 py-3.5 bg-white/90 border-2 border-gray-100 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-[#A8E6A3] focus:border-transparent text-base transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-[24px] font-bold text-white transition-all duration-300 text-sm shadow-xl mt-4 ${loading
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#A8E6A3] to-[#7DD87D] hover:shadow-2xl hover:scale-[1.02] active:scale-95'
                            }`}
                    >
                        {loading ? '처리 중...' : mode === 'signin' ? '로그인' : '회원가입'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <button
                        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        className="text-sm text-gray-500 hover:text-[#7DD87D] transition-colors font-medium"
                    >
                        {mode === 'signin'
                            ? '아직 계정이 없으신가요? 회원가입'
                            : '이미 계정이 있으신가요? 로그인'}
                    </button>
                </div>
            </div>
        </div>
    );
}
