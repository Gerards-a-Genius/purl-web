#!/usr/bin/env python3
"""
Pattern Embedding Generator

Generates text and image embeddings for patterns using:
- OpenAI text-embedding-3-large for text
- CLIP ViT-L/14 for images

Usage:
    python 05_generate_embeddings.py --patterns-dir PATH [--use-openai] [--use-clip]
"""

import os
import sys
import json
import logging
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import numpy as np
from tqdm import tqdm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Check for optional dependencies
try:
    import torch
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False

try:
    from PIL import Image
    import clip
    HAS_CLIP = True
except ImportError:
    HAS_CLIP = False

try:
    import openai
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False


class TextEmbedder:
    """Generate text embeddings."""

    def __init__(self, use_openai: bool = False, model_name: str = None):
        """
        Initialize text embedder.

        Args:
            use_openai: Use OpenAI API instead of local model
            model_name: Model name (defaults based on use_openai)
        """
        self.use_openai = use_openai

        if use_openai:
            if not HAS_OPENAI:
                raise ImportError("OpenAI package required. Install with: pip install openai")
            self.model_name = model_name or "text-embedding-3-large"
            self.client = openai.OpenAI()
            self.embedding_dim = 3072
            logger.info(f"Using OpenAI: {self.model_name}")
        else:
            if not HAS_SENTENCE_TRANSFORMERS:
                raise ImportError(
                    "sentence-transformers required. Install with: pip install sentence-transformers"
                )
            self.model_name = model_name or "all-MiniLM-L6-v2"
            self.model = SentenceTransformer(self.model_name)
            self.embedding_dim = self.model.get_sentence_embedding_dimension()
            logger.info(f"Using local model: {self.model_name}")

    def embed(self, text: str) -> np.ndarray:
        """Generate embedding for text."""
        if self.use_openai:
            response = self.client.embeddings.create(
                input=text,
                model=self.model_name
            )
            return np.array(response.data[0].embedding)
        else:
            return self.model.encode(text, convert_to_numpy=True)

    def embed_batch(self, texts: List[str], batch_size: int = 32) -> List[np.ndarray]:
        """Generate embeddings for multiple texts."""
        if self.use_openai:
            embeddings = []
            for i in range(0, len(texts), batch_size):
                batch = texts[i:i + batch_size]
                response = self.client.embeddings.create(
                    input=batch,
                    model=self.model_name
                )
                for item in response.data:
                    embeddings.append(np.array(item.embedding))
            return embeddings
        else:
            return [self.model.encode(t, convert_to_numpy=True) for t in texts]


class ImageEmbedder:
    """Generate image embeddings using CLIP."""

    def __init__(self, model_name: str = "ViT-L/14"):
        """
        Initialize image embedder.

        Args:
            model_name: CLIP model name
        """
        if not HAS_CLIP:
            raise ImportError(
                "CLIP required. Install with: pip install git+https://github.com/openai/CLIP.git"
            )
        if not HAS_TORCH:
            raise ImportError("PyTorch required. Install with: pip install torch")

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")

        self.model, self.preprocess = clip.load(model_name, device=self.device)
        self.model_name = model_name
        self.embedding_dim = 768  # ViT-L/14 output dim

        logger.info(f"Loaded CLIP model: {model_name}")

    def embed(self, image_path: str | Path) -> Optional[np.ndarray]:
        """Generate embedding for an image."""
        try:
            image = Image.open(image_path).convert("RGB")
            image_input = self.preprocess(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                embedding = self.model.encode_image(image_input)
                embedding = embedding / embedding.norm(dim=-1, keepdim=True)

            return embedding.cpu().numpy().flatten()

        except Exception as e:
            logger.error(f"Failed to embed image {image_path}: {e}")
            return None

    def embed_batch(self, image_paths: List[str | Path]) -> List[Optional[np.ndarray]]:
        """Generate embeddings for multiple images."""
        embeddings = []
        for path in tqdm(image_paths, desc="Embedding images"):
            embeddings.append(self.embed(path))
        return embeddings


class PatternEmbedder:
    """Generate embeddings for patterns."""

    def __init__(
        self,
        use_openai: bool = False,
        text_model: str = None,
        image_model: str = "ViT-L/14"
    ):
        """
        Initialize pattern embedder.

        Args:
            use_openai: Use OpenAI for text embeddings
            text_model: Text model name
            image_model: CLIP model name
        """
        self.text_embedder = None
        self.image_embedder = None

        # Initialize text embedder
        try:
            self.text_embedder = TextEmbedder(use_openai=use_openai, model_name=text_model)
        except ImportError as e:
            logger.warning(f"Text embedder not available: {e}")

        # Initialize image embedder
        try:
            self.image_embedder = ImageEmbedder(model_name=image_model)
        except ImportError as e:
            logger.warning(f"Image embedder not available: {e}")

    def embed_pattern(self, pattern_dir: Path) -> Dict:
        """
        Generate embeddings for a pattern.

        Args:
            pattern_dir: Directory containing pattern files

        Returns:
            Dict with embedding info and paths
        """
        result = {
            "pattern_dir": str(pattern_dir),
            "text_embedding": None,
            "image_embedding": None,
            "errors": []
        }

        metadata_path = pattern_dir / "metadata.json"
        if not metadata_path.exists():
            result["errors"].append("No metadata.json found")
            return result

        with open(metadata_path) as f:
            metadata = json.load(f)

        # Create embeddings directory
        embeddings_dir = pattern_dir / "embeddings"
        embeddings_dir.mkdir(exist_ok=True)

        # Generate text embedding
        if self.text_embedder:
            text_content = self._get_text_content(pattern_dir, metadata)
            if text_content:
                try:
                    text_embedding = self.text_embedder.embed(text_content)
                    text_path = embeddings_dir / "text_embed.npy"
                    np.save(text_path, text_embedding)

                    result["text_embedding"] = {
                        "path": str(text_path),
                        "model": self.text_embedder.model_name,
                        "dim": len(text_embedding)
                    }
                except Exception as e:
                    result["errors"].append(f"Text embedding failed: {e}")

        # Generate image embedding
        if self.image_embedder:
            image_path = self._get_image_path(pattern_dir, metadata)
            if image_path and image_path.exists():
                try:
                    image_embedding = self.image_embedder.embed(image_path)
                    if image_embedding is not None:
                        embed_path = embeddings_dir / "image_embed.npy"
                        np.save(embed_path, image_embedding)

                        result["image_embedding"] = {
                            "path": str(embed_path),
                            "model": self.image_embedder.model_name,
                            "dim": len(image_embedding)
                        }
                except Exception as e:
                    result["errors"].append(f"Image embedding failed: {e}")

        return result

    def _get_text_content(self, pattern_dir: Path, metadata: Dict) -> Optional[str]:
        """Extract text content for embedding."""
        parts = []

        # Title and description
        if metadata.get("title"):
            parts.append(metadata["title"])

        # Category and type
        if metadata.get("category"):
            parts.append(f"Category: {metadata['category']}")
        if metadata.get("type"):
            parts.append(f"Type: {metadata['type']}")

        # Techniques
        techniques = metadata.get("techniques", [])
        if techniques:
            tech_names = [t.get("name", "") for t in techniques if t.get("name")]
            if tech_names:
                parts.append(f"Techniques: {', '.join(tech_names)}")

        # Materials
        materials = metadata.get("materials", {})
        if materials.get("yarn_weight"):
            parts.append(f"Yarn weight: {materials['yarn_weight']}")

        # Instructions
        instructions = metadata.get("instructions", {})
        if instructions.get("text_content"):
            # Truncate long instructions
            text = instructions["text_content"][:2000]
            parts.append(f"Instructions: {text}")
        else:
            # Try to read from file
            instructions_file = pattern_dir / "instructions.md"
            if instructions_file.exists():
                text = instructions_file.read_text()[:2000]
                parts.append(f"Instructions: {text}")

        # Tags
        if metadata.get("tags"):
            parts.append(f"Tags: {', '.join(metadata['tags'])}")

        return "\n\n".join(parts) if parts else None

    def _get_image_path(self, pattern_dir: Path, metadata: Dict) -> Optional[Path]:
        """Get the main image path for a pattern."""
        images = metadata.get("images", {})

        # Try preview first
        if images.get("preview"):
            preview_path = pattern_dir / images["preview"]
            if preview_path.exists():
                return preview_path

        # Try any image in the directory
        for ext in [".png", ".jpg", ".jpeg"]:
            for img_path in pattern_dir.glob(f"*{ext}"):
                return img_path

        return None


def process_patterns(
    patterns_dir: Path,
    use_openai: bool = False,
    skip_existing: bool = True
) -> Dict:
    """
    Process all patterns and generate embeddings.

    Args:
        patterns_dir: Directory containing pattern subdirectories
        use_openai: Use OpenAI for text embeddings
        skip_existing: Skip patterns that already have embeddings

    Returns:
        Processing results summary
    """
    embedder = PatternEmbedder(use_openai=use_openai)

    results = {
        "processed": 0,
        "skipped": 0,
        "failed": 0,
        "errors": []
    }

    # Find all pattern directories
    pattern_dirs = [
        d for d in patterns_dir.iterdir()
        if d.is_dir() and (d / "metadata.json").exists()
    ]

    logger.info(f"Found {len(pattern_dirs)} patterns to process")

    for pattern_dir in tqdm(pattern_dirs, desc="Processing patterns"):
        # Check if already processed
        if skip_existing:
            embed_dir = pattern_dir / "embeddings"
            if (embed_dir / "text_embed.npy").exists() or (embed_dir / "image_embed.npy").exists():
                results["skipped"] += 1
                continue

        # Generate embeddings
        result = embedder.embed_pattern(pattern_dir)

        if result["errors"]:
            results["failed"] += 1
            results["errors"].extend(result["errors"])
        else:
            results["processed"] += 1

    return results


def main():
    parser = argparse.ArgumentParser(
        description="Generate embeddings for patterns"
    )
    parser.add_argument(
        '--patterns-dir',
        type=Path,
        default=Path.home() / 'pattern-repository' / 'processed' / 'patterns',
        help='Directory containing pattern folders'
    )
    parser.add_argument(
        '--use-openai',
        action='store_true',
        help='Use OpenAI API for text embeddings'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Regenerate existing embeddings'
    )
    parser.add_argument(
        '--single',
        type=Path,
        help='Process a single pattern directory'
    )

    args = parser.parse_args()

    # Check dependencies
    if not HAS_TORCH:
        logger.warning("PyTorch not installed - image embeddings will be skipped")
    if not HAS_CLIP:
        logger.warning("CLIP not installed - image embeddings will be skipped")
    if args.use_openai and not HAS_OPENAI:
        logger.error("OpenAI package required for --use-openai")
        return 1
    if not args.use_openai and not HAS_SENTENCE_TRANSFORMERS:
        logger.warning("sentence-transformers not installed - using OpenAI instead")
        args.use_openai = True

    if args.single:
        # Process single pattern
        embedder = PatternEmbedder(use_openai=args.use_openai)
        result = embedder.embed_pattern(args.single)
        print(json.dumps(result, indent=2))
    else:
        # Process all patterns
        results = process_patterns(
            args.patterns_dir,
            use_openai=args.use_openai,
            skip_existing=not args.force
        )

        logger.info("\n" + "=" * 50)
        logger.info("EMBEDDING GENERATION COMPLETE")
        logger.info("=" * 50)
        logger.info(f"Processed: {results['processed']}")
        logger.info(f"Skipped: {results['skipped']}")
        logger.info(f"Failed: {results['failed']}")

        if results['errors']:
            logger.warning(f"\nErrors encountered: {len(results['errors'])}")
            for error in results['errors'][:10]:
                logger.warning(f"  - {error}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
