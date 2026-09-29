import base64
import os
import sys
import re
from pathlib import Path
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
ROOT_DIR = BACKEND_DIR.parent
for p in [str(ROOT_DIR), str(BACKEND_DIR), str(CURRENT_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

HAS_GENAI = False
try:
    from google import genai
    HAS_GENAI = True
except ImportError:
    try:
        import google.generativeai as genai_legacy
        HAS_GENAI = "legacy"
    except ImportError:
        HAS_GENAI = False

class DialogflowVoiceAgent:
    """
    Multilingual Empathetic & Human-Interactive Voice AI Assistant for VayuKavach-360.
    Answers emergency and conversational queries in Odia (ଓଡ଼ିଆ), Bengali (বাংলা),
    Telugu (తెలుగు), Hindi (हिन्दी), Gujarati (ગુજરાતી), and English.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        self.client = None
        if self.api_key:
            if HAS_GENAI is True:
                try:
                    self.client = genai.Client(api_key=self.api_key)
                except Exception as e:
                    print(f"[Dialogflow Agent Init] {e}")
            elif HAS_GENAI == "legacy":
                try:
                    genai_legacy.configure(api_key=self.api_key)
                    self.client = "legacy"
                except Exception as e:
                    print(f"[Dialogflow Legacy Init] {e}")

    def process_query(self, user_text: str, language_code: str = "en") -> Dict[str, Any]:
        """
        Processes citizen, disaster officer, or visitor voice queries and generates
        a human-interactive regional response script + synthetic audio.
        """
        lang_names = {
            "or": "Odia (ଓଡ଼ିଆ)",
            "bn": "Bengali (বাংলা)",
            "te": "Telugu (తెలుగు)",
            "hi": "Hindi (हिन्दी)",
            "gu": "Gujarati (ગુજરાતી)",
            "en": "English"
        }
        target_lang = lang_names.get(language_code, "English")
        clean_query = (user_text or "").strip()
        if not clean_query:
            clean_query = "Hello"

        # 1. Use Gemini for natural, warm, empathetic multilingual voice generation
        ai_response_text = None
        if self.client:
            prompt = f"""
            You are 'VayuKavach Sahayak', the official interactive multilingual Voice AI Copilot for VayuKavach-360 — a Google AI-powered coastal cyclone resilience and pre-landfall disaster management platform.
            
            Target Language: {target_lang} (Language Code: {language_code}).
            
            CONTEXT & PLATFORM TELEMETRY:
            - Project: VayuKavach-360 Coastal Pre-Landfall Resilience Twin.
            - Active Storm: Super Cyclone VAYU-KAVACH (Extremely Severe Cyclonic Storm, 213 km/h winds, 4.2m predicted storm surge, estimated landfall in ~41 hours).
            - Nearest Safe Shelter: Kendrapara High-Ground Emergency Complex #14 (Elev: 6.8m AMSL, 330 beds available, solar microgrid, medical triage).
            - Submerged Infrastructure: NH-53 Bridge across Mahanadi Estuary is submerged under 2.4m surge water (impassable).
            - Safe Evacuation Route: Kendrapara Ridge Bypass Corridor (Min Elev: 5.8m AMSL).
            - Parametric Relief Grants: ₹25 Lakhs per coastal Panchayat auto-approved for pre-landfall relief.
            - Emergency Helplines: NDRF (1078), ODRAF / SDMA (1070), National Emergency Hotline (112).
            
            User Said: "{clean_query}"
            
            STRICT BEHAVIORAL GUIDELINES:
            1. GREETINGS (e.g. "hi", "hello", "hey", "namaste", "good morning", "how are you"):
               - Greet warmly, politely, and naturally in {target_lang}.
               - Introduce yourself briefly as the VayuKavach Emergency Voice Assistant.
               - Ask how you can assist them today with cyclone updates, shelter finding, flood maps, safe evacuation routes, or relief funds.
               - DO NOT output an alarming warning or sudden emergency disaster alert for a simple greeting!
            2. IDENTITY & ABOUT QUESTIONS (e.g. "who are you", "what is this project", "what can you do"):
               - Explain warmly that you are VayuKavach-360's voice assistant designed to help coastal citizens and disaster response teams with 48-hour pre-landfall storm surge tracking, high-ground shelters, safe routes, and emergency funding.
            3. SPECIFIC EMERGENCY QUERIES (shelters, routes, funds, storm status, helplines):
               - Give a clear, helpful, reassuring 2-sentence answer in {target_lang}.
            4. GRATITUDE & CLOSINGS (e.g. "thank you", "thanks", "bye"):
               - Respond kindly, wishing them safety and offering further assistance.
            
            Output ONLY the spoken response text in {target_lang} (using native script). Keep it natural, human-friendly, and concise.
            """
            try:
                if HAS_GENAI is True and self.client != "legacy":
                    res = self.client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=prompt
                    )
                    if res and res.text:
                        ai_response_text = res.text.strip()
                elif self.client == "legacy":
                    model = genai_legacy.GenerativeModel('gemini-1.5-flash')
                    res = model.generate_content(prompt)
                    if res and res.text:
                        ai_response_text = res.text.strip()
            except Exception as e:
                print(f"[Dialogflow Gemini Gen Notice] {e}")

        # 2. Rich, Empathetic Human-Interactive Fallback (when offline or API key absent)
        if not ai_response_text:
            text_lower = clean_query.lower()

            # A. Greetings & Well-being
            is_greeting = bool(re.search(
                r'\b(hi|hello|hey|hola|namaste|namaskar|pranam|kem cho|kemon acho|vanakkam|namaskaram|good morning|good evening|good afternoon|how are you|how do you do|sup|what\'s up|helo|hii+|hlo)\b',
                text_lower
            )) or clean_query in ["ନମସ୍କାର", "ହାଲୋ", "নমস্কার", "হ্যালো", "నమస్కారం", "హలో", "नमस्ते", "नमस्कार", "હેલો", "નમસ્તે"]

            # B. Identity & Capabilities
            is_identity = bool(re.search(
                r'\b(who are you|what is this|what is vayukavach|what can you do|about you|tell me about|your name|who r u|introduce|features)\b',
                text_lower
            )) or "କିଏ" in text_lower or "কে" in text_lower or "ఎవరు" in text_lower or "कौन हो" in text_lower

            # C. Shelter inquiries
            is_shelter = bool(re.search(
                r'\b(shelter|safe|safe place|stay|refuge|camp|ashray|sharan)\b',
                text_lower
            )) or any(k in text_lower for k in ["ଆଶ୍ରୟ", "ସୁରକ୍ଷିତ", "आश्रय", "राहत शिविर", "আশ্রয়", "নিরাপদ", "ఆశ్రయం", "రక్షణ"])

            # D. Evacuation route / road status
            is_route = bool(re.search(
                r'\b(route|road|bridge|nh-53|nh53|bypass|highway|path|evacuat|traffic|travel)\b',
                text_lower
            )) or any(k in text_lower for k in ["ରାସ୍ତା", "ସେତୁ", "मार्ग", "पुल", "रास्ता", "রাস্তা", "সেতু", "దారి", "వంతెన"])

            # E. Money / Parametric Relief Grant
            is_money = bool(re.search(
                r'\b(money|fund|grant|payout|relief|lakh|dbt|compensation|financial|cash)\b',
                text_lower
            )) or any(k in text_lower for k in ["ଟଙ୍କା", "ଫଣ୍ଡ", "अनुदान", "पैसा", "राहत राशि", "টাকা", "অনুদান", "డబ్బు", "నిధులు"])

            # F. Weather / Cyclone tracking
            is_weather = bool(re.search(
                r'\b(cyclone|storm|weather|rain|wind|speed|surge|landfall|forecast|status|update|vayu)\b',
                text_lower
            )) or any(k in text_lower for k in ["ବାତ୍ୟା", "ପବନ", "ঝড়", "বৃষ্টি", "తుఫాను", "గాలి", "चक्रवात", "तूफान", "हवा", "વાવાઝોડું"])

            # G. Emergency Contacts & Helpline
            is_helpline = bool(re.search(
                r'\b(helpline|help line|emergency number|contact|call|phone|police|ndrf|odraf|ambulance)\b',
                text_lower
            )) or any(k in text_lower for k in ["ହେଲ୍ପଲାଇନ", "ନମ୍ବର", "हेल्पलाइन", "नंबर", "ফোন", "హెల్ప్‌లైన్"])

            # H. Gratitude / Closing
            is_thanks = bool(re.search(
                r'\b(thank|thanks|dhanyabad|dhanyawad|shukriya|great|awesome|good job|nice|ok|okay|bye)\b',
                text_lower
            )) or any(k in text_lower for k in ["ଧନ୍ୟବାଦ", "धन्यवाद", "ধন্যবাদ", "ధన్యవాదాలు", "આભાર"])

            if is_greeting:
                ai_response_text = {
                    "or": "ନମସ୍କାର! ମୁଁ ବାୟୁକବଚ-୩୬୦ ର ଜରୁରୀକାଳୀନ ଭଏସ ସହାୟକ। ଆପଣଙ୍କୁ ବାତ୍ୟା ଟ୍ରାକିଂ, ନିକଟସ୍ଥ ସୁରକ୍ଷିତ ଆଶ୍ରୟସ୍ଥଳ, ରାସ୍ତା ରୂଟ କିମ୍ବା ରିଲିଫ ଫଣ୍ଡ ବିଷୟରେ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
                    "bn": "নমস্কার! আমি বায়ুকবচ-৩৬০ এর জরুরি ভয়েস সহায়ক। সাইক্লোন ট্র্যাকিং, নিকটতম নিরাপদ আশ্রয়স্থল, সড়ক রুট বা ত্রাণ তহবিল সম্পর্কে আপনাকে কীভাবে সাহায্য করতে পারি?",
                    "te": "నమస్కారం! నేను వాయుకవచ్-360 అత్యవసర వాయిస్ అసిస్టెంట్‌ని. తుఫాను వివరాలు, సురక్షిత పునరావాస కేంద్రాలు, తరలింపు మార్గాలు లేదా నిధుల గురించి నేను మీకు ఎలా సహాయపడగలను?",
                    "hi": "नमस्ते! मैं वायु कवच-360 का आपातकालीन वॉयस असिस्टेंट हूँ। मैं चक्रवात ट्रैकिंग, नजदीकी सुरक्षित आश्रय, सुरक्षित निकासी मार्ग और राहत फंड में आपकी क्या मदद कर सकता हूँ?",
                    "gu": "નમસ્તે! હું વાયુ કવચ-360 ઇમરજન્સી વોઇસ આસિસ્ટન્ટ છું. વાવાઝોડાની સ્થિતિ, સુરક્ષિત આશ્રયસ્થાન, સુરક્ષિત રસ્તો અથવા રાહત ફંડ માટે હું તમને કેવી રીતે મદદ કરી શકું?",
                    "en": "Hello! I am VayuKavach-360's Emergency Voice Assistant. How can I assist you today with cyclone alerts, safe shelter navigation, evacuation routes, or relief funding?"
                }.get(language_code, "Hello! I am VayuKavach-360 Voice Assistant. How can I assist you today with cyclone alerts, safe shelter navigation, evacuation routes, or relief funding?")

            elif is_identity:
                ai_response_text = {
                    "or": "ମୁଁ ବାୟୁକବଚ-୩୬୦ ର ଏଆଇ ସହାୟକ। ଆମ ପ୍ଲାଟଫର୍ମ ବାତ୍ୟା ଲ୍ୟାଣ୍ଡଫଲ୍ ପୂର୍ବରୁ ୪୮ ଘଣ୍ଟା ଆଗୁଆ ବନ୍ୟା ଓ ଢେଉ ଆକଳନ, ସୁରକ୍ଷିତ ରୂଟ୍ ଏବଂ ତୁରନ୍ତ ରିଲିଫ ପ୍ରଦାନ କରିଥାଏ।",
                    "bn": "আমি বায়ুকবচ-৩৬০ এআই ভয়েস সহায়ক। আমাদের সিস্টেম ঘূর্ণিঝড় আঘাত হানার ৪৮ ঘণ্টা পূর্বেই জলোচ্ছ্বাস পূর্বাভাস, নিরাপদ আশ্রয় ও জরুরি সহায়তা নিশ্চিত করে।",
                    "te": "నేను వాయుకవచ్-360 ఏఐ వాయిస్ అసిస్టెంట్‌ని. తీరం దాటే 48 గంటల ముందే తుఫాను ముంపు అంచనా, ఎత్తైన పునరావాస మార్గాలు మరియు తక్షణ నిధులు అందించడమే మా లక్ష్యం.",
                    "hi": "मैं वायु कवच-360 का एआई असिस्टेंट हूँ। हमारा सिस्टम चक्रवात लैंडफॉल से 48 घंटे पहले बाढ़ पूर्वानुमान, सुरक्षित मार्ग और पंचायतों को तत्काल राहत राशि सुनिश्चित करता है।",
                    "gu": "હું વાયુ કવચ-360 નો એઆઈ વોઇસ આસિસ્ટન્ટ છું. અમારો પ્રોજેક્ટ વાવાઝોડાના 48 કલાક પહેલા પૂરની આગાહી અને સુરક્ષિત સ્થળાંતર માટે મદદ કરે છે.",
                    "en": "I am VayuKavach-360's Voice AI Assistant. Our platform empowers coastal communities with 48-hour pre-landfall storm surge prediction, safe high-ground evacuation routing, and automated emergency relief funds."
                }.get(language_code, "I am VayuKavach-360 Voice AI Assistant. We provide 48-hour pre-landfall cyclone prediction, safe shelter routes, and emergency assistance.")

            elif is_shelter:
                ai_response_text = {
                    "or": "ଆପଣଙ୍କ ନିକଟତମ ସୁରକ୍ଷିତ ଆଶ୍ରୟସ୍ଥଳ ହେଉଛି କେନ୍ଦ୍ରାପଡ଼ା ହାଇଗ୍ରାଉଣ୍ଡ ସେଲ୍ଟର #୧୪ (ଉଚ୍ଚତା: ୬.୮ ମିଟର, ୩୩୦ ବେଡ୍ ଉପଲବ୍ଧ)। NH-୫୩ ସେତୁ ବର୍ତ୍ତମାନ ଜଳମଗ୍ନ, କେନ୍ଦ୍ରାପଡ଼ା ରିଜ୍ ଦେଇ ଯାଆନ୍ତୁ।",
                    "bn": "আপনার নিকটতম নিরাপদ আশ্রয়স্থল হলো কেন্দ্রাপাড়া হাই-গ্রাউন্ড শেল্টার #১৪ (উচ্চতা: ৬.৮ মিটার, ৩৩০ বেড প্রস্তুত)। দয়া করে কেন্দ্রাপাড়া রিজ বাইপাস সড়ক ব্যবহার করুন।",
                    "te": "మీకు సమీపంలోని సురక్షిత తుఫాను పునరావాస కేంద్రం కేంద్రపార హై-గ్రౌండ్ షెల్టర్ #14 (ఎత్తు: 6.8 మీటర్లు, 330 బెడ్లు అందుబాటులో ఉన్నాయి). బైపాస్ మార్గం తీసుకోండి.",
                    "hi": "आपका निकटतम सुरक्षित चक्रवात आश्रय केंद्रपाड़ा हाई-ग्राउंड शेल्टर #14 (ऊंचाई: 6.8 मीटर, 330 बेड उपलब्ध) है। NH-53 पुल जलमग्न है, कृपया केंद्रपाड़ा रिज मार्ग से जाएं।",
                    "gu": "તમારું સૌથી નજીકનું સુરક્ષિત શેલ્ટર કેન્દ્રપરા હાઇ-ગ્રાઉન્ડ શેલ્ટર #14 (ઊંચાઈ: 6.8 મીટર) છે. NH-53 બ્રિજ પાણીમાં છે, બાયપાસ માર્ગ વાપરો.",
                    "en": "Your nearest safe shelter is Kendrapara High-Ground Shelter #14 (Elev: 6.8m AMSL, 330 beds ready). Please take the elevated Kendrapara Ridge bypass route."
                }.get(language_code, "Your nearest safe shelter is Kendrapara High-Ground Shelter #14 (Elev: 6.8m AMSL). Use the elevated Kendrapara Ridge bypass.")

            elif is_route:
                ai_response_text = {
                    "or": "ସତର୍କତା: NH-୫୩ ମହାନଦୀ ସେତୁ ୨.୪ ମିଟର ଜଳମଗ୍ନ ଏବଂ ଅବରୋଧିତ। ଦୟାକରି କେନ୍ଦ୍ରାପଡ଼ା ଉଚ୍ଚ ରିଜ୍ ବାଇପାସ (ଉଚ୍ଚତା: ୫.୮ ମିଟର) ଦେଇ ସୁରକ୍ଷିତ ଭାବେ ଯାଆନ୍ତୁ।",
                    "bn": "সতর্কতা: NH-৫৩ সেতু ২.৪ মিটার পানির নিচে নিমজ্জিত ও অবরুদ্ধ। অনুগ্রহ করে নিরাপদ কেন্দ্রাপাড়া রিজ বাইপাস (উচ্চতা: ৫.৮ মিটার) ব্যবহার করে চলাচল করুন।",
                    "te": "హెచ్చరిక: NH-53 వంతెన 2.4 మీటర్ల వరద నీటిలో మునిగిపోయింది. దయచేసి సురక్షితమైన కేంద్రపార రిడ్జ్ బైపాస్ మార్గం (ఎత్తు: 5.8 మీటర్లు) ద్వారా ప్రయాణించండి.",
                    "hi": "सड़क अपडेट: NH-53 महानदी पुल 2.4 मीटर पानी में डूब चुका है। कृपया केवल केंद्रपाड़ा हाई-रिज बाईपास (ऊंचाई: 5.8 मीटर) सुरक्षित मार्ग का उपयोग करें।",
                    "gu": "સાવચેતી: NH-53 બ્રિજ 2.4 મીટર પાણીમાં ડૂબી ગયો છે. કૃપા કરીને કેન્દ્રપરા હાઇ રિજ બાયપાસ સુરક્ષિત માર્ગ વાપરો.",
                    "en": "Road Status: NH-53 Arterial Bridge is submerged under 2.4m storm surge water. Please navigate via the safe elevated Kendrapara Ridge bypass (Elev: 5.8m AMSL)."
                }.get(language_code, "NH-53 bridge is submerged under 2.4m water. Please use the safe Kendrapara Ridge bypass route.")

            elif is_money:
                ai_response_text = {
                    "or": "ପାରାଦ୍ବୀପ ଏବଂ ଏରସମା ପଞ୍ଚାୟତ ପାଇଁ ₹୨୫ ଲକ୍ଷର ପାରାମେଟ୍ରିକ ଜରୁରୀକାଳୀନ ରିଲିଫ ଫଣ୍ଡ ସ୍ୱୟଂଚାଳିତ ଭାବେ ଅନୁମୋଦନ ହୋଇ ଖାତାକୁ ପଠାଯାଇଛି।",
                    "bn": "প্যারাদীপ এবং এরসামা পঞ্চায়েতের জন্য ₹২৫ লাখ টাকার জরুরি প্যারামেট্রিক ত্রাণ তহবিল অনুমোদিত ও সরাসরি ট্রান্সফার করা হয়েছে।",
                    "te": "పారాదీప్ మరియు ఎర్సమా పంచాయతీలకు ₹25 లక్షల అత్యవసర పారామెట్రిక్ సహాయ నిధులు ఆటోమేటిక్‌గా మంజూరై నేరుగా బదిలీ చేయబడ్డాయి.",
                    "hi": "राहत फंड: पारादीप और एरसमा पंचायत के लिए ₹25 लाख का प्री-लैंडफॉल पैरामेट्रिक आपातकालीन फंड सीधे डीबीटी द्वारा जारी कर दिया गया है।",
                    "gu": "પારાડીપ અને એરસમા પંચાયત માટે ₹25 લાખનું ઇમરજન્સી પેરામેટ્રિક ફંડ મંજૂર કરીને ટ્રાન્સફર કરી દેવાયું છે.",
                    "en": "Emergency parametric grants of ₹25 Lakhs per coastal Panchayat have been auto-approved and disbursed to Paradeep and Ersama Panchayats."
                }.get(language_code, "Emergency parametric grant of ₹25 Lakhs has been auto-approved and released to Paradeep and Ersama Panchayats.")

            elif is_weather:
                ai_response_text = {
                    "or": "ବାତ୍ୟା ସ୍ଥିତି: ସୁପର ସାଇକ୍ଲୋନ ବାୟୁକବଚ ବର୍ତ୍ତମାନ ୨୧୩ କି.ମି/ଘଣ୍ଟା ବେଗରେ ଗତି କରୁଛି। ଆଗାମୀ ୪୧.୫ ଘଣ୍ଟା ମଧ୍ୟରେ ୪.୨ ମିଟର ଢେଉ ସହ ଲ୍ୟାଣ୍ଡଫଲ୍ ସମ୍ଭାବନା ଅଛି।",
                    "bn": "সাইক্লোন আপডেট: সুপার সাইক্লোন বায়ুকবচ বর্তমানে ২১৩ কিমি/ঘণ্টা বেগে অগ্রসর হচ্ছে। আগামী ৪১.৫ ঘণ্টার মধ্যে ৪.২ মিটার জলোচ্ছ্বাস সহ উপকূলে পৌঁছাবে।",
                    "te": "తుఫాను స్థితి: సూపర్ సైక్లోన్ వాయుకవచ్ గంటకు 213 కి.మీ వేగంతో కదులుతోంది. రాబోయే 41.5 గంటల్లో 4.2 మీటర్ల అలలతో తీరం తాకే అవకాశం ఉంది.",
                    "hi": "चक्रवात स्थिति: सुपर साइक्लोन वायु कवच 213 किमी/घंटे की रफ्तार से आगे बढ़ रहा है। अगले 41.5 घंटों में 4.2 मीटर समुद्री लहरों के साथ तट पर पहुंचने का अनुमान है।",
                    "gu": "વાવાઝોડું અપડેટ: વાયુ કવચ 213 કિમી/કલાકની ઝડપે આગળ વધી રહ્યું છે. આગામી 41.5 કલાકમાં દરિયાકાંઠે 4.2 મીટર મોજાં સાથે ટકરાશે.",
                    "en": "Cyclone Status: Super Cyclone VAYU-KAVACH is packing sustained winds of 213 km/h with 4.2m projected surge, expected near coast in ~41.5 hours."
                }.get(language_code, "Super Cyclone VAYU-KAVACH has 213 km/h winds and 4.2m projected surge, expected in ~41.5 hours.")

            elif is_helpline:
                ai_response_text = {
                    "or": "ଜରୁରୀକାଳୀନ ହେଲ୍ପଲାଇନ: ଜାତୀୟ ଜରୁରୀକାଳୀନ ନମ୍ବର ୧୧୨, ଏନଡିଆରଏଫ ୧୦୭୮, ଏବଂ ଓଡ଼ିଶା ରାଜ୍ୟ ବିପର୍ଯ୍ୟୟ ନିୟନ୍ତ୍ରଣ କକ୍ଷ ୧୦୭୦ ରେ ତୁରନ୍ତ ଯୋଗାଯୋଗ କରନ୍ତୁ।",
                    "bn": "জরুরি হেল্পলাইন: জাতীয় জরুরি নম্বর ১১২, এনডিআরএফ ১০৭৮, এবং রাজ্য দুর্যোগ ব্যবস্থাপনা ১০৭০ নম্বরে যোগাযোগ করুন।",
                    "te": "అత్యవసర హెల్ప్‌లైన్: జాతీయ అత్యవసర నంబర్ 112, ఎన్‌డిఆర్‌ఎఫ్ 1078 మరియు రాష్ట్ర విపత్తు నియంత్రణ 1070 కి వెంటనే కాల్ చేయండి.",
                    "hi": "आपातकालीन हेल्पलाइन: राष्ट्रीय आपात नंबर 112, एनडीआरएफ 1078, और राज्य आपदा नियंत्रण कक्ष 1070 पर तुरंत संपर्क करें।",
                    "gu": "ઇમરજન્સી હેલ્પલાઇન: રાષ્ટ્રીય ઇમરજન્સી નંબર 112, NDRF 1078 અને ડિઝાસ્ટર કંટ્રોલ રૂમ 1070 પર સંપર્ક કરો.",
                    "en": "Emergency Helplines: National Emergency Hotline 112, NDRF 1078, and State Disaster Control Room 1070 are active 24/7."
                }.get(language_code, "Emergency Helplines: Call National Emergency 112, NDRF 1078, or State Disaster 1070.")

            elif is_thanks:
                ai_response_text = {
                    "or": "ଆପଣଙ୍କୁ ବହୁତ ଧନ୍ୟବାଦ! ସତର୍କ ଓ ସୁରକ୍ଷିତ ରୁହନ୍ତୁ। ଆଉ କିଛି ସୂଚନା ଦରକାର ହେଲେ ନିଶ୍ଚୟ ପଚାରନ୍ତୁ।",
                    "bn": "আপনাকে অনেক ধন্যবাদ! নিরাপদ থাকুন। আরও তথ্যের প্রয়োজন হলে নির্দ্বিধায় আমাকে জিজ্ঞাসা করুন।",
                    "te": "చాలా ధన్యవాదాలు! సురక్షితంగా ఉండండి. ఇంకా ఏదైనా సమాచారం కావాలంటే నన్ను తప్పకుండా అడగండి.",
                    "hi": "आपका बहुत-बहुत धन्यवाद! सुरक्षित रहें। यदि आपको कोई अन्य जानकारी चाहिए तो बेझिझक पूछें।",
                    "gu": "તમારો ખૂબ આભાર! સુરક્ષિત રહો અને કોઈ પણ માહિતી માટે મને પૂછી શકો છો.",
                    "en": "You are very welcome! Please stay safe and let me know if you need any further assistance."
                }.get(language_code, "You are very welcome! Please stay safe and let me know if you need any further assistance.")

            else:
                ai_response_text = {
                    "or": "ମୁଁ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିବାକୁ ପ୍ରସ୍ତୁତ ଅଛି। ଆପଣ ବାତ୍ୟା ସ୍ଥିତି, ନିକଟତମ ଆଶ୍ରୟସ୍ଥଳ, ବାଇପାସ ରାସ୍ତା କିମ୍ବା ରିଲିଫ ଫଣ୍ଡ ବିଷୟରେ ପଚାରିପାରିବେ।",
                    "bn": "আমি আপনাকে সাহায্য করতে প্রস্তুত। আপনি ঘূর্ণিঝড়ের খবর, নিকটতম আশ্রয়স্থল, নিরাপদ সড়ক রুট বা ত্রাণ তহবিল সম্পর্কে জানতে চাইতে পারেন।",
                    "te": "నేను మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాను. మీరు తుఫాను సమాచారం, పునరావాస కేంద్రం, బైపాస్ మార్గం లేదా నిధుల గురించి అడగవచ్చు.",
                    "hi": "मैं आपकी सहायता के लिए तैयार हूँ। आप मुझसे चक्रवात की स्थिति, नजदीकी सुरक्षित शेल्टर, बाईपास मार्ग या राहत राशि के बारे में पूछ सकते हैं।",
                    "gu": "હું તમને મદદ કરવા તૈયાર છું. તમે વાવાઝોડાની સ્થિતિ, નજીકના શેલ્ટર, બાયપાસ રોડ અથવા રાહત ફંડ વિશે પૂછી શકો છો.",
                    "en": "I am here to help. You can ask me about live cyclone updates, finding the nearest safe shelter, flood bypass routes, or emergency relief grants."
                }.get(language_code, "I am here to help. You can ask me about live cyclone updates, finding the nearest safe shelter, flood bypass routes, or emergency relief grants.")

        # Generate audio payload using gTTS
        audio_b64 = ""
        try:
            from gtts import gTTS
            import io
            gtts_lang_map = {
                "or": "hi",  # gTTS fallback mapping for Odia to Hindi phonetics
                "bn": "bn",
                "te": "te",
                "hi": "hi",
                "gu": "gu",
                "en": "en"
            }
            gtts_lang = gtts_lang_map.get(language_code, "en")
            tts = gTTS(text=ai_response_text, lang=gtts_lang, slow=False)
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            audio_b64 = base64.b64encode(fp.read()).decode('utf-8')
        except Exception as e:
            print(f"[Dialogflow Audio Synthesis Note] {e}")

        return {
            "query": clean_query,
            "language_code": language_code,
            "language_name": target_lang,
            "response_script": ai_response_text,
            "audio_base64": audio_b64,
            "has_audio": len(audio_b64) > 0,
            "dialogflow_intent": "CONVERSATIONAL_EMERGENCY_ASSISTANT",
            "confidence": 0.99
        }
