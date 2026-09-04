import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type RequestStatus = 'Draft' | 'Submitted' | 'Quotes Collecting' | 'Under Review' | 'Approved' | 'Rejected' | 'Ordered' | 'Fulfilled' | 'Closed';
export type DeliveryStatus = 'Dispatched' | 'Delivered' | 'Rejected' | 'Delayed' | 'Received';
export type QuoteStatus = 'Received' | 'Shortlisted' | 'Selected' | 'Declined';
export type ProductCategory = 'equipment' | 'implant' | 'consumable' | 'medicine' | 'service';

export interface Vendor {
  id: string;
  name: string;
  category: ProductCategory[];
  reliabilityScore: number; // 0-100
  fulfillmentRate: number; // percentage
  rejectionRate: number; // percentage
  averageDelayDays: number;
}

export interface Quote {
  id: string;
  vendorId: string;
  price: number;
  availability: string; // e.g., "In Stock", "Out of Stock"
  deliveryTimelineDays: number;
  documentsUrl?: string;
  status: QuoteStatus;
}

export interface ApprovalStep {
  id: string;
  role: string;
  approver?: string;
  decision?: 'approve' | 'reject';
  timestamp?: string;
}

export interface ProcurementRequest {
  id: string;
  item: string;
  spec: string;
  category: ProductCategory;
  department: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  linkedCaseId?: string;
  linkedPatientId?: string;
  preferredVendorId?: string;
  status: RequestStatus;
  requester: string;
  createdAt: string;
  quotes: Quote[];
  approvals: ApprovalStep[];
  purchaseOrder?: {
    id: string;
    generatedAt: string;
    totalAmount: number;
  };
  delivery?: {
    id: string;
    status: DeliveryStatus;
    updatedAt: string;
    notes?: string;
  };
  qualityCheck?: {
    passed: boolean;
    notes: string;
    checkedAt: string;
    checkedBy: string;
  };
  auditLogs: {
    id: string;
    action: string;
    actor: string;
    timestamp: string;
  }[];
}

interface ProcurementState {
  requests: ProcurementRequest[];
  vendors: Vendor[];
}

const mockVendors: Vendor[] = [
  { id: 'V-001', name: 'MediTech Supplies Ltd', category: ['equipment', 'consumable'], reliabilityScore: 92, fulfillmentRate: 95, rejectionRate: 2, averageDelayDays: 1 },
  { id: 'V-002', name: 'Global Pharma', category: ['medicine'], reliabilityScore: 88, fulfillmentRate: 90, rejectionRate: 5, averageDelayDays: 2 },
  { id: 'V-003', name: 'SurgiImplant Inc', category: ['implant'], reliabilityScore: 98, fulfillmentRate: 99, rejectionRate: 0, averageDelayDays: 0 },
];

const mockRequests: ProcurementRequest[] = [
  {
    id: 'PR-1001',
    item: 'MRI Compatible Ventilator',
    spec: 'Pediatric supported, Non-magnetic',
    category: 'equipment',
    department: 'Radiology',
    urgency: 'High',
    status: 'Quotes Collecting',
    requester: 'Dr. Ananya Patel',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), // ~2 days ago (Stalled)
    quotes: [],
    approvals: [
      { id: 'A1', role: 'Department Head' },
      { id: 'A2', role: 'Finance Director' }
    ],
    auditLogs: [
      { id: 'L1', action: 'Request Submitted', actor: 'Dr. Ananya Patel', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() }
    ]
  },
  {
    id: 'PR-1002',
    item: 'Titanium Femoral Stem',
    spec: 'Size 12, Standard Offset',
    category: 'implant',
    department: 'Orthopedics',
    urgency: 'Critical',
    linkedCaseId: 'SURG-409',
    linkedPatientId: 'P-8821',
    status: 'Ordered',
    requester: 'Dr. Vikram Singh',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    quotes: [
      { id: 'Q1', vendorId: 'V-003', price: 4500, availability: 'In Stock', deliveryTimelineDays: 2, status: 'Selected' }
    ],
    approvals: [
      { id: 'A1', role: 'Department Head', approver: 'Dr. Meera Iyer', decision: 'approve', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      { id: 'A2', role: 'Finance Director', approver: 'Rahul Sharma', decision: 'approve', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString() }
    ],
    purchaseOrder: { id: 'PO-9921', generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), totalAmount: 4500 },
    delivery: { id: 'D-882', status: 'Dispatched', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() },
    auditLogs: []
  }
];

const initialState: ProcurementState = {
  requests: mockRequests,
  vendors: mockVendors,
};

const addAuditLog = (req: ProcurementRequest, action: string, actor: string) => {
  req.auditLogs.push({ id: `LOG-${Date.now()}`, action, actor, timestamp: new Date().toISOString() });
};

export const procurementSlice = createSlice({
  name: 'procurement',
  initialState,
  reducers: {
    createRequest: (state, action: PayloadAction<Omit<ProcurementRequest, 'id' | 'status' | 'createdAt' | 'quotes' | 'approvals' | 'auditLogs'> & { isDraft?: boolean }>) => {
      const newReq: ProcurementRequest = {
        ...action.payload,
        id: `PR-${1000 + state.requests.length + 1}`,
        status: action.payload.isDraft ? 'Draft' : 'Submitted',
        createdAt: new Date().toISOString(),
        quotes: [],
        approvals: [
          { id: 'A1', role: 'Department Head' },
          { id: 'A2', role: 'Finance' }
        ], // Default ladder
        auditLogs: []
      };
      addAuditLog(newReq, action.payload.isDraft ? 'Request Drafted' : 'Request Submitted', newReq.requester);
      state.requests.unshift(newReq);
    },
    updateRequestStatus: (state, action: PayloadAction<{ id: string, status: RequestStatus, actor: string }>) => {
      const req = state.requests.find(r => r.id === action.payload.id);
      if (req) {
        req.status = action.payload.status;
        addAuditLog(req, `Status updated to ${action.payload.status}`, action.payload.actor);
      }
    },
    addQuote: (state, action: PayloadAction<{ reqId: string, quote: Omit<Quote, 'id' | 'status'>, actor: string }>) => {
      const req = state.requests.find(r => r.id === action.payload.reqId);
      if (req) {
        req.quotes.push({
          ...action.payload.quote,
          id: `Q-${Date.now()}`,
          status: 'Received'
        });
        if (req.status === 'Submitted') req.status = 'Quotes Collecting';
        addAuditLog(req, `Quote added from Vendor ${action.payload.quote.vendorId}`, action.payload.actor);
      }
    },
    shortlistQuote: (state, action: PayloadAction<{ reqId: string, quoteId: string, actor: string }>) => {
      const req = state.requests.find(r => r.id === action.payload.reqId);
      if (req) {
        const quote = req.quotes.find(q => q.id === action.payload.quoteId);
        if (quote) {
          quote.status = 'Shortlisted';
          addAuditLog(req, `Quote ${action.payload.quoteId} Shortlisted`, action.payload.actor);
        }
      }
    },
    selectQuote: (state, action: PayloadAction<{ reqId: string, quoteId: string, actor: string }>) => {
      const req = state.requests.find(r => r.id === action.payload.reqId);
      if (req) {
        req.quotes.forEach(q => q.status = (q.id === action.payload.quoteId) ? 'Selected' : 'Declined');
        req.status = 'Under Review';
        addAuditLog(req, `Quote ${action.payload.quoteId} Selected for Approval`, action.payload.actor);
      }
    },
    approveOrRejectStep: (state, action: PayloadAction<{ reqId: string, stepId: string, decision: 'approve' | 'reject', actor: string }>) => {
      const req = state.requests.find(r => r.id === action.payload.reqId);
      if (req) {
        const step = req.approvals.find(s => s.id === action.payload.stepId);
        if (step) {
          step.approver = action.payload.actor;
          step.decision = action.payload.decision;
          step.timestamp = new Date().toISOString();
          
          addAuditLog(req, `${action.payload.decision === 'approve' ? 'Approved' : 'Rejected'} by ${step.role}`, action.payload.actor);

          if (action.payload.decision === 'reject') {
            req.status = 'Rejected';
          } else {
            const allApproved = req.approvals.every(s => s.decision === 'approve');
            if (allApproved) req.status = 'Approved';
          }
        }
      }
    },
    generatePO: (state, action: PayloadAction<{ reqId: string, actor: string }>) => {
      const req = state.requests.find(r => r.id === action.payload.reqId);
      if (req && req.status === 'Approved') {
        const selectedQuote = req.quotes.find(q => q.status === 'Selected');
        if (selectedQuote) {
          req.purchaseOrder = {
            id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
            generatedAt: new Date().toISOString(),
            totalAmount: selectedQuote.price
          };
          req.status = 'Ordered';
          req.delivery = {
            id: `D-${Math.floor(100 + Math.random() * 900)}`,
            status: 'Dispatched', // Auto dispatch for simulation
            updatedAt: new Date().toISOString()
          };
          addAuditLog(req, `PO ${req.purchaseOrder.id} Generated and Sent to Vendor`, action.payload.actor);
        }
      }
    },
    updateDeliveryStatus: (state, action: PayloadAction<{ reqId: string, status: DeliveryStatus, actor: string }>) => {
      const req = state.requests.find(r => r.id === action.payload.reqId);
      if (req && req.delivery) {
        req.delivery.status = action.payload.status;
        req.delivery.updatedAt = new Date().toISOString();
        if (action.payload.status === 'Delivered' || action.payload.status === 'Received') {
          req.status = 'Fulfilled';
        }
        addAuditLog(req, `Delivery marked as ${action.payload.status}`, action.payload.actor);
      }
    },
    recordQualityCheck: (state, action: PayloadAction<{ reqId: string, passed: boolean, notes: string, actor: string }>) => {
      const req = state.requests.find(r => r.id === action.payload.reqId);
      if (req) {
        req.qualityCheck = {
          passed: action.payload.passed,
          notes: action.payload.notes,
          checkedAt: new Date().toISOString(),
          checkedBy: action.payload.actor
        };
        addAuditLog(req, `Quality Check ${action.payload.passed ? 'PASSED' : 'FAILED'}: ${action.payload.notes}`, action.payload.actor);
        
        if (!action.payload.passed && req.delivery) {
          req.delivery.status = 'Rejected';
        } else if (action.payload.passed) {
          if (req.delivery) req.delivery.status = 'Received';
          req.status = 'Fulfilled'; // Quality verified, case fulfilled
        }
      }
    },
    restartQuoteRound: (state, action: PayloadAction<{ reqId: string, actor: string }>) => {
      const req = state.requests.find(r => r.id === action.payload.reqId);
      if (req) {
        req.status = 'Quotes Collecting';
        req.quotes = []; // clear old quotes
        req.approvals.forEach(a => { a.decision = undefined; a.approver = undefined; a.timestamp = undefined; }); // reset approvals
        req.purchaseOrder = undefined;
        req.delivery = undefined;
        req.qualityCheck = undefined;
        addAuditLog(req, `Restarted Quote Round due to rejection`, action.payload.actor);
      }
    }
  },
});

export const { 
  createRequest, updateRequestStatus, addQuote, shortlistQuote, selectQuote, 
  approveOrRejectStep, generatePO, updateDeliveryStatus, recordQualityCheck, restartQuoteRound 
} = procurementSlice.actions;

export default procurementSlice.reducer;
