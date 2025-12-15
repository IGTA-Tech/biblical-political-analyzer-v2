/**
 * API Route: Get character relationship graph data
 * Returns nodes and edges for visualization
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fallback data when database not available
const FALLBACK_NODES = [
  { id: '1', name: 'Abraham', title: 'Father of Faith', category: 'patriarch', era: 'Patriarchal', testament: 'OT' },
  { id: '2', name: 'Sarah', title: 'Mother of Nations', category: 'matriarch', era: 'Patriarchal', testament: 'OT' },
  { id: '3', name: 'Isaac', title: 'Son of Promise', category: 'patriarch', era: 'Patriarchal', testament: 'OT' },
  { id: '4', name: 'Rebekah', title: 'Wife of Isaac', category: 'matriarch', era: 'Patriarchal', testament: 'OT' },
  { id: '5', name: 'Jacob', title: 'Israel', category: 'patriarch', era: 'Patriarchal', testament: 'OT' },
  { id: '6', name: 'Esau', title: 'Father of Edom', category: 'patriarch', era: 'Patriarchal', testament: 'OT' },
  { id: '7', name: 'Rachel', title: 'Beloved Wife', category: 'matriarch', era: 'Patriarchal', testament: 'OT' },
  { id: '8', name: 'Leah', title: 'First Wife', category: 'matriarch', era: 'Patriarchal', testament: 'OT' },
  { id: '9', name: 'Joseph', title: 'The Dreamer', category: 'patriarch', era: 'Patriarchal', testament: 'OT' },
  { id: '10', name: 'Judah', title: 'Lion of the Tribe', category: 'patriarch', era: 'Patriarchal', testament: 'OT' },
  { id: '11', name: 'Benjamin', title: 'Son of Right Hand', category: 'patriarch', era: 'Patriarchal', testament: 'OT' },
  { id: '12', name: 'Moses', title: 'Lawgiver', category: 'prophet', era: 'Exodus', testament: 'OT' },
  { id: '13', name: 'Aaron', title: 'First High Priest', category: 'priest', era: 'Exodus', testament: 'OT' },
  { id: '14', name: 'Miriam', title: 'Prophetess', category: 'prophet', era: 'Exodus', testament: 'OT' },
  { id: '15', name: 'Joshua', title: 'Conqueror', category: 'leader', era: 'Conquest', testament: 'OT' },
  { id: '16', name: 'David', title: 'King of Israel', category: 'king', era: 'United Monarchy', testament: 'OT' },
  { id: '17', name: 'Jonathan', title: 'Friend of David', category: 'prince', era: 'United Monarchy', testament: 'OT' },
  { id: '18', name: 'Saul', title: 'First King', category: 'king', era: 'United Monarchy', testament: 'OT' },
  { id: '19', name: 'Solomon', title: 'Wisest King', category: 'king', era: 'United Monarchy', testament: 'OT' },
  { id: '20', name: 'Bathsheba', title: 'Queen Mother', category: 'queen', era: 'United Monarchy', testament: 'OT' },
  { id: '21', name: 'Samuel', title: 'Last Judge', category: 'prophet', era: 'Judges', testament: 'OT' },
  { id: '22', name: 'Elijah', title: 'Prophet of Fire', category: 'prophet', era: 'Divided Kingdom', testament: 'OT' },
  { id: '23', name: 'Elisha', title: 'Successor', category: 'prophet', era: 'Divided Kingdom', testament: 'OT' },
  { id: '24', name: 'Jesus', title: 'Son of God', category: 'messiah', era: 'Ministry', testament: 'both' },
  { id: '25', name: 'Mary', title: 'Mother of Jesus', category: 'family', era: 'Ministry', testament: 'NT' },
  { id: '26', name: 'Joseph of Nazareth', title: 'Earthly Father', category: 'family', era: 'Ministry', testament: 'NT' },
  { id: '27', name: 'John the Baptist', title: 'Forerunner', category: 'prophet', era: 'Ministry', testament: 'NT' },
  { id: '28', name: 'Peter', title: 'The Rock', category: 'apostle', era: 'Early Church', testament: 'NT' },
  { id: '29', name: 'John', title: 'Beloved Disciple', category: 'apostle', era: 'Early Church', testament: 'NT' },
  { id: '30', name: 'James', title: 'Son of Thunder', category: 'apostle', era: 'Early Church', testament: 'NT' },
  { id: '31', name: 'Paul', title: 'Apostle to Gentiles', category: 'apostle', era: 'Early Church', testament: 'NT' },
  { id: '32', name: 'Barnabas', title: 'Encourager', category: 'companion', era: 'Early Church', testament: 'NT' },
  { id: '33', name: 'Timothy', title: 'Young Pastor', category: 'companion', era: 'Early Church', testament: 'NT' },
];

const FALLBACK_EDGES = [
  // Patriarchal Family
  { source: '1', target: '2', type: 'spouse', strength: 10, sentiment: 'positive' },
  { source: '1', target: '3', type: 'parent', strength: 10, sentiment: 'positive' },
  { source: '2', target: '3', type: 'parent', strength: 10, sentiment: 'positive' },
  { source: '3', target: '4', type: 'spouse', strength: 9, sentiment: 'positive' },
  { source: '3', target: '5', type: 'parent', strength: 9, sentiment: 'complex' },
  { source: '3', target: '6', type: 'parent', strength: 8, sentiment: 'complex' },
  { source: '4', target: '5', type: 'parent', strength: 9, sentiment: 'positive' },
  { source: '4', target: '6', type: 'parent', strength: 6, sentiment: 'neutral' },
  { source: '5', target: '6', type: 'sibling', strength: 8, sentiment: 'complex' },
  { source: '5', target: '7', type: 'spouse', strength: 10, sentiment: 'positive' },
  { source: '5', target: '8', type: 'spouse', strength: 7, sentiment: 'complex' },
  { source: '5', target: '9', type: 'parent', strength: 10, sentiment: 'positive' },
  { source: '5', target: '10', type: 'parent', strength: 8, sentiment: 'positive' },
  { source: '5', target: '11', type: 'parent', strength: 9, sentiment: 'positive' },
  { source: '7', target: '9', type: 'parent', strength: 10, sentiment: 'positive' },
  { source: '7', target: '11', type: 'parent', strength: 9, sentiment: 'positive' },
  { source: '8', target: '10', type: 'parent', strength: 8, sentiment: 'positive' },
  { source: '9', target: '11', type: 'sibling', strength: 9, sentiment: 'positive' },
  { source: '9', target: '10', type: 'sibling', strength: 8, sentiment: 'complex' },

  // Exodus Family
  { source: '12', target: '13', type: 'sibling', strength: 9, sentiment: 'positive' },
  { source: '12', target: '14', type: 'sibling', strength: 8, sentiment: 'positive' },
  { source: '13', target: '14', type: 'sibling', strength: 8, sentiment: 'positive' },
  { source: '12', target: '15', type: 'mentor', strength: 9, sentiment: 'positive' },

  // United Monarchy
  { source: '16', target: '17', type: 'friend', strength: 10, sentiment: 'positive' },
  { source: '18', target: '17', type: 'parent', strength: 7, sentiment: 'complex' },
  { source: '16', target: '18', type: 'served', strength: 8, sentiment: 'complex' },
  { source: '21', target: '18', type: 'mentor', strength: 7, sentiment: 'complex' },
  { source: '21', target: '16', type: 'mentor', strength: 9, sentiment: 'positive' },
  { source: '16', target: '20', type: 'spouse', strength: 8, sentiment: 'complex' },
  { source: '16', target: '19', type: 'parent', strength: 9, sentiment: 'positive' },
  { source: '20', target: '19', type: 'parent', strength: 9, sentiment: 'positive' },

  // Prophets
  { source: '22', target: '23', type: 'mentor', strength: 10, sentiment: 'positive' },

  // New Testament
  { source: '25', target: '24', type: 'parent', strength: 10, sentiment: 'positive' },
  { source: '26', target: '24', type: 'parent', strength: 9, sentiment: 'positive' },
  { source: '25', target: '26', type: 'spouse', strength: 9, sentiment: 'positive' },
  { source: '27', target: '24', type: 'family', strength: 10, sentiment: 'positive' },
  { source: '24', target: '28', type: 'mentor', strength: 10, sentiment: 'positive' },
  { source: '24', target: '29', type: 'mentor', strength: 10, sentiment: 'positive' },
  { source: '24', target: '30', type: 'mentor', strength: 9, sentiment: 'positive' },
  { source: '29', target: '30', type: 'sibling', strength: 9, sentiment: 'positive' },
  { source: '28', target: '29', type: 'friend', strength: 9, sentiment: 'positive' },
  { source: '28', target: '30', type: 'friend', strength: 8, sentiment: 'positive' },
  { source: '31', target: '32', type: 'friend', strength: 8, sentiment: 'complex' },
  { source: '31', target: '33', type: 'mentor', strength: 10, sentiment: 'positive' },
  { source: '32', target: '31', type: 'mentor', strength: 9, sentiment: 'positive' },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { center, types, depth = '2' } = req.query;

  // Try to get data from Supabase
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Check if table exists and has data
      const { data: charCount, error: countError } = await supabase
        .from('biblical_characters')
        .select('id', { count: 'exact', head: true });

      if (!countError && charCount !== null) {
        // Fetch from database
        let nodesQuery = supabase
          .from('biblical_characters')
          .select('id, name, title, category, era, testament');

        // If centered, filter to related characters
        if (center && typeof center === 'string') {
          // Get centered character first
          const { data: centerChar } = await supabase
            .from('biblical_characters')
            .select('id')
            .eq('name', center)
            .single();

          if (centerChar) {
            // Get related character IDs
            const { data: relatedIds } = await supabase
              .from('character_relationships')
              .select('character_id, related_character_id')
              .or(`character_id.eq.${centerChar.id},related_character_id.eq.${centerChar.id}`);

            if (relatedIds && relatedIds.length > 0) {
              const ids = new Set<string>([centerChar.id]);
              relatedIds.forEach(r => {
                ids.add(r.character_id);
                ids.add(r.related_character_id);
              });
              nodesQuery = nodesQuery.in('id', Array.from(ids));
            }
          }
        }

        const { data: nodes, error: nodesError } = await nodesQuery;

        if (nodesError) throw nodesError;

        // Fetch relationships
        let edgesQuery = supabase
          .from('character_relationships')
          .select('character_id, related_character_id, relationship_type, relationship_subtype, strength, sentiment');

        if (types && typeof types === 'string') {
          const typeList = types.split(',');
          edgesQuery = edgesQuery.in('relationship_type', typeList);
        }

        const { data: edges, error: edgesError } = await edgesQuery;

        if (edgesError) throw edgesError;

        // Filter edges to only include nodes we have
        const nodeIds = new Set(nodes?.map(n => n.id) || []);
        const filteredEdges = (edges || []).filter(
          e => nodeIds.has(e.character_id) && nodeIds.has(e.related_character_id)
        );

        return res.status(200).json({
          nodes: nodes || [],
          edges: filteredEdges.map(e => ({
            source: e.character_id,
            target: e.related_character_id,
            type: e.relationship_type,
            subtype: e.relationship_subtype,
            strength: e.strength || 5,
            sentiment: e.sentiment || 'neutral',
          })),
          source: 'database',
        });
      }
    } catch (error) {
      console.error('Database error, falling back to static data:', error);
    }
  }

  // Fallback to static data
  let nodes = [...FALLBACK_NODES];
  let edges = [...FALLBACK_EDGES];

  // Filter by center character
  if (center && typeof center === 'string') {
    const centerNode = nodes.find(n => n.name === center);
    if (centerNode) {
      const relatedIds = new Set<string>([centerNode.id]);
      edges.forEach(e => {
        if (e.source === centerNode.id || e.target === centerNode.id) {
          relatedIds.add(e.source);
          relatedIds.add(e.target);
        }
      });
      nodes = nodes.filter(n => relatedIds.has(n.id));
      edges = edges.filter(e => relatedIds.has(e.source) && relatedIds.has(e.target));
    }
  }

  // Filter by relationship types
  if (types && typeof types === 'string') {
    const typeList = types.split(',');
    edges = edges.filter(e => typeList.includes(e.type));
  }

  res.status(200).json({
    nodes,
    edges,
    source: 'fallback',
  });
}
