import base64
import os
from typing import Dict, Any

# Regional alert messages default dictionary
REGIONAL_ALERTS = {
    "or": {
        "language_name": "Odia (ଓଡ଼ିଆ)",
        "default_text": "জরୁରୀ ସୂଚନା: ମହାବାତ୍ୟା ବାୟୁକବଚ ଆଗାମୀ ୪୮ ଘଣ୍ଟା ମଧ୍ୟରେ ପାରାଦ୍ବୀପ ଉପକୂଳରେ ସ୍ଥଳଭାଗ ଛୁଇଁବ। ସମସ୍ତ ଉପକୂଳବାସୀ ତୁରନ୍ତ ନିକଟସ୍ଥ ମହାବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳକୁ ଚାଲିଯାଆନ୍ତୁ।"
    },
    "bn": {
        "language_name": "Bengali (বাংলা)",
        "default_text": "জরুরি সতর্কতা: আগামী ৪৮ ঘণ্টার মধ্যে উপকূলীয় অঞ্চলে সুপার সাইক্লোন বায়ুকবচ আঘাত হানবে। সমস্ত উপকূলবাসীকে অবিলম্বে সাইক্লোন শেল্টারে স্থানান্তরিত হওয়ার নির্দেশ দেওয়া হচ্ছে।"
    },
    "te": {
        "language_name": "Telugu (తెలుగు)",
        "default_text": "అత్యవసర హెచ్చరిక: తదుపరి 48 గంటల్లో తీరం దాటనున్న తుఫాను వాయుకవచ్. తీర ప్రాంత ప్రజలంతా వెంటనే సురక్షితమైన తుఫాను పునరావాస కేంద్రాలకు వెళ్లాలని విజ్ఞప్తి."
    },
    "hi": {
        "language_name": "Hindi (हिन्दी)",
        "default_text": "आपातकालीन चेतावनी: अति तीव्र चक्रवात वायु कवच अगले 48 घंटों में तटीय क्षेत्रों में दस्तक देगा। सभी तटीय निवासी तुरंत निकटतम चक्रवात राहत शिविर में जाएं।"
    }
}

class MultiDialectBroadcaster:
    """
    Synthesizes regional evacuation broadcasts for coastal Indian communities in Odia, Bengali, Telugu, and Hindi.
    Integrates with Google Cloud Text-to-Speech / Translation API.
    """
    def __init__(self):
        pass

    def generate_broadcast_audio(self, lang_code: str = "or", custom_text: str = None) -> Dict[str, Any]:
        lang_info = REGIONAL_ALERTS.get(lang_code, REGIONAL_ALERTS["or"])
        alert_text = custom_text or lang_info["default_text"]
        
        # Try generating real audio using gTTS if available
        audio_b64 = ""
        try:
            from gtts import gTTS
            import io
            
            # Map lang codes for gtts
            gtts_lang = lang_code
            if lang_code == "or":
                gtts_lang = "hi"  # fallback audio voice for Odia phonetics if or not direct in gtts
                
            tts = gTTS(text=alert_text, lang=gtts_lang, slow=False)
            mp3_fp = io.BytesIO()
            tts.write_to_fp(mp3_fp)
            mp3_fp.seek(0)
            audio_b64 = base64.b64encode(mp3_fp.read()).decode('utf-8')
        except Exception as e:
            # Fallback to simulated audio string payload
            print(f"[TTS Broadcaster Info] Using simulated audio payload: {e}")
            audio_b64 = ""

        return {
            "language": lang_code,
            "language_name": lang_info["language_name"],
            "alert_text": alert_text,
            "audio_base64": audio_b64,
            "audio_format": "mp3",
            "has_audio": len(audio_b64) > 0
        }
