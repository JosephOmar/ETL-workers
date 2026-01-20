export const parseBulkInput = (text: string): string[] =>
  text
    .split(/\r?\n|,/)
    .map(v => v.trim())
    .filter(Boolean);

export const normalize = (value: string) => 
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const levenshtein = (a: string, b: string): number => {
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);

  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (b[i - 1] === a[j - 1] ? 0 : 1)
      );
    }
  }

  return matrix[b.length][a.length];
};

const fuzzyTokenMatch = (token: string, target: string) =>
  levenshtein(token, target) <= 1;

export const flexibleNameMatch = (workerName: string, query: string) => {
  const workerTokens = normalize(workerName).split(" ");
  const queryTokens = normalize(query).split(" ");

  return queryTokens.every(q =>
    workerTokens.some(w =>
      w.includes(q) || fuzzyTokenMatch(q, w)
    )
  );
};

export const normalizeWorkerInput = (input: string) =>
  input
    .split("(")[0]
    .split(":")
    .pop()
    ?.trim()
    .toLowerCase();