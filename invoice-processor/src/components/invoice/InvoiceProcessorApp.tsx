"use client";

import { pdf } from "@react-pdf/renderer";
import { useEffect, useMemo, useRef, useState } from "react";
import { InvoicePdfDocument } from "@/components/invoice/InvoicePdfDocument";
import {
  DEFAULT_MODEL,
  MAX_UPLOAD_SIZE_BYTES,
  humanizeCategory,
  mergeModelSelection,
} from "@/lib/invoice";
import { processInvoice } from "@/lib/api";
import { extractTextFromFile, isSupported } from "@/lib/ocr";
import { loadInvoiceProcessorState, saveInvoiceProcessorState } from "@/lib/storage";
import type { InvoiceProcessingResult } from "@/lib/types";
import { useModels } from "@/hooks/useModels";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function cardTitle(title: string, subtitle: string) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

type Stage = "idle" | "ocr" | "llm" | "ready" | "error";

export function InvoiceProcessorApp() {
  const modelsQuery = useModels();
  const [hydrated, setHydrated] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastResult, setLastResult] = useState<InvoiceProcessingResult | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [ocrStageLabel, setOcrStageLabel] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [error, setError] = useState("");
  const abortRef = useRef(false);

  useEffect(() => {
    const state = loadInvoiceProcessorState();
    setSelectedModel(state.selectedModel);
    setLastResult(state.lastResult);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveInvoiceProcessorState({ selectedModel, lastResult });
  }, [hydrated, lastResult, selectedModel]);

  useEffect(() => {
    if (!modelsQuery.data?.length) return;
    setSelectedModel((current) => mergeModelSelection(current, modelsQuery.data));
  }, [modelsQuery.data]);

  const resolvedModel = useMemo(
    () => mergeModelSelection(selectedModel, modelsQuery.data ?? []),
    [modelsQuery.data, selectedModel]
  );

  async function handleProcess() {
    if (!selectedFile) {
      setError("Choose an invoice file before processing.");
      setStage("error");
      return;
    }

    if (!isSupported(selectedFile)) {
      setError("Only PDF and image files (PNG, JPEG, WEBP) are supported.");
      setStage("error");
      return;
    }

    if (selectedFile.size > MAX_UPLOAD_SIZE_BYTES) {
      setError("This file is too large. Please use a file smaller than 10 MB.");
      setStage("error");
      return;
    }

    setError("");
    abortRef.current = false;

    try {
      // ── Step 1: Browser OCR ───────────────────────────────────────────
      setStage("ocr");
      setOcrProgress(0);
      setOcrStageLabel("Initialising OCR…");

      const extractedText = await extractTextFromFile(selectedFile, (label, progress) => {
        if (abortRef.current) throw new Error("Cancelled");
        setOcrStageLabel(label);
        setOcrProgress(progress);
      });

      if (abortRef.current) return;

      if (!extractedText.trim()) {
        throw new Error("No text could be extracted from this file. Try a clearer scan.");
      }

      // ── Step 2: LLM extraction + classification ───────────────────────
      setStage("llm");

      const result = await processInvoice(
        extractedText,
        selectedFile.name,
        resolvedModel || DEFAULT_MODEL
      );

      setLastResult(result);
      setStage("ready");
    } catch (processError) {
      if (abortRef.current) return;
      setError(
        processError instanceof Error ? processError.message : "Failed to process the invoice."
      );
      setStage("error");
    }
  }

  function handleCancel() {
    abortRef.current = true;
    setStage(lastResult ? "ready" : "idle");
    setError("");
  }

  async function handleDownloadPdf() {
    if (!lastResult) return;
    const blob = await pdf(<InvoicePdfDocument result={lastResult} />).toBlob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${lastResult.extractedInvoice.invoiceNumber || "invoice-summary"}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const isProcessing = stage === "ocr" || stage === "llm";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#f0fdf4_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              AI Fiesta Invoice Processor
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              Upload an invoice, extract the fields, classify the expense, and export a review PDF.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              OCR runs in your browser via Tesseract.js — no raw file is sent to the server. The extracted text is then parsed by Mesh for structured field extraction and accounting classification.
            </p>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <label className="mb-2 block text-sm font-medium text-slate-700">Model</label>
            <select
              className="w-full min-w-64 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
              value={resolvedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
            >
              {(modelsQuery.data ?? []).map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
              {!modelsQuery.data?.length ? <option value={resolvedModel}>{resolvedModel}</option> : null}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              {modelsQuery.isError
                ? "Model listing is unavailable — falling back to the default model."
                : "Mesh credentials stay on the server. Only the extracted text is sent."}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* ── Upload panel ─────────────────────────────────────────────── */}
          <section className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
            {cardTitle("Invoice Upload", "Drop a PDF or image — OCR runs locally in your browser.")}

            <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-emerald-300 bg-emerald-50/60 px-6 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50">
              <span className="text-base font-semibold text-slate-900">Drop a file here or click to browse</span>
              <span className="mt-2 text-sm text-slate-500">
                Supports PDF, PNG, JPEG, WEBP — up to 10 MB
              </span>
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </label>

            {/* Selected file info */}
            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-600">Selected file</div>
              <div className="mt-1 text-base font-medium text-slate-950">
                {selectedFile?.name ?? "No file selected yet"}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {selectedFile
                  ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                  : "The previous processed result stays visible until you replace it."}
              </div>
            </div>

            {/* Progress UI */}
            {isProcessing && (
              <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center justify-between text-sm font-medium text-emerald-800">
                  <span>
                    {stage === "ocr" ? "🔍 Running OCR…" : "🤖 Analysing with Mesh…"}
                  </span>
                  {stage === "ocr" && (
                    <span className="tabular-nums">{Math.round(ocrProgress * 100)}%</span>
                  )}
                </div>
                {stage === "ocr" && (
                  <>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-200">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-200"
                        style={{ width: `${Math.round(ocrProgress * 100)}%` }}
                      />
                    </div>
                    <div className="mt-1.5 text-xs text-emerald-700">{ocrStageLabel}</div>
                  </>
                )}
                {stage === "llm" && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-200">
                    <div className="h-full animate-pulse rounded-full bg-emerald-400" style={{ width: "100%" }} />
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              {!isProcessing ? (
                <button
                  type="button"
                  onClick={handleProcess}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  Process invoice
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setSelectedFile(null);
                  setError("");
                  setStage(lastResult ? "ready" : "idle");
                }}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear upload
              </button>

              {lastResult ? (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleDownloadPdf}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Download summary PDF
                </button>
              ) : null}
            </div>

            {error ? (
              <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">What this MVP classifies</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Software/SaaS, professional services, marketing, travel, office supplies, utilities, rent/facilities, payroll/contractors, taxes/fees, or other.
              </p>
            </div>
          </section>

          {/* ── Results panel ────────────────────────────────────────────── */}
          <section className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
            {cardTitle(
              "Structured Result",
              "Review the extracted invoice fields, classification, and warnings before exporting."
            )}

            {!lastResult ? (
              <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
                Process an invoice to see the structured summary here.
              </div>
            ) : (
              <div className="space-y-5">
                {/* Header cards */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Vendor</div>
                    <div className="mt-1 text-lg font-semibold text-slate-950">
                      {lastResult.extractedInvoice.vendorName || "Not found"}
                    </div>
                    <div className="mt-4 text-sm text-slate-500">Invoice number</div>
                    <div className="mt-1 text-base font-medium text-slate-900">
                      {lastResult.extractedInvoice.invoiceNumber || "Not found"}
                    </div>
                    <div className="mt-4 text-sm text-slate-500">Total</div>
                    <div className="mt-1 text-base font-medium text-slate-900">
                      {lastResult.extractedInvoice.total != null
                        ? `${lastResult.extractedInvoice.currency || ""} ${lastResult.extractedInvoice.total.toLocaleString()}`.trim()
                        : "Not found"}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
                    <div className="text-sm text-emerald-700">Primary category</div>
                    <div className="mt-1 text-lg font-semibold text-emerald-950">
                      {humanizeCategory(lastResult.classification.primaryCategory)}
                    </div>
                    <div className="mt-4 text-sm text-emerald-700">Confidence</div>
                    <div className="mt-1 text-base font-medium text-emerald-900">
                      {formatPercent(lastResult.classification.confidence)}
                    </div>
                    <div className="mt-4 text-sm text-emerald-700">Rationale</div>
                    <div className="mt-1 text-sm leading-6 text-emerald-950">
                      {lastResult.classification.rationale || "No rationale returned."}
                    </div>
                  </div>
                </div>

                {/* Extracted fields + Warnings */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-semibold text-slate-950">Extracted Fields</h3>
                    <dl className="mt-4 space-y-3 text-sm">
                      {([
                        ["Invoice date", lastResult.extractedInvoice.invoiceDate],
                        ["Due date", lastResult.extractedInvoice.dueDate],
                        ["Currency", lastResult.extractedInvoice.currency],
                        ["Subtotal", lastResult.extractedInvoice.subtotal != null ? lastResult.extractedInvoice.subtotal.toLocaleString() : null],
                        ["Tax", lastResult.extractedInvoice.tax != null ? lastResult.extractedInvoice.tax.toLocaleString() : null],
                      ] as [string, string | null][]).map(([label, value]) => (
                        <div key={label} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                          <dt className="text-slate-500">{label}</dt>
                          <dd className="text-right font-medium text-slate-900">{value ?? "-"}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-semibold text-slate-950">Warnings & Review Flags</h3>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      {lastResult.warnings.length > 0 ? (
                        lastResult.warnings.map((warning, index) => (
                          <div key={`${warning}-${index}`} className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                            {warning}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                          No review flags returned for this invoice.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Line items */}
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-950">Line Items</h3>
                  <div className="mt-4 space-y-3">
                    {lastResult.extractedInvoice.lineItems.length > 0 ? (
                      lastResult.extractedInvoice.lineItems.map((item, index) => (
                        <div
                          key={`${item.description}-${index}`}
                          className={`rounded-2xl border bg-white p-4 ${item.valid ? "border-slate-200" : "border-red-200 bg-red-50"}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-sm font-medium text-slate-950">
                              {item.description || `Line item ${index + 1}`}
                            </div>
                            {!item.valid && (
                              <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                Mismatch
                              </span>
                            )}
                          </div>
                          {item.sku && (
                            <div className="mt-1 text-xs text-slate-400">SKU: {item.sku}</div>
                          )}
                          <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                            <div>Qty: {item.quantity ?? "-"}</div>
                            <div>Unit price: {item.unitPrice != null ? item.unitPrice.toLocaleString() : "-"}</div>
                            <div>Total: {item.total != null ? item.total.toLocaleString() : "-"}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
                        No line items were extracted.
                      </div>
                    )}
                  </div>
                </div>

                {/* Raw OCR text preview */}
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-950">OCR Text Preview</h3>
                  <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                    {lastResult.extractedTextPreview}
                  </pre>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
