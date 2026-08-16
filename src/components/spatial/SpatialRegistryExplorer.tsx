import React, { useState } from 'react';
import { Database, Search, ShieldCheck, Share2, Eye, Compass, Layers } from 'lucide-react';
import { FloorPlan, SpatialObject } from '../../core/spatial/SpatialTypes';
import { SpatialObjectRegistry } from '../../core/spatial/SpatialObjectRegistry';
import { SpatialRelationshipEngine } from '../../core/spatial/SpatialRelationshipEngine';

interface SpatialRegistryExplorerProps {
  floorPlan: FloorPlan;
}

export const SpatialRegistryExplorer: React.FC<SpatialRegistryExplorerProps> = ({ floorPlan }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedObjectType, setSelectedObjectType] = useState<string>('ALL');

  const registry = SpatialObjectRegistry.getInstance();
  const objects: SpatialObject[] = registry.registerFloorPlanObjects(floorPlan);

  const filteredObjects = objects.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.cardinalDirection.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedObjectType === 'ALL' || o.type === selectedObjectType;
    return matchesSearch && matchesType;
  });

  const topology = SpatialRelationshipEngine.getInstance().buildTopologyGraph(floorPlan);

  return (
    <div className="space-y-6 text-xs text-slate-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Spatial Object Registry & Permanent ID Index
            </h2>
            <p className="text-slate-400 mt-1">
              Indexed QuadTree spatial registry assigning permanent UUIDs to rooms, walls, doors, windows, and structural elements.
            </p>
          </div>
          <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            {objects.length} Registered Spatial Entities
          </span>
        </div>

        {/* Search & Type Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Spatial ID, Name, Zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-400">Filter Type:</span>
            <select
              value={selectedObjectType}
              onChange={(e) => setSelectedObjectType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Entity Types</option>
              <option value="ROOM">Rooms</option>
              <option value="WALL">Walls</option>
              <option value="DOOR">Doors</option>
              <option value="WINDOW">Windows</option>
              <option value="STAIR">Stairs</option>
            </select>
          </div>
        </div>

        {/* Registry Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Permanent Spatial ID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Entity Name</th>
                <th className="p-3">Centroid (x, y)</th>
                <th className="p-3">Cardinal Direction</th>
                <th className="p-3">Layer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredObjects.map((obj) => (
                <tr key={obj.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono font-bold text-emerald-400">{obj.id}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-800 text-slate-200">
                      {obj.type}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">{obj.name}</td>
                  <td className="p-3 font-mono text-slate-300">
                    ({obj.coordinate.x.toFixed(1)}, {obj.coordinate.y.toFixed(1)})
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-300">{obj.cardinalDirection}</td>
                  <td className="p-3 text-slate-400">{obj.layerType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Topology Graph Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Share2 className="w-4 h-4 text-emerald-400" />
          Pure Topology & Adjacency Network Graph
        </h3>
        <p className="text-slate-400">
          Connectivity relationships derived from geometric room polygons and shared doors without Vastu rules.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-white block">Nodes (Rooms)</span>
            {topology.nodes.map((n) => (
              <div key={n.id} className="flex items-center justify-between p-2 rounded bg-slate-900 text-slate-300">
                <span className="font-bold text-white">{n.name}</span>
                <span className="font-mono text-emerald-400 font-bold">{n.direction}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-white block">Edges (Connectivity)</span>
            {topology.edges.map((e, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900 text-slate-300 font-mono text-[11px]">
                <span>{e.source} ↔ {e.target}</span>
                <span className="text-amber-400 font-bold">{e.relationship}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
