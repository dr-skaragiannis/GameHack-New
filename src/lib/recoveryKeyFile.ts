export type RecoveryKeyCredential = { email: string; recoveryKey: string };

type RecoveryKeyFile = RecoveryKeyCredential & {
  format: "gamehack-recovery-key";
  version: 1;
};

const universityEmailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@ionio\.gr$/i;

export function parseRecoveryKeyFile(contents: string): RecoveryKeyCredential | null {
  try {
    const parsed: unknown = JSON.parse(contents);
    if (!parsed || typeof parsed !== "object") return null;
    const file = parsed as Partial<RecoveryKeyFile>;
    if (
      file.format !== "gamehack-recovery-key" ||
      file.version !== 1 ||
      typeof file.email !== "string" ||
      !universityEmailPattern.test(file.email) ||
      typeof file.recoveryKey !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(file.recoveryKey)
    ) return null;
    return { email: file.email.trim().toLowerCase(), recoveryKey: file.recoveryKey };
  } catch {
    return null;
  }
}

export function downloadRecoveryKeyFile(email: string, recoveryKey: string): void {
  const file: RecoveryKeyFile = {
    format: "gamehack-recovery-key",
    version: 1,
    email: email.trim().toLowerCase(),
    recoveryKey,
  };
  const blob = new Blob([`${JSON.stringify(file, null, 2)}\n`], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "gamehack-recovery-key.json";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
