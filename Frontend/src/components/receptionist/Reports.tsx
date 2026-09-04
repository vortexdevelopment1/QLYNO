"use client";

import * as React from "react";
import { Download, FileBarChart2 } from "lucide-react";
import { Button, Card, Field, Modal, SectionHeader, Select, StatCard } from "./ui";
import { useReceptionistData } from "./data-context";

const reportTypes = [
  "Patient registrations",
  "Appointments",
  "Admissions",
  "Cancellations",
  "Overall reception activity",
];

export function Reports() {
  const { patients, appointments, admissions } = useReceptionistData();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [type, setType] = React.useState(reportTypes[0]);
  const [range, setRange] = React.useState("Today");
  const [generated, setGenerated] = React.useState<string | null>(null);

  function handleGenerate(event: React.FormEvent) {
    event.preventDefault();
    setGenerated(`${type} - ${range}`);
    setModalOpen(false);
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Front desk - Reports"
        title="Reports"
        description="Generate reports related to patient registrations, appointments, admissions, cancellations and overall reception activity."
        action={
          <Button onClick={() => setModalOpen(true)}>
            <FileBarChart2 size={16} /> Generate Report
          </Button>
        }
      />

      <Modal open={modalOpen} title="Generate Report" eyebrow="Reception Reports" onClose={() => setModalOpen(false)} size="md">
        <form onSubmit={handleGenerate} className="space-y-4">
          <Field label="Report type" required>
            <Select value={type} onChange={(event) => setType(event.target.value)}>
              {reportTypes.map((reportType) => <option key={reportType}>{reportType}</option>)}
            </Select>
          </Field>
          <Field label="Date range" required>
            <Select value={range} onChange={(event) => setRange(event.target.value)}>
              <option>Today</option>
              <option>This week</option>
              <option>This month</option>
              <option>Custom range</option>
            </Select>
          </Field>
          <div className="flex flex-wrap gap-3">
            <Button type="submit">
              <FileBarChart2 size={16} /> Generate report
            </Button>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <div className="rp-grid-4 mb-5">
        <StatCard label="Total patients" value={patients.length} tone="pine" />
        <StatCard label="Total appointments" value={appointments.length} tone="slate" />
        <StatCard label="Cancelled" value={appointments.filter((appointment) => appointment.status === "Cancelled").length} tone="amber" />
        <StatCard label="Admissions" value={admissions.length} tone="pine" />
      </div>

      <Card>
        <h2 className="rp-h2">Result</h2>
        {generated ? (
          <div>
            <p className="rp-sub mb-3">Report ready: <span className="font-medium text-ink">{generated}</span></p>
            <Button variant="secondary"><Download size={16} /> Download CSV</Button>
          </div>
        ) : (
          <p className="rp-sub">Choose a report type and range, then generate to preview a summary here.</p>
        )}
      </Card>
    </div>
  );
}
