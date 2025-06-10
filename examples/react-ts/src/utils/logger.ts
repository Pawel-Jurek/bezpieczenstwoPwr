const LOG_KEY = "app_logs";

export class SimpleLogger {
  static log(message: string) {
    const entry = `[${new Date().toISOString()}] ${message}`;
    const existing = localStorage.getItem(LOG_KEY) || "";
    const updated = existing ? `${existing}\n${entry}` : entry;
    localStorage.setItem(LOG_KEY, updated);
    console.log(entry); // Still output to browser console
  }

  static clear() {
    localStorage.removeItem(LOG_KEY);
  }

  static getLogs(): string {
    return localStorage.getItem(LOG_KEY) || "";
  }

  static download(filename = "logs.txt") {
    const blob = new Blob([this.getLogs()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
