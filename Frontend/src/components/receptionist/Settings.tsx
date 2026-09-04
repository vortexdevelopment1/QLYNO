"use client";

import * as React from "react";
import { Bell, Lock, Printer, Save, Settings2, UserCog } from "lucide-react";
import { Button, Card, Field, Input, Modal, SectionHeader, Select } from "./ui";

type SettingsModal = "profile" | "printer" | "security" | null;

export function Settings() {
  const [modal, setModal] = React.useState<SettingsModal>(null);

  return (
    <div>
      <SectionHeader
        eyebrow="Front desk - Settings"
        title="Settings"
        description="Manage reception profile, counter settings, notification preferences, printers and account security configurations."
      />

      <div className="rp-grid-3">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <UserCog size={16} className="text-brand-700" />
            <h2 className="rp-h2 !mb-0">Reception profile</h2>
          </div>
          <p className="rp-sub mb-4">Front Desk - Counter 2, all department view.</p>
          <Button variant="secondary" onClick={() => setModal("profile")}>
            <Settings2 size={15} /> Edit Profile
          </Button>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Printer size={16} className="text-brand-700" />
            <h2 className="rp-h2 !mb-0">Printer settings</h2>
          </div>
          <p className="rp-sub mb-4">Thermal printer and visitor pass printer are configured.</p>
          <Button variant="secondary" onClick={() => setModal("printer")}>
            <Printer size={15} /> Configure
          </Button>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Lock size={16} className="text-brand-700" />
            <h2 className="rp-h2 !mb-0">Security</h2>
          </div>
          <p className="rp-sub mb-4">Password and session timeout controls.</p>
          <Button variant="secondary" onClick={() => setModal("security")}>
            <Lock size={15} /> Manage
          </Button>
        </Card>
      </div>

      <Card className="mt-5">
        <div className="mb-3 flex items-center gap-2">
          <Bell size={16} className="text-brand-700" />
          <h2 className="rp-h2 !mb-0">Notification preferences</h2>
        </div>
        <div className="space-y-3">
          {["New appointment booked", "Patient checked in", "Emergency registration", "Bed allotment updates"].map((label) => (
            <label key={label} className="rp-toggle-row">
              <span>{label}</span>
              <input type="checkbox" defaultChecked className="rp-toggle" />
            </label>
          ))}
        </div>
      </Card>

      <Modal open={modal === "profile"} title="Reception Profile" eyebrow="Settings" onClose={() => setModal(null)} size="md">
        <div className="space-y-4">
          <Field label="Display name">
            <Input defaultValue="Front Desk - Counter 2" />
          </Field>
          <Field label="Counter number">
            <Input defaultValue="2" />
          </Field>
          <Field label="Default department view">
            <Select defaultValue="All">
              <option>All</option>
              <option>General Medicine</option>
              <option>Emergency</option>
            </Select>
          </Field>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setModal(null)}>
              <Save size={15} /> Save profile
            </Button>
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={modal === "printer"} title="Printer Settings" eyebrow="Settings" onClose={() => setModal(null)} size="md">
        <div className="space-y-4">
          <Field label="Token / slip printer">
            <Select defaultValue="Front Desk Thermal Printer 1">
              <option>Front Desk Thermal Printer 1</option>
              <option>Front Desk Thermal Printer 2</option>
            </Select>
          </Field>
          <Field label="Visitor pass printer">
            <Select defaultValue="Visitor Pass Printer">
              <option>Visitor Pass Printer</option>
              <option>Front Desk Thermal Printer 1</option>
            </Select>
          </Field>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setModal(null)}>
              <Save size={15} /> Save printers
            </Button>
            <Button variant="secondary">Test print</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modal === "security"} title="Account & Security" eyebrow="Settings" onClose={() => setModal(null)} size="md">
        <div className="space-y-4">
          <Field label="Change password">
            <Input type="password" placeholder="New password" />
          </Field>
          <Field label="Session timeout" hint="Auto lock the counter after inactivity">
            <Select defaultValue="15 minutes">
              <option>5 minutes</option>
              <option>15 minutes</option>
              <option>30 minutes</option>
            </Select>
          </Field>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setModal(null)}>
              <Save size={15} /> Save security
            </Button>
            <Button variant="danger" onClick={() => setModal(null)}>
              Sign out of all sessions
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
