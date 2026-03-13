import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Survey = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(20).fill(null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Dynamically load the 20 questions from i18n
  const questions = Array.from({length: 20}, (_, i) => t(`survey.q${i+1}`));

  const progress = ((currentIndex) / questions.length) * 100;
  const isFinalQuestion = currentIndex === questions.length - 1;

  // Simplify OPTIONS dynamically based on translation
  const getOptions = () => [
    { value: 1, label: t('survey.opts_bad'), color: "hover:bg-pink-500/10 hover:text-pink-400 hover:border-pink-500/30", selected: "bg-pink-500/20 text-pink-400 border-pink-500 shadow-[0_0_15px_rgba(244,114,182,0.3)] font-semibold backdrop-blur-sm" },
    { value: 3, label: t('survey.opts_neutral'), color: "hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30", selected: "bg-purple-500/20 text-purple-400 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)] font-semibold backdrop-blur-sm" },
    { value: 5, label: t('survey.opts_good'), color: "hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30", selected: "bg-cyan-500/20 text-cyan-400 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] font-semibold backdrop-blur-sm" },
  ];

  const handleSelect = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = value;
    setAnswers(newAnswers);

    if (!isFinalQuestion) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 500);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCompleted(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    }, 1500);
  };

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
        >
          <CheckCircle size={80} strokeWidth={1.5} />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2 tracking-tight"
        >
          {t('app.title')} - Done!
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 text-base"
        >
          Your answers are saved successfully.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pt-8 pb-16 px-4 sm:px-0 relative font-sans text-white z-10">
      <div className="mb-10 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mb-4 border border-white/20 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
             <Sparkles className="text-white" size={28} strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{t('survey.title')}</h1>
        <p className="text-gray-400 mt-2 text-sm md:text-md uppercase tracking-wider">{t('survey.subtitle')}</p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden relative min-h-[400px] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Progress Bar (Aurora) */}
        <div className="w-full h-1.5 bg-gray-900 absolute top-0 left-0 border-b border-white/5">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>

        <div className="p-8 sm:p-12 h-full flex flex-col justify-center relative">
          
          <div className="mb-6 text-purple-400 font-semibold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
            Question {currentIndex + 1} // {questions.length}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ x: 20, opacity: 0, filter: "blur(4px)" }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ x: -20, opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex-1"
            >
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-12 leading-snug tracking-tight">
                {questions[currentIndex]}
              </h2>

              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                {getOptions().map((opt) => {
                  const isSelected = answers[currentIndex] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      className={`flex-1 py-4 px-2 rounded-2xl text-sm border transition-all duration-300 ${
                        isSelected 
                          ? opt.selected 
                          : `border-white/5 bg-white/5 text-gray-400 hover:border-white/20 backdrop-blur-md ${opt.color}`
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="mt-16 flex justify-between items-center pt-2">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="text-gray-500 hover:text-gray-300 text-xs font-semibold uppercase tracking-[0.1em] transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              Back
            </button>

            {isFinalQuestion ? (
               <AnimatePresence>
                 {answers[currentIndex] !== null && (
                   <motion.button
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     onClick={handleSubmit}
                     disabled={isSubmitting}
                     className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white px-8 py-3.5 rounded-xl font-bold tracking-wide text-xs transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-50 border border-transparent"
                   >
                     {isSubmitting ? 'Saving...' : t('survey.submit')}
                     {!isSubmitting && <ArrowRight size={18} strokeWidth={2} />}
                   </motion.button>
                 )}
               </AnimatePresence>
            ) : (
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={answers[currentIndex] === null}
                  className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-[0.1em] uppercase hover:text-cyan-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Skip
                </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
