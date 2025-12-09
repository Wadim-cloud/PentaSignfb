use serde::{Serialize, Deserialize};
use svg::node::element::{Circle, Line, Path};
use svg::Document;
use fastrand::Rng;

const PALETTE: [&str; 5] = ["#C69572", "#94B4C6", "#4A6C82", "#F2F4F6", "#888888"];

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Node {
    pub x: f32,
    pub y: f32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Edge {
    pub start: usize,
    pub end: usize,
    pub color: usize,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct EdgeInput {
    pub start: usize,
    pub end: usize,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Pattern {
    pub nodes: Vec<Node>,
    pub edges: Vec<Edge>,
}

fn generate_nodes() -> Vec<Node> {
    let mut nodes = Vec::new();
    let center = (0.0, 0.0);
    let radii = [100.0, 75.0, 50.0, 25.0]; // Outer to inner

    // Outer pentagonal nodes (20 nodes, 4 per side)
    for i in 0..5 {
        let angle_start = (i as f32 * 72.0 - 90.0).to_radians();
        let angle_end = ((i + 1) as f32 * 72.0 - 90.0).to_radians();
        
        let x1 = center.0 + radii[0] * angle_start.cos();
        let y1 = center.1 + radii[0] * angle_start.sin();
        
        let x2 = center.0 + radii[0] * angle_end.cos();
        let y2 = center.1 + radii[0] * angle_end.sin();

        for j in 1..=4 {
            let t = j as f32 / 5.0;
            nodes.push(Node {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1),
            });
        }
    }
    
    // 3 inner rings, 4 nodes each, rotationally offset
    for i in 1..4 {
        let radius = radii[i];
        let rotation_offset = (i as f32 * 22.5).to_radians(); // Stagger rings
        for j in 0..4 {
            let angle = (j as f32 * 90.0).to_radians() + rotation_offset;
            nodes.push(Node {
                x: center.0 + radius * angle.cos(),
                y: center.1 + radius * angle.sin(),
            });
        }
    }

    nodes
}

fn generate_edges(nodes: &Vec<Node>, id_seed: u32, free_edges: &[EdgeInput], mask_nonce: u32) -> Vec<Edge> {
    let mut edges = Vec::new();
    let mut rng = Rng::with_seed((id_seed as u64) << 32 | (mask_nonce as u64));
    let total_nodes = nodes.len();

    // 1. Deterministic traversal based on id_seed
    let mut current_node = (id_seed % total_nodes as u32) as usize;
    let num_deterministic_edges = 15 + (id_seed % 5);

    for _ in 0..num_deterministic_edges {
        let next_node = rng.usize(0..total_nodes);
        if current_node != next_node && !edges.iter().any(|e| (e.start == current_node && e.end == next_node) || (e.start == next_node && e.end == current_node)) {
            edges.push(Edge {
                start: current_node,
                end: next_node,
                color: rng.usize(0..3), // Use main colors
            });
        }
        current_node = next_node;
    }
    
    // 2. User-controlled free edges (simplified for now)
    for free_edge in free_edges {
        if free_edge.start < total_nodes && free_edge.end < total_nodes && free_edge.start != free_edge.end {
             if !edges.iter().any(|e| (e.start == free_edge.start && e.end == free_edge.end) || (e.start == free_edge.end && e.end == free_edge.start)) {
                edges.push(Edge {
                    start: free_edge.start,
                    end: free_edge.end,
                    color: 3, // White for user edges
                });
            }
        }
    }

    // 3. Mask layer - introduce some random-looking but deterministic noise
    let num_mask_edges = 3 + (mask_nonce % 3);
     for _ in 0..num_mask_edges {
        let start_node = rng.usize(0..total_nodes);
        let end_node = rng.usize(0..total_nodes);
        if start_node != end_node && !edges.iter().any(|e| (e.start == start_node && e.end == end_node) || (e.start == end_node && e.end == start_node)) {
            edges.push(Edge {
                start: start_node,
                end: end_node,
                color: 4, // Grey for mask edges
            });
        }
    }

    edges
}


pub fn generate_pattern(id_seed: u32, free_edges: &[EdgeInput], mask_nonce: u32) -> Pattern {
    let nodes = generate_nodes();
    let edges = generate_edges(&nodes, id_seed, free_edges, mask_nonce);
    
    Pattern { nodes, edges }
}

pub fn pattern_to_svg(pattern: &Pattern, size: f32) -> String {
    let viewbox_size = 220.0;
    let mut document = Document::new()
        .set("width", size)
        .set("height", size)
        .set("viewBox", (-viewbox_size/2.0, -viewbox_size/2.0, viewbox_size, viewbox_size))
        .add(
            Path::new()
                .set("fill", "#050505")
                .set("d", format!("M {} {} L {} {} L {} {} L {} {} z", -viewbox_size/2.0, -viewbox_size/2.0, viewbox_size/2.0, -viewbox_size/2.0, viewbox_size/2.0, viewbox_size/2.0, -viewbox_size/2.0, viewbox_size/2.0))
        );

    // Optional symmetry lines
    for i in 0..5 {
        let angle = (i as f32 * 72.0 - 90.0).to_radians();
        let line = Line::new()
            .set("x1", 0)
            .set("y1", 0)
            .set("x2", 100.0 * angle.cos())
            .set("y2", 100.0 * angle.sin())
            .set("stroke", "#222")
            .set("stroke-width", 0.5);
        document = document.add(line);
    }


    for edge in &pattern.edges {
        let start_node = &pattern.nodes[edge.start];
        let end_node = &pattern.nodes[edge.end];
        let color = PALETTE[edge.color % PALETTE.len()];
        
        let line = Line::new()
            .set("x1", start_node.x)
            .set("y1", start_node.y)
            .set("x2", end_node.x)
            .set("y2", end_node.y)
            .set("stroke", color)
            .set("stroke-width", 1.2)
            .set("stroke-linecap", "round");
        document = document.add(line);
    }
    
    for node in &pattern.nodes {
        let circle = Circle::new()
            .set("cx", node.x)
            .set("cy", node.y)
            .set("r", 1.8)
            .set("fill", PALETTE[3]); // White nodes
        document = document.add(circle);
    }
    
    // 3 inner dots
     for i in 0..3 {
         let angle = (i as f32 * 120.0).to_radians();
         let radius = 12.0;
         let circle = Circle::new()
            .set("cx", radius * angle.cos())
            .set("cy", radius * angle.sin())
            .set("r", 1.5)
            .set("fill", "#666");
        document = document.add(circle);
     }


    document.to_string()
}
