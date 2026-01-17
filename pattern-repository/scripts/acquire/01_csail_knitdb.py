#!/usr/bin/env python3
"""
MIT CSAIL KnitDB Dataset Acquisition Script

Downloads the KnitPick/KnitDB dataset from MIT CSAIL Textiles Lab.
This dataset contains machine-knit swatches with .knitout format instructions.

Source: https://textiles-lab.github.io/projects/knitdb/
License: MIT License (academic use)

Usage:
    python 01_csail_knitdb.py [--output-dir PATH]
"""

import os
import sys
import json
import logging
import argparse
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Optional
import requests
from tqdm import tqdm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Known dataset URLs and mirrors
CSAIL_SOURCES = {
    "knitdb_dataset": {
        "url": "https://textiles-lab.github.io/projects/knitdb/",
        "github": "https://github.com/textiles-lab/knitout-backend-kniterate",
        "type": "webpage"
    },
    "neural_inverse_dataset": {
        "url": "https://deepknitting.csail.mit.edu/dataset/",
        "github": "https://github.com/xionluhnis/neural_inverse_knitting",
        "type": "dataset_browser"
    },
    "knitout_examples": {
        "url": "https://github.com/textiles-lab/knitout",
        "type": "github_repo"
    },
    "autoknit": {
        "url": "https://github.com/textiles-lab/autoknit",
        "type": "github_repo"
    }
}


def download_file(url: str, dest_path: Path, chunk_size: int = 8192) -> bool:
    """Download a file with progress bar."""
    try:
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()

        total_size = int(response.headers.get('content-length', 0))

        with open(dest_path, 'wb') as f:
            with tqdm(total=total_size, unit='B', unit_scale=True, desc=dest_path.name) as pbar:
                for chunk in response.iter_content(chunk_size=chunk_size):
                    if chunk:
                        f.write(chunk)
                        pbar.update(len(chunk))

        logger.info(f"Downloaded: {dest_path}")
        return True

    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to download {url}: {e}")
        return False


def clone_github_repo(repo_url: str, dest_dir: Path) -> bool:
    """Clone a GitHub repository."""
    import subprocess

    try:
        if dest_dir.exists():
            logger.info(f"Repository already exists at {dest_dir}, pulling updates...")
            result = subprocess.run(
                ['git', 'pull'],
                cwd=dest_dir,
                capture_output=True,
                text=True
            )
        else:
            logger.info(f"Cloning {repo_url} to {dest_dir}...")
            result = subprocess.run(
                ['git', 'clone', '--depth', '1', repo_url, str(dest_dir)],
                capture_output=True,
                text=True
            )

        if result.returncode == 0:
            logger.info(f"Successfully cloned/updated: {dest_dir}")
            return True
        else:
            logger.error(f"Git operation failed: {result.stderr}")
            return False

    except FileNotFoundError:
        logger.error("Git is not installed. Please install git and try again.")
        return False


def fetch_knitout_examples(output_dir: Path) -> dict:
    """Fetch knitout format examples from the official repository."""
    knitout_dir = output_dir / "knitout_examples"

    success = clone_github_repo(
        "https://github.com/textiles-lab/knitout.git",
        knitout_dir
    )

    if success:
        # Count .knitout files
        knitout_files = list(knitout_dir.rglob("*.knitout"))
        k_files = list(knitout_dir.rglob("*.k"))

        return {
            "source": "textiles-lab/knitout",
            "path": str(knitout_dir),
            "knitout_files": len(knitout_files),
            "k_files": len(k_files),
            "status": "success"
        }

    return {"status": "failed"}


def fetch_autoknit_examples(output_dir: Path) -> dict:
    """Fetch autoknit examples (3D mesh to knitting patterns)."""
    autoknit_dir = output_dir / "autoknit"

    success = clone_github_repo(
        "https://github.com/textiles-lab/autoknit.git",
        autoknit_dir
    )

    if success:
        # Look for example files
        obj_files = list(autoknit_dir.rglob("*.obj"))

        return {
            "source": "textiles-lab/autoknit",
            "path": str(autoknit_dir),
            "obj_files": len(obj_files),
            "status": "success",
            "note": "Contains 3D mesh to knitting pattern conversion tools"
        }

    return {"status": "failed"}


def fetch_kniterate_backend(output_dir: Path) -> dict:
    """Fetch kniterate backend with machine knitting examples."""
    backend_dir = output_dir / "knitout_backend_kniterate"

    success = clone_github_repo(
        "https://github.com/textiles-lab/knitout-backend-kniterate.git",
        backend_dir
    )

    if success:
        return {
            "source": "textiles-lab/knitout-backend-kniterate",
            "path": str(backend_dir),
            "status": "success",
            "note": "Contains machine knitting instruction generators"
        }

    return {"status": "failed"}


def scrape_dataset_browser(output_dir: Path) -> dict:
    """
    Attempt to access the Deep Knitting dataset browser.
    Note: This may require additional steps as it's an interactive browser.
    """
    logger.info("Checking Deep Knitting dataset browser...")

    try:
        response = requests.get(
            "https://deepknitting.csail.mit.edu/dataset/",
            timeout=30
        )

        if response.status_code == 200:
            # Save the HTML for reference
            browser_info_path = output_dir / "dataset_browser_info.html"
            browser_info_path.write_text(response.text)

            return {
                "source": "deepknitting.csail.mit.edu",
                "url": "https://deepknitting.csail.mit.edu/dataset/",
                "status": "accessible",
                "note": "Interactive dataset browser - may require manual download",
                "saved_info": str(browser_info_path)
            }
        else:
            return {
                "status": "unavailable",
                "http_status": response.status_code
            }

    except requests.exceptions.RequestException as e:
        logger.warning(f"Could not access dataset browser: {e}")
        return {"status": "error", "error": str(e)}


def create_acquisition_manifest(output_dir: Path, results: dict) -> None:
    """Create a manifest file documenting what was acquired."""
    manifest = {
        "acquisition_date": datetime.now().isoformat(),
        "source": "MIT CSAIL Textiles Lab",
        "datasets": results,
        "total_repositories": sum(1 for r in results.values() if r.get("status") == "success"),
        "notes": [
            "Knitout format is a low-level knitting machine instruction format",
            "AutoKnit converts 3D meshes to knitting patterns",
            "Dataset browser at deepknitting.csail.mit.edu contains labeled swatches"
        ]
    }

    manifest_path = output_dir / "acquisition_manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    logger.info(f"Manifest saved to: {manifest_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Download MIT CSAIL KnitDB and related datasets"
    )
    parser.add_argument(
        '--output-dir',
        type=Path,
        default=Path.home() / 'pattern-repository' / 'raw' / 'csail',
        help='Output directory for downloaded data'
    )
    parser.add_argument(
        '--skip-clone',
        action='store_true',
        help='Skip cloning git repositories'
    )

    args = parser.parse_args()
    output_dir = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    logger.info(f"Output directory: {output_dir}")
    logger.info("Starting MIT CSAIL dataset acquisition...")

    results = {}

    # 1. Fetch knitout examples
    if not args.skip_clone:
        logger.info("\n=== Fetching Knitout Examples ===")
        results["knitout_examples"] = fetch_knitout_examples(output_dir)

        # 2. Fetch autoknit
        logger.info("\n=== Fetching AutoKnit ===")
        results["autoknit"] = fetch_autoknit_examples(output_dir)

        # 3. Fetch kniterate backend
        logger.info("\n=== Fetching Kniterate Backend ===")
        results["kniterate_backend"] = fetch_kniterate_backend(output_dir)

    # 4. Check dataset browser
    logger.info("\n=== Checking Dataset Browser ===")
    results["dataset_browser"] = scrape_dataset_browser(output_dir)

    # Create manifest
    create_acquisition_manifest(output_dir, results)

    # Summary
    logger.info("\n" + "=" * 50)
    logger.info("ACQUISITION SUMMARY")
    logger.info("=" * 50)

    successful = sum(1 for r in results.values() if r.get("status") == "success")
    logger.info(f"Successfully acquired: {successful}/{len(results)} sources")

    for name, result in results.items():
        status = result.get("status", "unknown")
        logger.info(f"  - {name}: {status}")
        if result.get("note"):
            logger.info(f"    Note: {result['note']}")

    logger.info("\nNext steps:")
    logger.info("1. Visit https://deepknitting.csail.mit.edu/dataset/ to browse/download swatches")
    logger.info("2. Run 03_neural_inverse.py to get the full Neural Inverse Knitting dataset")
    logger.info("3. Process .knitout files to extract pattern structures")

    return 0 if successful > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
