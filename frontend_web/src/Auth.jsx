import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Building2, UserCircle2, ArrowRight, Sparkles, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
    const { i18n } = useTranslation();
    const changeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
    };
    return (
        <div className="absolute top-6 right-6 flex items-center gap-2 bg-gray-900/50 border border-white/10 rounded-xl px-3 py-2 shadow-inner z-50 backdrop-blur-md">
            <Globe size={16} className="text-gray-400" />
            <select 
                onChange={changeLanguage} 
                value={i18n.language || 'en'} 
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer w-full tracking-wider font-bold uppercase appearance-none ml-1"
            >
                <option value="en" className="bg-gray-900 text-white">English</option>
                <option value="hi" className="bg-gray-900 text-white">Hindi (हिंदी)</option>
                <option value="gu" className="bg-gray-900 text-white">Gujarati (ગુજરાતી)</option>
                <option value="mr" className="bg-gray-900 text-white">Marathi (मराठी)</option>
            </select>
        </div>
    );
};

const AuthHub = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isEntity, setIsEntity] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulated API Auth Request
    setTimeout(() => {
      setIsLoading(false);
      if (isEntity) {
          navigate('/entity');
      } else {
          navigate('/dashboard');
      }
    }, 1500);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 font-sans selection:bg-purple-500/30 selection:text-white overflow-hidden relative text-white">
      
      <LanguageSelector />

      {/* Aurora Ambient Background (Auth Specific) */}
      <div className="fixed top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-purple-900/40 rounded-full blur-3xl pointer-events-none mix-blend-screen opacity-70"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-900/40 rounded-full blur-3xl pointer-events-none mix-blend-screen opacity-60"></div>

      <div className="w-full h-full min-h-screen flex items-center justify-center p-4 sm:p-8 relative z-10 w-full">
        <motion.div 
            layout
            transition={{ type: "spring", stiffness: 90, damping: 25 }}
            className={`w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col-reverse lg:flex-row relative z-20`}
        >
          
          {/* Form Section */}
          <div className="w-full lg:w-1/2 p-8 sm:p-14 xl:p-20 relative z-20 flex flex-col justify-center">
            
            <motion.div layout="position" className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                   <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 p-2.5 rounded-2xl border border-white/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                      <Sparkles size={28} className="text-white" strokeWidth={1.5} />
                   </div>
                   <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{t('app.title')}</h1>
                </div>

                <AnimatePresence mode="popLayout">
                    <motion.h2 
                        key={isLogin ? "login" : "register"}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4 }}
                        className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight"
                    >
                        {isLogin ? t('auth.welcome') : t('auth.create_account')}
                    </motion.h2>
                </AnimatePresence>
                <p className="text-gray-400 text-sm mt-2">
                    {isLogin ? "Authenticate to access your secure portal." : "Setup a new account to begin your journey."}
                </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <AnimatePresence>
                  {!isLogin && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} 
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden space-y-5"
                      >
                         <div>
                           <label className="block text-xs font-semibold text-gray-400 uppercase tracking-[0.1em] mb-2">Account Type</label>
                           <div className="flex bg-gray-900/50 border border-white/10 rounded-xl p-1 shadow-inner">
                               <button type="button" onClick={() => setIsEntity(false)} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${!isEntity ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}>
                                  Personal
                               </button>
                               <button type="button" onClick={() => setIsEntity(true)} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${isEntity ? 'bg-white/10 text-cyan-400 shadow-sm border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}>
                                  <Building2 size={16}/> Clinic / Org
                               </button>
                           </div>
                         </div>

                         <div>
                           <label className="block text-xs font-semibold text-gray-400 uppercase tracking-[0.1em] mb-2">{isEntity ? "Organization Name" : "Full Name"}</label>
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                {isEntity ? (
                                    <Building2 className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                                ) : (
                                    <UserCircle2 className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                )}
                              </div>
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-inner"
                                placeholder={isEntity ? "Mindful Care Partners" : "Jane Doe"}
                                required={!isLogin}
                              />
                            </div>
                         </div>
                      </motion.div>
                  )}
               </AnimatePresence>

              <motion.div layout="position">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-[0.1em] mb-2">{t('auth.email')}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-inner"
                    placeholder="user@mindai.app"
                    required
                  />
                </div>
              </motion.div>

              <motion.div layout="position">
                 <div className="flex justify-between items-center mb-2">
                   <label className="block text-xs font-semibold text-gray-400 uppercase tracking-[0.1em]">{t('auth.password')}</label>
                   {isLogin && <button type="button" className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors">Forgot Password?</button>}
                 </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-inner"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </motion.div>

              <AnimatePresence>
                  {!isLogin && (
                      <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto', marginTop: 24 }} 
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="overflow-hidden"
                      >
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-[0.1em] mb-2">Confirm {t('auth.password')}</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                          </div>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-inner"
                            placeholder="••••••••"
                            required={!isLogin}
                          />
                        </div>
                      </motion.div>
                  )}
              </AnimatePresence>

              <motion.div layout="position" className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {isLogin ? t('auth.login') : t('auth.register')} <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div layout="position" className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                {isLogin ? "Need an account? " : "Already have an account? "}
                <button onClick={toggleMode} className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                  {isLogin ? t('auth.register') : t('auth.login')}
                </button>
              </p>
            </motion.div>

          </div>

          {/* Graphical/Branding Section - Aurora Glass */}
          <motion.div 
             layout="position"
             className="w-full lg:w-1/2 relative bg-gray-900/30 min-h-[300px] lg:min-h-auto flex items-center justify-center p-8 overflow-hidden z-10 lg:border-l border-white/10 flex-col"
          >
              <AnimatePresence mode="wait">
                  <motion.div
                      key={isLogin ? 'login-graphic' : 'register-graphic'}
                      initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                      exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="relative z-10 w-full max-w-sm flex flex-col items-center selection:bg-transparent"
                  >
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-8 border border-white/20 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                          <Sparkles className="text-white" size={40} strokeWidth={1.5} />
                      </div>
                      
                      <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 text-center mb-4 tracking-tight">
                          {t('app.title')}
                      </h3>
                      <p className="text-gray-400 text-center text-sm leading-relaxed max-w-[280px]">
                          {isLogin 
                            ? "Securely access your records and daily tracking."
                            : "Start your journey towards better mental wellness."
                          }
                      </p>
                  </motion.div>
              </AnimatePresence>
          </motion.div>
          
        </motion.div>
      </div>
    </div>
  );
};

export const Login = AuthHub;
export const Register = AuthHub;
