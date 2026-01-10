// Scenario management utilities

const STORAGE_KEY_SCENARIOS = "tax_scenarios";

export function saveScenario(name, taxType, inputs, outputs, regime) {
  try {
    const scenarios = getScenarios();
    const newScenario = {
      id: Date.now().toString(),
      name,
      taxType,
      inputs: JSON.parse(JSON.stringify(inputs)), // Deep copy
      outputs: JSON.parse(JSON.stringify(outputs)), // Deep copy
      regime: regime || "2026+",
      createdAt: Date.now(),
    };
    
    scenarios.push(newScenario);
    localStorage.setItem(STORAGE_KEY_SCENARIOS, JSON.stringify(scenarios));
    return newScenario;
  } catch (error) {
    console.error("Error saving scenario:", error);
    throw new Error("Failed to save scenario: " + error.message);
  }
}

export function getScenarios() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SCENARIOS);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading scenarios from localStorage:", error);
    // Clear corrupted data and return empty array
    localStorage.removeItem(STORAGE_KEY_SCENARIOS);
    return [];
  }
}

export function deleteScenario(id) {
  const scenarios = getScenarios();
  const filtered = scenarios.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY_SCENARIOS, JSON.stringify(filtered));
  return filtered;
}

export function compareScenarios(scenarioIds) {
  const scenarios = getScenarios();
  return scenarioIds.map(id => scenarios.find(s => s.id === id)).filter(Boolean);
}

