import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { Play, Pause, RotateCcw, Info, Zap, Shield } from 'lucide-react';

const TopologyVisualizer = () => {
  const svgRef = useRef();
  const animationRef = useRef();
  const [mode, setMode] = useState('continuous');
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState('idle');
  const [showEducationalPanel, setShowEducationalPanel] = useState(false);
  const [currentExample, setCurrentExample] = useState(0);
  const [highlightedPath, setHighlightedPath] = useState(null);

  // Enhanced concepts with better spacing and positioning
  const concepts = [
    // Cities cluster (left side)
    { id: 'paris', label: 'Paris', x: 100, y: 120, category: 'cities', color: '#3b82f6', facts: ['Capital of France', 'City of Light', 'Population: 2.1M'] },
    { id: 'london', label: 'London', x: 80, y: 180, category: 'cities', color: '#3b82f6', facts: ['Capital of UK', 'Thames River', 'Population: 9M'] },
    { id: 'tokyo', label: 'Tokyo', x: 150, y: 160, category: 'cities', color: '#3b82f6', facts: ['Capital of Japan', 'Largest metro area', 'Population: 37M'] },
    
    // Countries cluster (bottom left)
    { id: 'france', label: 'France', x: 70, y: 280, category: 'countries', color: '#1d4ed8', facts: ['European country', '67M population', 'Republic'] },
    { id: 'japan', label: 'Japan', x: 180, y: 280, category: 'countries', color: '#1d4ed8', facts: ['Island nation', '125M population', 'Constitutional monarchy'] },
    
    // Planets cluster (right side)
    { id: 'jupiter', label: 'Jupiter', x: 480, y: 120, category: 'planets', color: '#ef4444', facts: ['Gas giant', 'Largest planet', '79 moons'] },
    { id: 'mars', label: 'Mars', x: 450, y: 180, category: 'planets', color: '#ef4444', facts: ['Red planet', 'Fourth from sun', 'Two moons'] },
    { id: 'earth', label: 'Earth', x: 520, y: 170, category: 'planets', color: '#ef4444', facts: ['Our home', 'Blue planet', 'One moon'] },
    
    // Concepts cluster (center)
    { id: 'capital', label: 'Capital', x: 280, y: 120, category: 'concepts', color: '#10b981', facts: ['Administrative center', 'Seat of government', 'Political hub'] },
    { id: 'planet', label: 'Planet', x: 380, y: 120, category: 'concepts', color: '#10b981', facts: ['Celestial body', 'Orbits star', 'Cleared orbit'] },
    { id: 'city', label: 'City', x: 230, y: 180, category: 'concepts', color: '#10b981', facts: ['Urban area', 'Dense population', 'Infrastructure'] },
  ];

  const hallucinations = [
    { from: 'paris', to: 'jupiter', connection: 'capital of', severity: 'absurd', offset: 0 },
    { from: 'tokyo', to: 'mars', connection: 'located on', severity: 'impossible', offset: 30 },
    { from: 'london', to: 'earth', connection: 'moon of', severity: 'category-error', offset: -20 }
  ];

  const validConnections = [
    { from: 'paris', to: 'france', connection: 'capital of', strength: 1.0 },
    { from: 'tokyo', to: 'japan', connection: 'capital of', strength: 1.0 },
    { from: 'paris', to: 'city', connection: 'is a', strength: 0.9 },
    { from: 'jupiter', to: 'planet', connection: 'is a', strength: 0.9 },
  ];

  const educationalExamples = [
    {
      title: "The Classic Hallucination",
      description: "Why does AI sometimes say 'Paris is the capital of Jupiter'?",
      highlight: { from: 'paris', to: 'jupiter' },
      explanation: "In continuous space, the AI finds a path: Paris → Capital → (some mathematical interpolation) → Planet → Jupiter. There's no hard boundary preventing this impossible connection."
    },
    {
      title: "Continuous Interpolation Problem",
      description: "Everything connects to everything else",
      highlight: "all-paths",
      explanation: "Current transformers operate in continuous vector spaces where any concept can theoretically reach any other through smooth mathematical transformations."
    },
    {
      title: "Proposed Solution: Discrete Boundaries",
      description: "Topological barriers prevent impossible connections",
      highlight: { from: 'tokyo', to: 'mars' },
      explanation: "With torsion and discrete boundaries, incompatible concept categories would have unbridgeable gaps, making hallucinations mathematically impossible."
    }
  ];

  const animateHallucination = useCallback(() => {
    if (!isAnimating) return;
    
    const svg = d3.select(svgRef.current);
    const currentHallucination = hallucinations[currentExample % hallucinations.length];
    
    const fromNode = concepts.find(c => c.id === currentHallucination.from);
    const toNode = concepts.find(c => c.id === currentHallucination.to);
    
    // Animate a "thinking" particle along the hallucination path
    const particle = svg.append('circle')
      .attr('r', 6)
      .attr('fill', '#fbbf24')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('cx', fromNode.x)
      .attr('cy', fromNode.y);
    
    particle
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('cx', toNode.x)
      .attr('cy', toNode.y)
      .on('end', () => {
        particle.remove();
        if (isAnimating) {
          setTimeout(animateHallucination, 1000);
        }
      });
  }, [isAnimating, currentExample, concepts, hallucinations]);

  useEffect(() => {
    if (isAnimating && animationType === 'hallucination') {
      animateHallucination();
    }
  }, [isAnimating, animationType, animateHallucination]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;

    // Create background grid for reference
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      svg.append('line')
        .attr('x1', x).attr('y1', 0)
        .attr('x2', x).attr('y2', height)
        .attr('stroke', '#f1f5f9')
        .attr('stroke-width', 1);
    }
    for (let y = 0; y < height; y += gridSize) {
      svg.append('line')
        .attr('x1', 0).attr('y1', y)
        .attr('x2', width).attr('y2', y)
        .attr('stroke', '#f1f5f9')
        .attr('stroke-width', 1);
    }

    if (mode === 'continuous') {
      // Show the "embedding space" with gradient background
      const gradient = svg.append('defs')
        .append('radialGradient')
        .attr('id', 'embedding-gradient')
        .attr('cx', '50%').attr('cy', '50%')
        .attr('r', '50%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ddd6fe')
        .attr('stop-opacity', 0.3);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#e0e7ff')
        .attr('stop-opacity', 0.1);

      svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'url(#embedding-gradient)');

      // Show all possible interpolation paths
      concepts.forEach((concept1, i) => {
        concepts.forEach((concept2, j) => {
          if (i < j) {
            const distance = Math.sqrt(
              Math.pow(concept1.x - concept2.x, 2) + 
              Math.pow(concept1.y - concept2.y, 2)
            );
            const opacity = Math.max(0.05, 0.3 - distance/500);
            
            svg.append('line')
              .attr('x1', concept1.x)
              .attr('y1', concept1.y)
              .attr('x2', concept2.x)
              .attr('y2', concept2.y)
              .attr('stroke', '#94a3b8')
              .attr('stroke-width', 1)
              .attr('opacity', opacity)
              .style('pointer-events', 'none');
          }
        });
      });

      // Highlight hallucination paths with better spacing and labels
      hallucinations.forEach((hallucination, idx) => {
        const fromNode = concepts.find(c => c.id === hallucination.from);
        const toNode = concepts.find(c => c.id === hallucination.to);
        
        const line = svg.append('line')
          .attr('x1', fromNode.x)
          .attr('y1', fromNode.y)
          .attr('x2', toNode.x)
          .attr('y2', toNode.y)
          .attr('stroke', '#dc2626')
          .attr('stroke-width', 3)
          .attr('opacity', 0.8)
          .style('stroke-dasharray', '8,4');

        // Add pulsing animation to hallucination paths
        line.append('animate')
          .attr('attributeName', 'opacity')
          .attr('values', '0.8;0.3;0.8')
          .attr('dur', '2s')
          .attr('repeatCount', 'indefinite');

        // Add label with better positioning to avoid overlap
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        const labelOffset = hallucination.offset || (idx * 25 - 25); // Spread labels vertically
        
        // Background for label
        svg.append('rect')
          .attr('x', midX - hallucination.connection.length * 3.5)
          .attr('y', midY + labelOffset - 8)
          .attr('width', hallucination.connection.length * 7)
          .attr('height', 16)
          .attr('fill', 'rgba(254, 242, 242, 0.95)')
          .attr('stroke', '#dc2626')
          .attr('stroke-width', 1)
          .attr('rx', 3);

        svg.append('text')
          .attr('x', midX)
          .attr('y', midY + labelOffset + 3)
          .attr('text-anchor', 'middle')
          .attr('fill', '#dc2626')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text(`"${hallucination.connection}"`);
      });

    } else {
      // Discrete mode with topological boundaries
      const categories = [...new Set(concepts.map(c => c.category))];
      
      categories.forEach((category, categoryIndex) => {
        const categoryNodes = concepts.filter(c => c.category === category);
        if (categoryNodes.length > 1) {
          const hull = d3.polygonHull(categoryNodes.map(d => [d.x, d.y]));
          if (hull) {
            const padding = 35;
            const expandedHull = hull.map(point => {
              const center = d3.polygonCentroid(hull);
              const dx = point[0] - center[0];
              const dy = point[1] - center[1];
              const length = Math.sqrt(dx * dx + dy * dy);
              return [
                center[0] + (dx / length) * (length + padding),
                center[1] + (dy / length) * (length + padding)
              ];
            });

            // Create boundary with gradient effect
            const boundaryGradient = svg.append('defs')
              .append('linearGradient')
              .attr('id', `boundary-${categoryIndex}`)
              .attr('gradientUnits', 'objectBoundingBox');

            boundaryGradient.append('stop')
              .attr('offset', '0%')
              .attr('stop-color', categoryNodes[0].color)
              .attr('stop-opacity', 0.2);

            boundaryGradient.append('stop')
              .attr('offset', '100%')
              .attr('stop-color', categoryNodes[0].color)
              .attr('stop-opacity', 0.05);

            svg.append('polygon')
              .attr('points', expandedHull.map(d => d.join(',')).join(' '))
              .attr('fill', `url(#boundary-${categoryIndex})`)
              .attr('stroke', categoryNodes[0].color)
              .attr('stroke-width', 3)
              .attr('stroke-dasharray', '5,3')
              .style('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))');

            // Add category label with better positioning
            const center = d3.polygonCentroid(expandedHull);
            const labelY = Math.min(center[1] - 40, 25); // Keep labels in visible area
            svg.append('text')
              .attr('x', center[0])
              .attr('y', labelY)
              .attr('text-anchor', 'middle')
              .attr('fill', categoryNodes[0].color)
              .attr('font-size', '13px')
              .attr('font-weight', 'bold')
              .attr('opacity', 0.8)
              .style('text-shadow', '1px 1px 2px rgba(255,255,255,0.8)')
              .text(category.charAt(0).toUpperCase() + category.slice(1));
          }
        }
      });

      // Show valid connections within categories
      validConnections.forEach(connection => {
        const fromNode = concepts.find(c => c.id === connection.from);
        const toNode = concepts.find(c => c.id === connection.to);
        
        svg.append('line')
          .attr('x1', fromNode.x)
          .attr('y1', fromNode.y)
          .attr('x2', toNode.x)
          .attr('y2', toNode.y)
          .attr('stroke', '#10b981')
          .attr('stroke-width', 3)
          .attr('opacity', 0.8);

        // Add connection label
        svg.append('text')
          .attr('x', (fromNode.x + toNode.x) / 2)
          .attr('y', (fromNode.y + toNode.y) / 2 - 8)
          .attr('text-anchor', 'middle')
          .attr('fill', '#059669')
          .attr('font-size', '10px')
          .attr('font-weight', '500')
          .text(connection.connection);
      });

      // Show blocked hallucinations with better positioned barrier symbols
      hallucinations.forEach((hallucination, idx) => {
        const fromNode = concepts.find(c => c.id === hallucination.from);
        const toNode = concepts.find(c => c.id === hallucination.to);
        
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2 + (hallucination.offset || 0);

        // Draw faded blocked connection line first
        svg.append('line')
          .attr('x1', fromNode.x)
          .attr('y1', fromNode.y)
          .attr('x2', toNode.x)
          .attr('y2', toNode.y)
          .attr('stroke', '#dc2626')
          .attr('stroke-width', 2)
          .attr('opacity', 0.2)
          .style('stroke-dasharray', '5,5');

        // Barrier symbol with better positioning
        const barrierSize = 35;
        svg.append('rect')
          .attr('x', midX - barrierSize/2)
          .attr('y', midY - barrierSize/2)
          .attr('width', barrierSize)
          .attr('height', barrierSize)
          .attr('fill', '#fef2f2')
          .attr('stroke', '#dc2626')
          .attr('stroke-width', 2)
          .attr('rx', 8)
          .style('filter', 'drop-shadow(2px 2px 4px rgba(220,38,38,0.3))');

        // Lightning bolt symbol
        svg.append('text')
          .attr('x', midX)
          .attr('y', midY + 6)
          .attr('text-anchor', 'middle')
          .attr('fill', '#dc2626')
          .attr('font-size', '18px')
          .attr('font-weight', 'bold')
          .text('⚡');

        // "BLOCKED" label positioned to avoid overlap
        const labelOffset = idx % 2 === 0 ? -45 : 45;
        svg.append('text')
          .attr('x', midX)
          .attr('y', midY + labelOffset)
          .attr('text-anchor', 'middle')
          .attr('fill', '#dc2626')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('opacity', 0.8)
          .text('BLOCKED');

        // Connection type label with better positioning
        const connectionLabelY = midY + (labelOffset > 0 ? -35 : 35);
        svg.append('rect')
          .attr('x', midX - hallucination.connection.length * 3)
          .attr('y', connectionLabelY - 8)
          .attr('width', hallucination.connection.length * 6)
          .attr('height', 16)
          .attr('fill', 'rgba(254, 242, 242, 0.9)')
          .attr('stroke', '#dc2626')
          .attr('stroke-width', 1)
          .attr('rx', 3);

        svg.append('text')
          .attr('x', midX)
          .attr('y', connectionLabelY + 3)
          .attr('text-anchor', 'middle')
          .attr('fill', '#dc2626')
          .attr('font-size', '10px')
          .attr('font-weight', '600')
          .text(`"${hallucination.connection}"`);
      });
    }

    // Draw enhanced concept nodes
    const nodes = svg.selectAll('.node')
      .data(concepts)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (event, d) => setSelectedConcept(d))
      .on('mouseover', function(event, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', 18)
          .attr('stroke-width', 3);
      })
      .on('mouseout', function(event, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', 15)
          .attr('stroke-width', 2);
      });

    // Node circles with gradient
    const nodeGradients = nodes.append('defs')
      .append('radialGradient')
      .attr('id', d => `node-gradient-${d.id}`)
      .attr('cx', '30%').attr('cy', '30%');

    nodeGradients.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d => d3.color(d.color).brighter(0.5));

    nodeGradients.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d => d.color);

    nodes.append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 15)
      .attr('fill', d => `url(#node-gradient-${d.id})`)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))');

    // Node labels with background
    nodes.append('rect')
      .attr('x', d => d.x - d.label.length * 3.5)
      .attr('y', d => d.y + 20)
      .attr('width', d => d.label.length * 7)
      .attr('height', 16)
      .attr('fill', 'rgba(255,255,255,0.9)')
      .attr('stroke', '#e5e7eb')
      .attr('rx', 3);

    nodes.append('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y + 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1f2937')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .text(d => d.label);

  }, [mode, currentExample]);

  const startAnimation = (type) => {
    setAnimationType(type);
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  const resetVisualization = () => {
    setIsAnimating(false);
    setCurrentExample(0);
    setSelectedConcept(null);
    setHighlightedPath(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
          <h1 className="text-4xl font-bold mb-2">
            AI Hallucination Deep Dive
          </h1>
          <p className="text-blue-100 text-lg">
            Interactive exploration of topological vs. statistical explanations for AI hallucinations
          </p>
        </div>

        {/* Control Panel */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => setMode('continuous')}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  mode === 'continuous' 
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
                }`}
              >
                <Zap size={16} />
                Current AI (Continuous)
              </button>
              <button
                onClick={() => setMode('discrete')}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  mode === 'discrete' 
                    ? 'bg-green-600 text-white shadow-lg transform scale-105' 
                    : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-300'
                }`}
              >
                <Shield size={16} />
                With Torsion (Discrete)
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => isAnimating ? stopAnimation() : startAnimation('hallucination')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isAnimating 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {isAnimating ? <Pause size={16} /> : <Play size={16} />}
                {isAnimating ? 'Stop' : 'Animate'}
              </button>
              <button
                onClick={resetVisualization}
                className="px-4 py-2 rounded-lg font-medium bg-gray-500 text-white hover:bg-gray-600 transition-all flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                onClick={() => setShowEducationalPanel(!showEducationalPanel)}
                className="px-4 py-2 rounded-lg font-medium bg-purple-500 text-white hover:bg-purple-600 transition-all flex items-center gap-2"
              >
                <Info size={16} />
                Learn
              </button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Main Visualization */}
          <div className="flex-1 p-6">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200">
              <svg ref={svgRef} width="600" height="400" className="w-full h-auto" style={{maxHeight: '400px'}}></svg>
            </div>

            {/* Current Mode Explanation */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-lg transition-all ${
                mode === 'continuous' 
                  ? 'bg-blue-50 border-2 border-blue-200 transform scale-105' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Zap size={20} />
                  Current AI Architecture
                </h3>
                <ul className="text-blue-800 space-y-2">
                  <li>• <strong>Continuous embedding space</strong> - concepts exist as vectors</li>
                  <li>• <strong>Smooth interpolation</strong> - any concept can reach any other</li>
                  <li>• <strong>No logical boundaries</strong> - mathematical freedom enables errors</li>
                  <li>• <strong>Statistical learning</strong> - patterns from training data only</li>
                </ul>
              </div>

              <div className={`p-6 rounded-lg transition-all ${
                mode === 'discrete' 
                  ? 'bg-green-50 border-2 border-green-200 transform scale-105' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Shield size={20} />
                  Proposed Topological Solution
                </h3>
                <ul className="text-green-800 space-y-2">
                  <li>• <strong>Discrete concept categories</strong> - hard mathematical boundaries</li>
                  <li>• <strong>Topological constraints</strong> - torsion prevents impossible paths</li>
                  <li>• <strong>Sheaf cohomology</strong> - formal obstruction theory</li>
                  <li>• <strong>Semantic rings</strong> - algebraic structure for meaning</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Educational Panel */}
          {showEducationalPanel && (
            <div className="w-96 bg-gradient-to-b from-purple-50 to-indigo-50 border-l border-gray-200 p-6">
              <h3 className="text-2xl font-bold text-purple-900 mb-4">Learning Center</h3>
              
              <div className="space-y-4">
                {educationalExamples.map((example, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                      currentExample === index 
                        ? 'bg-white border-purple-300 shadow-lg' 
                        : 'bg-purple-50 border-transparent hover:border-purple-200'
                    }`}
                    onClick={() => setCurrentExample(index)}
                  >
                    <h4 className="font-semibold text-purple-900 mb-2">{example.title}</h4>
                    <p className="text-sm text-purple-700 mb-2">{example.description}</p>
                    {currentExample === index && (
                      <p className="text-xs text-purple-600 bg-white p-3 rounded border-l-4 border-purple-400">
                        {example.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {selectedConcept && (
                <div className="mt-6 p-4 bg-white rounded-lg border-2 border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2">Selected: {selectedConcept.label}</h4>
                  <p className="text-sm text-indigo-700 mb-2">Category: {selectedConcept.category}</p>
                  <ul className="text-xs text-indigo-600 space-y-1">
                    {selectedConcept.facts.map((fact, idx) => (
                      <li key={idx}>• {fact}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Research Status</h4>
                <p className="text-sm text-yellow-800">
                  The topological explanation is theoretically interesting but lacks peer-reviewed validation. 
                  Current hallucination research focuses on statistical and training-based solutions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopologyVisualizer;
