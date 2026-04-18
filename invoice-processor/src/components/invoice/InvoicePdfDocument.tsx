"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { humanizeCategory } from "@/lib/invoice";
import type { InvoiceProcessingResult } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
    lineHeight: 1.45,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    color: "#4b5563",
    marginBottom: 12,
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0f766e",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  label: {
    width: "38%",
    color: "#6b7280",
  },
  value: {
    width: "62%",
  },
  lineItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 6,
    marginBottom: 6,
  },
  flag: {
    marginBottom: 3,
  },
});

function LabeledRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  const display = value != null && value !== "" ? String(value) : "-";
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{display}</Text>
    </View>
  );
}

export function InvoicePdfDocument({ result }: { result: InvoiceProcessingResult }) {
  const { uploadedInvoice, extractedInvoice, classification, warnings, model } = result;

  return (
    <Document title={`${extractedInvoice.invoiceNumber || "invoice"}-summary`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Invoice Classification Summary</Text>
        <Text style={styles.subtitle}>
          {uploadedInvoice.fileName} | Processed with {model}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Details</Text>
          <LabeledRow label="Vendor" value={extractedInvoice.vendorName} />
          <LabeledRow label="Invoice number" value={extractedInvoice.invoiceNumber} />
          <LabeledRow label="Invoice date" value={extractedInvoice.invoiceDate} />
          <LabeledRow label="Due date" value={extractedInvoice.dueDate} />
          <LabeledRow label="Currency" value={extractedInvoice.currency} />
          <LabeledRow label="Subtotal" value={extractedInvoice.subtotal} />
          <LabeledRow label="Tax" value={extractedInvoice.tax} />
          <LabeledRow label="Total" value={extractedInvoice.total} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Classification</Text>
          <LabeledRow label="Primary category" value={humanizeCategory(classification.primaryCategory)} />
          <LabeledRow
            label="Secondary category"
            value={humanizeCategory(classification.secondaryCategory)}
          />
          <LabeledRow
            label="Classification confidence"
            value={`${Math.round(classification.confidence * 100)}%`}
          />
          <LabeledRow label="Rationale" value={classification.rationale} />
        </View>

        {extractedInvoice.lineItems.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Line Items</Text>
            {extractedInvoice.lineItems.map((item, index) => (
              <View key={`${item.description}-${index}`} style={styles.lineItem}>
                <LabeledRow label="Description" value={item.description} />
                {item.sku ? <LabeledRow label="SKU" value={item.sku} /> : null}
                <LabeledRow label="Quantity" value={item.quantity} />
                <LabeledRow label="Unit price" value={item.unitPrice} />
                <LabeledRow label="Total" value={item.total} />
                {!item.valid ? <LabeledRow label="⚠ Note" value="Unit price × quantity mismatch" /> : null}
              </View>
            ))}
          </View>
        ) : null}

        {warnings.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Warnings</Text>
            {warnings.map((warning, index) => (
              <Text key={`${warning}-${index}`} style={styles.flag}>
                • {warning}
              </Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
