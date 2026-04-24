document.addEventListener('DOMContentLoaded', () => {

    // ─── Theme Toggle ───
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            if (current === 'dark') {
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        });
    }

    // ─── Auth-Aware Nav ───
    (async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const authNavItem = document.getElementById('auth-nav-item');
                if (authNavItem) {
                    authNavItem.innerHTML = '<a href="#" id="logout-btn">Log Out</a>';
                    document.getElementById('logout-btn').addEventListener('click', async (e) => {
                        e.preventDefault();
                        await fetch('/api/auth/logout', { method: 'POST' });
                        window.location.reload();
                    });
                }
            }
        } catch (e) { /* not logged in */ }
    })();

    // ─── Trending News — Real-time via Backend API ───
    const gradientPalettes = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
        'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        'linear-gradient(135deg, #f5576c 0%, #ff6f91 100%)',
        'linear-gradient(135deg, #0acffe 0%, #495aff 100%)',
    ];

    // Health-themed SVG icons for cards that lack images
    const healthIcons = [
        `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:48px;height:48px;opacity:0.35"><path d="M24 4L30.18 16.56L44 18.58L34 28.32L36.36 42.08L24 35.56L11.64 42.08L14 28.32L4 18.58L17.82 16.56L24 4Z" fill="white"/></svg>`,
        `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:48px;height:48px;opacity:0.35"><path d="M34 8C29.58 8 26 11.58 26 16H22C22 11.58 18.42 8 14 8C9.58 8 6 11.58 6 16C6 26 24 40 24 40S42 26 42 16C42 11.58 38.42 8 34 8Z" fill="white"/></svg>`,
        `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:48px;height:48px;opacity:0.35"><path d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM20 34V14L34 24L20 34Z" fill="white"/></svg>`,
        `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:48px;height:48px;opacity:0.35"><rect x="14" y="6" width="20" height="4" rx="2" fill="white"/><rect x="20" y="6" width="8" height="36" rx="2" fill="white"/><rect x="14" y="20" width="20" height="4" rx="2" fill="white"/></svg>`,
    ];

    function renderTicker(articles) {
        const track = document.getElementById('ticker-track');
        if (!track) return;

        // Duplicate the data for seamless infinite scroll
        const doubled = [...articles, ...articles];
        track.innerHTML = doubled.map((a, i) => {
            const gradient = gradientPalettes[i % gradientPalettes.length];
            const icon = healthIcons[i % healthIcons.length];
            const hasImage = a.image && a.image !== '#' && a.image !== '';

            const imgHtml = hasImage
                ? `<img src="${a.image}" alt="${a.title}" class="trending-card-img" onerror="this.parentElement.querySelector('.trending-card-gradient').style.display='flex';this.style.display='none';">`
                : '';

            return `
            <a href="${a.url}" target="_blank" rel="noopener noreferrer" class="trending-card" style="text-decoration:none;">
                ${imgHtml}
                <div class="trending-card-gradient" style="background:${gradient};${hasImage ? 'display:none;' : 'display:flex;'}align-items:center;justify-content:center;height:160px;border-radius:12px 12px 0 0;">
                    ${icon}
                </div>
                <div class="trending-card-body">
                    <div class="trending-card-source">${a.source}</div>
                    <div class="trending-card-title">${a.title}</div>
                    <div class="trending-card-date">${a.date}</div>
                </div>
            </a>
        `;
        }).join('');
    }

    // Fetch real-time health news from our backend API
    async function loadTrending() {
        try {
            const res = await fetch('/api/news/trending');
            if (res.ok) {
                const data = await res.json();
                if (data.articles && data.articles.length > 0) {
                    renderTicker(data.articles);
                    return;
                }
            }
        } catch (e) {
            console.warn('Failed to load trending news:', e);
        }

        // Hardcoded fallback with REAL working links to reputable health sources
        const fallback = [
            {
                title: "Physical Activity Is Good for You — The More, the Better",
                source: "WHO",
                date: "Updated 2024",
                image: null,
                url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity"
            },
            {
                title: "Diabetes: Key Facts, Symptoms and Treatment",
                source: "WHO",
                date: "Updated 2024",
                image: null,
                url: "https://www.who.int/news-room/fact-sheets/detail/diabetes"
            },
            {
                title: "Mental Health: Strengthening Our Response",
                source: "WHO",
                date: "Updated 2024",
                image: null,
                url: "https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response"
            },
            {
                title: "Healthy Diet: Essential Facts and Practical Tips",
                source: "WHO",
                date: "Updated 2024",
                image: null,
                url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet"
            },
            {
                title: "Cardiovascular Diseases: Prevention and Control",
                source: "WHO",
                date: "Updated 2024",
                image: null,
                url: "https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)"
            },
            {
                title: "Cancer: Early Detection Saves Lives",
                source: "WHO",
                date: "Updated 2024",
                image: null,
                url: "https://www.who.int/news-room/fact-sheets/detail/cancer"
            },
            {
                title: "Immunization Coverage: Global Progress Report",
                source: "WHO",
                date: "Updated 2024",
                image: null,
                url: "https://www.who.int/news-room/fact-sheets/detail/immunization-coverage"
            },
            {
                title: "Sleep and Health: Why Rest Matters",
                source: "CDC",
                date: "Updated 2024",
                image: null,
                url: "https://www.cdc.gov/sleep/about/index.html"
            }
        ];
        renderTicker(fallback);
    }

    loadTrending();

    // ─── Full Article Data ───
    const articleData = {
        diabetes: {
            category: 'Diabetes',
            categoryClass: 'category-diabetes',
            title: 'Understanding Diabetes: Types, Symptoms & Management',
            readTime: '6 min read',
            image: '/images/blog-diabetes.png',
            fallbackImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=400&fit=crop',
            content: `
                <h2>What Is Diabetes?</h2>
                <p>Diabetes is a chronic metabolic disorder characterized by elevated blood sugar levels. It occurs when the body either doesn't produce enough insulin (Type 1) or can't effectively use the insulin it produces (Type 2). Over 422 million people worldwide live with diabetes, making it one of the most prevalent chronic conditions.</p>

                <h2>Types of Diabetes</h2>
                <ul>
                    <li><strong>Type 1 Diabetes:</strong> An autoimmune condition where the immune system attacks insulin-producing cells in the pancreas. Usually diagnosed in children and young adults.</li>
                    <li><strong>Type 2 Diabetes:</strong> The most common form, accounting for 90-95% of cases. The body becomes resistant to insulin or doesn't produce enough. Often linked to lifestyle factors.</li>
                    <li><strong>Gestational Diabetes:</strong> Develops during pregnancy and usually resolves after delivery, but increases the risk of Type 2 diabetes later in life.</li>
                </ul>

                <h2>Warning Signs to Watch For</h2>
                <p>Early detection is crucial. Common symptoms include:</p>
                <ul>
                    <li>Frequent urination, especially at night</li>
                    <li>Excessive thirst and unexplained hunger</li>
                    <li>Sudden weight loss without trying</li>
                    <li>Blurred vision and fatigue</li>
                    <li>Slow-healing cuts and frequent infections</li>
                </ul>

                <h2>Management & Prevention</h2>
                <p>While Type 1 diabetes cannot be prevented, Type 2 is largely preventable through healthy lifestyle choices. Regular physical activity (at least 150 minutes per week), a balanced diet rich in whole grains, fruits, and vegetables, maintaining a healthy weight, and regular blood sugar monitoring are the cornerstones of diabetes management. Consult your healthcare provider for personalized treatment plans.</p>
            `
        },
        heart: {
            category: 'Cardiology',
            categoryClass: 'category-cardiology',
            title: 'Heart Disease: Warning Signs You Should Never Ignore',
            readTime: '7 min read',
            image: '/images/blog-heart.png',
            fallbackImage: 'https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=800&h=400&fit=crop',
            content: `
                <h2>The Silent Killer</h2>
                <p>Heart disease is the leading cause of death worldwide, claiming approximately 17.9 million lives each year. What makes it particularly dangerous is that many people don't experience symptoms until a serious event like a heart attack occurs. Understanding the risk factors and warning signs can literally save your life.</p>

                <h2>Warning Signs of Heart Disease</h2>
                <ul>
                    <li><strong>Chest pain or discomfort:</strong> A feeling of pressure, squeezing, or tightness in the chest that may come and go</li>
                    <li><strong>Shortness of breath:</strong> Difficulty breathing during normal activities or while lying down</li>
                    <li><strong>Unusual fatigue:</strong> Extreme tiredness that doesn't improve with rest</li>
                    <li><strong>Swelling:</strong> In legs, ankles, feet, or abdomen due to fluid buildup</li>
                    <li><strong>Irregular heartbeat:</strong> Palpitations, racing, or fluttering sensations</li>
                </ul>

                <h2>Risk Factors</h2>
                <p>Several factors increase your risk of developing heart disease:</p>
                <ul>
                    <li>High blood pressure (hypertension)</li>
                    <li>High cholesterol levels</li>
                    <li>Smoking and excessive alcohol consumption</li>
                    <li>Obesity and physical inactivity</li>
                    <li>Family history of heart disease</li>
                    <li>Diabetes and chronic stress</li>
                </ul>

                <h2>Prevention Strategies</h2>
                <p>Heart disease is largely preventable. Adopt a heart-healthy lifestyle by eating a diet low in saturated fats and sodium, exercising regularly, managing stress through mindfulness or meditation, quitting smoking, and getting regular health check-ups. If you experience any warning signs, seek medical attention immediately — early intervention saves lives.</p>
            `
        },
        mental: {
            category: 'Mental Health',
            categoryClass: 'category-mental-health',
            title: 'Mental Health Matters: Recognizing Anxiety & Depression',
            readTime: '8 min read',
            image: '/images/blog-mental.png',
            fallbackImage: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&h=400&fit=crop',
            content: `
                <h2>Breaking the Stigma</h2>
                <p>Mental health conditions affect 1 in 4 people globally, yet stigma prevents many from seeking help. Anxiety disorders and depression are among the most common mental health conditions, and understanding them is the first step toward effective treatment and recovery.</p>

                <h2>Recognizing Anxiety</h2>
                <p>Anxiety goes beyond normal worry. Clinical anxiety disorders include:</p>
                <ul>
                    <li>Persistent, excessive worry about everyday situations</li>
                    <li>Racing thoughts and difficulty concentrating</li>
                    <li>Physical symptoms: rapid heartbeat, sweating, trembling</li>
                    <li>Avoidance of social situations or specific triggers</li>
                    <li>Sleep disturbances and restlessness</li>
                </ul>

                <h2>Understanding Depression</h2>
                <p>Depression is more than feeling sad. Key symptoms include:</p>
                <ul>
                    <li>Persistent feelings of emptiness, hopelessness, or worthlessness</li>
                    <li>Loss of interest in activities you once enjoyed</li>
                    <li>Significant changes in appetite and weight</li>
                    <li>Fatigue and difficulty making decisions</li>
                    <li>Thoughts of self-harm or suicide — if you experience these, please reach out for help immediately</li>
                </ul>

                <h2>Effective Coping Strategies</h2>
                <p>Professional help is essential, but these daily practices can support your mental wellbeing: regular physical exercise (even a 20-minute walk), maintaining social connections, practicing mindfulness and deep breathing exercises, establishing a consistent sleep schedule, and limiting screen time and social media consumption. Remember — seeking help is a sign of strength, not weakness.</p>
            `
        },
        coldflu: {
            category: 'Respiratory',
            categoryClass: 'category-respiratory',
            title: 'Common Cold vs. Flu: How to Tell the Difference',
            readTime: '5 min read',
            image: '/images/blog-coldflu.png',
            fallbackImage: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&h=400&fit=crop',
            content: `
                <h2>Similar But Different</h2>
                <p>Both the common cold and influenza (flu) are respiratory illnesses caused by viruses, but they are caused by different pathogens. While the common cold is generally mild and resolves within a week, the flu can lead to serious complications, hospitalization, and even death — especially in vulnerable populations.</p>

                <h2>Key Differences</h2>
                <ul>
                    <li><strong>Onset:</strong> Cold symptoms develop gradually; flu hits suddenly and severely</li>
                    <li><strong>Fever:</strong> Rare with colds; common with flu (100-104°F), lasting 3-4 days</li>
                    <li><strong>Body aches:</strong> Mild with colds; severe with flu</li>
                    <li><strong>Fatigue:</strong> Mild with colds; can last 2-3 weeks with flu</li>
                    <li><strong>Sneezing/Stuffy nose:</strong> Common with colds; sometimes with flu</li>
                    <li><strong>Complications:</strong> Colds rarely cause complications; flu can lead to pneumonia, organ failure</li>
                </ul>

                <h2>When to See a Doctor</h2>
                <p>Seek medical attention if you experience: difficulty breathing, persistent chest pain, confusion, severe vomiting, symptoms that improve then worsen, or if you're in a high-risk group (elderly, pregnant, immunocompromised).</p>

                <h2>Prevention Tips</h2>
                <p>Get your annual flu vaccine, wash hands frequently with soap for at least 20 seconds, avoid touching your face, maintain distance from sick individuals, and keep your immune system strong through proper nutrition, sleep, and exercise. If you do get sick, stay home to avoid spreading the illness.</p>
            `
        },
        nutrition: {
            category: 'Nutrition',
            categoryClass: 'category-nutrition',
            title: 'Nutrition & Immunity: Foods That Boost Your Defenses',
            readTime: '6 min read',
            image: '/images/blog-nutrition.png',
            fallbackImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop',
            content: `
                <h2>Your Diet Is Your First Defense</h2>
                <p>Your immune system is a complex network of cells, tissues, and organs that work together to defend against harmful pathogens. While no single food can prevent illness, a well-balanced diet rich in specific nutrients can significantly strengthen your immune response and help your body fight infections more effectively.</p>

                <h2>Top Immune-Boosting Foods</h2>
                <ul>
                    <li><strong>Citrus fruits:</strong> Oranges, lemons, and grapefruits are packed with Vitamin C, which increases white blood cell production</li>
                    <li><strong>Garlic:</strong> Contains allicin, which has been shown to enhance immune cell function</li>
                    <li><strong>Yogurt:</strong> Probiotics support gut health, where 70% of your immune system resides</li>
                    <li><strong>Spinach:</strong> Rich in Vitamin C, antioxidants, and beta carotene</li>
                    <li><strong>Almonds:</strong> Excellent source of Vitamin E, a powerful antioxidant</li>
                    <li><strong>Turmeric:</strong> Curcumin has strong anti-inflammatory and antioxidant properties</li>
                    <li><strong>Green tea:</strong> Contains EGCG, a potent antioxidant that enhances immune function</li>
                </ul>

                <h2>Essential Vitamins & Minerals</h2>
                <p>Key micronutrients for immunity include: Vitamin C (75-90mg daily), Vitamin D (600-800 IU daily, especially important in winter), Zinc (8-11mg daily), and Selenium. Many people are deficient in Vitamin D, which is critical for immune regulation — consider getting your levels checked.</p>

                <h2>Dietary Habits That Matter</h2>
                <p>Beyond specific foods, your overall dietary pattern matters most. Focus on eating a rainbow of fruits and vegetables, include lean proteins and healthy fats, minimize processed foods and added sugars (which suppress immune function), stay well-hydrated, and consider fermented foods like kimchi and kefir for gut health.</p>
            `
        },
        sleep: {
            category: 'Wellness',
            categoryClass: 'category-wellness',
            title: 'The Science of Sleep: Why Rest Is Your Best Medicine',
            readTime: '7 min read',
            image: '/images/blog-sleep.png',
            fallbackImage: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=400&fit=crop',
            content: `
                <h2>The Sleep Crisis</h2>
                <p>In our always-on, hyper-connected world, sleep has become one of the most neglected aspects of health. Over 45% of the global population doesn't get enough sleep, and the consequences extend far beyond feeling groggy. Chronic sleep deprivation is linked to heart disease, obesity, diabetes, depression, and a weakened immune system.</p>

                <h2>What Happens When You Sleep</h2>
                <p>Sleep is far from passive — your body performs critical functions during rest:</p>
                <ul>
                    <li><strong>Memory consolidation:</strong> Your brain processes and stores information from the day</li>
                    <li><strong>Cellular repair:</strong> Growth hormones are released, repairing tissues and muscles</li>
                    <li><strong>Immune strengthening:</strong> Your body produces cytokines that fight infection and inflammation</li>
                    <li><strong>Toxin removal:</strong> The glymphatic system clears metabolic waste from the brain</li>
                    <li><strong>Hormone regulation:</strong> Sleep regulates appetite hormones (leptin and ghrelin), stress hormones, and more</li>
                </ul>

                <h2>How Much Sleep Do You Need?</h2>
                <p>The National Sleep Foundation recommends 7-9 hours for adults (18-64), 8-10 hours for teenagers, and 9-11 hours for school-age children. Quality matters as much as quantity — fragmented sleep is less restorative than consolidated, uninterrupted rest.</p>

                <h2>Building Better Sleep Habits</h2>
                <p>Improve your sleep with these evidence-based strategies: stick to a consistent sleep and wake time (even on weekends), create a cool, dark, and quiet bedroom environment, avoid screens for at least 30 minutes before bed (blue light suppresses melatonin), limit caffeine after 2 PM, exercise regularly but not close to bedtime, and try relaxation techniques like progressive muscle relaxation or guided meditation.</p>
            `
        }
    };

    // ─── Modal Logic ───
    const overlay = document.getElementById('article-modal-overlay');
    const modal = document.getElementById('article-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const modalImg = document.getElementById('modal-hero-img');
    const modalCategory = document.getElementById('modal-category');
    const modalTitle = document.getElementById('modal-title');
    const modalMeta = document.getElementById('modal-meta');
    const modalContent = document.getElementById('modal-content');

    function openModal(articleKey) {
        const article = articleData[articleKey];
        if (!article) return;

        modalImg.src = article.image;
        modalImg.onerror = function() { this.src = article.fallbackImage; };
        modalCategory.textContent = article.category;
        modalCategory.className = `article-category ${article.categoryClass}`;
        modalTitle.textContent = article.title;
        modalMeta.innerHTML = `
            <span>${article.readTime}</span>
            <span>•</span>
            <span>Symptom Checker Health Team</span>
        `;
        modalContent.innerHTML = article.content;

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Attach click events to article cards
    document.querySelectorAll('.article-card').forEach(card => {
        card.addEventListener('click', () => {
            const key = card.getAttribute('data-article');
            openModal(key);
        });
    });
});
