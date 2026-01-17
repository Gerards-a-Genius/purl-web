#!/usr/bin/env python3
"""
Vintage Knitting Patterns Acquisition Script

Downloads public domain knitting patterns from vintage sources.
Patterns published before 1928 are in the public domain (US).

Sources:
- Free Vintage Knitting (freevintageknitting.com)
- Internet Archive (archive.org)
- Project Gutenberg
- HathiTrust Digital Library

License: Public Domain

Usage:
    python 05_vintage_knitting.py [--output-dir PATH] [--delay SECONDS]

IMPORTANT: This script uses respectful rate limiting to avoid overloading servers.
"""

import os
import sys
import json
import logging
import argparse
import time
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# User agent for polite scraping
USER_AGENT = "PatternRepositoryBot/1.0 (Educational/Research; contact@example.com)"

# Public domain sources
SOURCES = {
    "free_vintage_knitting": {
        "base_url": "https://freevintageknitting.com/",
        "index_pages": [
            "free-pattern/",
            "pattern-book/"
        ],
        "description": "Curated vintage knitting patterns",
        "priority": 1
    },
    "internet_archive": {
        "base_url": "https://archive.org/",
        "search_url": "https://archive.org/advancedsearch.php",
        "description": "Internet Archive digitized books",
        "priority": 2
    },
    "gutenberg": {
        "base_url": "https://www.gutenberg.org/",
        "search_url": "https://www.gutenberg.org/ebooks/search/?query=knitting",
        "description": "Project Gutenberg free ebooks",
        "priority": 3
    }
}


class RespectfulScraper:
    """Scraper with built-in rate limiting and politeness."""

    def __init__(self, delay: float = 2.0):
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        })
        self.last_request_time = 0

    def wait(self):
        """Enforce rate limiting."""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.delay:
            time.sleep(self.delay - elapsed)
        self.last_request_time = time.time()

    def get(self, url: str, **kwargs) -> Optional[requests.Response]:
        """Make a rate-limited GET request."""
        self.wait()
        try:
            response = self.session.get(url, timeout=30, **kwargs)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed for {url}: {e}")
            return None

    def download_file(self, url: str, dest_path: Path) -> bool:
        """Download a file with progress bar."""
        self.wait()
        try:
            response = self.session.get(url, stream=True, timeout=60)
            response.raise_for_status()

            total_size = int(response.headers.get('content-length', 0))

            with open(dest_path, 'wb') as f:
                with tqdm(total=total_size, unit='B', unit_scale=True,
                          desc=dest_path.name[:30], leave=False) as pbar:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                            pbar.update(len(chunk))

            return True

        except requests.exceptions.RequestException as e:
            logger.error(f"Download failed: {e}")
            return False


def scrape_free_vintage_knitting(scraper: RespectfulScraper, output_dir: Path, max_patterns: int = 100) -> Dict:
    """Scrape patterns from Free Vintage Knitting."""
    logger.info("Scraping Free Vintage Knitting...")

    source_dir = output_dir / "free_vintage_knitting"
    source_dir.mkdir(exist_ok=True)
    pdfs_dir = source_dir / "pdfs"
    pdfs_dir.mkdir(exist_ok=True)

    result = {
        "source": "freevintageknitting.com",
        "patterns_found": 0,
        "patterns_downloaded": 0,
        "errors": []
    }

    patterns_metadata = []

    # Get the main pattern index page
    index_url = "https://freevintageknitting.com/free-pattern/"
    response = scraper.get(index_url)

    if not response:
        result["errors"].append("Could not access main index")
        return result

    soup = BeautifulSoup(response.text, 'lxml')

    # Find pattern links (structure varies by site)
    pattern_links = []

    # Look for links to individual patterns
    for link in soup.find_all('a', href=True):
        href = link.get('href', '')
        if 'pattern' in href.lower() and href.endswith('/'):
            full_url = urljoin(index_url, href)
            if full_url not in [p['url'] for p in pattern_links]:
                pattern_links.append({
                    'url': full_url,
                    'title': link.get_text(strip=True) or 'Unknown'
                })

    result["patterns_found"] = len(pattern_links)
    logger.info(f"Found {len(pattern_links)} potential patterns")

    # Download patterns (limited to max_patterns)
    for i, pattern in enumerate(pattern_links[:max_patterns]):
        logger.info(f"[{i+1}/{min(len(pattern_links), max_patterns)}] Processing: {pattern['title'][:50]}")

        # Get pattern page
        pattern_response = scraper.get(pattern['url'])
        if not pattern_response:
            result["errors"].append(f"Could not access: {pattern['url']}")
            continue

        pattern_soup = BeautifulSoup(pattern_response.text, 'lxml')

        # Look for PDF download link
        pdf_link = None
        for link in pattern_soup.find_all('a', href=True):
            href = link.get('href', '')
            if href.lower().endswith('.pdf'):
                pdf_link = urljoin(pattern['url'], href)
                break

        if pdf_link:
            # Generate safe filename
            safe_name = "".join(c if c.isalnum() or c in '-_' else '_'
                               for c in pattern['title'][:50])
            pdf_filename = f"{safe_name}.pdf"
            pdf_path = pdfs_dir / pdf_filename

            if not pdf_path.exists():
                if scraper.download_file(pdf_link, pdf_path):
                    result["patterns_downloaded"] += 1
                    patterns_metadata.append({
                        "title": pattern['title'],
                        "source_url": pattern['url'],
                        "pdf_url": pdf_link,
                        "local_path": str(pdf_path.relative_to(output_dir)),
                        "downloaded": datetime.now().isoformat()
                    })
            else:
                logger.info(f"  Already exists: {pdf_filename}")
                result["patterns_downloaded"] += 1

    # Save metadata
    metadata_path = source_dir / "patterns_metadata.json"
    with open(metadata_path, 'w') as f:
        json.dump(patterns_metadata, f, indent=2)

    result["metadata_file"] = str(metadata_path)
    return result


def search_internet_archive(scraper: RespectfulScraper, output_dir: Path, max_items: int = 50) -> Dict:
    """Search Internet Archive for knitting books."""
    logger.info("Searching Internet Archive...")

    source_dir = output_dir / "internet_archive"
    source_dir.mkdir(exist_ok=True)

    result = {
        "source": "archive.org",
        "items_found": 0,
        "items_downloaded": 0,
        "items": []
    }

    # Search for knitting-related books in public domain
    search_url = (
        "https://archive.org/advancedsearch.php?"
        "q=subject%3A%28knitting%29+AND+mediatype%3A%28texts%29"
        "&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=year&fl%5B%5D=description"
        "&sort%5B%5D=downloads+desc"
        f"&rows={max_items}"
        "&output=json"
    )

    response = scraper.get(search_url)
    if not response:
        result["errors"] = ["Could not search Internet Archive"]
        return result

    try:
        data = response.json()
        docs = data.get('response', {}).get('docs', [])
        result["items_found"] = len(docs)

        logger.info(f"Found {len(docs)} items on Internet Archive")

        # Save search results
        for doc in docs:
            item = {
                "identifier": doc.get('identifier'),
                "title": doc.get('title'),
                "year": doc.get('year'),
                "description": doc.get('description', '')[:500] if doc.get('description') else '',
                "url": f"https://archive.org/details/{doc.get('identifier')}",
                "download_url": f"https://archive.org/download/{doc.get('identifier')}"
            }
            result["items"].append(item)

        # Save items list
        items_path = source_dir / "archive_items.json"
        with open(items_path, 'w') as f:
            json.dump(result["items"], f, indent=2)

        logger.info(f"Items list saved to: {items_path}")
        logger.info("Note: PDFs can be downloaded from the URLs in the items list")

    except json.JSONDecodeError as e:
        result["errors"] = [f"Failed to parse response: {e}"]

    return result


def search_gutenberg(scraper: RespectfulScraper, output_dir: Path) -> Dict:
    """Search Project Gutenberg for knitting books."""
    logger.info("Searching Project Gutenberg...")

    source_dir = output_dir / "gutenberg"
    source_dir.mkdir(exist_ok=True)

    result = {
        "source": "gutenberg.org",
        "items_found": 0,
        "items": []
    }

    search_url = "https://www.gutenberg.org/ebooks/search/?query=knitting&submit_search=Go%21"
    response = scraper.get(search_url)

    if not response:
        result["errors"] = ["Could not search Gutenberg"]
        return result

    soup = BeautifulSoup(response.text, 'lxml')

    # Find book entries
    for book_link in soup.find_all('li', class_='booklink'):
        link = book_link.find('a', href=True)
        if link:
            title_span = book_link.find('span', class_='title')
            author_span = book_link.find('span', class_='subtitle')

            ebook_id = link['href'].split('/')[-1] if link['href'] else None

            if ebook_id:
                result["items"].append({
                    "id": ebook_id,
                    "title": title_span.get_text(strip=True) if title_span else "Unknown",
                    "author": author_span.get_text(strip=True) if author_span else "Unknown",
                    "url": f"https://www.gutenberg.org/ebooks/{ebook_id}",
                    "download_txt": f"https://www.gutenberg.org/cache/epub/{ebook_id}/pg{ebook_id}.txt",
                    "download_html": f"https://www.gutenberg.org/cache/epub/{ebook_id}/pg{ebook_id}-images.html"
                })

    result["items_found"] = len(result["items"])
    logger.info(f"Found {result['items_found']} items on Gutenberg")

    # Save items list
    items_path = source_dir / "gutenberg_items.json"
    with open(items_path, 'w') as f:
        json.dump(result["items"], f, indent=2)

    return result


def create_acquisition_manifest(output_dir: Path, results: Dict) -> None:
    """Create manifest documenting the acquisition."""
    manifest = {
        "acquisition_date": datetime.now().isoformat(),
        "source_type": "Public Domain Vintage Patterns",
        "legal_status": "Public domain (pre-1928 US publications)",
        "results": results,
        "notes": [
            "All patterns are from public domain sources",
            "Original publication dates are typically 1850-1927",
            "PDFs may require OCR for text extraction",
            "Some patterns use vintage terminology and measurements"
        ],
        "next_steps": [
            "1. Run PDF extraction to get text and images",
            "2. Apply OCR to scanned pages",
            "3. Modernize pattern terminology",
            "4. Standardize measurements (imperial to metric)"
        ]
    }

    manifest_path = output_dir / "acquisition_manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    logger.info(f"Manifest saved to: {manifest_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Download public domain vintage knitting patterns"
    )
    parser.add_argument(
        '--output-dir',
        type=Path,
        default=Path.home() / 'pattern-repository' / 'raw' / 'vintage_knitting',
        help='Output directory'
    )
    parser.add_argument(
        '--delay',
        type=float,
        default=2.0,
        help='Delay between requests in seconds (default: 2.0)'
    )
    parser.add_argument(
        '--max-patterns',
        type=int,
        default=50,
        help='Maximum patterns to download per source (default: 50)'
    )
    parser.add_argument(
        '--source',
        choices=['all', 'vintage', 'archive', 'gutenberg'],
        default='all',
        help='Which source to scrape (default: all)'
    )

    args = parser.parse_args()
    output_dir = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    logger.info(f"Output directory: {output_dir}")
    logger.info(f"Rate limit delay: {args.delay}s between requests")

    scraper = RespectfulScraper(delay=args.delay)
    results = {}

    # Scrape Free Vintage Knitting
    if args.source in ['all', 'vintage']:
        logger.info("\n=== Free Vintage Knitting ===")
        results["free_vintage_knitting"] = scrape_free_vintage_knitting(
            scraper, output_dir, max_patterns=args.max_patterns
        )

    # Search Internet Archive
    if args.source in ['all', 'archive']:
        logger.info("\n=== Internet Archive ===")
        results["internet_archive"] = search_internet_archive(
            scraper, output_dir, max_items=args.max_patterns
        )

    # Search Project Gutenberg
    if args.source in ['all', 'gutenberg']:
        logger.info("\n=== Project Gutenberg ===")
        results["gutenberg"] = search_gutenberg(scraper, output_dir)

    # Create manifest
    create_acquisition_manifest(output_dir, results)

    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("ACQUISITION SUMMARY")
    logger.info("=" * 60)

    total_patterns = 0
    for source, data in results.items():
        patterns = data.get('patterns_downloaded', 0) or data.get('items_found', 0)
        total_patterns += patterns
        logger.info(f"{source}: {patterns} items")

    logger.info(f"\nTotal items cataloged: {total_patterns}")
    logger.info("\nNote: Some sources provide metadata only. Use the URLs in the")
    logger.info("JSON files to download full content as needed.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
