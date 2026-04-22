import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function list() {
  try {
    const models = await ai.models.list();
    let txt = '';
    // Let's assume models is an async iterator
    for await (const m of models) {
        if (m.name.includes('gemini')) {
            txt += m.name + '\n';
        }
    }
    fs.writeFileSync('models.txt', txt);
    console.log("Done");
  } catch(e){
    console.error(e);
  }
}
list();
