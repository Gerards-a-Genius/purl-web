#!/usr/bin/env python3
"""
Process Knitting-LLMs Patterns

Converts the generated patterns from knitting-llms into the standardized
repository format with proper metadata.

Usage:
    python 01_process_knitting_llms.py
"""

import os
import sys
import json
import uuid
import re
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple

# Paths
REPO_ROOT = Path(__file__).parent.parent.parent
RAW_DIR = REPO_ROOT / "raw" / "fossasia" / "downloads" / "knitting-llms-main" / "outputs"
PROCESSED_DIR = REPO_ROOT / "processed" / "patterns"


def parse_pattern_markdown(md_content: str) -> Dict:
    """Parse a knitting-llms pattern markdown file."""
    pattern = {
        "title": "",
        "model": "",
        "prompt": "",
        "size": "",
        "difficulty": "",
        "materials": [],
        "gauge": "",
        "color_scheme": [],
        "pattern_notes": [],
        "instructions": [],
        "tips": []
    }

    lines = md_content.split('\n')
    current_section = None
    current_row = None

    for line in lines:
        line = line.strip()

        # Title
        if line.startswith('# '):
            pattern["title"] = line[2:].strip()

        # Metadata fields
        elif line.startswith('- **Model**:'):
            pattern["model"] = line.split(':', 1)[1].strip()
        elif line.startswith('- **Prompt**:'):
            pattern["prompt"] = line.split(':', 1)[1].strip().strip('"')
        elif line.startswith('- **Size**:'):
            pattern["size"] = line.split(':', 1)[1].strip()
        elif line.startswith('- **Difficulty**:'):
            pattern["difficulty"] = line.split(':', 1)[1].strip().lower()

        # Section headers
        elif line.startswith('## '):
            section = line[3:].strip().lower()
            if 'material' in section:
                current_section = 'materials'
            elif 'gauge' in section:
                current_section = 'gauge'
            elif 'color' in section:
                current_section = 'colors'
            elif 'note' in section:
                current_section = 'notes'
            elif 'instruction' in section or 'row' in section:
                current_section = 'instructions'
            elif 'tip' in section:
                current_section = 'tips'
            else:
                current_section = None

        # Row headers
        elif line.startswith('### Row'):
            match = re.match(r'### Row (\d+)', line)
            if match:
                current_row = int(match.group(1))

        # Content lines
        elif line.startswith('- ') and current_section:
            content = line[2:].strip()
            if current_section == 'materials':
                pattern["materials"].append(content)
            elif current_section == 'notes':
                pattern["pattern_notes"].append(content)
            elif current_section == 'tips':
                pattern["tips"].append(content)
            elif current_section == 'colors':
                # Parse color: "Color 1: Light Blue (#E3F2FD)"
                match = re.match(r'Color \d+: (.+) \((#[A-Fa-f0-9]+)\)', content)
                if match:
                    pattern["color_scheme"].append({
                        "name": match.group(1),
                        "hex": match.group(2)
                    })

        # Gauge line
        elif current_section == 'gauge' and line and not line.startswith('#'):
            if pattern["gauge"]:
                pattern["gauge"] += " " + line
            else:
                pattern["gauge"] = line

        # Instruction lines
        elif current_section == 'instructions' and line.startswith('Work '):
            if current_row:
                pattern["instructions"].append({
                    "row": current_row,
                    "instruction": line
                })

    return pattern


def create_standardized_metadata(parsed: Dict, source_file: str, image_file: Optional[str]) -> Dict:
    """Convert parsed pattern to standardized metadata format."""

    # Generate UUID
    pattern_id = str(uuid.uuid4())

    # Parse size (e.g., "20x20 stitches")
    stitch_count = 0
    row_count = 0
    if parsed["size"]:
        match = re.match(r'(\d+)x(\d+)', parsed["size"])
        if match:
            stitch_count = int(match.group(1))
            row_count = int(match.group(2))

    # Build standardized metadata
    metadata = {
        "id": pattern_id,
        "source": "knitting_llms",
        "source_id": Path(source_file).stem,
        "title": parsed["title"] or f"Generated Pattern {pattern_id[:8]}",
        "type": "knitting",
        "category": "swatch",

        "difficulty": {
            "level": parsed["difficulty"] or "beginner",
            "score": 0.2 if parsed["difficulty"] == "beginner" else 0.5
        },

        "techniques": [
            {"name": "colorwork", "complexity": 0.4, "description": "Stranded colorwork"},
            {"name": "stockinette", "complexity": 0.1, "description": "Basic stockinette stitch"}
        ],

        "materials": {
            "yarn_weight": "worsted",
            "fiber_content": ["acrylic", "wool"],
            "yardage": 50,
            "needle_size": "US 7 / 4.5mm",
            "needle_size_mm": 4.5,
            "notions": ["tapestry needle", "stitch markers"],
            "colors": parsed["color_scheme"]
        },

        "gauge": {
            "stitches_per_inch": 5,
            "stitches_per_10cm": 20,
            "rows_per_inch": 7,
            "rows_per_10cm": 28,
            "swatch_size": "4x4 inches",
            "pattern_used": "stockinette",
            "raw_gauge": parsed["gauge"]
        },

        "sizing": {
            "available_sizes": ["one size"],
            "size_range": parsed["size"]
        },

        "instructions": {
            "format": "written",
            "sections": ["setup", "body"],
            "stitch_count": stitch_count,
            "row_count": row_count,
            "abbreviations_used": ["k", "p"],
            "rows": parsed["instructions"],
            "notes": parsed["pattern_notes"],
            "tips": parsed["tips"]
        },

        "images": {
            "preview": "preview.png" if image_file else None,
            "chart": None,
            "swatches": []
        },

        "embeddings": {
            "text_model": None,
            "image_model": None,
            "text_vector_path": None,
            "image_vector_path": None
        },

        "license": "mit",
        "attribution": f"Generated by {parsed['model']} via knitting-llms project",
        "date_added": datetime.now().strftime("%Y-%m-%d"),
        "date_original": "2024",

        "tags": ["colorwork", "generated", "swatch", "beginner", "llm-generated"],

        "generation_metadata": {
            "model": parsed["model"],
            "prompt": parsed["prompt"]
        },

        "notes": f"Pattern generated from LLM activation patterns. Prompt: {parsed['prompt'][:100]}..."
    }

    return metadata


def create_instructions_markdown(parsed: Dict) -> str:
    """Create a clean instructions markdown file."""
    lines = [
        f"# {parsed['title']}",
        "",
        "## Materials",
        ""
    ]

    for mat in parsed["materials"]:
        lines.append(f"- {mat}")

    lines.extend([
        "",
        "## Gauge",
        parsed["gauge"] or "Gauge is not critical for this pattern.",
        "",
        "## Color Scheme",
        ""
    ])

    for i, color in enumerate(parsed["color_scheme"], 1):
        lines.append(f"- Color {i}: {color['name']} ({color['hex']})")

    lines.extend([
        "",
        "## Pattern Notes",
        ""
    ])

    for note in parsed["pattern_notes"]:
        lines.append(f"- {note}")

    lines.extend([
        "",
        "## Instructions",
        ""
    ])

    for row_inst in parsed["instructions"]:
        lines.append(f"**Row {row_inst['row']}:** {row_inst['instruction']}")
        lines.append("")

    lines.extend([
        "",
        "## Tips",
        ""
    ])

    for tip in parsed["tips"]:
        lines.append(f"- {tip}")

    return "\n".join(lines)


def process_pattern(md_file: Path) -> Optional[Dict]:
    """Process a single pattern file."""
    print(f"Processing: {md_file.name}")

    # Read markdown
    md_content = md_file.read_text()

    # Parse
    parsed = parse_pattern_markdown(md_content)

    if not parsed["title"]:
        print(f"  Warning: Could not parse title from {md_file.name}")
        parsed["title"] = md_file.stem.replace('_', ' ').title()

    # Check for corresponding image
    image_file = md_file.with_suffix('.png')
    has_image = image_file.exists()

    # Create standardized metadata
    metadata = create_standardized_metadata(parsed, str(md_file), str(image_file) if has_image else None)

    # Create pattern directory
    pattern_dir = PROCESSED_DIR / metadata["id"]
    pattern_dir.mkdir(parents=True, exist_ok=True)

    # Save metadata
    metadata_path = pattern_dir / "metadata.json"
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    # Save clean instructions
    instructions_md = create_instructions_markdown(parsed)
    instructions_path = pattern_dir / "instructions.md"
    instructions_path.write_text(instructions_md)

    # Save raw instructions
    raw_path = pattern_dir / "instructions_raw.txt"
    raw_path.write_text(md_content)

    # Copy image if exists
    if has_image:
        dest_image = pattern_dir / "preview.png"
        shutil.copy(image_file, dest_image)

    # Create embeddings directory
    (pattern_dir / "embeddings").mkdir(exist_ok=True)

    print(f"  Created: {pattern_dir.name}")
    return metadata


def update_master_catalog(all_metadata: List[Dict]):
    """Update the master catalog with all processed patterns."""
    catalog_dir = PROCESSED_DIR.parent / "index"
    catalog_dir.mkdir(exist_ok=True)

    catalog = {
        "updated": datetime.now().isoformat(),
        "total_patterns": len(all_metadata),
        "sources": {},
        "patterns": []
    }

    for meta in all_metadata:
        source = meta.get("source", "unknown")
        catalog["sources"][source] = catalog["sources"].get(source, 0) + 1

        catalog["patterns"].append({
            "id": meta["id"],
            "title": meta["title"],
            "source": source,
            "type": meta["type"],
            "category": meta.get("category"),
            "difficulty": meta.get("difficulty", {}).get("level"),
            "path": f"patterns/{meta['id']}"
        })

    catalog_path = catalog_dir / "master_catalog.json"
    with open(catalog_path, 'w') as f:
        json.dump(catalog, f, indent=2)

    print(f"\nMaster catalog updated: {catalog_path}")
    print(f"Total patterns: {catalog['total_patterns']}")


def main():
    print("=" * 60)
    print("Processing Knitting-LLMs Patterns")
    print("=" * 60)

    if not RAW_DIR.exists():
        print(f"Error: Source directory not found: {RAW_DIR}")
        return 1

    # Find all markdown pattern files
    md_files = list(RAW_DIR.glob("pattern_*.md"))
    print(f"Found {len(md_files)} pattern files\n")

    all_metadata = []

    for md_file in md_files:
        try:
            metadata = process_pattern(md_file)
            if metadata:
                all_metadata.append(metadata)
        except Exception as e:
            print(f"  Error processing {md_file.name}: {e}")

    # Update master catalog
    if all_metadata:
        update_master_catalog(all_metadata)

    print("\n" + "=" * 60)
    print("Processing Complete")
    print("=" * 60)
    print(f"Patterns processed: {len(all_metadata)}")
    print(f"Output directory: {PROCESSED_DIR}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
