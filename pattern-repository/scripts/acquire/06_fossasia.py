#!/usr/bin/env python3
"""
FOSSASIA Knitting Patterns Acquisition Script

Downloads open-source knitting patterns and tools from FOSSASIA.
Includes knitlib, knitpat format specifications, and community patterns.

Source: https://github.com/fossasia/knitting.fossasia.org
License: MIT/Apache 2.0

Usage:
    python 06_fossasia.py [--output-dir PATH]
"""

import os
import sys
import json
import logging
import argparse
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List
import requests
from tqdm import tqdm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FOSSASIA knitting-related repositories
FOSSASIA_REPOS = {
    "knitting_fossasia": {
        "url": "https://github.com/fossasia/knitting.fossasia.org.git",
        "description": "Main knitting project site with patterns and tools",
        "priority": 1
    },
    "knitlib": {
        "url": "https://github.com/fossasia/knitlib.git",
        "description": "Python library for controlling knitting machines",
        "priority": 2
    },
    "knitpat": {
        "url": "https://github.com/fossasia/knitpat.git",
        "description": "Knitting pattern format specification",
        "priority": 3
    },
    "knitweb": {
        "url": "https://github.com/fossasia/knitweb.git",
        "description": "Web interface for knitting machine control",
        "priority": 4
    },
    "knittingpattern": {
        "url": "https://github.com/fossasia/knittingpattern.git",
        "description": "Python library for knitting pattern conversion",
        "priority": 5
    },
    "AYABInterface": {
        "url": "https://github.com/fossasia/AYABInterface.git",
        "description": "Interface for All Yarns Are Beautiful knitting machine hack",
        "priority": 6
    }
}

# Additional open-source knitting repos
COMMUNITY_REPOS = {
    "opensourcecraft_patterns": {
        "url": "https://github.com/opensourcecraft/knitting-patterns.git",
        "description": "Open source knitting pattern collection",
        "priority": 1
    },
    "knit_parser": {
        "url": "https://github.com/uriel/knit.git",
        "description": "Parser for knitting pattern notation",
        "priority": 2
    },
    "strickvl_knitting_llms": {
        "url": "https://github.com/strickvl/knitting-llms.git",
        "description": "LLM-based knitting pattern generation",
        "priority": 3
    }
}


def clone_repo(url: str, dest_dir: Path, depth: int = 1) -> bool:
    """Clone a git repository with shallow clone."""
    try:
        if dest_dir.exists():
            logger.info(f"  Updating existing repo: {dest_dir.name}")
            result = subprocess.run(
                ['git', 'pull'],
                cwd=dest_dir,
                capture_output=True,
                text=True,
                timeout=300
            )
        else:
            logger.info(f"  Cloning: {url}")
            result = subprocess.run(
                ['git', 'clone', '--depth', str(depth), url, str(dest_dir)],
                capture_output=True,
                text=True,
                timeout=300
            )

        return result.returncode == 0

    except subprocess.TimeoutExpired:
        logger.error(f"  Timeout cloning {url}")
        return False
    except FileNotFoundError:
        logger.error("  Git not installed")
        return False


def analyze_repo(repo_dir: Path) -> Dict:
    """Analyze a cloned repository."""
    if not repo_dir.exists():
        return {"exists": False}

    analysis = {
        "exists": True,
        "total_files": 0,
        "file_types": {},
        "has_patterns": False,
        "has_images": False,
        "readme": None
    }

    for path in repo_dir.rglob("*"):
        if path.is_file():
            analysis["total_files"] += 1
            suffix = path.suffix.lower()
            analysis["file_types"][suffix] = analysis["file_types"].get(suffix, 0) + 1

            # Check for pattern-related files
            if suffix in ['.pat', '.knitpat', '.json'] and 'pattern' in path.name.lower():
                analysis["has_patterns"] = True

            # Check for images
            if suffix in ['.png', '.jpg', '.jpeg', '.svg']:
                analysis["has_images"] = True

    # Look for README
    for readme_name in ['README.md', 'README.rst', 'README.txt', 'README']:
        readme_path = repo_dir / readme_name
        if readme_path.exists():
            analysis["readme"] = readme_name
            break

    return analysis


def extract_pattern_files(repos_dir: Path) -> List[Dict]:
    """Find and catalog pattern files across all repos."""
    pattern_files = []

    # File extensions that might contain patterns
    pattern_extensions = ['.pat', '.knitpat', '.json', '.yaml', '.yml', '.k', '.knitout']

    for path in repos_dir.rglob("*"):
        if path.is_file() and path.suffix.lower() in pattern_extensions:
            # Check if it looks like a pattern file
            name_lower = path.name.lower()
            if any(kw in name_lower for kw in ['pattern', 'swatch', 'sample', 'example']):
                pattern_files.append({
                    "path": str(path.relative_to(repos_dir)),
                    "name": path.name,
                    "size": path.stat().st_size,
                    "type": path.suffix
                })

    return pattern_files


def create_unified_index(repos_dir: Path, results: Dict) -> Dict:
    """Create a unified index of all acquired resources."""
    index = {
        "repositories": {},
        "pattern_files": [],
        "total_patterns": 0,
        "tools_available": []
    }

    for repo_name, result in results.items():
        if result.get("cloned"):
            repo_dir = repos_dir / repo_name
            analysis = result.get("analysis", {})

            index["repositories"][repo_name] = {
                "path": str(repo_dir),
                "files": analysis.get("total_files", 0),
                "has_patterns": analysis.get("has_patterns", False),
                "has_images": analysis.get("has_images", False)
            }

            # Identify tools
            if analysis.get("file_types", {}).get(".py", 0) > 5:
                index["tools_available"].append(repo_name)

    # Find pattern files
    index["pattern_files"] = extract_pattern_files(repos_dir)
    index["total_patterns"] = len(index["pattern_files"])

    return index


def create_acquisition_manifest(output_dir: Path, results: Dict, index: Dict) -> None:
    """Create manifest documenting the acquisition."""
    manifest = {
        "acquisition_date": datetime.now().isoformat(),
        "source": "FOSSASIA & Open Source Knitting Community",
        "results": results,
        "index": index,
        "notes": [
            "FOSSASIA provides MIT/Apache licensed knitting tools and patterns",
            "knitpat format is a standard for machine-readable patterns",
            "knitlib provides Python API for controlling knitting machines",
            "knittingpattern library can convert between pattern formats"
        ],
        "next_steps": [
            "1. Review pattern files in each repository",
            "2. Use knittingpattern library to convert formats",
            "3. Extract example patterns from knitlib",
            "4. Study knitpat format specification for standardization"
        ]
    }

    manifest_path = output_dir / "acquisition_manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    logger.info(f"Manifest saved to: {manifest_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Download FOSSASIA knitting patterns and tools"
    )
    parser.add_argument(
        '--output-dir',
        type=Path,
        default=Path.home() / 'pattern-repository' / 'raw' / 'fossasia',
        help='Output directory'
    )
    parser.add_argument(
        '--skip-community',
        action='store_true',
        help='Skip community (non-FOSSASIA) repositories'
    )
    parser.add_argument(
        '--full-clone',
        action='store_true',
        help='Do full clone instead of shallow (larger but complete history)'
    )

    args = parser.parse_args()
    output_dir = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    logger.info(f"Output directory: {output_dir}")

    results = {}
    clone_depth = None if args.full_clone else 1

    # Clone FOSSASIA repos
    logger.info("\n=== Cloning FOSSASIA Repositories ===")
    fossasia_dir = output_dir / "fossasia"
    fossasia_dir.mkdir(exist_ok=True)

    for repo_name, repo_info in sorted(FOSSASIA_REPOS.items(), key=lambda x: x[1]["priority"]):
        logger.info(f"\n[{repo_info['priority']}/{len(FOSSASIA_REPOS)}] {repo_name}")
        logger.info(f"    {repo_info['description']}")

        repo_dir = fossasia_dir / repo_name
        success = clone_repo(repo_info["url"], repo_dir, depth=clone_depth or 1)

        results[repo_name] = {
            "url": repo_info["url"],
            "description": repo_info["description"],
            "cloned": success,
            "analysis": analyze_repo(repo_dir) if success else {}
        }

    # Clone community repos
    if not args.skip_community:
        logger.info("\n=== Cloning Community Repositories ===")
        community_dir = output_dir / "community"
        community_dir.mkdir(exist_ok=True)

        for repo_name, repo_info in sorted(COMMUNITY_REPOS.items(), key=lambda x: x[1]["priority"]):
            logger.info(f"\n[{repo_info['priority']}/{len(COMMUNITY_REPOS)}] {repo_name}")
            logger.info(f"    {repo_info['description']}")

            repo_dir = community_dir / repo_name
            success = clone_repo(repo_info["url"], repo_dir, depth=clone_depth or 1)

            results[repo_name] = {
                "url": repo_info["url"],
                "description": repo_info["description"],
                "cloned": success,
                "analysis": analyze_repo(repo_dir) if success else {},
                "source": "community"
            }

    # Create unified index
    logger.info("\n=== Creating Unified Index ===")
    index = create_unified_index(output_dir, results)

    # Create manifest
    create_acquisition_manifest(output_dir, results, index)

    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("ACQUISITION SUMMARY")
    logger.info("=" * 60)

    successful = sum(1 for r in results.values() if r.get("cloned"))
    logger.info(f"\nRepositories cloned: {successful}/{len(results)}")

    for repo_name, result in results.items():
        status = "OK" if result.get("cloned") else "FAILED"
        files = result.get("analysis", {}).get("total_files", 0)
        logger.info(f"  [{status}] {repo_name}: {files} files")

    logger.info(f"\nPattern files found: {index['total_patterns']}")
    logger.info(f"Tools available: {', '.join(index['tools_available'])}")

    logger.info("\nKey resources:")
    logger.info("  - knitpat: Pattern format specification")
    logger.info("  - knittingpattern: Format conversion library")
    logger.info("  - knitlib: Machine control interface")

    return 0 if successful > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
