document.addEventListener('DOMContentLoaded', () => {

    const articleData = {
        diabetes: {
            id: 'diabetes',
            category: 'Nutrition',
            tag: 'Diabetes',
            title: 'The Comprehensive Guide to Diabetes Management',
            excerpt: 'Diabetes is a chronic condition that affects how your body turns food into energy. Learn about Type 1, Type 2, and effective management strategies.',
            readTime: '12 min read',
            image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=400&fit=crop',
            content: `
                <h2>Understanding the Mechanism</h2>
                <p>Most of the food you eat is broken down into sugar (also called glucose) and released into your bloodstream. When your blood sugar goes up, it signals your pancreas to release insulin. Insulin acts like a key to let the blood sugar into your body’s cells for use as energy.</p>
                <p>With diabetes, your body doesn’t make enough insulin or can’t use it as well as it should. When there isn’t enough insulin or cells stop responding to insulin, too much blood sugar stays in your bloodstream. Over time, that can cause serious health problems, such as heart disease, vision loss, and kidney disease.</p>
                
                <h2>Type 1 vs. Type 2</h2>
                <p><strong>Type 1 diabetes</strong> is thought to be caused by an autoimmune reaction (the body attacks itself by mistake). This reaction stops your body from making insulin. Approximately 5-10% of the people who have diabetes have type 1. Symptoms of type 1 diabetes often develop quickly. It’s usually diagnosed in children, teens, and young adults.</p>
                <p><strong>Type 2 diabetes</strong>, your body doesn’t use insulin well and can’t keep blood sugar at normal levels. About 90-95% of people with diabetes have type 2. It develops over many years and is usually diagnosed in adults (but increasingly in children, teens, and young adults). You may not notice any symptoms, so it’s important to get your blood sugar tested if you’re at risk.</p>
                
                <h2>Prevention and Lifestyle</h2>
                <p>There isn’t a cure yet for diabetes, but losing weight, eating healthy food, and being active can really help. Other things you can do to help:</p>
                <ul>
                    <li>Take medicine as prescribed.</li>
                    <li>Get diabetes self-management education and support.</li>
                    <li>Make and keep appointments with your health care team.</li>
                </ul>
            `
        },
        heart: {
            id: 'heart',
            category: 'Heart Health',
            tag: 'Cardiology',
            title: 'Cardiovascular Health: Silent Risks and Prevention',
            excerpt: 'Heart disease is the leading cause of death globally. Understanding your risks and implementing early prevention can significantly increase longevity.',
            readTime: '10 min read',
            image: 'https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=800&h=400&fit=crop',
            content: `
                <h2>The Spectrum of Heart Disease</h2>
                <p>Heart disease describes a range of conditions that affect your heart. Diseases under the heart disease umbrella include blood vessel diseases, such as coronary artery disease; heart rhythm problems (arrhythmias); and heart defects you're born with (congenital heart defects), among others.</p>
                <p>The term "cardiovascular disease" is generally used to refer to conditions that involve narrowed or blocked blood vessels that can lead to a heart attack, chest pain (angina) or stroke. Other heart conditions, such as those that affect your heart's muscle, valves or rhythm, also are considered forms of heart disease.</p>
                
                <h2>Warning Signs to Watch For</h2>
                <p>Symptoms of heart disease depend on what type of heart disease you have. Many forms of heart disease can be prevented or treated with healthy lifestyle choices.</p>
                <ul>
                    <li><strong>Atherosclerotic disease:</strong> Chest pain, chest tightness, chest pressure and chest discomfort (angina); Shortness of breath; Pain, numbness, weakness or coldness in your legs or arms.</li>
                    <li><strong>Heart arrhythmias:</strong> Fluttering in your chest; Racing heartbeat (tachycardia); Slow heartbeat (bradycardia); Chest pain or discomfort.</li>
                    <li><strong>Heart failure:</strong> Shortness of breath with exertion or when lying down; Fatigue and weakness; Swelling (edema) in your legs, ankles and feet.</li>
                </ul>

                <h2>Proactive Measures</h2>
                <p>Quitting smoking is the single best thing you can do for your heart. Additionally, maintaining a diet low in salt and saturated fat, exercising at least 30 minutes a day on most days of the week, and maintaining a healthy weight are essential pillars of cardiovascular longevity.</p>
            `
        },
        mental: {
            id: 'mental',
            category: 'Mental Health',
            tag: 'Psychology',
            title: 'Mental Health Awareness: Navigating Anxiety and Burnout',
            excerpt: 'In an increasingly fast-paced world, mental well-being is often neglected. Learn the signs of chronic stress and how to reclaim your peace.',
            readTime: '15 min read',
            image: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&h=400&fit=crop',
            content: `
                <h2>Understanding the Mind-Body Connection</h2>
                <p>Mental health includes our emotional, psychological, and social well-being. It affects how we think, feel, and act. It also helps determine how we handle stress, relate to others, and make healthy choices. Mental health is important at every stage of life, from childhood and adolescence through adulthood.</p>
                <p>Although the terms are often used interchangeably, poor mental health and mental illness are not the same thing. A person can experience poor mental health and not be diagnosed with a mental illness. Likewise, a person diagnosed with a mental illness can experience periods of physical, mental, and social well-being.</p>
                
                <h2>Anxiety vs. Everyday Stress</h2>
                <p>Stress is the body's reaction to a threat, whereas anxiety is the body's reaction to the stress. People under stress experience mental and physical symptoms, such as irritability, anger, fatigue, muscle pain, digestive troubles, and difficulty sleeping. Anxiety, on the other hand, is defined by persistent, excessive worries that don't go away even in the absence of a stressor.</p>
                
                <h2>Strategies for Resilience</h2>
                <p>Building resilience involves developing a toolkit of coping mechanisms:</p>
                <ul>
                    <li><strong>Mindfulness:</strong> Practicing being present in the moment can reduce the "noise" of anxious thoughts.</li>
                    <li><strong>Social Support:</strong> Connecting with others provides a safety net and different perspectives.</li>
                    <li><strong>Sleep Hygiene:</strong> Chronic sleep deprivation is a major driver of emotional instability.</li>
                    <li><strong>Professional Help:</strong> Therapy is not just for crises; it is a proactive way to understand your own mental patterns.</li>
                </ul>
            `
        },
        immunity: {
            id: 'immunity',
            category: 'Immunity',
            tag: 'Wellness',
            title: 'Strengthening Your Natural Defenses: The Science of Immunity',
            excerpt: 'Your immune system is a complex network of cells and proteins. Discover how nutrition, sleep, and lifestyle impact your ability to fight infection.',
            readTime: '9 min read',
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop',
            content: `
                <h2>How the Immune System Works</h2>
                <p>The immune system is your body's shield against "foreign" invaders. These include germs (like bacteria, viruses, and fungi) and substances that don't belong in the body. The system is made up of different organs, cells, and proteins that work together.</p>
                <p>There are two main parts of the immune system: the innate immune system, which you are born with, and the adaptive immune system, which you develop when your body is exposed to microbes or the chemicals released by microbes.</p>
                
                <h2>Nutritional Support</h2>
                <p>Vitamins and minerals play a critical role. Vitamin C is often the go-to, but others are equally important:</p>
                <ul>
                    <li><strong>Vitamin D:</strong> Essential for immune regulation. Many people are deficient without knowing it.</li>
                    <li><strong>Zinc:</strong> Critical for immune cell development and function.</li>
                    <li><strong>Gut Health:</strong> Approximately 70% of the immune system is located in the gut. Probiotics and fiber are essential.</li>
                </ul>

                <h2>Common Myths</h2>
                <p>It’s important to note that you cannot "boost" your immune system beyond its natural peak—you can only support it to function at its best. Over-activation of the immune system can lead to autoimmune issues. Balance, not intensity, is the goal.</p>
            `
        },
        coldflu: {
            id: 'coldflu',
            category: 'Emergency Care',
            tag: 'Respiratory',
            title: 'Common Cold vs. Influenza: A Clinical Comparison',
            excerpt: 'While they share similar symptoms, the flu can be far more dangerous. Learn the clinical differences and when to seek emergency care.',
            readTime: '8 min read',
            image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&h=400&fit=crop',
            content: `
                <h2>Pathogen Differences</h2>
                <p>The common cold is most often caused by rhinoviruses, while the flu is caused by influenza viruses (Type A or B). Both are respiratory illnesses, but they are not the same. Because they share many symptoms, it can be difficult to tell the difference based on how you feel alone.</p>
                
                <h2>Symptom Progression</h2>
                <p>In general, the flu is worse than the common cold, and symptoms are more intense. People with colds are more likely to have a runny or stuffy nose. Colds generally do not result in serious health problems, such as pneumonia, bacterial infections, or hospitalizations. Flu can have very serious associated complications.</p>
                <ul>
                    <li><strong>Onset:</strong> Cold symptoms develop gradually; flu symptoms hit suddenly.</li>
                    <li><strong>Fever:</strong> Rare with colds; very common and high with the flu.</li>
                    <li><strong>Aches:</strong> Slight with colds; often severe with the flu.</li>
                    <li><strong>Chills:</strong> Uncommon with colds; common with the flu.</li>
                </ul>

                <h2>Treatment and Prevention</h2>
                <p>Annual vaccination is the most effective way to prevent the flu. For the common cold, there is no vaccine. Treatment for both involves rest, hydration, and over-the-counter medications to manage symptoms. However, if you are at high risk for complications, antiviral drugs prescribed by a doctor can shorten the duration of the flu.</p>
            `
        },
        sleep: {
            id: 'sleep',
            category: 'Wellness',
            tag: 'Sleep Science',
            title: 'The Science of Rest: Why Quality Sleep is Non-Negotiable',
            excerpt: 'Sleep is a fundamental biological necessity. Explore the neurological stages of sleep and how to optimize your environment for recovery.',
            readTime: '11 min read',
            image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=400&fit=crop',
            content: `
                <h2>The Architecture of Sleep</h2>
                <p>Sleep is not a uniform state of being. Instead, it’s composed of several several rounds of the sleep cycle, which has four individual stages. On a typical night, a person goes through four to six sleep cycles. Not all sleep cycles are the same length, but on average they last about 90 minutes each.</p>
                <p>Stages 1-3 are Non-REM (NREM) sleep, while Stage 4 is REM (Rapid Eye Movement) sleep. Deep sleep (N3) is the stage where the body performs the most physical repair, while REM is critical for cognitive functions like memory consolidation and emotional processing.</p>
                
                <h2>The Impact of Deprivation</h2>
                <p>Short-term sleep deprivation can lead to irritability, memory lapses, and impaired judgment. However, chronic deprivation is linked to much more serious long-term risks:</p>
                <ul>
                    <li><strong>Cognitive Decline:</strong> Increased risk of neurodegenerative diseases.</li>
                    <li><strong>Metabolic Issues:</strong> Disruption of hunger hormones leading to weight gain and insulin resistance.</li>
                    <li><strong>Heart Health:</strong> Chronic inflammation and increased blood pressure.</li>
                </ul>

                <h2>Optimizing Your Sleep Hygiene</h2>
                <p>To improve sleep quality, consistency is key. Going to bed and waking up at the same time every day regulates your circadian rhythm. Additionally, ensuring your bedroom is dark, quiet, and cool (around 65°F/18°C) creates the optimal physiological environment for melatonin production.</p>
            `
        }
    };

    const articles = Object.values(articleData);
    let currentFilter = 'all';

    const articleGrid = document.getElementById('article-grid');
    const categoryPills = document.querySelectorAll('.pill');
    const trendingTrack = document.getElementById('trending-track');
    const carousel = document.getElementById('trending-carousel');

    renderArticles();
    loadTrending();
    initRevealAnimations();

    function renderArticles() {
        const filtered = articles.filter(a => {
            return currentFilter === 'all' || a.category === currentFilter;
        });

        articleGrid.innerHTML = filtered.map(a => `
            <div class="article-card reveal" data-article="${a.id}">
                <div class="article-img-wrap">
                    <img src="${a.image}" alt="${a.title}" class="article-card-img">
                </div>
                <div class="article-card-body">
                    <span class="article-tag">${a.tag}</span>
                    <h3 class="article-card-title">${a.title}</h3>
                    <p class="article-card-excerpt">${a.excerpt}</p>
                    <div class="article-card-footer">
                        <span>${a.readTime}</span>
                        <span>Read Article →</span>
                    </div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('click', () => openModal(card.dataset.article));
        });
        
        initRevealAnimations();
    }

    async function loadTrending() {
        try {
            const res = await fetch('/api/news/trending');
            const data = res.ok ? await res.json() : { articles: getFallbackNews() };
            renderTrending(data.articles);
        } catch (e) {
            renderTrending(getFallbackNews());
        }
    }

    function renderTrending(news) {
        const cardsHTML = news.map(n => `
            <a href="${n.url}" target="_blank" class="trending-card-compact">
                <img src="${n.image || 'https://images.unsplash.com/photo-1505751172107-573225a91200?w=100&h=100&fit=crop'}" class="trending-thumb" onerror="this.src='https://via.placeholder.com/100x100?text=Health'">
                <div class="trending-info">
                    <span class="news-source">${n.source}</span>
                    <h4 class="news-title">${n.title}</h4>
                    <span class="news-meta">${n.date || 'Today'} • 2 min read</span>
                </div>
            </a>
        `).join('');
        trendingTrack.innerHTML = cardsHTML + cardsHTML;
    }

    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.dataset.category;
            renderArticles();
        });
    });

    const overlay = document.getElementById('article-modal-overlay');
    const modalImg = document.getElementById('modal-hero-img');
    const modalCategory = document.getElementById('modal-category');
    const modalTitle = document.getElementById('modal-title');
    const modalMeta = document.getElementById('modal-meta');
    const modalContent = document.getElementById('modal-content');
    const closeBtn = document.getElementById('modal-close-btn');

    function openModal(id) {
        const a = articleData[id];
        if (!a) return;
        modalImg.src = a.image;
        modalCategory.textContent = a.category;
        modalTitle.textContent = a.title;
        modalMeta.innerHTML = `<span>${a.readTime}</span> • <span>Medora Health Desk</span>`;
        modalContent.innerHTML = a.content;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    function initRevealAnimations() {
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        reveals.forEach(r => observer.observe(r));
    }

    function getFallbackNews() {
        return [
            { title: "Physical Activity Is Good for You", source: "WHO", url: "#", image: null },
            { title: "Diabetes: Key Facts and Symptoms", source: "WHO", url: "#", image: null }
        ];
    }
});
