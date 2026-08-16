# MISSING-REPORT-API-REPORT

## 1. Report Generation API
- **Missing Service:** ReportGenerationEngine
- **Expected Endpoint:** `POST /api/reports/generate` or `ReportApi.getInstance().generateReport(request)`
- **Request Schema:** `{ projectId: string, twinId: string, reportType: string, sections: string[], format: string }`
- **Response Schema:** `{ reportId: string, status: "pending" | "completed", downloadUrl?: string, previewData?: any }`
- **Business Purpose:** Generates a professional report (Executive, Technical, Compliance, etc.) based on the Vastu Analysis, Knowledge Graph, and Digital Twin context.

## 2. Report Export API
- **Missing Service:** ReportExportService
- **Expected Endpoint:** `GET /api/reports/{id}/export?format={format}` or `ReportApi.getInstance().exportReport(reportId, format)`
- **Request Schema:** `{ reportId: string, format: "PDF" | "DOCX" | "HTML" | "JSON" }`
- **Response Schema:** `{ fileUrl: string, mimeType: string }`
- **Business Purpose:** Allows exporting the generated reports in various formats for consultants and end-users.

## 3. Report History & Workflow API
- **Missing Service:** ReportWorkflowEngine
- **Expected Endpoint:** `GET /api/reports?projectId={id}` or `ReportApi.getInstance().listReports(projectId)`
- **Request Schema:** `{ projectId: string }`
- **Response Schema:** `{ reports: Array<{ id: string, name: string, type: string, status: "Draft" | "Pending Review" | "Approved" | "Published", generatedAt: number, generatedBy: string }> }`
- **Business Purpose:** Manages the history and approval states of all reports generated for a given project.
