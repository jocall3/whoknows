// Stub for InteractiveFlowAI service
export async function decomposeUserFlowAndGeneratePrototype(flow, progressCallback) {
  return Promise.resolve({ initialScreenId: 'screen1', screens: { screen1: { html: '<div>Stub Screen</div>' } }, interactionMap: {} });
}
export async function generateComponentFromHtml(html) {
  return Promise.resolve('<div>Stub React Component</div>');
}
