// ==========================================
// WasteWiseAI — Scenario Simulator
// ==========================================

import { FlaskConical, AlertTriangle } from 'lucide-react';
import { ScenarioType, Scenario } from '../types';
import { scenariosData } from '../data/scenarios';

interface ScenarioSimulatorProps {
  activeScenario: ScenarioType;
  scenario: Scenario;
  onChange: (type: ScenarioType) => void;
}

const scenarioIcons: Record<ScenarioType, string> = {
  normal: '☀️',
  festival: '🎉',
  'heavy-rain': '🌧️',
  traffic: '🚗',
  'truck-unavailable': '🚫',
};

export default function ScenarioSimulator({ activeScenario, scenario, onChange }: ScenarioSimulatorProps) {
  return (
    <div className="panel scenario-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <FlaskConical size={16} className="panel-header-icon amber" />
          <h3 className="panel-title">Scenario Simulator</h3>
        </div>
      </div>

      <div className="scenario-buttons">
        {scenariosData.map(sc => (
          <button
            key={sc.type}
            className={`scenario-btn ${activeScenario === sc.type ? 'active' : ''}`}
            onClick={() => onChange(sc.type)}
          >
            <span className="scenario-emoji">{scenarioIcons[sc.type]}</span>
            <span className="scenario-label">{sc.label}</span>
          </button>
        ))}
      </div>

      {activeScenario !== 'normal' && (
        <div className="scenario-active-info">
          <AlertTriangle size={14} />
          <div>
            <div className="scenario-active-title">Scenario Active: {scenario.label}</div>
            <div className="scenario-active-desc">{scenario.description}</div>
            {scenario.wasteGenerationIncrease > 0 && (
              <div className="scenario-active-impact">
                Estimated waste generation: +{scenario.wasteGenerationIncrease}%
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
