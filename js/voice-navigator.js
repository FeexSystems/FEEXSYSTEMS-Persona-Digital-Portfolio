// Browser-native voice input/output adapter for the Navigator.
export class VoiceNavigator {
  constructor({ input, navigator, onResult = () => {}, onState = () => {} } = {}) {
    this.input = input; this.navigator = navigator; this.onResult = onResult; this.onState = onState;
    this.recognition = null;
    const SpeechRecognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US'; this.recognition.interimResults = false; this.recognition.continuous = false;
      this.recognition.onstart = () => this.onState('LISTENING');
      this.recognition.onerror = e => this.onState(`ERROR: ${e.error}`);
      this.recognition.onend = () => this.onState('READY');
      this.recognition.onresult = async e => {
        const text = e.results?.[0]?.[0]?.transcript?.trim() || '';
        if (!text) return;
        if (this.input) this.input.value = text;
        try { const result = await this.navigator.ask(text); this.onResult(result); } catch (err) { this.onState(err.message); }
      };
    }
  }
  start() { if (!this.recognition) return false; this.recognition.start(); return true; }
  stop() { this.recognition?.stop(); }
  speak(text) {
    if (!globalThis.speechSynthesis || !text) return;
    speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
}
