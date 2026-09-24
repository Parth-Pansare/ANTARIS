export interface AiMessage { id:string; role:'user'|'assistant'; text:string; timestamp:string; }
export async function askAntarisAI(prompt:string):Promise<string>{
 await new Promise(r=>setTimeout(r,650)); const p=prompt.toLowerCase();
 if(p.includes('alert')) return 'There are 3 active alerts in the demonstration dataset: 1 critical maintenance item and 2 warnings. Review the Alerts console for acknowledgement and escalation.';
 if(p.includes('energy')) return 'Energy systems are operating within the current demonstration baseline. Generator load is moderate and reserve capacity is being monitored.';
 if(p.includes('environment')) return 'Environmental telemetry is being monitored across temperature, wind and pressure channels. Forecast services remain backend/ML dependent.';
 if(p.includes('equipment')) return 'Generator G-02 is the priority inspection item in the current demo dataset. Open Equipment or Maintenance for the detailed health view.';
 if(p.includes('station')) return 'Current station systems are online in this demo. Maitri and Bharati can be switched from the station selector.';
 return 'I can help interpret station status, alerts, energy, environmental conditions and equipment attention. This demo response is ready to be replaced by the Spring Boot → AI/ML service integration.';
}
