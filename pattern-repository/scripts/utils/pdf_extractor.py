#!/usr/bin/env python3
"""
PDF Pattern Extractor

Extracts text, images, and charts from PDF pattern files.
Optimized for vintage knitting patterns with OCR support.

Usage:
    from utils.pdf_extractor import PDFExtractor

    extractor = PDFExtractor()
    result = extractor.extract("pattern.pdf", output_dir="./output")
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
import hashlib

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

try:
    import pytesseract
    from PIL import Image
    HAS_OCR = True
except ImportError:
    HAS_OCR = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ExtractionResult:
    """Result of PDF extraction."""
    pdf_path: str
    total_pages: int
    text_extracted: bool
    images_extracted: int
    ocr_applied: bool
    text_file: Optional[str] = None
    images_dir: Optional[str] = None
    metadata: Optional[Dict] = None
    errors: List[str] = None

    def __post_init__(self):
        if self.errors is None:
            self.errors = []

    def to_dict(self) -> Dict:
        return asdict(self)


class PDFExtractor:
    """Extract content from PDF pattern files."""

    def __init__(self, ocr_enabled: bool = True, dpi: int = 300):
        """
        Initialize the PDF extractor.

        Args:
            ocr_enabled: Whether to use OCR for scanned pages
            dpi: Resolution for image extraction
        """
        self.ocr_enabled = ocr_enabled and HAS_OCR
        self.dpi = dpi

        # Check dependencies
        if not HAS_PYMUPDF and not HAS_PDFPLUMBER:
            raise ImportError(
                "PDF extraction requires PyMuPDF or pdfplumber. "
                "Install with: pip install PyMuPDF pdfplumber"
            )

        if ocr_enabled and not HAS_OCR:
            logger.warning(
                "OCR requested but pytesseract not available. "
                "Install with: pip install pytesseract pillow"
            )

    def extract(
        self,
        pdf_path: str | Path,
        output_dir: Optional[str | Path] = None,
        extract_images: bool = True,
        apply_ocr: bool = True
    ) -> ExtractionResult:
        """
        Extract content from a PDF file.

        Args:
            pdf_path: Path to the PDF file
            output_dir: Directory to save extracted content
            extract_images: Whether to extract images
            apply_ocr: Whether to apply OCR to scanned pages

        Returns:
            ExtractionResult with extraction details
        """
        pdf_path = Path(pdf_path)

        if not pdf_path.exists():
            return ExtractionResult(
                pdf_path=str(pdf_path),
                total_pages=0,
                text_extracted=False,
                images_extracted=0,
                ocr_applied=False,
                errors=[f"File not found: {pdf_path}"]
            )

        # Set up output directory
        if output_dir is None:
            output_dir = pdf_path.parent / f"{pdf_path.stem}_extracted"
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        result = ExtractionResult(
            pdf_path=str(pdf_path),
            total_pages=0,
            text_extracted=False,
            images_extracted=0,
            ocr_applied=False
        )

        try:
            if HAS_PYMUPDF:
                result = self._extract_with_pymupdf(
                    pdf_path, output_dir, extract_images, apply_ocr, result
                )
            else:
                result = self._extract_with_pdfplumber(
                    pdf_path, output_dir, extract_images, result
                )

        except Exception as e:
            result.errors.append(f"Extraction failed: {str(e)}")
            logger.error(f"Failed to extract {pdf_path}: {e}")

        return result

    def _extract_with_pymupdf(
        self,
        pdf_path: Path,
        output_dir: Path,
        extract_images: bool,
        apply_ocr: bool,
        result: ExtractionResult
    ) -> ExtractionResult:
        """Extract using PyMuPDF (faster, more features)."""
        doc = fitz.open(pdf_path)
        result.total_pages = len(doc)

        all_text = []
        images_dir = output_dir / "images"

        if extract_images:
            images_dir.mkdir(exist_ok=True)
            result.images_dir = str(images_dir)

        image_count = 0

        for page_num, page in enumerate(doc):
            logger.debug(f"Processing page {page_num + 1}/{result.total_pages}")

            # Extract text
            text = page.get_text()

            # If no text and OCR is enabled, try OCR
            if not text.strip() and apply_ocr and self.ocr_enabled:
                text = self._ocr_page(page)
                if text:
                    result.ocr_applied = True

            if text:
                all_text.append(f"\n--- Page {page_num + 1} ---\n")
                all_text.append(text)

            # Extract images
            if extract_images:
                for img_index, img in enumerate(page.get_images()):
                    try:
                        xref = img[0]
                        base_image = doc.extract_image(xref)
                        image_bytes = base_image["image"]
                        image_ext = base_image["ext"]

                        image_filename = f"page{page_num + 1:03d}_img{img_index + 1:02d}.{image_ext}"
                        image_path = images_dir / image_filename

                        with open(image_path, "wb") as img_file:
                            img_file.write(image_bytes)

                        image_count += 1

                    except Exception as e:
                        logger.warning(f"Failed to extract image: {e}")

        doc.close()

        # Save extracted text
        if all_text:
            text_content = "\n".join(all_text)
            text_file = output_dir / f"{pdf_path.stem}_text.txt"
            text_file.write_text(text_content, encoding='utf-8')
            result.text_file = str(text_file)
            result.text_extracted = True

        result.images_extracted = image_count

        # Extract metadata
        result.metadata = self._extract_metadata_pymupdf(pdf_path)

        return result

    def _extract_with_pdfplumber(
        self,
        pdf_path: Path,
        output_dir: Path,
        extract_images: bool,
        result: ExtractionResult
    ) -> ExtractionResult:
        """Extract using pdfplumber (fallback)."""
        with pdfplumber.open(pdf_path) as pdf:
            result.total_pages = len(pdf.pages)

            all_text = []

            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                if text:
                    all_text.append(f"\n--- Page {page_num + 1} ---\n")
                    all_text.append(text)

            # Save extracted text
            if all_text:
                text_content = "\n".join(all_text)
                text_file = output_dir / f"{pdf_path.stem}_text.txt"
                text_file.write_text(text_content, encoding='utf-8')
                result.text_file = str(text_file)
                result.text_extracted = True

            # pdfplumber image extraction is limited
            if extract_images:
                logger.warning("Image extraction with pdfplumber is limited. Consider installing PyMuPDF.")

        return result

    def _ocr_page(self, page) -> str:
        """Apply OCR to a page."""
        if not HAS_OCR:
            return ""

        try:
            # Render page to image
            pix = page.get_pixmap(dpi=self.dpi)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

            # Apply OCR
            text = pytesseract.image_to_string(img)
            return text

        except Exception as e:
            logger.warning(f"OCR failed: {e}")
            return ""

    def _extract_metadata_pymupdf(self, pdf_path: Path) -> Dict:
        """Extract PDF metadata using PyMuPDF."""
        try:
            doc = fitz.open(pdf_path)
            metadata = doc.metadata
            doc.close()

            # Clean up metadata
            clean_metadata = {}
            for key, value in metadata.items():
                if value:
                    clean_metadata[key] = value

            # Add file info
            clean_metadata['file_size'] = pdf_path.stat().st_size
            clean_metadata['file_hash'] = self._file_hash(pdf_path)

            return clean_metadata

        except Exception as e:
            logger.warning(f"Failed to extract metadata: {e}")
            return {}

    def _file_hash(self, file_path: Path) -> str:
        """Calculate MD5 hash of file."""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()


def batch_extract(
    pdf_dir: str | Path,
    output_dir: str | Path,
    **kwargs
) -> List[ExtractionResult]:
    """
    Extract content from all PDFs in a directory.

    Args:
        pdf_dir: Directory containing PDF files
        output_dir: Base output directory
        **kwargs: Additional arguments for PDFExtractor.extract()

    Returns:
        List of ExtractionResult objects
    """
    pdf_dir = Path(pdf_dir)
    output_dir = Path(output_dir)

    extractor = PDFExtractor()
    results = []

    pdf_files = list(pdf_dir.glob("*.pdf"))
    logger.info(f"Found {len(pdf_files)} PDF files")

    for pdf_path in pdf_files:
        logger.info(f"Processing: {pdf_path.name}")
        pdf_output = output_dir / pdf_path.stem
        result = extractor.extract(pdf_path, pdf_output, **kwargs)
        results.append(result)

    # Save batch results
    results_path = output_dir / "batch_extraction_results.json"
    with open(results_path, 'w') as f:
        json.dump([r.to_dict() for r in results], f, indent=2)

    logger.info(f"Batch results saved to: {results_path}")

    return results


if __name__ == "__main__":
    # Example usage
    import argparse

    parser = argparse.ArgumentParser(description="Extract content from PDF patterns")
    parser.add_argument("pdf_path", help="Path to PDF file or directory")
    parser.add_argument("--output", "-o", help="Output directory")
    parser.add_argument("--no-images", action="store_true", help="Skip image extraction")
    parser.add_argument("--no-ocr", action="store_true", help="Skip OCR")

    args = parser.parse_args()

    pdf_path = Path(args.pdf_path)

    if pdf_path.is_dir():
        output_dir = Path(args.output) if args.output else pdf_path / "extracted"
        results = batch_extract(
            pdf_path,
            output_dir,
            extract_images=not args.no_images,
            apply_ocr=not args.no_ocr
        )
        print(f"\nProcessed {len(results)} files")
    else:
        extractor = PDFExtractor()
        output_dir = Path(args.output) if args.output else None
        result = extractor.extract(
            pdf_path,
            output_dir,
            extract_images=not args.no_images,
            apply_ocr=not args.no_ocr
        )
        print(f"\nExtraction complete:")
        print(f"  Pages: {result.total_pages}")
        print(f"  Text extracted: {result.text_extracted}")
        print(f"  Images extracted: {result.images_extracted}")
        print(f"  OCR applied: {result.ocr_applied}")
        if result.errors:
            print(f"  Errors: {result.errors}")
