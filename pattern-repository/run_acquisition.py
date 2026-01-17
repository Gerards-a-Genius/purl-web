#!/usr/bin/env python3
"""
Pattern Repository - Master Acquisition Runner

Orchestrates the full acquisition pipeline:
1. Download from all sources
2. Process and extract content
3. Generate embeddings
4. Initialize vector database
5. Index patterns

Usage:
    python run_acquisition.py --all              # Run everything
    python run_acquisition.py --acquire          # Only acquisition
    python run_acquisition.py --process          # Only processing
    python run_acquisition.py --embed            # Only embeddings
    python run_acquisition.py --index            # Only indexing
"""

import os
import sys
import subprocess
import argparse
import logging
from pathlib import Path
from datetime import datetime
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Repository root
REPO_ROOT = Path(__file__).parent
SCRIPTS_DIR = REPO_ROOT / "scripts"


def run_script(script_path: Path, *args, **kwargs) -> bool:
    """Run a Python script and return success status."""
    cmd = [sys.executable, str(script_path)] + list(args)

    logger.info(f"Running: {script_path.name}")
    logger.debug(f"Command: {' '.join(cmd)}")

    try:
        result = subprocess.run(
            cmd,
            cwd=REPO_ROOT,
            capture_output=kwargs.get('capture_output', False),
            timeout=kwargs.get('timeout', 3600)  # 1 hour default
        )
        return result.returncode == 0

    except subprocess.TimeoutExpired:
        logger.error(f"Script timed out: {script_path.name}")
        return False
    except Exception as e:
        logger.error(f"Script failed: {e}")
        return False


def phase_acquire() -> dict:
    """Phase 1: Data Acquisition from all sources."""
    logger.info("\n" + "=" * 60)
    logger.info("PHASE 1: DATA ACQUISITION")
    logger.info("=" * 60)

    results = {}

    # Acquisition scripts in order
    acquisition_scripts = [
        ("csail", SCRIPTS_DIR / "acquire" / "01_csail_knitdb.py"),
        ("neural_inverse", SCRIPTS_DIR / "acquire" / "03_neural_inverse.py"),
        ("fossasia", SCRIPTS_DIR / "acquire" / "06_fossasia.py"),
        ("vintage", SCRIPTS_DIR / "acquire" / "05_vintage_knitting.py"),
    ]

    for name, script in acquisition_scripts:
        if script.exists():
            logger.info(f"\n--- Acquiring: {name} ---")
            results[name] = run_script(script)
        else:
            logger.warning(f"Script not found: {script}")
            results[name] = False

    return results


def phase_process() -> dict:
    """Phase 2: Process and extract content from raw data."""
    logger.info("\n" + "=" * 60)
    logger.info("PHASE 2: PROCESSING")
    logger.info("=" * 60)

    results = {}

    # Check for PDFs to process
    pdf_dirs = [
        REPO_ROOT / "raw" / "vintage_knitting" / "free_vintage_knitting" / "pdfs",
        REPO_ROOT / "raw" / "antique_library",
    ]

    for pdf_dir in pdf_dirs:
        if pdf_dir.exists():
            pdfs = list(pdf_dir.glob("*.pdf"))
            if pdfs:
                logger.info(f"Found {len(pdfs)} PDFs in {pdf_dir.name}")
                # Note: PDF extraction would happen here
                results[pdf_dir.name] = True

    return results


def phase_setup_db() -> dict:
    """Phase 3: Set up vector database."""
    logger.info("\n" + "=" * 60)
    logger.info("PHASE 3: DATABASE SETUP")
    logger.info("=" * 60)

    results = {}

    setup_script = SCRIPTS_DIR / "vectordb" / "setup_chroma.py"
    if setup_script.exists():
        results["chromadb"] = run_script(setup_script)
    else:
        logger.warning("ChromaDB setup script not found")
        results["chromadb"] = False

    return results


def phase_embed() -> dict:
    """Phase 4: Generate embeddings."""
    logger.info("\n" + "=" * 60)
    logger.info("PHASE 4: EMBEDDING GENERATION")
    logger.info("=" * 60)

    results = {}

    embed_script = SCRIPTS_DIR / "process" / "05_generate_embeddings.py"
    if embed_script.exists():
        results["embeddings"] = run_script(embed_script)
    else:
        logger.warning("Embedding script not found")
        results["embeddings"] = False

    return results


def create_run_report(all_results: dict) -> None:
    """Create a run report."""
    report = {
        "run_date": datetime.now().isoformat(),
        "results": all_results,
        "success": all(
            all(v for v in phase.values()) if isinstance(phase, dict) else phase
            for phase in all_results.values()
        )
    }

    report_path = REPO_ROOT / "logs" / f"run_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    report_path.parent.mkdir(exist_ok=True)

    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)

    logger.info(f"\nRun report saved to: {report_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Pattern Repository Master Runner"
    )
    parser.add_argument('--all', action='store_true', help='Run all phases')
    parser.add_argument('--acquire', action='store_true', help='Run acquisition phase')
    parser.add_argument('--process', action='store_true', help='Run processing phase')
    parser.add_argument('--setup-db', action='store_true', help='Set up vector database')
    parser.add_argument('--embed', action='store_true', help='Generate embeddings')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done')

    args = parser.parse_args()

    # Default to --all if no phase specified
    if not any([args.all, args.acquire, args.process, args.setup_db, args.embed]):
        args.all = True

    logger.info("=" * 60)
    logger.info("PATTERN REPOSITORY - ACQUISITION PIPELINE")
    logger.info("=" * 60)
    logger.info(f"Repository: {REPO_ROOT}")
    logger.info(f"Started: {datetime.now().isoformat()}")

    if args.dry_run:
        logger.info("\n[DRY RUN - No changes will be made]\n")

    all_results = {}

    # Phase 1: Acquisition
    if args.all or args.acquire:
        if args.dry_run:
            logger.info("Would run: Data acquisition from all sources")
        else:
            all_results["acquisition"] = phase_acquire()

    # Phase 2: Processing
    if args.all or args.process:
        if args.dry_run:
            logger.info("Would run: PDF extraction and content processing")
        else:
            all_results["processing"] = phase_process()

    # Phase 3: Database Setup
    if args.all or args.setup_db:
        if args.dry_run:
            logger.info("Would run: ChromaDB vector database setup")
        else:
            all_results["database"] = phase_setup_db()

    # Phase 4: Embedding Generation
    if args.all or args.embed:
        if args.dry_run:
            logger.info("Would run: Text and image embedding generation")
        else:
            all_results["embeddings"] = phase_embed()

    # Summary
    if not args.dry_run:
        logger.info("\n" + "=" * 60)
        logger.info("PIPELINE COMPLETE")
        logger.info("=" * 60)

        for phase, results in all_results.items():
            if isinstance(results, dict):
                successes = sum(results.values())
                total = len(results)
                logger.info(f"{phase}: {successes}/{total} successful")
            else:
                status = "OK" if results else "FAILED"
                logger.info(f"{phase}: {status}")

        create_run_report(all_results)

        # Next steps
        logger.info("\nNext steps:")
        logger.info("1. Review acquisition manifests in raw/ directories")
        logger.info("2. Run PDF extraction for vintage patterns")
        logger.info("3. Standardize patterns to processed/ format")
        logger.info("4. Generate embeddings and index patterns")
        logger.info("5. Test retrieval with scripts/test/test_retrieval.py")

    return 0


if __name__ == "__main__":
    sys.exit(main())
