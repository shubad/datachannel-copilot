// Task-specific response components, keyed by the ComponentId the scenario
// catalogue names. CopilotChat merges this into its fixed-library registry.

import type * as React from "react";
import type { Emit, P } from "./kit";
import { IncidentBoard, RootCause, ScheduleCard, CredentialHealth, Freshness, VolumeChart, ChangeTimeline, BulkRunProgress, Agenda, ErrorRanking, AuthFlow } from "./monitoring";
import { DataPreview, SchemaExplorer, TransformBuilder, SegmentBuilder, SyncMapper, WorkflowDAG, RankedBars } from "./data";
import { InviteCard, AlertRuleBuilder, CreditsMeter, WorkspaceSetup, WorkspaceShare, ActionReceipt } from "./admin";

export const RESPONSE_REGISTRY: Record<string, React.ComponentType<{ props: P; emit: Emit }>> = {
  // monitoring & health
  incidents: IncidentBoard,
  diagnosis: RootCause,
  schedule: ScheduleCard,
  credentials: CredentialHealth,
  freshness: Freshness,
  volume: VolumeChart,
  changes: ChangeTimeline,
  bulkrun: BulkRunProgress,
  agenda: Agenda,
  ranking: ErrorRanking,
  authflow: AuthFlow,
  // data, transform, activation, orchestration
  preview: DataPreview,
  schema: SchemaExplorer,
  transform: TransformBuilder,
  segment: SegmentBuilder,
  mapping: SyncMapper,
  workflow: WorkflowDAG,
  leaderboard: RankedBars,
  // admin, billing, agency
  invite: InviteCard,
  alertrule: AlertRuleBuilder,
  credits: CreditsMeter,
  wssetup: WorkspaceSetup,
  share: WorkspaceShare,
  receipt: ActionReceipt,
};
