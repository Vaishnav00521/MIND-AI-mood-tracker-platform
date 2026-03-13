import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app": {
        "title": "MindAI"
      },
      "nav": {
        "dashboard": "Dashboard",
        "survey": "Daily Check-in",
        "habits": "Habits",
        "calendar": "Calendar",
        "ai_chat": "AI Chat",
        "privacy": "Privacy"
      },
      "auth": {
        "welcome": "Welcome Back",
        "create_account": "Create Account",
        "email": "Email Address",
        "password": "Password",
        "login": "Login",
        "register": "Register"
      },
      "survey": {
        "title": "Daily Check-in",
        "subtitle": "How was your day? Answer a few simple questions.",
        "submit": "Save My Answers",
        "q1": "How did you sleep last night?",
        "q2": "Did you feel stressed today?",
        "q3": "Did you eat healthy meals today?",
        "q4": "How was your energy level today?",
        "q5": "Did you get some exercise or go for a walk?",
        "q6": "Did you talk to a friend or family member today?",
        "q7": "How is your mood right now?",
        "q8": "Did you have trouble focusing on your work today?",
        "q9": "Did you do something you enjoy today?",
        "q10": "Are you feeling worried about tomorrow?",
        "q11": "Did you drink enough water today?",
        "q12": "Did you feel angry or irritable today?",
        "q13": "Did you spend too much time on your phone?",
        "q14": "Did you feel tired during the day?",
        "q15": "Were you able to relax this evening?",
        "q16": "Did you feel lonely today?",
        "q17": "Did something make you smile today?",
        "q18": "How is your physical health today?",
        "q19": "Did you take any breaks while working?",
        "q20": "Overall, was today a good day?",
        "opts_good": "Very Good / Yes",
        "opts_neutral": "Okay / Sometimes",
        "opts_bad": "Bad / No"
      },
      "dashboard": {
        "greeting": "Hello, how are you today?",
        "mood_score": "Current Mood",
        "completion": "Check-in Status",
        "streak": "Day Streak",
        "chart_title": "My Mood History"
      }
    }
  },
  hi: {
    translation: {
       "app": {
        "title": "माइंड एआई (MindAI)"
      },
      "nav": {
        "dashboard": "डैशबोर्ड",
        "survey": "दैनिक जांच (Check-in)",
        "habits": "आदतें",
        "calendar": "कैलेंडर",
        "ai_chat": "एआई चैट",
        "privacy": "गोपनीयता"
      },
      "auth": {
        "welcome": "वापसी पर स्वागत है",
        "create_account": "खाता बनाएं",
        "email": "ईमेल पता",
        "password": "पासवर्ड",
        "login": "लॉग इन करें",
        "register": "रजिस्टर करें"
      },
      "survey": {
        "title": "दैनिक जांच (Daily Check-in)",
        "subtitle": "आपका दिन कैसा रहा? कुछ सरल सवालों के जवाब दें।",
        "submit": "मेरे जवाब सहेजें",
        "q1": "पिछली रात को आपको कैसी नींद आई?",
        "q2": "क्या आज आपको तनाव महसूस हुआ?",
        "q3": "क्या आज आपने स्वस्थ भोजन खाया?",
        "q4": "आज आपकी ऊर्जा (Energy) का स्तर कैसा था?",
        "q5": "क्या आज आपने कोई व्यायाम किया या टहलने गए?",
        "q6": "क्या आज आपने किसी दोस्त या परिवार के सदस्य से बात की?",
        "q7": "अभी आपका मूड कैसा है?",
        "q8": "क्या आज आपको अपने काम पर ध्यान केंद्रित करने में परेशानी हुई?",
        "q9": "क्या आज आपने कुछ ऐसा किया जिसका आपने आनंद लिया?",
        "q10": "क्या आप कल के बारे में चिंतित महसूस कर रहे हैं?",
        "q11": "क्या आज आपने पर्याप्त पानी पिया?",
        "q12": "क्या आज आपको गुस्सा या चिड़चिड़ापन महसूस हुआ?",
        "q13": "क्या आपने आज अपने फोन पर बहुत ज्यादा समय बिताया?",
        "q14": "क्या आपको दिन के दौरान थकान महसूस हुई?",
        "q15": "क्या आप इस शाम आराम कर पाए?",
        "q16": "क्या आज आपको अकेलापन महसूस हुआ?",
        "q17": "क्या आज किसी बात ने आपको मुस्कुराया?",
        "q18": "आज आपका शारीरिक स्वास्थ्य कैसा है?",
        "q19": "क्या काम करते समय आपने कोई ब्रेक लिया?",
        "q20": "कुल मिलाकर, क्या आज का दिन अच्छा रहा?",
        "opts_good": "बहुत अच्छा / हाँ",
        "opts_neutral": "ठीक है / कभी-कभी",
        "opts_bad": "खराब / नहीं"
      },
      "dashboard": {
        "greeting": "नमस्ते, आज आप कैसे हैं?",
        "mood_score": "वर्तमान मूड",
        "completion": "जांच की स्थिति",
        "streak": "लगातार दिन",
        "chart_title": "मेरा मूड इतिहास"
      }
    }
  },
  gu: {
    translation: {
      "app": {
        "title": "માઇન્ડ એઆઇ (MindAI)"
      },
      "nav": {
        "dashboard": "ડેશબોર્ડ",
        "survey": "રોજિંદી તપાસ (Check-in)",
        "habits": "આદતો",
        "calendar": "કેલેન્ડર",
        "ai_chat": "એઆઇ ચેટ",
        "privacy": "ગોપનીયતા"
      },
      "auth": {
        "welcome": "ફરી સ્વાગત છે",
        "create_account": "ખાતું બનાવો",
        "email": "ઇમેઇલ સરનામું",
        "password": "પાસવર્ડ",
        "login": "લોગિન કરો",
        "register": "રજીસ્ટર કરો"
      },
      "survey": {
        "title": "રોજિંદી તપાસ (Daily Check-in)",
        "subtitle": "તમારો દિવસ કેવો રહ્યો? થોડા સરળ પ્રશ્નોના જવાબ આપો.",
        "submit": "મારા જવાબો સાચવો",
        "q1": "ગઈકાલે રાત્રે તમને કેવી ઊંઘ આવી?",
        "q2": "શું તમને આજે તણાવ અનુભવાયો?",
        "q3": "શું આજે તમે સ્વસ્થ ખોરાક ખાધો?",
        "q4": "આજે તમારી ઉર્જાનું સ્તર કેવું હતું?",
        "q5": "શું આજે તમે કોઈ કસરત કરી અથવા ચાલવા ગયા?",
        "q6": "શું આજે તમે કોઈ મિત્ર અથવા પરિવારના સભ્ય સાથે વાત કરી?",
        "q7": "અત્યારે તમારો મૂડ કેવો છે?",
        "q8": "શું આજે તમને તમારા કામ પર ધ્યાન કેન્દ્રિત કરવામાં તકલીફ પડી?",
        "q9": "શું આજે તમે કંઈક એવું કર્યું જેનો તમને આનંદ આવ્યો?",
        "q10": "શું તમે કાલ વિશે ચિંતિત છો?",
        "q11": "શું આજે તમે પૂરતું પાણી પીધું?",
        "q12": "શું આજે તમને ગુસ્સો આવ્યો?",
        "q13": "શું આજે તમે તમારા ફોન પર ખૂબ સમય વિતાવ્યો?",
        "q14": "શું તમને દિવસ દરમિયાન થાક લાગ્યો?",
        "q15": "શું તમે આ સાંજે આરામ કરી શક્યા?",
        "q16": "શું આજે તમને એકલતા અનુભવાઈ?",
        "q17": "શું આજે કોઈ બાબતે તમને હસાવ્યા?",
        "q18": "આજે તમારું શારીરિક સ્વાસ્થ્ય કેવું છે?",
        "q19": "શું કામ કરતી વખતે તમે કોઈ વિરામ લીધો?",
        "q20": "એકંદરે, શું આજનો દિવસ સારો હતો?",
        "opts_good": "ખૂબ સારું / હા",
        "opts_neutral": "ઠીક છે / ક્યારેક",
        "opts_bad": "ખરાબ / ના"
      },
      "dashboard": {
        "greeting": "નમસ્તે, આજે તમે કેમ છો?",
        "mood_score": "વર્તમાન મૂડ",
        "completion": "તપાસની સ્થિતિ",
        "streak": "સળંગ દિવસો",
        "chart_title": "મારો મૂડ ઇતિહાસ"
      }
    }
  },
  mr: {
    translation: {
       "app": {
        "title": "माईंड एआय (MindAI)"
      },
      "nav": {
        "dashboard": "डॅशबोर्ड",
        "survey": "दैनिक तपासणी (Check-in)",
        "habits": "सवयी",
        "calendar": "कॅलेंडर",
        "ai_chat": "एआय चॅट",
        "privacy": "गोपनीयता"
      },
      "auth": {
        "welcome": "आपले स्वागत आहे",
        "create_account": "खाते तयार करा",
        "email": "ईमेल पत्ता",
        "password": "पासवर्ड",
        "login": "लॉग इन करा",
        "register": "नोंदणी करा"
      },
      "survey": {
        "title": "दैनिक तपासणी (Daily Check-in)",
        "subtitle": "तुमचा दिवस कसा गेला? काही सोप्या प्रश्नांची उत्तरे द्या.",
        "submit": "माझी उत्तरे जतन करा",
        "q1": "काल रात्री तुम्हाला कशी झोप लागली?",
        "q2": "आज तुम्हाला तणाव जाणवला का?",
        "q3": "आज तुम्ही निरोगी अन्न खाल्ले का?",
        "q4": "आज तुमची उर्जा (Energy) पातळी कशी होती?",
        "q5": "आज तुम्ही व्यायाम केलात किंवा चालायला गेलात का?",
        "q6": "आज तुम्ही एखाद्या मित्राशी किंवा कुटुंबातील सदस्याशी बोललात का?",
        "q7": "सध्या तुमचा मूड कसा आहे?",
        "q8": "आज तुम्हाला तुमच्या कामावर लक्ष केंद्रित करण्यात अडचण आली का?",
        "q9": "तुम्हाला आवडेल असे काही तुम्ही आज केले का?",
        "q10": "तुम्हाला उद्याबद्दल काळजी वाटते का?",
        "q11": "आज तुम्ही पुरेसे पाणी प्यायले का?",
        "q12": "आज तुम्हाला राग किंवा चिडचिड जाणवली का?",
        "q13": "आज तुम्ही मोबाईलवर जास्त वेळ घालवला का?",
        "q14": "आज दिवसा तुम्हाला थकवा जाणवला का?",
        "q15": "आज संध्याकाळी तुम्हाला आराम करता आला का?",
        "q16": "आज तुम्हाला एकटेपणा जाणवला का?",
        "q17": "आज कोणत्या गोष्टीमुळे तुमच्या चेहऱ्यावर हास्य आले का?",
        "q18": "आज तुमचे शारीरिक आरोग्य कसे आहे?",
        "q19": "काम करताना तुम्ही थोडी विश्रांती घेतली का?",
        "q20": "एकंदरीत, आजचा दिवस चांगला गेला का?",
        "opts_good": "खूप छान / होय",
        "opts_neutral": "ठीक आहे / कधीकधी",
        "opts_bad": "वाईट / नाही"
      },
      "dashboard": {
        "greeting": "नमस्कार, आज तुम्ही कसे आहात?",
        "mood_score": "सध्याचा मूड",
        "completion": "तपासणी स्थिती",
        "streak": "सलग दिवस",
        "chart_title": "माझा मूड इतिहास"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
