/**
 * Character Relationship Graph
 * Interactive force-directed graph showing biblical character relationships
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Node {
  id: string;
  name: string;
  title?: string;
  category: string;
  era?: string;
  testament?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Edge {
  source: string | Node;
  target: string | Node;
  type: string;
  subtype?: string;
  strength: number;
  sentiment: string;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface CharacterRelationshipGraphProps {
  centeredCharacter?: string;
  onNodeClick?: (character: Node) => void;
  height?: number;
  showLegend?: boolean;
  relationshipFilter?: string[];
}

// Color schemes
const CATEGORY_COLORS: Record<string, string> = {
  patriarch: '#D97706', // amber
  matriarch: '#DB2777', // pink
  prophet: '#7C3AED', // purple
  king: '#2563EB', // blue
  queen: '#EC4899', // pink
  apostle: '#059669', // emerald
  messiah: '#DC2626', // red
  disciple: '#10B981', // green
  priest: '#8B5CF6', // violet
  judge: '#F59E0B', // yellow
  leader: '#3B82F6', // blue
  family: '#6366F1', // indigo
  companion: '#14B8A6', // teal
  prince: '#0EA5E9', // sky
  default: '#6B7280', // gray
};

const RELATIONSHIP_COLORS: Record<string, string> = {
  spouse: '#EC4899', // pink
  parent: '#3B82F6', // blue
  child: '#3B82F6', // blue
  sibling: '#8B5CF6', // violet
  friend: '#10B981', // green
  mentor: '#F59E0B', // amber
  student: '#F59E0B', // amber
  enemy: '#EF4444', // red
  served: '#6366F1', // indigo
  family: '#D946EF', // fuchsia
  adversary: '#EF4444', // red
  'prophet-to': '#7C3AED', // purple
  default: '#9CA3AF', // gray
};

const SENTIMENT_STYLES: Record<string, { dash: string; opacity: number }> = {
  positive: { dash: '', opacity: 0.8 },
  negative: { dash: '5,5', opacity: 0.6 },
  complex: { dash: '3,3', opacity: 0.7 },
  neutral: { dash: '1,3', opacity: 0.5 },
};

export default function CharacterRelationshipGraph({
  centeredCharacter,
  onNodeClick,
  height = 600,
  showLegend = true,
  relationshipFilter,
}: CharacterRelationshipGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height });
  const simulationRef = useRef<any>(null);

  // Fetch graph data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (centeredCharacter) params.set('center', centeredCharacter);
        if (relationshipFilter?.length) params.set('types', relationshipFilter.join(','));

        const res = await fetch(`/api/people/graph?${params}`);
        if (!res.ok) throw new Error('Failed to fetch graph data');
        const data = await res.json();
        setGraphData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [centeredCharacter, relationshipFilter]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  // Force simulation
  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    const { width, height } = dimensions;
    const nodes = graphData.nodes.map(n => ({ ...n }));
    const edges = graphData.edges.map(e => ({
      ...e,
      source: typeof e.source === 'string' ? e.source : e.source.id,
      target: typeof e.target === 'string' ? e.target : e.target.id,
    }));

    // Initialize positions
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) / 3;
      node.x = width / 2 + radius * Math.cos(angle);
      node.y = height / 2 + radius * Math.sin(angle);
      node.vx = 0;
      node.vy = 0;
    });

    // Center the focused character
    if (centeredCharacter) {
      const centered = nodes.find(n => n.name === centeredCharacter);
      if (centered) {
        centered.fx = width / 2;
        centered.fy = height / 2;
      }
    }

    // Simple force simulation (without D3 dependency)
    const simulate = () => {
      const alpha = 0.1;
      const nodeMap = new Map(nodes.map(n => [n.id, n]));

      // Apply forces
      for (let iter = 0; iter < 100; iter++) {
        // Center gravity
        nodes.forEach(node => {
          if (node.fx === null || node.fx === undefined) {
            node.vx! += (width / 2 - node.x!) * 0.01;
            node.vy! += (height / 2 - node.y!) * 0.01;
          }
        });

        // Link force
        edges.forEach(edge => {
          const source = nodeMap.get(edge.source as string);
          const target = nodeMap.get(edge.target as string);
          if (!source || !target) return;

          const dx = target.x! - source.x!;
          const dy = target.y! - source.y!;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 100 + (10 - edge.strength) * 20;
          const force = (dist - targetDist) * 0.05;

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (source.fx === null || source.fx === undefined) {
            source.vx! += fx;
            source.vy! += fy;
          }
          if (target.fx === null || target.fx === undefined) {
            target.vx! -= fx;
            target.vy! -= fy;
          }
        });

        // Repulsion between nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            const dx = b.x! - a.x!;
            const dy = b.y! - a.y!;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 1000 / (dist * dist);

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (a.fx === null || a.fx === undefined) {
              a.vx! -= fx;
              a.vy! -= fy;
            }
            if (b.fx === null || b.fx === undefined) {
              b.vx! += fx;
              b.vy! += fy;
            }
          }
        }

        // Apply velocity
        nodes.forEach(node => {
          if (node.fx === null || node.fx === undefined) {
            node.x! += node.vx! * alpha;
            node.y! += node.vy! * alpha;
            node.vx! *= 0.9;
            node.vy! *= 0.9;

            // Bounds
            node.x = Math.max(50, Math.min(width - 50, node.x!));
            node.y = Math.max(50, Math.min(height - 50, node.y!));
          } else {
            node.x = node.fx;
            node.y = node.fy!;
          }
        });
      }

      // Update graph data with positions
      setGraphData({
        nodes: nodes,
        edges: edges.map(e => ({
          ...e,
          source: nodeMap.get(e.source as string)!,
          target: nodeMap.get(e.target as string)!,
        })),
      });
    };

    simulate();
  }, [graphData?.nodes.length, dimensions, centeredCharacter]);

  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  }, [onNodeClick]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-biblical-gold border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading relationship graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center text-red-600">
          <p>Error loading graph: {error}</p>
        </div>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center text-gray-500">
          <p>No relationship data available</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Legend */}
      {showLegend && (
        <div className="absolute top-2 left-2 bg-white/90 rounded-lg p-3 shadow-lg z-10 text-xs">
          <h4 className="font-semibold mb-2 text-biblical-deepblue">Categories</h4>
          <div className="grid grid-cols-2 gap-1 mb-3">
            {Object.entries(CATEGORY_COLORS).slice(0, 8).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="capitalize">{cat}</span>
              </div>
            ))}
          </div>
          <h4 className="font-semibold mb-2 text-biblical-deepblue">Relationships</h4>
          <div className="space-y-1">
            {['spouse', 'parent', 'friend', 'mentor', 'enemy'].map(rel => (
              <div key={rel} className="flex items-center gap-1">
                <div className="w-4 h-0.5" style={{ backgroundColor: RELATIONSHIP_COLORS[rel] }}></div>
                <span className="capitalize">{rel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      {hoveredNode && (
        <div
          className="absolute bg-white rounded-lg shadow-xl p-3 z-20 pointer-events-none"
          style={{
            left: (hoveredNode.x || 0) + 20,
            top: (hoveredNode.y || 0) - 10,
            maxWidth: 200,
          }}
        >
          <h4 className="font-bold text-biblical-deepblue">{hoveredNode.name}</h4>
          {hoveredNode.title && <p className="text-sm text-biblical-gold">{hoveredNode.title}</p>}
          <div className="flex gap-2 mt-1">
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded capitalize">
              {hoveredNode.category}
            </span>
            {hoveredNode.era && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                {hoveredNode.era}
              </span>
            )}
          </div>
        </div>
      )}

      {/* SVG Graph */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-lg"
      >
        {/* Edges */}
        <g className="edges">
          {graphData.edges.map((edge, i) => {
            const source = edge.source as Node;
            const target = edge.target as Node;
            if (!source.x || !target.x) return null;

            const color = RELATIONSHIP_COLORS[edge.type] || RELATIONSHIP_COLORS.default;
            const style = SENTIMENT_STYLES[edge.sentiment] || SENTIMENT_STYLES.neutral;

            return (
              <g key={i}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={color}
                  strokeWidth={Math.max(1, edge.strength / 3)}
                  strokeOpacity={style.opacity}
                  strokeDasharray={style.dash}
                />
                {/* Relationship label on hover */}
                <text
                  x={(source.x + target.x!) / 2}
                  y={(source.y! + target.y!) / 2 - 5}
                  textAnchor="middle"
                  className="text-[8px] fill-gray-500 opacity-0 hover:opacity-100"
                >
                  {edge.type}
                </text>
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        <g className="nodes">
          {graphData.nodes.map(node => {
            if (!node.x) return null;
            const color = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.default;
            const isSelected = selectedNode?.id === node.id;
            const isCentered = node.name === centeredCharacter;
            const radius = isCentered ? 30 : isSelected ? 25 : 20;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer"
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Glow for centered/selected */}
                {(isSelected || isCentered) && (
                  <circle
                    r={radius + 5}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    strokeOpacity={0.3}
                    className="animate-pulse"
                  />
                )}

                {/* Main circle */}
                <circle
                  r={radius}
                  fill={color}
                  stroke="white"
                  strokeWidth={2}
                  className="transition-all hover:stroke-biblical-gold hover:stroke-[3px]"
                />

                {/* Initial */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-white font-bold pointer-events-none"
                  fontSize={radius * 0.7}
                >
                  {node.name.charAt(0)}
                </text>

                {/* Name label */}
                <text
                  y={radius + 12}
                  textAnchor="middle"
                  className="fill-gray-700 text-xs font-medium pointer-events-none"
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Selected character info */}
      {selectedNode && (
        <div className="absolute bottom-2 right-2 bg-white rounded-lg shadow-xl p-4 max-w-xs z-10">
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: CATEGORY_COLORS[selectedNode.category] || CATEGORY_COLORS.default }}
            >
              {selectedNode.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-biblical-deepblue">{selectedNode.name}</h3>
              {selectedNode.title && <p className="text-sm text-biblical-gold">{selectedNode.title}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded capitalize">
              {selectedNode.category}
            </span>
            {selectedNode.era && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                {selectedNode.era}
              </span>
            )}
            {selectedNode.testament && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                {selectedNode.testament === 'OT' ? 'Old Testament' : selectedNode.testament === 'NT' ? 'New Testament' : 'Both'}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {graphData.edges.filter(
              e => (e.source as Node).id === selectedNode.id || (e.target as Node).id === selectedNode.id
            ).length} relationships
          </div>
        </div>
      )}
    </div>
  );
}
