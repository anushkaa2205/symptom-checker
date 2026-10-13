// Detects messages that describe a possible medical emergency, so the chat can show
// emergency guidance immediately instead of starting a question-by-question assessment.
//
// Covers common paraphrases ("my chest hurts", "can't breathe properly"), Hinglish
// ("seene mein dard", "saans nahi aa rahi") and Hindi script, and skips simple English
// negations ("no chest pain", "I don't have a fever or chest pain").

const CATEGORIES = [
    {
        type: "cardiac",
        patterns: [
            /\bchest\s+(pain|pressure|tightness|discomfort|hurts?|hurting|is\s+hurting|feels?\s+(tight|heavy))\b/i,
            /\b(pain|pressure|tightness|heaviness)\s+in\s+(my\s+|the\s+)?chest\b/i,
            /\bheart\s+attack\b/i,
            /\b(seene|sine|chhati|chaati|chati)\s+(me|mein|main)\s+(dard|dabav|jakdan)\b/i,
            /dil\s+ka\s+daura/i,
            /(सीने|छाती)\s+में\s+दर्द/, /दिल\s+का\s+दौरा/,
        ],
    },
    {
        type: "breathing",
        patterns: [
            /\b(can'?t|cannot|can\s+not|unable\s+to|struggling\s+to|hard\s+to|difficult\s+to)\s+breath(e|ing)?\b/i,
            /\b(difficulty|trouble|problem)\s+breathing\b/i,
            /\bgasping\b/i,
            /\bchoking\b/i,
            /\bthroat\s+(is\s+)?(closing|swelling\s+shut)\b/i,
            /\bsaans\s+(nahi|nahin|nhi)\s+(aa|le\s+pa)/i,
            /\bsaans\s+lene\s+(me|mein)\s+(taklif|takleef|dikkat|pareshani)\b/i,
            /सांस\s+(नहीं|लेने\s+में\s+(तकलीफ|दिक्कत))/,
        ],
    },
    {
        type: "neuro",
        patterns: [
            /\b(having|had)\s+a\s+stroke\b/i,
            /\b(?<!heat\s)stroke\s+(symptoms|signs)\b/i,
            /\bface\s+(is\s+)?drooping\b/i,
            /\bslurred\s+speech\b/i,
            /\b(can'?t|cannot)\s+move\s+(one|my\s+(left|right))\s+(side|arm|leg)\b/i,
            /\bsudden\s+(numbness|weakness)\b/i,
            /\b(seizure|seizures|convulsions?|fits)\b/i,
            /\b(unconscious|unresponsive|not\s+responding|passed\s+out|fainted|collapsed)\b/i,
            /\b(behosh|mirgi|daura\s+pad)/i,
            /(बेहोश|मिर्गी)/,
        ],
    },
    {
        type: "bleeding",
        patterns: [
            /\b(heavy|severe|a\s+lot\s+of|lots\s+of)\s+bleeding\b/i,
            /\bbleeding\s+(heavily|a\s+lot|badly|won'?t\s+stop|will\s+not\s+stop|does\s*n'?t\s+stop)\b/i,
            /\b(vomiting|coughing|throwing\s+up)\s+blood\b/i,
            /\bkhoon\s+(bahut\s+)?(beh|bah)\s+raha\b/i,
            /खून\s+(बहुत\s+)?बह\s+रहा/,
        ],
    },
    {
        type: "poisoning",
        patterns: [
            /\boverdose(d)?\b/i,
            /\btook\s+too\s+many\s+(pills|tablets|medicines?)\b/i,
            /\b(swallowed|drank|ate)\s+(poison|bleach|pesticide|rat\s+poison)\b/i,
            /\bsevere\s+allergic\s+reaction\b/i,
            /\banaphyla/i,
        ],
    },
    {
        type: "self_harm",
        patterns: [
            /\b(kill|hurt|harm)\s+myself\b/i,
            /\b(want|wanna|going)\s+to\s+die\b/i,
            /\bend\s+(my|it)\s+(life|all)\b/i,
            /\bsuicid(e|al)\b/i,
            /\bjeena\s+nahi\s+chahta|\bjeena\s+nahi\s+chahti|\bmar\s+jana\s+chahta|\bmar\s+jana\s+chahti/i,
            /(आत्महत्या|मरना\s+चाहता|मरना\s+चाहती)/,
        ],
    },
];

// "no chest pain", "I don't have chest pain", "without any bleeding", "never fainted"
const NEGATION = /\b(no|not|without|never|denies|don'?t\s+have|do\s+not\s+have|doesn'?t\s+have|haven'?t\s+had)\b[^.,;!?]{0,25}$/i;

export function detectEmergency(message) {
    if (typeof message !== "string" || !message.trim()) return null;
    for (const { type, patterns } of CATEGORIES) {
        for (const re of patterns) {
            const m = re.exec(message);
            if (!m) continue;
            const before = message.slice(Math.max(0, m.index - 40), m.index);
            if (NEGATION.test(before)) continue;
            return { type, matched: m[0] };
        }
    }
    return null;
}

export function emergencyReply(type) {
    if (type === "self_harm") {
        return "I'm really sorry you're feeling this way, and I'm glad you said something. You don't have to go through this alone. " +
            "Please reach out right now: in India you can call **Tele-MANAS on 14416** (free, 24/7), or **112** if you are in immediate danger. " +
            "If you can, tell someone you trust and stay with them.";
    }
    return "Your symptoms may need **immediate medical attention**. Please call **112** (or **108** for an ambulance in India) " +
        "or go to the nearest hospital emergency department now. Don't wait to see if it gets better, and don't drive yourself if you can avoid it.";
}
