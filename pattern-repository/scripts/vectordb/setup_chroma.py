#!/usr/bin/env python3
"""
ChromaDB Vector Database Setup

Initializes ChromaDB collections for pattern embeddings.
Creates collections for text, image, and multimodal search.

Usage:
    python setup_chroma.py [--db-path PATH]
"""

import os
import sys
import json
import logging
import argparse
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

try:
    import chromadb
    from chromadb.config import Settings
    HAS_CHROMADB = True
except ImportError:
    HAS_CHROMADB = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Collection configurations
COLLECTIONS = {
    "pattern_text": {
        "name": "pattern_text",
        "description": "Text embeddings of pattern instructions",
        "metadata": {
            "hnsw:space": "cosine",
            "embedding_model": "text-embedding-3-large",
            "embedding_dim": 3072
        }
    },
    "pattern_images": {
        "name": "pattern_images",
        "description": "Image embeddings of pattern previews and swatches",
        "metadata": {
            "hnsw:space": "cosine",
            "embedding_model": "clip-vit-large-patch14",
            "embedding_dim": 768
        }
    },
    "pattern_multimodal": {
        "name": "pattern_multimodal",
        "description": "Combined text+image embeddings for cross-modal search",
        "metadata": {
            "hnsw:space": "cosine",
            "embedding_model": "combined",
            "embedding_dim": 1536
        }
    },
    "technique_embeddings": {
        "name": "technique_embeddings",
        "description": "Embeddings for technique descriptions",
        "metadata": {
            "hnsw:space": "cosine",
            "embedding_model": "text-embedding-3-large",
            "embedding_dim": 3072
        }
    }
}


class PatternVectorDB:
    """Manager for pattern embeddings in ChromaDB."""

    def __init__(self, db_path: str | Path):
        """
        Initialize the vector database.

        Args:
            db_path: Path to ChromaDB persistent storage
        """
        if not HAS_CHROMADB:
            raise ImportError(
                "ChromaDB is required. Install with: pip install chromadb"
            )

        self.db_path = Path(db_path)
        self.db_path.mkdir(parents=True, exist_ok=True)

        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=str(self.db_path),
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )

        self.collections = {}

    def setup_collections(self) -> Dict[str, bool]:
        """Create all required collections."""
        results = {}

        for collection_key, config in COLLECTIONS.items():
            try:
                collection = self.client.get_or_create_collection(
                    name=config["name"],
                    metadata=config["metadata"]
                )
                self.collections[collection_key] = collection
                results[collection_key] = True
                logger.info(f"Collection ready: {config['name']}")

            except Exception as e:
                logger.error(f"Failed to create {config['name']}: {e}")
                results[collection_key] = False

        return results

    def get_collection(self, name: str):
        """Get a collection by name."""
        if name in self.collections:
            return self.collections[name]
        return self.client.get_collection(name)

    def add_pattern_text(
        self,
        pattern_id: str,
        embedding: List[float],
        text: str,
        metadata: Optional[Dict] = None
    ) -> bool:
        """Add a pattern's text embedding."""
        try:
            collection = self.get_collection("pattern_text")
            collection.add(
                ids=[pattern_id],
                embeddings=[embedding],
                documents=[text],
                metadatas=[metadata or {}]
            )
            return True
        except Exception as e:
            logger.error(f"Failed to add text embedding: {e}")
            return False

    def add_pattern_image(
        self,
        pattern_id: str,
        embedding: List[float],
        image_path: str,
        metadata: Optional[Dict] = None
    ) -> bool:
        """Add a pattern's image embedding."""
        try:
            collection = self.get_collection("pattern_images")
            meta = metadata or {}
            meta["image_path"] = image_path

            collection.add(
                ids=[pattern_id],
                embeddings=[embedding],
                metadatas=[meta]
            )
            return True
        except Exception as e:
            logger.error(f"Failed to add image embedding: {e}")
            return False

    def search_by_text(
        self,
        query_embedding: List[float],
        n_results: int = 10,
        where: Optional[Dict] = None
    ) -> Dict:
        """Search patterns by text similarity."""
        collection = self.get_collection("pattern_text")
        return collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where,
            include=["documents", "metadatas", "distances"]
        )

    def search_by_image(
        self,
        query_embedding: List[float],
        n_results: int = 10,
        where: Optional[Dict] = None
    ) -> Dict:
        """Search patterns by image similarity."""
        collection = self.get_collection("pattern_images")
        return collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where,
            include=["metadatas", "distances"]
        )

    def get_stats(self) -> Dict:
        """Get statistics about the database."""
        stats = {
            "db_path": str(self.db_path),
            "collections": {}
        }

        for name, collection in self.collections.items():
            stats["collections"][name] = {
                "count": collection.count(),
                "metadata": collection.metadata
            }

        return stats

    def export_config(self, output_path: Path) -> None:
        """Export database configuration."""
        config = {
            "created": datetime.now().isoformat(),
            "db_path": str(self.db_path),
            "collections": COLLECTIONS,
            "stats": self.get_stats()
        }

        with open(output_path, 'w') as f:
            json.dump(config, f, indent=2)

        logger.info(f"Config exported to: {output_path}")


def setup_database(db_path: Path) -> PatternVectorDB:
    """Initialize and set up the vector database."""
    logger.info(f"Setting up ChromaDB at: {db_path}")

    db = PatternVectorDB(db_path)
    results = db.setup_collections()

    successful = sum(results.values())
    total = len(results)

    logger.info(f"\nCollections created: {successful}/{total}")

    for name, success in results.items():
        status = "OK" if success else "FAILED"
        logger.info(f"  [{status}] {name}")

    return db


def main():
    parser = argparse.ArgumentParser(
        description="Set up ChromaDB for pattern embeddings"
    )
    parser.add_argument(
        '--db-path',
        type=Path,
        default=Path.home() / 'pattern-repository' / 'embeddings' / 'chroma_db',
        help='Path to ChromaDB storage'
    )
    parser.add_argument(
        '--reset',
        action='store_true',
        help='Reset existing database'
    )

    args = parser.parse_args()

    if not HAS_CHROMADB:
        logger.error("ChromaDB is not installed.")
        logger.error("Install with: pip install chromadb")
        return 1

    # Reset if requested
    if args.reset and args.db_path.exists():
        import shutil
        logger.warning(f"Resetting database at: {args.db_path}")
        shutil.rmtree(args.db_path)

    # Set up database
    db = setup_database(args.db_path)

    # Export config
    config_path = args.db_path.parent / "chroma_config.json"
    db.export_config(config_path)

    # Print stats
    logger.info("\n" + "=" * 50)
    logger.info("DATABASE SETUP COMPLETE")
    logger.info("=" * 50)

    stats = db.get_stats()
    logger.info(f"Database path: {stats['db_path']}")
    logger.info(f"Collections: {len(stats['collections'])}")

    for name, info in stats['collections'].items():
        logger.info(f"  - {name}: {info['count']} documents")

    logger.info("\nNext steps:")
    logger.info("1. Generate embeddings with scripts/process/05_generate_embeddings.py")
    logger.info("2. Index patterns with scripts/vectordb/index_patterns.py")
    logger.info("3. Test search with scripts/test/test_retrieval.py")

    return 0


if __name__ == "__main__":
    sys.exit(main())
