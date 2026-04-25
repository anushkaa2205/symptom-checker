import Chat from "../models/chat.js";

export const getDashboardStats = async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.user._id }).sort({ updatedAt: -1 });

        let totalAssessments = chats.length;
        let urgencyBreakdown = { green: 0, yellow: 0, red: 0 };
        let recentDiagnoses = [];
        let symptomCounts = {};

        for (const chat of chats) {
            const verdictMsg = chat.messages.find(m => m.sender === 'assistant' && m.text.startsWith('VERDICT|'));
            
            let urgency = 'green';
            let issue = chat.title;
            let symptomsSummary = [];
            let solutionItems = [];
            let medicineItems = [];

            if (verdictMsg && verdictMsg.text.startsWith("VERDICT|")) {
    const parts = verdictMsg.text.split('|');

    if (parts.length >= 6) {
        urgency = parts[1]?.trim().toLowerCase() || 'green';
        issue = parts[2]?.trim() || chat.title;

        const solutionRaw = parts[3] || '';
        const medicinesRaw = parts[4] || 'None';
        const symptomsRaw = parts[5] || 'None';

        solutionItems = solutionRaw
            .split('~')
            .filter(item => item.trim() !== '');

        medicineItems = medicinesRaw
            .split('~')
            .filter(item =>
                item.trim() !== '' &&
                item.trim().toLowerCase() !== 'none'
            );

        symptomsSummary = symptomsRaw
            .split('~')
            .filter(item =>
                item.trim() !== '' &&
                item.trim().toLowerCase() !== 'none'
            );

        if (urgencyBreakdown[urgency] !== undefined) {
            urgencyBreakdown[urgency]++;
        } else {
            urgencyBreakdown['green']++;
        }

        for (const symptom of symptomsSummary) {
            const s = symptom.trim().toLowerCase();

            if (s) {
                symptomCounts[s] =
                    (symptomCounts[s] || 0) + 1;
            }
        }

    } else {
        console.log("Invalid verdict format:", verdictMsg.text);

        urgencyBreakdown['green']++;
    }

} else {
    urgencyBreakdown['green']++;
}

            if (recentDiagnoses.length < 5) {
                recentDiagnoses.push({
                    _id: chat._id,
                    title: issue,
                    urgency: urgency,
                    date: chat.updatedAt,
                    symptomsSummary: symptomsSummary,
                    solutionItems: solutionItems,
                    medicineItems: medicineItems
                });
            }
        }
        
        let mostFrequentSymptom = 'N/A';
        let maxCount = 0;
        for (const s in symptomCounts) {
            if (symptomCounts[s] > maxCount) {
                maxCount = symptomCounts[s];
                mostFrequentSymptom = s.charAt(0).toUpperCase() + s.slice(1);
            }
        }
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyAssessments = chats.filter(chat => {
            const date = new Date(chat.createdAt);

            return (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            );
        }).length;

        const lastAssessmentDate =
            chats.length > 0 ? chats[0].updatedAt : null;

        const mostCommonUrgency =
            Object.keys(urgencyBreakdown).reduce((a, b) =>
                urgencyBreakdown[a] > urgencyBreakdown[b] ? a : b
            );

        res.json({
            user: {
                name: req.user.Fname || 'User',
                email: req.user.email
            },
            stats: {
                totalAssessments,
                mostFrequentSymptom,
                monthlyAssessments,
                lastAssessmentDate,
                mostCommonUrgency
            },
            urgencyBreakdown,
            recentDiagnoses
        });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
};
