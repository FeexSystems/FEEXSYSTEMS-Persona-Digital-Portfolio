export class AgentToolRuntime {
  constructor(tools = {}) { this.tools = Object.freeze({ ...tools }); this.audit = []; }
  async execute(name, args = {}, context = {}) {
    if (!Object.hasOwn(this.tools, name)) throw new Error(`Tool not permitted: ${name}`);
    const startedAt = performance.now();
    const result = await this.tools[name](args, context);
    const record = { id: crypto.randomUUID(), tool: name, args, timestamp: new Date().toISOString(), durationMs: Math.round(performance.now() - startedAt) };
    this.audit.push(record);
    return { result, trace: record };
  }
  manifest() { return Object.keys(this.tools); }
}
