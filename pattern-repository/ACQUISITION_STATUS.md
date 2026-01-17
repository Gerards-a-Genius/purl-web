# Acquisition Status Report

**Date:** 2026-01-16
**Total Files Acquired:** 315

## Successfully Downloaded

### 1. Neural Inverse Knitting (MIT CSAIL)
- **Location:** `raw/neural_inverse/`
- **Status:** Downloaded
- **Contents:**
  - Research paper (PDF)
  - Full repository with ML code
  - Test data and evaluation scripts
- **Use:** Image → instruction training data

### 2. Knitting-LLMs (strickvl)
- **Location:** `raw/fossasia/downloads/knitting-llms-main/`
- **Status:** Downloaded
- **Contents:**
  - 21 generated pattern files (.md)
  - 21 pattern visualizations (.png)
  - Pattern generation code
- **Use:** Example format for pattern generation output

### 3. Knitout Format (MIT Textiles Lab)
- **Location:** `raw/csail/knitout-master/`
- **Status:** Downloaded
- **Contents:**
  - Knitout format specification
  - HTML documentation
- **Use:** Machine knitting instruction format reference

### 4. FOSSASIA Pattern Libraries
- **Location:** `raw/fossasia/downloads/`
- **Status:** Downloaded
- **Repositories:**
  - `knittingpattern-master/` - Pattern format conversion library
  - `knitpat-master/` - Knitpat format specification
- **Use:** Format conversion and standardization

### 5. Internet Archive (Vintage)
- **Location:** `raw/vintage_knitting/internet_archive/`
- **Status:** Metadata cataloged
- **Items:** 20 vintage knitting books/magazines
- **Use:** Public domain patterns (requires manual PDF download)

## Pending Actions

1. **Fix Git Access:**
   - Run `sudo xcodebuild -license` to enable git
   - Then re-run acquisition for additional repos

2. **Install ChromaDB:**
   ```bash
   pip install chromadb
   ```

3. **Download More Vintage PDFs:**
   - Visit Internet Archive URLs in `archive_items.json`
   - Download PDFs manually or via browser

4. **Process Raw Data:**
   ```bash
   python scripts/process/05_generate_embeddings.py
   ```

## Data Quality Notes

- **Knitting-LLMs patterns:** Excellent format for training - complete with materials, instructions, and visualizations
- **Neural Inverse:** Academic quality, well-structured for ML training
- **Knitout:** Machine-readable format, good for structured understanding
- **Vintage:** Requires OCR for text extraction from PDFs

## Next Steps

1. Set up virtual environment and install all dependencies
2. Run PDF extraction on vintage patterns
3. Standardize all patterns to metadata schema
4. Generate embeddings (requires OpenAI API key or local models)
5. Build MCP server for Claude integration
