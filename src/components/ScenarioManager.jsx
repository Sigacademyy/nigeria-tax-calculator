import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { saveScenario, getScenarios, deleteScenario, compareScenarios } from "../utils/scenarios";

export default function ScenarioManager({ taxType, inputs, outputs, regime, onScenarioSelect }) {
  const { showToast } = useToast();
  const [scenarios, setScenarios] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [selectedScenarios, setSelectedScenarios] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = () => {
    try {
      const saved = getScenarios();
      setScenarios(saved);
    } catch (error) {
      console.error("Error loading scenarios:", error);
      showToast("Error loading scenarios", "error");
      setScenarios([]);
    }
  };

  const handleSaveScenario = () => {
    if (!scenarioName.trim()) {
      showToast("Please enter a scenario name", "error");
      return;
    }

    setIsSaving(true);
    try {
      saveScenario(scenarioName, taxType, inputs, outputs, regime);
      showToast("Scenario saved successfully!", "success");
      setScenarioName("");
      loadScenarios();
    } catch (e) {
      console.error("Error saving scenario:", e);
      showToast("Failed to save scenario: " + (e.message || "Unknown error"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteScenario = (id) => {
    if (window.confirm("Are you sure you want to delete this scenario?")) {
      try {
        deleteScenario(id);
        showToast("Scenario deleted", "success");
        loadScenarios();
        setSelectedScenarios(selectedScenarios.filter(sid => sid !== id));
      } catch (error) {
        console.error("Error deleting scenario:", error);
        showToast("Failed to delete scenario", "error");
      }
    }
  };

  const handleToggleSelection = (id) => {
    setSelectedScenarios(prev => 
      prev.includes(id) 
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (selectedScenarios.length < 2) {
      showToast("Please select at least 2 scenarios to compare", "error");
      return;
    }
    setShowComparison(true);
  };

  const comparisonData = showComparison ? compareScenarios(selectedScenarios) : [];

  if (showComparison && comparisonData.length > 0) {
    return (
      <div className="card" style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, color: "var(--text-main)" }}>Scenario Comparison</h3>
          <button
            onClick={() => {
              setShowComparison(false);
              setSelectedScenarios([]);
            }}
            className="btn-outline"
            style={{ padding: "8px 16px" }}
          >
            Back to Scenarios
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-soft)" }}>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid var(--border)" }}>Field</th>
                {comparisonData.map((scenario, idx) => (
                  <th key={scenario.id} style={{ padding: "12px", textAlign: "left", border: "1px solid var(--border)", minWidth: "200px" }}>
                    {scenario.name}
                    <div style={{ fontSize: "11px", fontWeight: 400, color: "var(--text-muted)", marginTop: "4px" }}>
                      {new Date(scenario.createdAt).toLocaleDateString()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Inputs */}
              <tr>
                <td colSpan={comparisonData.length + 1} style={{ padding: "12px", backgroundColor: "var(--bg-soft)", fontWeight: 600, border: "1px solid var(--border)" }}>
                  INPUTS
                </td>
              </tr>
              {Object.keys(comparisonData[0].inputs || {}).map(key => {
                const values = comparisonData.map(s => s.inputs[key]);
                const allSame = values.every(v => v === values[0]);
                return (
                  <tr key={key}>
                    <td style={{ padding: "8px", border: "1px solid var(--border)", fontWeight: 500 }}>{key}</td>
                    {values.map((value, idx) => (
                      <td 
                        key={idx} 
                        style={{ 
                          padding: "8px", 
                          border: "1px solid var(--border)",
                          backgroundColor: !allSame ? "var(--primary-soft)" : "transparent",
                        }}
                      >
                        {typeof value === 'number' ? `₦${value.toLocaleString()}` : value || "-"}
                      </td>
                    ))}
                  </tr>
                );
              })}
              
              {/* Outputs */}
              <tr>
                <td colSpan={comparisonData.length + 1} style={{ padding: "12px", backgroundColor: "var(--bg-soft)", fontWeight: 600, border: "1px solid var(--border)", marginTop: "20px" }}>
                  RESULTS
                </td>
              </tr>
              {Object.keys(comparisonData[0].outputs || {}).map(key => {
                const values = comparisonData.map(s => s.outputs[key]);
                const allSame = values.every(v => v === values[0]);
                return (
                  <tr key={key}>
                    <td style={{ padding: "8px", border: "1px solid var(--border)", fontWeight: 500 }}>{key}</td>
                    {values.map((value, idx) => (
                      <td 
                        key={idx} 
                        style={{ 
                          padding: "8px", 
                          border: "1px solid var(--border)",
                          backgroundColor: !allSame ? "var(--primary-soft)" : "transparent",
                          fontWeight: 600,
                        }}
                      >
                        {typeof value === 'number' ? `₦${value.toLocaleString()}` : value || "-"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: "20px" }}>
      <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--text-main)" }}>Save & Compare Scenarios</h3>

      {/* Save Current Scenario */}
      <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "var(--bg-soft)", borderRadius: "8px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "var(--text-main)" }}>
          Save Current Calculation as Scenario
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="Enter scenario name (e.g., 'Base Case', 'Optimistic')"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSaveScenario()}
            style={{
              flex: 1,
              padding: "10px",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
          <button
            onClick={handleSaveScenario}
            disabled={isSaving || !scenarioName.trim()}
            className="btn-primary"
            style={{
              padding: "10px 20px",
              opacity: isSaving || !scenarioName.trim() ? 0.5 : 1,
              cursor: isSaving || !scenarioName.trim() ? "not-allowed" : "pointer",
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Saved Scenarios */}
      {scenarios.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ margin: 0, color: "var(--text-main)" }}>Saved Scenarios ({scenarios.length})</h4>
            {selectedScenarios.length >= 2 && (
              <button
                onClick={handleCompare}
                className="btn-primary"
                style={{ padding: "8px 16px" }}
              >
                Compare Selected ({selectedScenarios.length})
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {scenarios
              .filter(s => s.taxType === taxType)
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((scenario) => (
                <div
                  key={scenario.id}
                  style={{
                    padding: "12px",
                    border: selectedScenarios.includes(scenario.id) 
                      ? "2px solid var(--primary)" 
                      : "1px solid var(--border)",
                    borderRadius: "8px",
                    backgroundColor: selectedScenarios.includes(scenario.id) 
                      ? "var(--primary-soft)" 
                      : "var(--bg-card)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleToggleSelection(scenario.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedScenarios.includes(scenario.id)}
                    onChange={() => handleToggleSelection(scenario.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                      {scenario.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {scenario.taxType} • {new Date(scenario.createdAt).toLocaleString()} • {scenario.regime === "pre-2026" ? "Pre-2026" : "2026+"}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteScenario(scenario.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: "4px 8px",
                      fontSize: "18px",
                    }}
                    title="Delete scenario"
                  >
                    🗑️
                  </button>
                </div>
              ))}
          </div>

          {scenarios.filter(s => s.taxType === taxType).length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📊</div>
              <p>No scenarios saved yet for {taxType}</p>
            </div>
          )}
        </>
      )}

      {scenarios.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>💾</div>
          <p>Save your first scenario to start comparing different tax calculations</p>
        </div>
      )}
    </div>
  );
}

