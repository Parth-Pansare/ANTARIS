import { useMemo, useState } from "react";
import ThreeDStationCanvas, { type StationModelItem, type StationConnection } from "./ThreeDStationCanvas";

type S = "normal" | "warning" | "critical" | "offline" | "monitoring";
interface Item extends StationModelItem { temperature:string; power:string; alert:string; lastUpdate:string }

const systems:Item[]=[
  {id:"main",label:"Main Station",type:"Infrastructure",status:"normal",health:96,temperature:"−18°C",power:"184 kW",alert:"None",lastUpdate:"04s ago",x:0,z:0,w:7.2,d:4.2,h:2.8},
  {id:"lab",label:"Science Laboratory",type:"Laboratory",status:"monitoring",health:92,temperature:"−21°C",power:"52 kW",alert:"None",lastUpdate:"06s ago",x:-5.8,z:-2.4,w:4,d:3.2,h:2.2},
  {id:"living",label:"Residential Wing",type:"Living",status:"normal",health:94,temperature:"−16°C",power:"46 kW",alert:"None",lastUpdate:"04s ago",x:5.4,z:2.2,w:4.2,d:3,h:2.1},
  {id:"power",label:"Power House",type:"Energy",status:"normal",health:91,temperature:"74°C",power:"410 kW",alert:"None",lastUpdate:"03s ago",x:-2.8,z:5.2,w:4,d:3.2,h:2},
  {id:"fuel",label:"Fuel Storage",type:"Energy",status:"warning",health:84,temperature:"−11°C",power:"—",alert:"Reserve below target",lastUpdate:"08s ago",x:6.5,z:-4.8,w:3.2,d:2.8,h:1.8},
  {id:"comm",label:"Communications Tower",type:"Comms",status:"normal",health:98,temperature:"−22°C",power:"18 kW",alert:"None",lastUpdate:"02s ago",x:-7,z:3.5,w:2.7,d:2.4,h:1.7},
  {id:"equip",label:"Science Equipment",type:"Scientific",status:"monitoring",health:89,temperature:"−19°C",power:"31 kW",alert:"Sensor calibration due",lastUpdate:"12s ago",x:1.8,z:-4.4,w:3.5,d:2.6,h:1.7}
];

/* Conceptual station utility network: fuel feeds generation; power feeds facilities;
   communications carries telemetry/control. This is a functional demonstration topology,
   not a claim about the physical NCPOR site layout. */
const connections:StationConnection[]=[
  {from:"fuel",to:"power",label:"FUEL SUPPLY",kind:"fuel"},
  {from:"power",to:"main",label:"POWER",kind:"power"},
  {from:"power",to:"lab",label:"POWER",kind:"power"},
  {from:"power",to:"living",label:"POWER",kind:"power"},
  {from:"power",to:"comm",label:"POWER",kind:"power"},
  {from:"power",to:"equip",label:"POWER",kind:"power"},
  {from:"main",to:"comm",label:"TELEMETRY / CONTROL",kind:"data"},
  {from:"main",to:"lab",label:"OPERATIONS DATA",kind:"data"},
  {from:"main",to:"living",label:"SERVICES",kind:"support"},
  {from:"lab",to:"equip",label:"SCIENCE DATA",kind:"data"},
  {from:"fuel",to:"main",label:"FUEL LOGISTICS",kind:"support"}
];

export default function DigitalTwin({station}:{station:"MAITRI"|"BHARATI"}){
  const [selectedId,setSelectedId]=useState("main");
  const [layer,setLayer]=useState("All");
  const [viewKey,setViewKey]=useState(0);
  const [cameraCommand,setCameraCommand]=useState<{type:"reset"|"zoomIn"|"zoomOut"|"focus";id:number;targetId?:string}>({type:"reset",id:0});
  const selected=systems.find(s=>s.id===selectedId)||systems[0];
  const visible=useMemo(()=>systems.filter(s=>layer==="All"||s.type===layer||(layer==="Infrastructure"&&["Infrastructure","Laboratory","Living"].includes(s.type))),[layer]);
  const visibleIds=new Set(visible.map(x=>x.id));
  const visibleConnections=connections.filter(c=>visibleIds.has(c.from)&&visibleIds.has(c.to));
  const connectedTo=connections.filter(c=>c.from===selected.id||c.to===selected.id).map(c=>systems.find(s=>s.id===(c.from===selected.id?c.to:c.from))).filter(Boolean) as Item[];
  const reset=()=>{setViewKey(k=>k+1);setCameraCommand(c=>({type:"reset",id:c.id+1}))};
  const camera=(type:"zoomIn"|"zoomOut")=>setCameraCommand(c=>({type,id:c.id+1}));
  const selectSystem=(id:string)=>{setSelectedId(id);setCameraCommand(c=>({type:"focus",targetId:id,id:c.id+1}));};
  const model=visible.map(({temperature,power,alert,lastUpdate,...m})=>({...m,x:m.x*1.35,z:m.z*1.35}));
  const scaledConnections=visibleConnections.map(c=>({...c,from:c.from,to:c.to}));
  return <div className="page-shell twin-page">
    <div className="page-heading">
      <div><div className="eyebrow">DIGITAL TWIN / {station}</div><h1 className="page-title">{station} DIGITAL TWIN</h1><p className="page-subtitle">Interactive station utility map · orbit · zoom · pan · select systems to inspect live relationships</p></div>
      <div className="twin-controls"><button className="btn-ghost" onClick={reset}>↻ Reset View</button><button className="btn-ghost" onClick={()=>camera("zoomIn")}>＋</button><button className="btn-ghost" onClick={()=>camera("zoomOut")}>−</button><button className="btn-secondary" onClick={reset}>Full View</button></div>
    </div>
    <div className="twin-layout">
      <section className="glass twin-viewport">
        <div className="viewport-hud"><span>ANTARIS STATION DIGITAL TWIN</span><small>SCHEMATIC 3D SITE MODEL · UTILITY + DATA NETWORK</small></div>
        <ThreeDStationCanvas key={viewKey} items={model} connections={scaledConnections} selectedId={selectedId} onSelect={selectSystem} interactive command={cameraCommand} />
        <div className="viewport-legend">
          <span><i className="legend-dot normal"/> Operational</span><span><i className="legend-dot monitoring"/> Monitoring</span><span><i className="legend-dot warning"/> Attention</span>
          <span className="connection-key"><i className="line-swatch fuel"/> Fuel</span><span className="connection-key"><i className="line-swatch power"/> Power</span><span className="connection-key"><i className="line-swatch data"/> Data</span>
        </div>
        <div className="viewport-help">DRAG ORBIT · WHEEL ZOOM · SHIFT/RIGHT-DRAG PAN · CLICK SELECT · TOUCH DRAG</div>
      </section>
      <aside className="glass twin-inspector">
        <div className="section-title">SYSTEM INSPECTOR</div><div className="inspector-name font-display">{selected.label}</div><div className={`status-pill ${selected.status}`}>{selected.status.toUpperCase()}</div>
        <div className="health-ring"><strong>{selected.health}%</strong><span>HEALTH</span></div>
        {[['Type',selected.type],['Temperature',selected.temperature],['Power',selected.power],['Alert',selected.alert],['Last update',selected.lastUpdate]].map(([k,v])=><div className="inspector-row" key={k}><span>{k}</span><b>{v}</b></div>)}
        <div className="section-title layer-title">CONNECTED SYSTEMS</div>
        <div className="connection-list">
          {connectedTo.map(item=><button className="connection-row" key={item.id} onClick={()=>selectSystem(item.id)}><span className={`connection-status ${item.status}`}/><span>{item.label}</span><small>{connections.find(c=>(c.from===selected.id&&c.to===item.id)||(c.to===selected.id&&c.from===item.id))?.label}</small></button>)}
          {!connectedTo.length&&<div className="panel-note">No active relationship in the current layer.</div>}
        </div>
        <div className="section-title layer-title">VISUALIZATION LAYERS</div>
        {["All","Infrastructure","Energy","Laboratory","Comms","Scientific"].map(x=><button key={x} className={`layer-btn ${layer===x?'active':''}`} onClick={()=>setLayer(x)}>{x}</button>)}
        <div className="concept-note">Conceptual station representation for demonstration. Connections show the intended digital-twin dependency model, not an architectural or engineering claim about NCPOR facilities.</div>
      </aside>
    </div>
  </div>
}
