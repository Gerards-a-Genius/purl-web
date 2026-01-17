#!/usr/bin/env python3
"""
Neural Inverse Knitting Dataset Acquisition Script

Downloads the Neural Inverse Knitting dataset from MIT CSAIL.
This dataset contains knitted fabric images paired with machine-readable instructions.

Source: https://github.com/xionluhnis/neural_inverse_knitting
Paper: https://arxiv.org/pdf/1902.02752
Dataset Browser: https://deepknitting.csail.mit.edu/dataset/

License: MIT License

Usage:
    python 03_neural_inverse.py [--output-dir PATH]
"""

import os
import sys
import json
import logging
import argparse
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict
import requests
from tqdm import tqdm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Dataset information
DATASET_INFO = {
    "name": "Neural Inverse Knitting",
    "github_repo": "https://github.com/xionluhnis/neural_inverse_knitting.git",
    "paper": "https://arxiv.org/pdf/1902.02752",
    "dataset_browser": "https://deepknitting.csail.mit.edu/dataset/",
    "license": "MIT",
    "description": "Converts knitted fabric images into machine-readable manufacturing instructions",
    "contents": {
        "images": "Photographs of knitted swatches",
        "instructions": "Machine knitting instructions in knitout format",
        "labels": "Stitch-level annotations"
    }
}


def clone_repository(output_dir: Path) -> bool:
    """Clone the Neural Inverse Knitting repository."""
    repo_dir = output_dir / "neural_inverse_knitting"

    try:
        if repo_dir.exists():
            logger.info(f"Repository exists at {repo_dir}, pulling updates...")
            result = subprocess.run(
                ['git', 'pull'],
                cwd=repo_dir,
                capture_output=True,
                text=True,
                timeout=300
            )
        else:
            logger.info(f"Cloning Neural Inverse Knitting repository...")
            result = subprocess.run(
                ['git', 'clone', DATASET_INFO["github_repo"], str(repo_dir)],
                capture_output=True,
                text=True,
                timeout=600
            )

        if result.returncode == 0:
            logger.info(f"Repository ready at: {repo_dir}")
            return True
        else:
            logger.error(f"Git operation failed: {result.stderr}")
            return False

    except subprocess.TimeoutExpired:
        logger.error("Git operation timed out")
        return False
    except FileNotFoundError:
        logger.error("Git is not installed")
        return False


def analyze_repository(repo_dir: Path) -> Dict:
    """Analyze the cloned repository to understand its structure."""
    analysis = {
        "total_files": 0,
        "python_files": 0,
        "image_files": 0,
        "data_files": 0,
        "knitout_files": 0,
        "directories": []
    }

    if not repo_dir.exists():
        return analysis

    # Count different file types
    for path in repo_dir.rglob("*"):
        if path.is_file():
            analysis["total_files"] += 1
            suffix = path.suffix.lower()

            if suffix == '.py':
                analysis["python_files"] += 1
            elif suffix in ['.png', '.jpg', '.jpeg', '.bmp']:
                analysis["image_files"] += 1
            elif suffix in ['.json', '.csv', '.txt', '.dat']:
                analysis["data_files"] += 1
            elif suffix in ['.knitout', '.k']:
                analysis["knitout_files"] += 1

    # List top-level directories
    for path in repo_dir.iterdir():
        if path.is_dir() and not path.name.startswith('.'):
            analysis["directories"].append(path.name)

    return analysis


def download_paper(output_dir: Path) -> bool:
    """Download the research paper for reference."""
    paper_path = output_dir / "neural_inverse_knitting_paper.pdf"

    if paper_path.exists():
        logger.info(f"Paper already exists: {paper_path}")
        return True

    try:
        logger.info("Downloading research paper...")
        response = requests.get(DATASET_INFO["paper"], timeout=60, stream=True)
        response.raise_for_status()

        total_size = int(response.headers.get('content-length', 0))

        with open(paper_path, 'wb') as f:
            with tqdm(total=total_size, unit='B', unit_scale=True, desc="Paper") as pbar:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        pbar.update(len(chunk))

        logger.info(f"Paper saved to: {paper_path}")
        return True

    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to download paper: {e}")
        return False


def check_dataset_browser() -> Dict:
    """Check if the online dataset browser is accessible."""
    try:
        response = requests.get(DATASET_INFO["dataset_browser"], timeout=30)
        return {
            "accessible": response.status_code == 200,
            "url": DATASET_INFO["dataset_browser"],
            "note": "Interactive browser with downloadable swatches" if response.status_code == 200 else "May be temporarily unavailable"
        }
    except requests.exceptions.RequestException as e:
        return {
            "accessible": False,
            "error": str(e)
        }


def find_dataset_files(repo_dir: Path) -> Dict:
    """Find and catalog dataset files in the repository."""
    dataset_files = {
        "images": [],
        "instructions": [],
        "metadata": [],
        "models": []
    }

    if not repo_dir.exists():
        return dataset_files

    # Look for common dataset directories
    data_dirs = ['data', 'dataset', 'datasets', 'images', 'samples', 'examples']

    for data_dir_name in data_dirs:
        data_dir = repo_dir / data_dir_name
        if data_dir.exists():
            logger.info(f"Found data directory: {data_dir_name}")

            for path in data_dir.rglob("*"):
                if path.is_file():
                    suffix = path.suffix.lower()
                    rel_path = str(path.relative_to(repo_dir))

                    if suffix in ['.png', '.jpg', '.jpeg']:
                        dataset_files["images"].append(rel_path)
                    elif suffix in ['.knitout', '.k', '.txt']:
                        dataset_files["instructions"].append(rel_path)
                    elif suffix in ['.json', '.yaml', '.yml']:
                        dataset_files["metadata"].append(rel_path)
                    elif suffix in ['.pt', '.pth', '.ckpt', '.h5']:
                        dataset_files["models"].append(rel_path)

    return dataset_files


def create_acquisition_manifest(output_dir: Path, results: Dict) -> None:
    """Create a manifest documenting the acquisition."""
    manifest = {
        "acquisition_date": datetime.now().isoformat(),
        "source": "Neural Inverse Knitting - MIT CSAIL",
        "dataset_info": DATASET_INFO,
        "results": results,
        "next_steps": [
            "1. Explore the cloned repository for dataset files",
            "2. Visit dataset browser at deepknitting.csail.mit.edu for interactive download",
            "3. Run the repository's download scripts if available",
            "4. Process images and instructions into standardized format"
        ]
    }

    manifest_path = output_dir / "acquisition_manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    logger.info(f"Manifest saved to: {manifest_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Download Neural Inverse Knitting dataset"
    )
    parser.add_argument(
        '--output-dir',
        type=Path,
        default=Path.home() / 'pattern-repository' / 'raw' / 'neural_inverse',
        help='Output directory for downloaded data'
    )
    parser.add_argument(
        '--skip-paper',
        action='store_true',
        help='Skip downloading the research paper'
    )

    args = parser.parse_args()
    output_dir = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    logger.info(f"Output directory: {output_dir}")
    logger.info("Starting Neural Inverse Knitting dataset acquisition...")

    results = {
        "clone_success": False,
        "paper_downloaded": False,
        "browser_accessible": False,
        "repository_analysis": {},
        "dataset_files": {}
    }

    # 1. Clone repository
    logger.info("\n=== Cloning Repository ===")
    results["clone_success"] = clone_repository(output_dir)

    # 2. Analyze repository
    if results["clone_success"]:
        repo_dir = output_dir / "neural_inverse_knitting"
        logger.info("\n=== Analyzing Repository ===")
        results["repository_analysis"] = analyze_repository(repo_dir)
        results["dataset_files"] = find_dataset_files(repo_dir)

        logger.info(f"Total files: {results['repository_analysis']['total_files']}")
        logger.info(f"Image files: {results['repository_analysis']['image_files']}")
        logger.info(f"Python files: {results['repository_analysis']['python_files']}")
        logger.info(f"Directories: {results['repository_analysis']['directories']}")

    # 3. Download paper
    if not args.skip_paper:
        logger.info("\n=== Downloading Research Paper ===")
        results["paper_downloaded"] = download_paper(output_dir)

    # 4. Check dataset browser
    logger.info("\n=== Checking Dataset Browser ===")
    browser_status = check_dataset_browser()
    results["browser_accessible"] = browser_status.get("accessible", False)
    results["browser_info"] = browser_status

    # Create manifest
    create_acquisition_manifest(output_dir, results)

    # Summary
    logger.info("\n" + "=" * 50)
    logger.info("ACQUISITION SUMMARY")
    logger.info("=" * 50)
    logger.info(f"Repository cloned: {results['clone_success']}")
    logger.info(f"Paper downloaded: {results['paper_downloaded']}")
    logger.info(f"Dataset browser accessible: {results['browser_accessible']}")

    if results["dataset_files"]:
        logger.info(f"\nDataset files found:")
        logger.info(f"  - Images: {len(results['dataset_files']['images'])}")
        logger.info(f"  - Instructions: {len(results['dataset_files']['instructions'])}")
        logger.info(f"  - Metadata: {len(results['dataset_files']['metadata'])}")

    logger.info("\nNext steps:")
    logger.info("1. Check the repository's README for dataset download instructions")
    logger.info("2. Visit https://deepknitting.csail.mit.edu/dataset/ for interactive access")
    logger.info("3. Look for data download scripts in the cloned repository")

    return 0 if results["clone_success"] else 1


if __name__ == "__main__":
    sys.exit(main())
