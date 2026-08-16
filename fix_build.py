import re

with open('/app/applet/src/components/SpatialAnnotationEngine.tsx', 'r') as f:
    content = f.read()

broken_part = """                    { name: "Soma", angle: 33.75 },

  return (
    <div className="flex-1 flex flex-col bg-[#070b13] relative overflow-hidden h-screen w-full select-none">"""

fixed_part = """                    { name: "Soma", angle: 33.75 },
                    { name: "Bhallat", angle: 22.5 },
                    { name: "Aditi", angle: 348.75 },
                    { name: "Indra", angle: 90 },
                    { name: "Vitatha", angle: 168.75 },
                    { name: "Grihaksh", angle: 180 },
                    { name: "Sugriva", angle: 258.75 },
                    { name: "Pushpad", angle: 270 },
                    { name: "Asura", angle: 292.5 }
                  ];
                  return OUTER_DEITIES.map(d => {
                    const pt = polarToCartesian(600, 600, 327, d.angle);
                    return (
                      <text
                        key={d.name}
                        x={pt.x}
                        y={pt.y + 2.5}
                        fill="rgba(234, 179, 8, 0.55)"
                        fontSize="7px"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {d.name.toUpperCase()}
                      </text>
                    );
                  });
                })()}
              </svg>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b13] relative overflow-hidden h-screen w-full select-none">"""

if broken_part in content:
    content = content.replace(broken_part, fixed_part)
    print("Fixed broken SVG overlay successfully")
    with open('/app/applet/src/components/SpatialAnnotationEngine.tsx', 'w') as f:
        f.write(content)
