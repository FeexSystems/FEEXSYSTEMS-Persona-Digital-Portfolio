export const PERSONA_REGISTRY = {
  identity: {
    name: 'FEEXSYSTEMS',
    role: 'BUILDER / ARCHITECT / EXPLORER',
    status: 'ONLINE',
    mode: 'EXPLORATION',
  },
  worlds: [
    { id:'3wm', name:'3WM SONIK LABS', domain:'AUDIO', description:'AI-native audio and DSP systems.', repo:'https://github.com/FeexSystems/3WM-SONIK-LABS' },
    { id:'holokai', name:'HOLOKAI', domain:'CULTURE', description:'Civilization intelligence and world-model exploration.', repo:'https://github.com/FeexSystems/HoloKai-Systems-Labs' },
    { id:'yurrheeler', name:'YURRHEELER AI', domain:'HEALTH', description:'Multi-agent healthcare intelligence.', repo:'https://github.com/FeexSystems/yurrhealer-med-advisor' },
    { id:'ojachat', name:'OJACHAT', domain:'COMMERCE', description:'Conversational shopping and recommendation systems.', repo:'https://github.com/FeexSystems/OjaChat' },
    { id:'vyra', name:'VYRA LABS', domain:'INTERFACE', description:'Conversational interface experiments.', repo:'https://github.com/FeexSystems/VYRA-LABS' },
    { id:'rental', name:'RENTAL PARADISE', domain:'REAL ESTATE', description:'Property discovery and rental experience.', repo:'https://github.com/FeexSystems/Rental-Paradise' },
  ],
  capabilities: ['AI / ML','FULL-STACK','INFRASTRUCTURE','DATA','CREATIVE TECHNOLOGY','SECURITY'],
};

export function searchPersona(query='') {
  const q = query.trim().toLowerCase();
  if (!q) return PERSONA_REGISTRY.worlds;
  return PERSONA_REGISTRY.worlds.filter(world => `${world.name} ${world.domain} ${world.description}`.toLowerCase().includes(q));
}
