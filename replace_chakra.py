import re

with open('src/components/SpatialAnnotationEngine.tsx', 'r') as f:
    content = f.read()

# We need to find the block starting with:
#                 {isVastuChakraActive && (
#                   <div 
#                     className={`absolute z-40 ${!chakraState.isLocked ? "pointer-events-auto" : "pointer-events-none"}`}
# up to the end of the handles container.

pattern = re.compile(
    r'\{\s*isVastuChakraActive\s*&&\s*\(\s*<div\s*className=\{`absolute z-40 \$\{!chakraState.isLocked \? "pointer-events-auto" : "pointer-events-none"\}`\}.*?\{/\* Handles Container \*/\}.*?\)\}\s*</div>\s*</div>\s*\)\}',
    re.DOTALL
)

replacement = """{isVastuChakraActive && engineChakra && (() => {
                  const chakraGeometry = engineChakra.geometry;
                  const handles = HandleCalculator.calculateChakraHandles(chakraGeometry);
                  const isLocked = engineChakra.isLocked;
                  const t = engineChakra.transform;
                  
                  return (
                  <div 
                    className={`absolute z-40 ${!isLocked ? "pointer-events-auto" : "pointer-events-none"}`}
                    style={{ 
                       left: `${t.position.x}px`, 
                       top: `${t.position.y}px`,
                       width: '0px',
                       height: '0px'
                     }}
                  >
                    {/* Rotated Container (for Hit Area and Handles) */}
                    <div 
                      className="absolute"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${t.rotation}deg)`,
                        width: '0px',
                        height: '0px'
                      }}
                    >
                      {/* The Scaled SVG Container (Preserving original SVG implementation) */}
                      <div 
                        className="absolute pointer-events-none" 
                        style={{ transform: `scale(${t.scale.x})`, width: '0px', height: '0px' }}
                      >
                         {/* 45-55% Opacity on the original vibrant colors */}
                         <div className="absolute top-1/2 left-1/2 transition-opacity duration-300 pointer-events-none" style={{ transform: 'translate(-50%, -50%)', opacity: selectedId === "chakra" ? 0.55 : 0.45 }}>
                            <VastuChakraSVGOverlay className="pointer-events-none" />
                         </div>
                      </div>

                      {/* The Hit Area - Uses engine geometry! */}
                      <div 
                         className="absolute rounded-full"
                         style={{
                            width: `${chakraGeometry.radius * 2}px`,
                            height: `${chakraGeometry.radius * 2}px`,
                            transform: 'translate(-50%, -50%)',
                            clipPath: 'circle(50% at 50% 50%)',
                            pointerEvents: isLocked ? 'none' : 'auto',
                            cursor: isLocked ? 'default' : 'move',
                            backgroundColor: 'rgba(0,0,0,0.001)' // Transparent but catches events
                         }}
                         onPointerDown={(e) => {
                           if (isLocked) return;
                           if ((e.target as HTMLElement).closest('.cad-handle')) return;
                           
                           e.stopPropagation();
                           e.currentTarget.setPointerCapture(e.pointerId);
                           setSelectedId("chakra");
                           setIsDraggingChakra(true);
                           const coords = getCanvasCoords(e);
                           // SPRINT 3A constraints: Keep chakraState for pointer interaction 
                           setChakraDragOffset({
                             x: coords.x - chakraState.x,
                             y: coords.y - chakraState.y
                           });
                         }}
                      >
                      </div>

                      {/* Handles Container - Uses Engine HandleCalculator */}
                      {!isLocked && selectedId === "chakra" && (
                        <div className="absolute pointer-events-none" style={{ width: '0px', height: '0px' }}>
                           {handles.map((handle, i) => {
                             if (handle.type === HandleType.ROTATE) {
                               return (
                                 <div key="rotate-handle" className="absolute flex flex-col items-center pointer-events-none" style={{ transform: `translate(-50%, -50%) translate(${handle.position.x}px, ${handle.position.y}px)` }}>
                                   {/* Rotation Handle */}
                                   <div
                                      className="bg-slate-900 border border-emerald-500 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-500/20 transition-colors pointer-events-auto cursor-grab cad-handle"
                                      style={{
                                        width: `20px`,
                                        height: `20px`,
                                        borderWidth: `1.5px`,
                                        zIndex: 10,
                                      }}
                                      onPointerDown={(e) => {
                                        e.stopPropagation();
                                        e.currentTarget.setPointerCapture(e.pointerId);
                                        setIsRotatingChakra(true);
                                        const coords = getCanvasCoords(e);
                                        const dx = coords.x - chakraState.x;
                                        const dy = coords.y - chakraState.y;
                                        setChakraInteractionStart({
                                          angle: (Math.atan2(dy, dx) * 180) / Math.PI,
                                          rotation: chakraState.rotation,
                                          x: 0,
                                          y: 0,
                                          scale: chakraState.scale
                                        });
                                      }}
                                      title="Rotate Vastu Chakra"
                                   >
                                     <svg style={{ width: `12px`, height: `12px` }} className="text-emerald-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                     </svg>
                                   </div>
                                   {/* Thin line connecting handle to Chakra */}
                                   <div className="w-[1px] bg-emerald-500 absolute" style={{ height: `20px`, opacity: 0.6, top: '20px' }} />
                                 </div>
                               );
                             }
                             if (handle.type === HandleType.SCALE) {
                               return (
                                 <div key="scale-handle" className="absolute flex flex-row items-center pointer-events-none" style={{ transform: `translate(-50%, -50%) translate(${handle.position.x}px, ${handle.position.y}px)` }}>
                                   {/* Resize Handle */}
                                   <div
                                      className="bg-slate-900 border border-emerald-500 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-500/20 transition-colors pointer-events-auto cursor-ew-resize cad-handle"
                                      style={{
                                        width: `20px`,
                                        height: `20px`,
                                        borderWidth: `1.5px`,
                                        zIndex: 10,
                                      }}
                                      onPointerDown={(e) => {
                                        e.stopPropagation();
                                        e.currentTarget.setPointerCapture(e.pointerId);
                                        setIsResizingChakra(true);
                                        const coords = getCanvasCoords(e);
                                        const dx = coords.x - chakraState.x;
                                        const dy = coords.y - chakraState.y;
                                        setChakraResizeStart({
                                          scale: chakraState.scale,
                                          dist: Math.sqrt(dx * dx + dy * dy)
                                        });
                                      }}
                                      title="Scale Vastu Chakra"
                                   >
                                     <svg style={{ width: `12px`, height: `12px` }} className="text-emerald-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                     </svg>
                                   </div>
                                 </div>
                               );
                             }
                             return null;
                           })}
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })()}"""

new_content = pattern.sub(replacement, content)
with open('src/components/SpatialAnnotationEngine.tsx', 'w') as f:
    f.write(new_content)

print(f"Replaced? {new_content != content}")
