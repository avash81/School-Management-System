# M2.3 OCR and Table Detection Architecture

## Status

**Architecture complete; implementation pending.** M2.3 defines the intermediate representation between document processing and M2.4 extraction. It does not write marks or decide student identity.

## Goal

Convert a PDF or image into coordinate-aware text and a structured table while preserving enough provenance for human review:

```text
PDF/Image
  -> inspect quality and orientation
  -> digital text extraction or OCR
  -> coordinate normalization
  -> table boundary detection
  -> row/column reconstruction
  -> header mapping
  -> multi-page assembly
  -> intermediate table
  -> M2.4 extraction
```

OCR supplies text. Table detection supplies structure. Neither is authoritative over marks.

## OCR output contract

Every page must preserve its source dimensions and coordinate system:

```ts
{
  pageNumber: number,
  width: number,
  height: number,
  rotation: 0 | 90 | 180 | 270,
  elements: Array<{
    text: string,
    boundingBox: { x: number, y: number, width: number, height: number },
    confidence?: number,
    type: "word" | "line" | "block",
    source: "pdf_text" | "ocr",
  }>
}
```

Coordinates are normalized to the original page coordinate space after preprocessing transforms. Store the transform metadata so a reviewer can map extracted cells back to the original document.

## Input routing

Use the cheapest reliable route:

```text
Digital PDF with text layer -> text extraction
Scanned PDF                -> render pages -> OCR
Image                       -> preprocessing -> OCR
XLSX/CSV                    -> structured parser, no OCR
```

A PDF text-layer check must happen before rendering pages for OCR. Complex visual tables may still use a document/table provider even when a text layer exists.

## Preprocessing stages

For images and scanned pages:

```text
orientation detection
  -> rotation correction
  -> deskew
  -> crop/page boundary detection
  -> denoise
  -> contrast enhancement
  -> resolution normalization
  -> OCR
```

Each stage records its processor version and output metadata. Never overwrite the original file. A quality classifier returns `good`, `fair`, or `poor` with reasons such as low resolution, severe skew, clipping, shadows, or insufficient contrast. Poor quality produces a warning or mandatory review; it does not silently reject useful input.

## OCR provider abstraction

Define an `OCRProvider` contract with implementations for local OCR, cloud OCR, vision/document models, or handwriting-capable providers. The provider returns the common page/elements contract and must not write to the database or marks service.

Provider selection is policy-driven:

- printed digital text: PDF text extraction
- clean printed scan: standard OCR
- complex visual table: table/document provider
- handwriting: handwriting provider with mandatory review
- unsupported language or quality: explicit review/failure state

Record provider name, model/version, processing duration, and safe cost metadata for every run.

## Table boundary detection

Combine several signals rather than relying on visible borders alone:

- horizontal and vertical ruling lines
- repeated x-coordinate alignment
- repeated y-coordinate spacing
- whitespace gutters
- header vocabulary and layout
- text block containment
- school format profile hints

The detector should return candidate tables with a confidence score and evidence. Multiple candidates require review or format selection; the system must not silently choose an arbitrary table.

## Row and column reconstruction

For borderless tables, cluster element centers in normalized coordinate space:

```text
x clusters -> columns
y clusters -> rows
```

Clustering tolerances must account for font size, scan scale, rotation, and perspective. Preserve the original bounding boxes on every cell. A cell may contain multiple OCR elements joined by reading order and spatial overlap.

The output is an intermediate representation, not official data:

```ts
{
  pageNumber: number,
  tableIndex: number,
  confidence: number,
  headers: Array<{
    label: string,
    columnIndex: number,
    boundingBox: BoundingBox,
  }>,
  rows: Array<{
    rowIndex: number,
    cells: Array<{
      columnIndex: number,
      rawText: string,
      boundingBoxes: BoundingBox[],
      confidence?: number,
    }>,
  }>,
}
```

## Header and format mapping

Normalize known labels such as `Roll`, `Roll No.`, `Student Name`, `Written`, `Theory`, `Practical`, `Internal`, and `Total` into candidate fields. A school format profile can constrain expected column order and components, but a profile match is a suggestion until validated.

Support manual mapping when detection is uncertain:

```text
Column 1 -> rollNumber
Column 2 -> studentName
Column 3 -> theory
Column 4 -> practical
```

Save an approved mapping as a versioned school format profile. Corrections improve future routing through configuration, not silent model retraining.

## Merged and multi-level headers

Separate document headers, table headers, and data rows. Represent merged cells with a span over column indices. Flatten multi-level headers using the configured hierarchy, for example:

```text
theory.written
theory.internal
practical.oral
practical.lab
```

A merged title such as `Mathematics` must not become a student row or mark value.

## Multi-page assembly

Detect continuation tables by comparing:

- normalized header structure
- column positions and widths
- table title/context
- row spacing and page order
- school format profile

Repeated page headers are metadata, not data rows. A row split across pages is flagged as ambiguous unless cell provenance makes the join unambiguous. Page order and source references are retained after assembly.

## Language, handwriting, and values

The architecture must support English, Nepali, and mixed documents through provider capability metadata. Nepali labels and AD/BS date strings are preserved as raw source values until a later normalization stage.

Marks may appear as `87`, `87.5`, `87/100`, `87%`, `A`, `AB`, `-`, or other configured statuses. OCR/table detection preserves raw text. M2.4 and the marks validator interpret it. `AB` becomes an absent candidate with null numeric value; it never becomes zero.

Handwritten marks are a separate provider path and always require mandatory human review, regardless of model confidence.

## Quality and confidence

Track confidence at multiple levels:

```text
OCR element confidence
  -> table detection confidence
  -> header/column confidence
  -> cell confidence
```

Confidence is evidence, not correctness. Range rules, format profiles, neighboring values, and human review remain authoritative. Suspicious values such as `387` in a maximum-100 column are flagged, never auto-corrected.

## Failure handling

Use stable states and user-safe codes:

- `ORIENTATION_UNCERTAIN`
- `LOW_IMAGE_QUALITY`
- `OCR_FAILED`
- `TABLE_NOT_DETECTED`
- `MULTIPLE_TABLE_CANDIDATES`
- `HEADER_MAPPING_REQUIRED`
- `MULTI_PAGE_ASSEMBLY_UNCERTAIN`
- `HANDWRITING_REVIEW_REQUIRED`

Offer retry, format selection, manual column mapping, or cancellation. Keep technical diagnostics restricted and retain the original plus intermediate artifacts for debugging.

## Performance and cost

Process multi-page documents asynchronously. Split large PDFs into bounded page tasks, parallelize independent pages, and combine deterministically. Avoid expensive vision processing for clean text PDFs, CSV, or XLSX. Record page count, processing duration, provider, model version, and estimated cost.

## M2.3 handoff to M2.4

M2.3 returns tables and provenance only. M2.4 interprets headers and cell values into canonical student/subject/component records. No student match, official mark write, result calculation, or publication occurs in M2.3.

## Acceptance criteria

- Digital and scanned PDF routing is defined.
- Coordinate-aware OCR output is versioned and traceable.
- Orientation, deskew, denoise, contrast, and quality handling are defined.
- Border-based and borderless table detection are supported.
- Row, column, header, merged-cell, and multi-level structures are represented.
- Multi-page continuation and repeated headers are handled safely.
- English/Nepali, AD/BS, handwriting, absent, and special value strategies are defined.
- Confidence is tracked without becoming an authority.
- Manual mapping and format profiles are supported.
- Intermediate artifacts and stable failure states are retained.
- Large-document processing is asynchronous and cost-aware.
- The output boundary into M2.4 is explicit.

## Next part

M2.4 should define how intermediate cells become canonical student, subject, component, mark, and attendance records, including normalization, totals, ambiguous values, and extraction-level confidence.
