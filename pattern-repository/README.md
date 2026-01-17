# Pattern Repository

AI-powered knitting and crochet pattern repository with semantic search and generation capabilities.

## Overview

This repository aggregates open-source and public domain knitting/crochet patterns for use as training data and knowledge base for AI pattern generation.

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run acquisition pipeline
python run_acquisition.py --acquire

# 3. Set up vector database
python scripts/vectordb/setup_chroma.py

# 4. Generate embeddings (requires additional setup)
python scripts/process/05_generate_embeddings.py
```

## Directory Structure

```
pattern-repository/
├── raw/                      # Downloaded source data
│   ├── csail/               # MIT CSAIL KnitDB
│   ├── neural_inverse/      # Neural Inverse Knitting dataset
│   ├── fossasia/            # FOSSASIA patterns & tools
│   ├── vintage_knitting/    # Public domain vintage patterns
│   └── ravelry_metadata/    # Ravelry API metadata (optional)
│
├── processed/               # Standardized patterns
│   ├── patterns/           # Individual pattern folders
│   │   └── {uuid}/
│   │       ├── metadata.json
│   │       ├── instructions.md
│   │       ├── preview.png
│   │       └── embeddings/
│   └── index/              # Master indexes
│
├── embeddings/             # Vector database
│   └── chroma_db/         # ChromaDB storage
│
├── training/              # AI training datasets
│   ├── fine_tune/        # Fine-tuning data
│   └── rag/              # RAG chunks
│
├── scripts/              # Processing scripts
│   ├── acquire/         # Data acquisition
│   ├── process/         # Data processing
│   ├── vectordb/        # Vector DB management
│   └── utils/           # Utilities
│
└── models/              # Trained models
```

## Data Sources

| Source | Patterns | License | Status |
|--------|----------|---------|--------|
| MIT CSAIL KnitDB | ~300 | MIT | Academic |
| Neural Inverse Knitting | 300+ | MIT | Academic |
| FOSSASIA | 100+ | MIT/Apache | Open Source |
| Free Vintage Knitting | 500+ | Public Domain | Vintage |
| Internet Archive | 1000+ | Public Domain | Vintage |

## Acquisition Scripts

```bash
# Individual sources
python scripts/acquire/01_csail_knitdb.py
python scripts/acquire/03_neural_inverse.py
python scripts/acquire/06_fossasia.py
python scripts/acquire/05_vintage_knitting.py

# Or run all at once
python run_acquisition.py --acquire
```

## Processing Pipeline

1. **Acquire** - Download from sources
2. **Extract** - PDF → text + images
3. **Standardize** - Normalize to schema
4. **Embed** - Generate vectors
5. **Index** - Populate vector DB

## AI Integration

### RAG Search
```python
from scripts.vectordb.setup_chroma import PatternVectorDB

db = PatternVectorDB("./embeddings/chroma_db")
results = db.search_by_image(image_embedding, n_results=5)
```

### Fine-tuning Data
Training data is formatted in `training/fine_tune/`:
- `image_to_instructions/` - Image → pattern pairs
- `description_to_pattern/` - Text → pattern pairs

## Pattern Schema

See `processed/patterns/schema/pattern_schema.json` for the full JSON schema.

Key fields:
- `id` - UUID
- `type` - knitting/crochet/machine_knit
- `techniques` - List of techniques used
- `materials` - Yarn, needles, notions
- `instructions` - Full pattern text
- `embeddings` - Paths to embedding files

## Requirements

Core:
- Python 3.11+
- requests, beautifulsoup4
- chromadb

For embeddings:
- sentence-transformers (local) OR openai (API)
- torch, clip (for images)

For PDF processing:
- PyMuPDF, pdfplumber
- pytesseract (OCR)

## License

This repository aggregates content under various licenses:
- Scripts and tools: MIT License
- MIT CSAIL data: MIT License
- FOSSASIA data: MIT/Apache 2.0
- Vintage patterns: Public Domain

Always check individual pattern licenses before use.

## Contributing

1. Add new open-source pattern sources
2. Improve PDF extraction accuracy
3. Enhance embedding quality
4. Build MCP server for Claude integration
