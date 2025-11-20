import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  // Check for API key presence safely
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const smartFixXml = async (brokenXml: string): Promise<string> => {
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Fix the following malformed XML. Return ONLY the corrected XML string without any markdown formatting or explanation.
      
      Broken XML:
      ${brokenXml}`,
    });

    let text = response.text || "";
    // Cleanup if model returns markdown code blocks
    if (text.startsWith("```xml")) {
      text = text.replace(/^```xml\n/, '').replace(/\n```$/, '');
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    return text.trim();
  } catch (error) {
    console.error("Gemini Fix Error:", error);
    throw error;
  }
};

export const convertXmlToJson = async (xml: string): Promise<string> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Convert the following XML to valid JSON. Handle attributes and nested structures intelligently. Return ONLY the JSON string without markdown.
      
      XML:
      ${xml}`,
    });

    let text = response.text || "";
     if (text.startsWith("```json")) {
      text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    return text.trim();
  } catch (error) {
    console.error("Gemini Conversion Error:", error);
    throw error;
  }
};

export const generateSampleXml = async (): Promise<string> => {
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a complex sample XML document representing a library catalog with books, authors, and genres. Include at least 3 items with attributes. Return ONLY the XML.`,
    });
    
    let text = response.text || "";
    if (text.startsWith("```xml")) {
      text = text.replace(/^```xml\n/, '').replace(/\n```$/, '');
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    return text.trim();
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};