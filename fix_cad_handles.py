import re

with open('/app/applet/src/components/SpatialAnnotationEngine.tsx', 'r') as f:
    content = f.read()

# 1. Remove handles from VastuChakraSVGOverlay
handles_pattern = re.compile(r'\{\/\* CAD INTERACTION HANDLES \(Rotate & Resize\) \*\/\}.*?<\/svg>\n            \)\}\n', re.DOTALL)
# Wait, the handles are currently AT THE END of VastuChakraSVGOverlay.
# The end of the overlay is:
#             {/* CAD INTERACTION HANDLES (Rotate & Resize) */}
#             {!chakraState.isLocked && selectedId === "chakra" && (
#               <> ... </>
#             )}
#           </>
#         )}
#       </div>
#     );

handles_start = content.find('{/* CAD INTERACTION HANDLES (Rotate & Resize) */}')
if handles_start != -1:
    handles_end = content.find('            )}\n          </>\n', handles_start)
    if handles_end != -1:
        # include the closing bracket
        handles_end += len('            )}\n')
        # delete from content
        content = content[:handles_start] + content[handles_end:]

# 2. Add Handles at the Canvas level, AFTER the Vastu Chakra Overlay block
target_insert = """                    {/* The Visuals */}
                    <div className="absolute pointer-events-none" style={{ width: '1200px', height: '1200px', transform: 'translate(-600px, -600px)' }}>
                      <VastuChakraSVGOverlay className="w-full h-full pointer-events-none" />
                    </div>
                  </div>
                )}"""

new_handles = """                    {/* The Visuals */}
                    <div className="absolute pointer-events-none" style={{ width: '1200px', height: '1200px', transform: 'translate(-600px, -600px)' }}>
                      <VastuChakraSVGOverlay className="w-full h-full pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* CAD SELECTION HANDLES FOR CHAKRA (Canvas Level) */}
                {isVastuChakraActive && !chakraState.isLocked && selectedId === "chakra" && (
                  <div 
                    className="absolute pointer-events-none z-50"
                    style={{
                      left: `${chakraState.x}px`,
                      top: `${chakraState.y}px`,
                      transform: `translate(-50%, -50%) rotate(${chakraState.rotation}deg)`
                    }}
                  >
                    {/* Dashed circular selection outline */}
                    <div 
                      className="absolute rounded-full border-2 border-dashed border-emerald-500 pointer-events-none"
                      style={{ 
                        width: `${1200 * chakraState.scale}px`, 
                        height: `${1200 * chakraState.scale}px`, 
                        transform: "translate(-50%, -50%)",
                        boxShadow: "0 0 20px rgba(16, 185, 129, 0.1)"
                      }}
                    />
                    
                    {/* Center Pivot Point */}
                    <div 
                      className="absolute w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md pointer-events-none"
                      style={{ transform: "translate(-50%, -50%)" }}
                    />

                    {/* Prominent Rotation Handle at North edge */}
                    <div 
                      className="absolute flex flex-col items-center pointer-events-auto cursor-grab group"
                      style={{ transform: `translate(-50%, -50%) translate(0, ${-600 * chakraState.scale - 40}px)` }}
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
                      <div className="w-10 h-10 bg-slate-900 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                        <svg className="w-5 h-5 text-emerald-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                    </div>

                    {/* 4 Corner Resize Handles */}
                    {[
                      { x: -1, y: -1, cursor: "nwse-resize" },
                      { x: 1, y: -1, cursor: "nesw-resize" },
                      { x: 1, y: 1, cursor: "nwse-resize" },
                      { x: -1, y: 1, cursor: "nesw-resize" }
                    ].map((pos, i) => (
                      <div
                        key={i}
                        className="absolute w-5 h-5 bg-white border-2 border-emerald-500 shadow-md pointer-events-auto"
                        style={{
                          transform: `translate(-50%, -50%) translate(${pos.x * 600 * chakraState.scale}px, ${pos.y * 600 * chakraState.scale}px)`,
                          cursor: pos.cursor,
                          borderRadius: "4px"
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
                      />
                    ))}
                  </div>
                )}"""

content = content.replace(target_insert, new_handles)

with open('/app/applet/src/components/SpatialAnnotationEngine.tsx', 'w') as f:
    f.write(content)
    print("New CAD handles applied.")
