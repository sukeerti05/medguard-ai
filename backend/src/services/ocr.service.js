import Tesseract from "tesseract.js";

async function extractText(filePath) {
  const { data } = await Tesseract.recognize(filePath, "eng");
  return data.text;
}

export default {
  extractText
};
