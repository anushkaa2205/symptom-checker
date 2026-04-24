// Test: MedicalXpress RSS to see if it includes images
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function test() {
    // Test MedicalXpress RSS
    const feeds = [
        { name: "MedicalXpress", url: "https://medicalxpress.com/rss-feed/" },
        { name: "ScienceDaily Health", url: "https://www.sciencedaily.com/rss/health_medicine.xml" },
    ];
    
    for (const feed of feeds) {
        console.log(`\n=== ${feed.name} ===`);
        try {
            const res = await fetch(feed.url, { headers: { "User-Agent": UA } });
            if (!res.ok) { console.log("FAILED:", res.status); continue; }
            const xml = await res.text();
            
            // Show first item
            const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);
            if (itemMatch) {
                const item = itemMatch[1];
                const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "N/A";
                const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "N/A";
                
                // Check for media/enclosure/image
                const mediaContent = item.match(/<media:content[^>]+url="([^"]+)"/i)?.[1];
                const enclosure = item.match(/<enclosure[^>]+url="([^"]+)"/i)?.[1];
                const imgInDesc = item.match(/<img[^>]+src="([^"]+)"/i)?.[1];
                const mediaThumb = item.match(/<media:thumbnail[^>]+url="([^"]+)"/i)?.[1];
                
                console.log("Title:", title.substring(0, 80));
                console.log("Link:", link.substring(0, 80));
                console.log("media:content:", mediaContent || "NONE");
                console.log("enclosure:", enclosure || "NONE");
                console.log("img in desc:", imgInDesc || "NONE");
                console.log("media:thumbnail:", mediaThumb || "NONE");
            }
            
            // Count items
            const itemCount = (xml.match(/<item>/g) || []).length;
            console.log(`Total items: ${itemCount}`);
        } catch (e) {
            console.log("ERROR:", e.message);
        }
    }
}

test();
