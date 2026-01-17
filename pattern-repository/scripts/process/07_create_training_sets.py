#!/usr/bin/env python3
"""
Create Training Data Sets

Generates training data in various formats for AI model fine-tuning:
1. Image → Instructions (for vision-language models like LLaVA)
2. Description → Pattern (for text models like Mistral/LLaMA)
3. RAG chunks (for retrieval-augmented generation)

Usage:
    python 07_create_training_sets.py
"""

import os
import sys
import json
import random
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import shutil

# Paths
REPO_ROOT = Path(__file__).parent.parent.parent
PROCESSED_DIR = REPO_ROOT / "processed" / "patterns"
TRAINING_DIR = REPO_ROOT / "training"


def load_all_patterns() -> List[Dict]:
    """Load all processed patterns."""
    patterns = []

    for pattern_dir in PROCESSED_DIR.iterdir():
        if not pattern_dir.is_dir():
            continue

        metadata_file = pattern_dir / "metadata.json"
        if not metadata_file.exists():
            continue

        with open(metadata_file) as f:
            metadata = json.load(f)

        # Load instructions
        instructions_file = pattern_dir / "instructions.md"
        if instructions_file.exists():
            metadata["instructions_text"] = instructions_file.read_text()

        # Check for image
        preview_file = pattern_dir / "preview.png"
        metadata["has_image"] = preview_file.exists()
        metadata["image_path"] = str(preview_file) if preview_file.exists() else None
        metadata["pattern_dir"] = str(pattern_dir)

        patterns.append(metadata)

    return patterns


def create_image_to_instructions_dataset(patterns: List[Dict]) -> List[Dict]:
    """
    Create dataset for image → instructions training.
    Format: LLaVA/ShareGPT conversation format
    """
    dataset = []

    for pattern in patterns:
        if not pattern.get("has_image"):
            continue

        # Create conversation format
        entry = {
            "id": pattern["id"],
            "image": pattern["image_path"],
            "conversations": [
                {
                    "from": "human",
                    "value": "<image>\nAnalyze this knitted/crocheted item and generate a complete pattern blueprint including materials, gauge, and step-by-step instructions."
                },
                {
                    "from": "assistant",
                    "value": generate_pattern_response(pattern)
                }
            ]
        }
        dataset.append(entry)

        # Create variation with specific questions
        entry_specific = {
            "id": f"{pattern['id']}_specific",
            "image": pattern["image_path"],
            "conversations": [
                {
                    "from": "human",
                    "value": "<image>\nWhat techniques are used in this pattern? What yarn weight and needle size would you recommend?"
                },
                {
                    "from": "assistant",
                    "value": generate_technique_response(pattern)
                }
            ]
        }
        dataset.append(entry_specific)

    return dataset


def create_description_to_pattern_dataset(patterns: List[Dict]) -> List[Dict]:
    """
    Create dataset for text description → pattern generation.
    Format: Alpaca/instruction-tuning format
    """
    dataset = []

    for pattern in patterns:
        # Create description from metadata
        techniques = [t["name"] for t in pattern.get("techniques", [])]
        colors = [c["name"] for c in pattern.get("materials", {}).get("colors", [])]

        description = f"Create a {pattern.get('difficulty', {}).get('level', 'beginner')} "
        description += f"{pattern.get('type', 'knitting')} pattern for a {pattern.get('category', 'swatch')} "

        if techniques:
            description += f"using {', '.join(techniques)} techniques"

        if colors:
            description += f" with {', '.join(colors)} colors"

        description += "."

        entry = {
            "instruction": description,
            "input": "",
            "output": pattern.get("instructions_text", ""),
            "metadata": {
                "id": pattern["id"],
                "source": pattern.get("source"),
                "difficulty": pattern.get("difficulty", {}).get("level")
            }
        }
        dataset.append(entry)

        # Create variation with size specification
        size = pattern.get("sizing", {}).get("size_range", "20x20 stitches")
        entry_sized = {
            "instruction": f"{description} The finished size should be {size}.",
            "input": "",
            "output": pattern.get("instructions_text", ""),
            "metadata": {
                "id": f"{pattern['id']}_sized",
                "source": pattern.get("source")
            }
        }
        dataset.append(entry_sized)

    return dataset


def create_rag_chunks(patterns: List[Dict]) -> List[Dict]:
    """
    Create chunked documents for RAG retrieval.
    """
    chunks = []

    for pattern in patterns:
        base_metadata = {
            "pattern_id": pattern["id"],
            "title": pattern.get("title", ""),
            "type": pattern.get("type"),
            "category": pattern.get("category"),
            "difficulty": pattern.get("difficulty", {}).get("level"),
            "source": pattern.get("source")
        }

        # Chunk 1: Overview
        overview_text = f"Pattern: {pattern.get('title', 'Untitled')}\n"
        overview_text += f"Type: {pattern.get('type', 'knitting')}\n"
        overview_text += f"Difficulty: {pattern.get('difficulty', {}).get('level', 'beginner')}\n"

        techniques = [t["name"] for t in pattern.get("techniques", [])]
        if techniques:
            overview_text += f"Techniques: {', '.join(techniques)}\n"

        chunks.append({
            "id": f"{pattern['id']}_overview",
            "text": overview_text,
            "chunk_type": "overview",
            "metadata": base_metadata
        })

        # Chunk 2: Materials
        materials = pattern.get("materials", {})
        materials_text = "Materials needed:\n"
        materials_text += f"- Yarn weight: {materials.get('yarn_weight', 'worsted')}\n"
        materials_text += f"- Needle size: {materials.get('needle_size', 'US 7')}\n"

        for notion in materials.get("notions", []):
            materials_text += f"- {notion}\n"

        colors = materials.get("colors", [])
        if colors:
            materials_text += "\nColors:\n"
            for i, color in enumerate(colors, 1):
                materials_text += f"- Color {i}: {color.get('name', 'Unknown')} ({color.get('hex', '')})\n"

        chunks.append({
            "id": f"{pattern['id']}_materials",
            "text": materials_text,
            "chunk_type": "materials",
            "metadata": base_metadata
        })

        # Chunk 3: Instructions (split into smaller chunks if long)
        instructions = pattern.get("instructions_text", "")
        if instructions:
            # Split by sections
            sections = instructions.split("## ")
            for i, section in enumerate(sections):
                if section.strip():
                    chunks.append({
                        "id": f"{pattern['id']}_instructions_{i}",
                        "text": section.strip(),
                        "chunk_type": "instructions",
                        "metadata": base_metadata
                    })

    return chunks


def create_qa_pairs(patterns: List[Dict]) -> List[Dict]:
    """
    Create question-answer pairs for training.
    """
    qa_pairs = []

    questions_templates = [
        ("What materials do I need for {title}?", "materials"),
        ("How do I start the {title} pattern?", "start"),
        ("What techniques are used in {title}?", "techniques"),
        ("What is the difficulty level of {title}?", "difficulty"),
        ("What colors are used in {title}?", "colors"),
    ]

    for pattern in patterns:
        title = pattern.get("title", "this pattern")

        # Materials question
        materials = pattern.get("materials", {})
        materials_answer = f"For {title}, you'll need:\n"
        materials_answer += f"- {materials.get('yarn_weight', 'Worsted')} weight yarn\n"
        materials_answer += f"- {materials.get('needle_size', 'US 7')} needles\n"

        qa_pairs.append({
            "question": f"What materials do I need for {title}?",
            "answer": materials_answer,
            "pattern_id": pattern["id"],
            "type": "materials"
        })

        # Techniques question
        techniques = [t["name"] for t in pattern.get("techniques", [])]
        if techniques:
            qa_pairs.append({
                "question": f"What techniques are used in {title}?",
                "answer": f"{title} uses the following techniques: {', '.join(techniques)}.",
                "pattern_id": pattern["id"],
                "type": "techniques"
            })

        # Difficulty question
        difficulty = pattern.get("difficulty", {}).get("level", "beginner")
        qa_pairs.append({
            "question": f"What is the difficulty level of {title}?",
            "answer": f"{title} is rated as {difficulty} difficulty.",
            "pattern_id": pattern["id"],
            "type": "difficulty"
        })

    return qa_pairs


def generate_pattern_response(pattern: Dict) -> str:
    """Generate a complete pattern response for training."""
    response = f"## Pattern Analysis: {pattern.get('title', 'Generated Pattern')}\n\n"

    # Techniques
    techniques = [t["name"] for t in pattern.get("techniques", [])]
    response += "**Identified Techniques:**\n"
    for tech in techniques:
        response += f"- {tech.title()}\n"

    # Difficulty
    difficulty = pattern.get("difficulty", {})
    response += f"\n**Difficulty:** {difficulty.get('level', 'Beginner').title()}\n"

    # Construction
    response += f"\n**Construction:** Flat, worked back and forth\n"

    # Materials
    response += "\n## Pattern Blueprint\n\n"
    response += "**Materials:**\n"

    materials = pattern.get("materials", {})
    response += f"- {materials.get('yarn_weight', 'Worsted').title()} weight yarn\n"
    response += f"- {materials.get('needle_size', 'US 7 / 4.5mm')} needles\n"

    for notion in materials.get("notions", [])[:3]:
        response += f"- {notion}\n"

    # Gauge
    gauge = pattern.get("gauge", {})
    response += f"\n**Gauge:**\n"
    response += f"- {gauge.get('stitches_per_inch', 5)} stitches per inch\n"
    response += f"- {gauge.get('rows_per_inch', 7)} rows per inch\n"

    # Add truncated instructions
    if pattern.get("instructions_text"):
        instructions = pattern["instructions_text"][:1000]
        response += f"\n**Instructions:**\n{instructions}"
        if len(pattern["instructions_text"]) > 1000:
            response += "\n\n[Instructions continue...]"

    return response


def generate_technique_response(pattern: Dict) -> str:
    """Generate technique analysis response."""
    response = "Based on my analysis of this pattern:\n\n"

    # Techniques
    techniques = pattern.get("techniques", [])
    response += "**Techniques Used:**\n"
    for tech in techniques:
        response += f"- {tech['name'].title()}: {tech.get('description', 'Standard technique')}\n"

    # Recommendations
    materials = pattern.get("materials", {})
    response += f"\n**Recommended Materials:**\n"
    response += f"- Yarn Weight: {materials.get('yarn_weight', 'Worsted').title()}\n"
    response += f"- Needle Size: {materials.get('needle_size', 'US 7 / 4.5mm')}\n"

    # Colors
    colors = materials.get("colors", [])
    if colors:
        response += f"\n**Color Palette:**\n"
        for i, color in enumerate(colors, 1):
            response += f"- Color {i}: {color.get('name', 'Unknown')}\n"

    return response


def save_datasets(
    image_dataset: List[Dict],
    text_dataset: List[Dict],
    rag_chunks: List[Dict],
    qa_pairs: List[Dict]
):
    """Save all datasets to the training directory."""

    # Image to instructions
    img_dir = TRAINING_DIR / "fine_tune" / "image_to_instructions"
    img_dir.mkdir(parents=True, exist_ok=True)

    with open(img_dir / "train.json", 'w') as f:
        json.dump(image_dataset, f, indent=2)

    # Description to pattern
    text_dir = TRAINING_DIR / "fine_tune" / "description_to_pattern"
    text_dir.mkdir(parents=True, exist_ok=True)

    with open(text_dir / "train.json", 'w') as f:
        json.dump(text_dataset, f, indent=2)

    # RAG chunks
    rag_dir = TRAINING_DIR / "rag" / "chunks"
    rag_dir.mkdir(parents=True, exist_ok=True)

    with open(rag_dir / "chunks.json", 'w') as f:
        json.dump(rag_chunks, f, indent=2)

    # QA pairs
    qa_dir = TRAINING_DIR / "rag" / "qa_pairs"
    qa_dir.mkdir(parents=True, exist_ok=True)

    with open(qa_dir / "qa_pairs.json", 'w') as f:
        json.dump(qa_pairs, f, indent=2)

    # Create dataset summary
    summary = {
        "created": datetime.now().isoformat(),
        "datasets": {
            "image_to_instructions": {
                "path": str(img_dir / "train.json"),
                "count": len(image_dataset),
                "format": "LLaVA/ShareGPT"
            },
            "description_to_pattern": {
                "path": str(text_dir / "train.json"),
                "count": len(text_dataset),
                "format": "Alpaca"
            },
            "rag_chunks": {
                "path": str(rag_dir / "chunks.json"),
                "count": len(rag_chunks),
                "format": "Custom"
            },
            "qa_pairs": {
                "path": str(qa_dir / "qa_pairs.json"),
                "count": len(qa_pairs),
                "format": "QA"
            }
        }
    }

    with open(TRAINING_DIR / "dataset_summary.json", 'w') as f:
        json.dump(summary, f, indent=2)

    return summary


def main():
    print("=" * 60)
    print("Creating Training Datasets")
    print("=" * 60)

    # Load patterns
    print("\nLoading processed patterns...")
    patterns = load_all_patterns()
    print(f"Loaded {len(patterns)} patterns")

    if not patterns:
        print("No patterns found. Run processing scripts first.")
        return 1

    # Create datasets
    print("\nCreating image → instructions dataset...")
    image_dataset = create_image_to_instructions_dataset(patterns)
    print(f"  Created {len(image_dataset)} training examples")

    print("\nCreating description → pattern dataset...")
    text_dataset = create_description_to_pattern_dataset(patterns)
    print(f"  Created {len(text_dataset)} training examples")

    print("\nCreating RAG chunks...")
    rag_chunks = create_rag_chunks(patterns)
    print(f"  Created {len(rag_chunks)} chunks")

    print("\nCreating QA pairs...")
    qa_pairs = create_qa_pairs(patterns)
    print(f"  Created {len(qa_pairs)} QA pairs")

    # Save datasets
    print("\nSaving datasets...")
    summary = save_datasets(image_dataset, text_dataset, rag_chunks, qa_pairs)

    # Print summary
    print("\n" + "=" * 60)
    print("Dataset Creation Complete")
    print("=" * 60)

    for name, info in summary["datasets"].items():
        print(f"\n{name}:")
        print(f"  Format: {info['format']}")
        print(f"  Count: {info['count']}")
        print(f"  Path: {info['path']}")

    print(f"\nSummary saved to: {TRAINING_DIR / 'dataset_summary.json'}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
