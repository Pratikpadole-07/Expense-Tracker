export const parseReceiptText = (text) => {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  let amount = null;
  let date = null;
  let merchant = null;

  // 1️⃣ AMOUNT (largest number heuristic)
  const amounts = [];
  lines.forEach(line => {
    const matches = line.match(/\b\d{1,5}(\.\d{2})\b/g);
    if (matches) {
      matches.forEach(m => amounts.push(Number(m)));
    }
  });
  if (amounts.length) {
    amount = Math.max(...amounts);
  }

  // 2️⃣ DATE (common formats)
  for (const line of lines) {
    const match = line.match(
      /(\d{2}[\/\-]\d{2}[\/\-]\d{2,4})/
    );
    if (match) {
      date = match[1];
      break;
    }
  }

  // 3️⃣ MERCHANT (first strong uppercase line)
  for (const line of lines) {
    if (line.length > 3 && line === line.toUpperCase()) {
      merchant = line;
      break;
    }
  }

  // 4️⃣ CATEGORY (simple rules)
  let category = "Other";
  if (merchant) {
    if (/ZOMATO|SWIGGY|CAFE|RESTAURANT/.test(merchant)) {
      category = "Food";
    } else if (/UBER|OLA|TAXI/.test(merchant)) {
      category = "Transport";
    } else if (/AMAZON|FLIPKART/.test(merchant)) {
      category = "Shopping";
    }
  }

  return { amount, date, merchant, category };
};
