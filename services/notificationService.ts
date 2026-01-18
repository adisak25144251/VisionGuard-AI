
import { ALERT_TEMPLATES } from './alertTemplates';

// Configuration
const COOLDOWN_MINUTES = 5;
const WEBHOOK_URL = 'https://api.visionguard.ai/v1/webhook/alert'; // Mock

interface AlertContext {
  traceId: string;
  eventType: string;
  timestamp: number;
}

// Memory Store for Rate Limiting
const alertHistory: Record<string, AlertContext> = {};

export const sendAlert = async (
  type: keyof typeof ALERT_TEMPLATES,
  payload: Record<string, string>,
  traceId?: string
) => {
  const template = ALERT_TEMPLATES[type];
  if (!template) {
    console.error(`Alert template ${type} not found`);
    return;
  }

  // 1. Rate Limiting / Cooldown
  if (traceId) {
    const lastAlert = alertHistory[traceId];
    const now = Date.now();
    
    // If same trace ID, same event type, within cooldown -> Skip (unless Critical)
    if (lastAlert && 
        lastAlert.eventType === type && 
        template.severity !== 'CRITICAL' && 
        (now - lastAlert.timestamp) < COOLDOWN_MINUTES * 60 * 1000) {
      console.log(`Alert suppressed for ${traceId} (Cooldown active)`);
      return;
    }

    // Update History
    alertHistory[traceId] = {
      traceId,
      eventType: type as string,
      timestamp: now
    };
  }

  // 2. Format Message
  let shortMsg = template.shortMessage;
  let longMsg = template.longMessage;

  Object.entries(payload).forEach(([key, value]) => {
    shortMsg = shortMsg.replace(`{${key}}`, value);
    longMsg = longMsg.replace(`{${key}}`, value);
  });

  // 3. Dispatch (Mock)
  console.log(`[ALERT - ${template.severity}] Sending via LINE/Webhook:`, shortMsg);
  
  // 4. Escalation Policy Simulation
  if (template.severity === 'CRITICAL') {
      console.log(`[ESCALATION] Critical Alert! Notifying Admin & Supervisors immediately.`);
      // Mock SMS / Phone Call trigger
  }

  // 5. Construct Webhook Payload (Standard Schema)
  const webhookBody = {
    event_id: `evt-${Date.now()}`,
    timestamp: new Date().toISOString(),
    event_type: type,
    severity: template.severity,
    trace_id: traceId || null,
    message: {
        short: shortMsg,
        long: longMsg
    },
    context: payload
  };

  // Simulate Webhook Call
  // await fetch(WEBHOOK_URL, { method: 'POST', body: JSON.stringify(webhookBody) });
  
  return webhookBody;
};

export const clearAlertHistory = () => {
    for (const key in alertHistory) delete alertHistory[key];
};
