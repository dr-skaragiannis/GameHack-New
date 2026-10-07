export function passesQuickQuiz(score: number, total: number): boolean {
  if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1 || score < 0 || score > total) {
    return false;
  }
  return score >= Math.ceil((2 * total) / 3);
}
