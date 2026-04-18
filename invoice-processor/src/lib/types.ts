export interface ModelPricing {
  prompt_usd_per_1k: string | null;
  completion_usd_per_1k: string | null;
}

export interface MeshModel {
  id: string;
  name: string;
  context_length: number | null;
  is_free: boolean;
  description: string | null;
  pricing: ModelPricing | null;
}

export type InvoiceCategory =
  | "software_saas"
  | "professional_services"
  | "marketing"
  | "travel"
  | "office_supplies"
  | "utilities"
  | "rent_facilities"
  | "payroll_contractors"
  | "taxes_fees"
  | "other";

export interface UploadedInvoice {
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
}


export interface InvoiceLineItem {
  description: string;
  sku: string | null;
  quantity: number | null;
  unitPrice: number | null;
  total: number | null;
  valid: boolean;
}

export interface ExtractedInvoice {
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceClassification {
  primaryCategory: InvoiceCategory;
  secondaryCategory: InvoiceCategory | "";
  confidence: number;
  rationale: string;
  reviewFlags: string[];
}

export interface InvoiceProcessingResult {
  uploadedInvoice: UploadedInvoice;
  extractedInvoice: ExtractedInvoice;
  classification: InvoiceClassification;
  warnings: string[];
  model: string;
  extractedTextPreview: string;
}

export interface InvoiceProcessingResponse extends InvoiceProcessingResult {}

export interface InvoiceProcessorStorage {
  selectedModel: string;
  lastResult: InvoiceProcessingResult | null;
}
