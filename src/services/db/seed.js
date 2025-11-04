const MULT_STORE = 'mult_problems';
const DIV_STORE = 'div_problems';

export async function seedProblemsIfEmpty(db) {
  const hasAnyMult = await countStore(db, MULT_STORE);
  const hasAnyDiv = await countStore(db, DIV_STORE);
  if (hasAnyMult > 0 || hasAnyDiv > 0) return;

  const allOrderedMultiplication = generateMultiplicationProblems(0, 10, true);
  const allOrderedDivision = generateDivisionProblems();

  await putMany(db, MULT_STORE, allOrderedMultiplication);
  await putMany(db, DIV_STORE, allOrderedDivision);
}

function countStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function putMany(db, storeName, items) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    items.forEach((item) => store.put(item));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function generateMultiplicationProblems(min = 0, max = 10, ordered = true) {
  const problems = [];
  for (let a = min; a <= max; a++) {
    for (let b = ordered ? min : a; b <= max; b++) {
      problems.push({
        id: `${String(a).padStart(2, '0')}x${String(b).padStart(2, '0')}`,
        symbol: 'x',
        factors: [a, b],
        prompt: `${a} x ${b} =`,
        solution: a * b,
        operation: 'multiplication',
      });
      if (!ordered && b !== a) {
        // If you need both directions later, keep a mapping or aliases
        problems[problems.length - 1].aliases = [`${b}x${a}`];
      }
    }
  }

  return problems;
}

// 121 ordered problems:
// const allOrdered = generateMultiplicationProblems(0, 10, true);

// 66 unordered unique problems:
// const uniqueUnordered = generateMultiplicationProblems(0, 10, false);

function generateDivisionProblems(min = 1, max = 10, ordered = true) {
  const problems = [];
  for (let divisor = min; divisor <= max; divisor++) {
    for (let quotient = ordered ? min : divisor; quotient <= max; quotient++) {
      const dividend = divisor * quotient;
      problems.push({
        id: `${String(dividend).padStart(3, '0')}÷${String(divisor).padStart(
          2,
          '0'
        )}`,
        symbol: '÷',
        terms: [dividend, divisor], // dividend, divisor
        prompt: `${dividend} ÷ ${divisor} =`,
        solution: quotient,
        operation: 'division',
        meta: { divisor, quotient, dividend },
      });
      if (!ordered && quotient !== divisor) {
        problems[problems.length - 1].aliases = [
          `${String(divisor * quotient).padStart(3, '0')}÷${String(
            quotient
          ).padStart(2, '0')}`,
        ];
      }
    }
  }
  return problems;
}
