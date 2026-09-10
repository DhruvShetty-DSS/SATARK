import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { api, Project } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { MapPin, Filter } from 'lucide-react';

export const GeospatialMapView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  useEffect(() => {
    const fetchMapProjects = async () => {
      try {
        const res = await api.get('/projects', {
          params: { page_size: 150, state: stateFilter, risk_level: riskFilter }
        });
        setProjects(res.data.projects);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMapProjects();
  }, [stateFilter, riskFilter]);

  const getColorByRisk = (level: string) => {
    switch (level) {
      case 'Critical': return '#f43f5e';
      case 'High': return '#f97316';
      case 'Medium': return '#f59e0b';
      default: return '#10b981';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span>Geospatial Intelligence Map</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Interactive GIS mapping of MPLADS community work locations and risk clusters across India</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg"
          >
            <option value="All">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Kerala">Kerala</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg"
          >
            <option value="All">All Risk Levels</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High & Critical</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-[600px] relative z-10">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Rendering GIS spatial layers...
          </div>
        ) : (
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {projects.map((p) => {
              if (!p.latitude || !p.longitude) return null;
              return (
                <CircleMarker
                  key={p.id}
                  center={[p.latitude, p.longitude]}
                  radius={p.risk_level === 'Critical' ? 8 : 6}
                  pathOptions={{
                    fillColor: getColorByRisk(p.risk_level),
                    fillOpacity: 0.85,
                    color: '#0f172a',
                    weight: 1.5
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-1 space-y-1.5 text-xs text-slate-900 font-sans">
                      <span className="font-mono font-bold text-blue-700 text-[10px] block">{p.work_id}</span>
                      <h4 className="font-bold leading-tight">{p.project_name}</h4>
                      <p className="text-[11px] text-slate-600">{p.district_name}, {p.state_name}</p>
                      <div className="flex justify-between pt-1 font-semibold text-[11px]">
                        <span>Sanctioned: ₹{p.sanctioned_amount?.toLocaleString('en-IN')}</span>
                        <span className="text-rose-600 font-bold">Risk: {p.risk_score}</span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};
