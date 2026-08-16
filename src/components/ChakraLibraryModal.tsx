import React, { useState, useMemo } from 'react';
import { 
  X, Search, Compass, Layers, Sparkles, Box, Shield,
  Tag, Download, Info, Check, Move, ArrowRight
} from 'lucide-react';
import { OBJECT_LIBRARY, LibraryItem, LibraryCategory } from '../core/library/ObjectLibrary';
import { SingleSourceGeometry } from '../core/geometry/SingleSourceGeometry';

interface ChakraLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectObject: (item: LibraryItem) => void;
}

const CATEGORY_TABS: { id: LibraryCategory; label: string; icon: React.ElementType }[] = [
  { id: 'chakras', label: 'Chakra Library', icon: Compass },
  { id: 'yantras', label: 'Yantra Library', icon: Sparkles },
  { id: 'furniture', label: 'Furniture', icon: Box },
  { id: 'remedies', label: 'Vastu Remedies', icon: Shield },
  { id: 'symbols', label: 'Symbols', icon: Tag },
  { id: 'cad', label: 'CAD Components', icon: Layers },
];

export const ChakraLibraryModal: React.FC<ChakraLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectObject,
}) => {
  const [activeCategory, setActiveCategory] = useState<LibraryCategory>('chakras');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<LibraryItem | null>(
    OBJECT_LIBRARY.find(i => i.id === 'master-vastu-chakra') || OBJECT_LIBRARY[0]
  );
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return OBJECT_LIBRARY.filter(item => {
      const matchesCategory = item.category === activeCategory;
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  const handleDragStart = (e: React.DragEvent, item: LibraryItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedItemId(item.id);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-wide text-slate-100">USOM Object & Chakra Library</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md">
                  v1.1 Standard Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Single Source Geometry Objects • Drag & Drop Ready • Fully Versioned Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {CATEGORY_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search library, tags, metadata..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Content Area: Grid + Details Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Grid */}
          <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const isSelected = selectedPreviewItem?.id === item.id;
              const isDragged = draggedItemId === item.id;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={e => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedPreviewItem(item)}
                  className={`group relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                  } ${isDragged ? 'opacity-50 scale-95' : ''}`}
                >
                  <div>
                    {/* Item Top Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-slate-300 rounded border border-slate-700">
                        v{item.version}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-wider font-semibold">
                        {item.geometrySource}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Tags & Action */}
                  <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                          #{tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="text-[9px] text-slate-500 font-mono">
                          +{item.tags.length - 2}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectObject(item);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg flex items-center gap-1 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                    >
                      <span>Drop</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Drag Handle Indicator */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500">
                    <Move className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-slate-500">
                <Search className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No objects matching "{searchQuery}" in {activeCategory}</p>
                <p className="text-xs mt-1">Try switching categories or searching for standard tags.</p>
              </div>
            )}
          </div>

          {/* Preview & Single Source Geometry Metadata Panel */}
          {selectedPreviewItem && (
            <div className="w-80 border-l border-slate-800 bg-slate-950/90 p-5 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-400" />
                    Object Inspector
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                    v{selectedPreviewItem.version}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100">{selectedPreviewItem.name}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {selectedPreviewItem.description}
                </p>

                {/* Geometry Specs */}
                <div className="mt-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Single Source Geometry
                  </h4>

                  <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Source Engine:</span>
                      <span className="text-emerald-400 font-bold">{selectedPreviewItem.geometrySource}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Base Radius:</span>
                      <span className="text-slate-200">{SingleSourceGeometry.BASE_RADIUS}px</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Default Scale:</span>
                      <span className="text-slate-200">{selectedPreviewItem.defaultScale}x</span>
                    </div>
                    {selectedPreviewItem.metadata.numberOfSectors && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Sectors Matrix:</span>
                        <span className="text-slate-200">{selectedPreviewItem.metadata.numberOfSectors} Sectors</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata Tags */}
                <div className="mt-5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Engine Tags & Attributes
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPreviewItem.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <button
                  onClick={() => {
                    onSelectObject(selectedPreviewItem);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Drop onto Canvas (ObjectEngine)</span>
                </button>
                <p className="text-[10px] text-center text-slate-500">
                  Instantiated via ObjectEngine.createFromLibrary()
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
