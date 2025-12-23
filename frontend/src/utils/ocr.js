import Tesseract from "tesseract.js";

export const extractTextFromImage = async (file) => {
  const result = await Tesseract.recognize(
    file,
    "eng",
    { logger: () => {} }
  );

  return result.data.text;
};
