const LOG_KEY = "app_logs";

export class SimpleLogger {
  private static key: string = LOG_KEY;

  static setKey(key: string) {
    this.key = key;
    return SimpleLogger;
  }

  static log(...messages: (string | number)[]) {
    const entry = `[${new Date().toISOString()}] ${messages.join(" ")}`;
    const existing = localStorage.getItem(SimpleLogger.key) || "";
    const updated = existing ? `${existing}\n${entry}` : entry;
    localStorage.setItem(SimpleLogger.key, updated);
    // console.log(entry); // Still output to browser console
  }

  static clear() {
    localStorage.removeItem(SimpleLogger.key);
  }

  static getLogs(): string {
    return localStorage.getItem(SimpleLogger.key) || "";
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
