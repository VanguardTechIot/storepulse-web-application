// Business endpoints of the StorePulse REST API that json-server cannot answer by itself.
// Paths arrive already rewritten by routes.json (without /api/v1) and bodies already parsed.
// Errors use the same body as the REST API: { status, error, message (business code), timestamp }.
const crypto = require('crypto');

const REASONS = { 400: 'Bad Request', 404: 'Not Found', 409: 'Conflict' };

const fail = (res, status, code) =>
  res.status(status).json({
    status,
    error: REASONS[status],
    message: code,
    timestamp: new Date().toISOString(),
  });

// Each request writes db.json once, so the --watch of json-server does not reload it mid-request.

/** Applies the change to the stored item, saves and answers the updated item. */
const update = (res, found, change) => {
  const updated = found.assign(change).value();
  res.app.db.write();
  return res.json(updated);
};

/** Saves what the request already recorded and answers the business error. */
const saveAndFail = (res, status, code) => {
  res.app.db.write();
  return fail(res, status, code);
};

const nextId = (items) => items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
const byNewest = (field) => (a, b) => b[field].localeCompare(a[field]);
const round = (value) => Math.round(value * 100) / 100;

// ---------- Subscriptions and Payments ----------
const BRANDS = [
  [/^4/, 'Visa'],
  [/^5[1-5]/, 'Mastercard'],
  [/^3[47]/, 'Amex'],
];

/** Same rules as the PaymentCard of the REST API; `null` when the card is not valid. */
function cardOf(number, expiry) {
  const digits = String(number ?? '').replace(/\s+/g, '');
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(String(expiry ?? '').trim());
  if (!/^\d{13,19}$/.test(digits) || !match) return null;
  const now = new Date();
  const current = now.getUTCFullYear() * 12 + now.getUTCMonth() + 1;
  if ((2000 + Number(match[2])) * 12 + Number(match[1]) < current) return null;
  const brand = BRANDS.find(([pattern]) => pattern.test(digits))?.[1] ?? 'Card';
  const lastFourDigits = digits.slice(-4);
  return { lastFourDigits, label: `${brand} •••• ${lastFourDigits}` };
}

const allowsUnits = (plan, units) =>
  plan.monitoredUnitLimit === null || units <= plan.monitoredUnitLimit;

function periodFrom(start, cycle) {
  const end = new Date(start);
  if (cycle === 'ANNUAL') end.setUTCFullYear(end.getUTCFullYear() + 1);
  else end.setUTCMonth(end.getUTCMonth() + 1);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

function requestSubscription(db, req, res) {
  const body = req.body;
  const required = [
    'galleryId',
    'planId',
    'billingCycle',
    'paymentMethod',
    'cardNumber',
    'cardExpiry',
  ];
  if (!body || required.some((field) => !body[field]) || !(body.monitoredUnitCount >= 0)) {
    return fail(res, 400, 'invalid_request');
  }
  const gallery = db
    .get('galleries')
    .find({ id: String(body.galleryId) })
    .value();
  if (!gallery) return fail(res, 409, 'administrator_not_active');
  const plan = db
    .get('subscriptionPlans')
    .find({ id: Number(body.planId) })
    .value();
  if (!plan) return fail(res, 404, 'plan_not_found');
  const card = cardOf(body.cardNumber, body.cardExpiry);
  if (!card) return fail(res, 409, 'invalid_card');

  const subscriptions = db.get('subscriptions');
  let subscription = subscriptions
    .find((s) => String(s.galleryId) === String(body.galleryId))
    .value();
  if (subscription && subscription.galleryAdministratorId !== gallery.administratorId) {
    return fail(res, 404, 'subscription_not_found');
  }
  if (!subscription) {
    if (!allowsUnits(plan, body.monitoredUnitCount)) return fail(res, 409, 'unit_limit_exceeded');
    subscription = {
      id: nextId(subscriptions.value()),
      galleryId: String(body.galleryId),
      galleryAdministratorId: gallery.administratorId,
      planId: plan.id,
      status: 'PENDING_PAYMENT',
      billingCycle: body.billingCycle,
      startDate: null,
      endDate: null,
      monitoredUnitCount: body.monitoredUnitCount,
      autoRenewal: true,
      paymentMethodLabel: null,
    };
    subscriptions.push(subscription).value();
  }

  // Simulated gateway: a card ending in 0119 does not answer and one ending in 0002 is declined.
  if (card.lastFourDigits === '0119') return saveAndFail(res, 409, 'gateway_unavailable');
  const accepted = card.lastFourDigits !== '0002';
  const now = new Date();
  const payments = db.get('payments');
  payments
    .push({
      id: nextId(payments.value()),
      subscriptionId: subscription.id,
      receiptNumber: accepted ? `F001-${String(now.getTime() % 1_000_000).padStart(6, '0')}` : null,
      planId: plan.id,
      billingCycle: body.billingCycle,
      amount: body.billingCycle === 'ANNUAL' ? plan.annualPrice : plan.monthlyPrice,
      currency: plan.currency,
      method: body.paymentMethod,
      methodLabel: card.label,
      status: accepted ? 'ACCEPTED' : 'REJECTED',
      gatewayReference: `ch_sim_${crypto.randomUUID()}`,
      registeredAt: now.toISOString(),
    })
    .value();
  if (!accepted) return saveAndFail(res, 409, 'payment_rejected');
  if (!allowsUnits(plan, subscription.monitoredUnitCount)) {
    return saveAndFail(res, 409, 'unit_limit_exceeded');
  }

  res.status(201);
  return update(res, subscriptions.find({ id: subscription.id }), {
    planId: plan.id,
    status: 'ACTIVE',
    billingCycle: body.billingCycle,
    ...periodFrom(now, body.billingCycle),
    autoRenewal: true,
    paymentMethodLabel: card.label,
  });
}

function changeRenewal(db, res, subscriptionId, enable) {
  const found = db.get('subscriptions').find({ id: Number(subscriptionId) });
  const subscription = found.value();
  if (!subscription) return fail(res, 404, 'subscription_not_found');
  if (enable && subscription.status === 'EXPIRED') return fail(res, 409, 'subscription_expired');
  if (subscription.status !== 'ACTIVE') return fail(res, 409, 'subscription_not_active');
  if (subscription.autoRenewal === enable) {
    return fail(res, 409, enable ? 'renewal_already_enabled' : 'renewal_already_disabled');
  }
  return update(res, found, { autoRenewal: enable });
}

// ---------- Safety ----------
function changeAlert(db, res, alertId, change) {
  const found = db.get('alerts').find({ id: Number(alertId) });
  const alert = found.value();
  if (!alert) return fail(res, 404, 'alert_not_found');
  const result = change(alert);
  if (typeof result === 'string') return fail(res, 409, result);
  return update(res, found, result);
}

const acknowledge = (alert) =>
  alert.status !== 'ACTIVE'
    ? 'alert_cannot_be_acknowledged'
    : { status: 'ACKNOWLEDGED', acknowledgedAt: new Date().toISOString() };

const resolveWith = (note) => (alert) => {
  if (alert.status !== 'ACKNOWLEDGED') return 'alert_cannot_be_resolved';
  const resolutionNote = String(note ?? '').trim();
  if (!resolutionNote || resolutionNote.length > 255) return 'invalid_resolution_note';
  return { status: 'RESOLVED', resolvedAt: new Date().toISOString(), resolutionNote };
};

// ---------- Dashboard and Analytics ----------
/** Counts the alerts by state and sums the consumption of the latest month with readings. */
function dashboardSummary(db) {
  const alerts = db.get('alerts').value();
  const count = (status) => alerts.filter((alert) => alert.status === status).length;
  const openBySensorType = {};
  alerts
    .filter((alert) => alert.status !== 'RESOLVED')
    .forEach((alert) => {
      openBySensorType[alert.sensorType] = (openBySensorType[alert.sensorType] ?? 0) + 1;
    });

  const consumption = db.get('consumption').value();
  const month = consumption
    .reduce((latest, c) => (c.periodStart > latest ? c.periodStart : latest), '')
    .slice(0, 7);
  const total = (type) =>
    round(
      consumption
        .filter((c) => c.measurementType === type && c.periodStart.startsWith(month))
        .reduce((sum, c) => sum + c.totalValue, 0),
    );

  return {
    alerts: {
      open: count('ACTIVE') + count('ACKNOWLEDGED'),
      active: count('ACTIVE'),
      acknowledged: count('ACKNOWLEDGED'),
      resolved: count('RESOLVED'),
      openBySensorType,
    },
    consumption: { electricityKwh: total('ELECTRICITY'), waterCubicMeters: total('WATER') },
  };
}

// ---------- Utility Billing ----------
const UTILITIES = [
  ['WATER', 'm³'],
  ['ELECTRICITY', 'kWh'],
];
const BASELINE_MONTHS = 3;
const PAYMENT_TERM_DAYS = 15;
const TEXT_MAX_LENGTH = 1000;
const DISPUTE_REASONS = ['CONSUMPTION_ABOVE_BASELINE', 'RATE', 'METER_READING', 'OTHER'];

const sameId = (a, b) => String(a) === String(b);
const scaled = (value) => Math.round(value * 1000) / 1000;
const isLongText = (value) => String(value ?? '').trim().length > TEXT_MAX_LENGTH;

/** `yyyy-MM` of the month `offset` months away from the given one. */
function shiftMonth(month, offset) {
  const [year, number] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, number - 1 + offset, 1));
  return date.toISOString().slice(0, 7);
}

/** Consumption Monitoring recorded for the unit and utility in the month, or `null`. */
function monthlyConsumption(db, unitId, utilityType, month) {
  const record = db
    .get('consumption')
    .find(
      (c) =>
        sameId(c.resourceId, unitId) &&
        c.measurementType === utilityType &&
        c.periodStart.startsWith(month),
    )
    .value();
  return record ? record.totalValue : null;
}

/** Same rules as the REST API: consumption of the month, baseline of the previous ones, tariff. */
function generateBill(db, req, res) {
  const body = req.body ?? {};
  if (!body.unitId || !String(body.unitCode ?? '').trim()) return fail(res, 400, 'invalid_request');
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(body.period ?? ''))) {
    return fail(res, 400, 'invalid_request');
  }
  const period = body.period;
  const bills = db.get('utilityBills');
  const periodStart = `${period}-01`;
  if (bills.value().some((b) => sameId(b.unitId, body.unitId) && b.periodStart === periodStart)) {
    return fail(res, 409, 'duplicate');
  }

  const items = [];
  for (const [utilityType, unitOfMeasure] of UTILITIES) {
    const consumption = monthlyConsumption(db, body.unitId, utilityType, period);
    if (consumption === null) continue;
    const history = Array.from({ length: BASELINE_MONTHS }, (_, index) =>
      monthlyConsumption(db, body.unitId, utilityType, shiftMonth(period, -(index + 1))),
    ).filter((value) => value !== null);
    const baseline = history.length
      ? history.reduce((sum, value) => sum + value, 0) / history.length
      : consumption;
    const tariff = db
      .get('utilityTariffs')
      .filter((t) => t.utilityType === utilityType && t.effectiveFrom <= periodStart)
      .sortBy('effectiveFrom')
      .last()
      .value();
    if (!tariff) return fail(res, 409, 'tariff_not_found');
    items.push({
      utilityType,
      consumption: scaled(consumption),
      baseline: scaled(baseline),
      unitOfMeasure,
      rate: tariff.rate,
      amount: round(scaled(consumption) * tariff.rate),
    });
  }
  if (!items.length) return fail(res, 409, 'no_consumption_data');

  const lastDay = new Date(Date.UTC(...period.split('-').map(Number), 0)).getUTCDate();
  const bill = {
    id: nextId(bills.value()),
    code: `FAC-${period.replace('-', '')}-${String(body.unitCode).replaceAll('-', '')}`,
    unitId: body.unitId,
    unitCode: body.unitCode,
    unitName: body.unitName ?? null,
    tenantName: body.tenantName ?? null,
    periodStart,
    periodEnd: `${period}-${String(lastDay).padStart(2, '0')}`,
    status: 'DRAFT',
    items,
    totalAmount: round(items.reduce((sum, item) => sum + item.amount, 0)),
    dataCompleteness: Math.floor((items.length * 100) / UTILITIES.length),
    dataWarningAccepted: false,
    issuedAt: null,
    dueDate: null,
  };
  bills.push(bill).value();
  res.app.db.write();
  return res.status(201).json(bill);
}

function changeBill(db, res, billId, change) {
  const found = db.get('utilityBills').find((b) => sameId(b.id, billId));
  const bill = found.value();
  if (!bill) return fail(res, 404, 'not_found');
  const result = change(bill);
  if (typeof result === 'string') return fail(res, 409, result);
  return update(res, found, result);
}

const verifyData = (accept) => (bill) => {
  if (bill.status !== 'DRAFT') return 'invalid_transition';
  const incomplete = bill.dataCompleteness < 100;
  if (incomplete && accept !== true) return 'incomplete_data_not_accepted';
  return { status: 'DATA_VERIFIED', dataWarningAccepted: incomplete };
};

const issue = (bill) => {
  if (bill.status !== 'DATA_VERIFIED') return 'invalid_transition';
  const now = new Date();
  const due = new Date(now);
  due.setUTCDate(due.getUTCDate() + PAYMENT_TERM_DAYS);
  return { status: 'ISSUED', issuedAt: now.toISOString(), dueDate: due.toISOString().slice(0, 10) };
};

/**
 * The REST API takes the tenant from the token. The local server cannot read it, so the tenant
 * travels as `tenantId` in the body.
 */
function raiseDispute(db, req, res) {
  const body = req.body ?? {};
  if (
    !body.utilityBillId ||
    !DISPUTE_REASONS.includes(body.reason) ||
    isLongText(body.description)
  ) {
    return fail(res, 400, 'invalid_request');
  }
  if (!body.tenantId) return fail(res, 409, 'tenant_required');
  const foundBill = db.get('utilityBills').find((b) => sameId(b.id, body.utilityBillId));
  const bill = foundBill.value();
  if (!bill) return fail(res, 404, 'not_found');
  if (bill.status !== 'ISSUED' && bill.status !== 'IN_DISPUTE') {
    return fail(res, 409, 'invalid_transition');
  }
  foundBill.assign({ status: 'IN_DISPUTE' }).value();
  const disputes = db.get('billingDisputes');
  const dispute = {
    id: nextId(disputes.value()),
    utilityBillId: bill.id,
    tenantId: body.tenantId,
    reason: body.reason,
    description: body.description ?? null,
    status: 'OPEN',
    reviewNotes: null,
    resolution: null,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };
  disputes.push(dispute).value();
  res.app.db.write();
  return res.status(201).json(dispute);
}

function reviewDispute(db, req, res, disputeId) {
  const notes = req.body?.reviewNotes;
  if (isLongText(notes)) return fail(res, 400, 'invalid_request');
  const found = db.get('billingDisputes').find((d) => sameId(d.id, disputeId));
  const dispute = found.value();
  if (!dispute) return fail(res, 404, 'not_found');
  if (dispute.status !== 'OPEN') return fail(res, 409, 'invalid_transition');
  const reviewNotes = String(notes ?? '').trim() || null;
  return update(res, found, { status: 'UNDER_REVIEW', reviewNotes });
}

/** Closes the dispute; its bill is resolved once none of its disputes remains open. */
function resolveDispute(db, req, res, disputeId) {
  const resolution = String(req.body?.resolution ?? '').trim();
  if (isLongText(resolution)) return fail(res, 400, 'invalid_request');
  const found = db.get('billingDisputes').find((d) => sameId(d.id, disputeId));
  const dispute = found.value();
  if (!dispute) return fail(res, 404, 'not_found');
  if (dispute.status === 'RESOLVED') return fail(res, 409, 'dispute_closed');
  if (!resolution) return fail(res, 409, 'resolution_required');

  const stillOpen = db
    .get('billingDisputes')
    .some(
      (d) =>
        sameId(d.utilityBillId, dispute.utilityBillId) &&
        !sameId(d.id, dispute.id) &&
        d.status !== 'RESOLVED',
    )
    .value();
  if (!stillOpen) {
    const foundBill = db.get('utilityBills').find((b) => sameId(b.id, dispute.utilityBillId));
    if (!foundBill.value()) return fail(res, 404, 'not_found');
    if (foundBill.value().status !== 'IN_DISPUTE') return fail(res, 409, 'invalid_transition');
    foundBill.assign({ status: 'RESOLVED' }).value();
  }
  return update(res, found, {
    status: 'RESOLVED',
    resolution,
    resolvedAt: new Date().toISOString(),
  });
}

module.exports = (req, res, next) => {
  const db = req.app.db;
  const path = req.path.replace(/\/+$/, '');
  let match;

  if (req.method === 'GET' && path === '/subscriptions') {
    if (!req.query.galleryId) return fail(res, 400, 'invalid_request');
    const subscription = db
      .get('subscriptions')
      .find((s) => String(s.galleryId) === String(req.query.galleryId))
      .value();
    return subscription ? res.json(subscription) : fail(res, 404, 'subscription_not_found');
  }
  if (req.method === 'POST' && path === '/subscriptions') return requestSubscription(db, req, res);
  if (
    req.method === 'POST' &&
    (match = /^\/subscriptions\/(\d+)\/(cancel|reactivate)-renewal$/.exec(path))
  ) {
    return changeRenewal(db, res, match[1], match[2] === 'reactivate');
  }
  if (req.method === 'GET' && (match = /^\/subscriptions\/(\d+)\/payments$/.exec(path))) {
    const payments = db
      .get('payments')
      .filter({ subscriptionId: Number(match[1]) })
      .value();
    return res.json([...payments].sort(byNewest('registeredAt')));
  }

  if (req.method === 'GET' && path === '/alerts') {
    return res.json([...db.get('alerts').value()].sort(byNewest('detectedAt')));
  }
  if (req.method === 'GET' && (match = /^\/alerts\/(\d+)$/.exec(path))) {
    const alert = db
      .get('alerts')
      .find({ id: Number(match[1]) })
      .value();
    return alert ? res.json(alert) : fail(res, 404, 'alert_not_found');
  }
  if (req.method === 'PATCH' && (match = /^\/alerts\/(\d+)\/acknowledge$/.exec(path))) {
    return changeAlert(db, res, match[1], acknowledge);
  }
  if (req.method === 'PATCH' && (match = /^\/alerts\/(\d+)\/resolve$/.exec(path))) {
    return changeAlert(db, res, match[1], resolveWith(req.body?.resolutionNote));
  }

  if (req.method === 'GET' && path === '/dashboard/summary') return res.json(dashboardSummary(db));

  if (req.method === 'POST' && path === '/utilityBills') return generateBill(db, req, res);
  if (req.method === 'PATCH' && (match = /^\/utilityBills\/([^/]+)\/verify-data$/.exec(path))) {
    return changeBill(db, res, match[1], verifyData(req.body?.acceptIncompleteData));
  }
  if (req.method === 'PATCH' && (match = /^\/utilityBills\/([^/]+)\/issue$/.exec(path))) {
    return changeBill(db, res, match[1], issue);
  }
  if (req.method === 'GET' && (match = /^\/utilityBills\/([^/]+)$/.exec(path))) {
    const bill = db
      .get('utilityBills')
      .find((b) => sameId(b.id, match[1]))
      .value();
    return bill ? res.json(bill) : fail(res, 404, 'not_found');
  }
  if (req.method === 'POST' && path === '/billingDisputes') return raiseDispute(db, req, res);
  if (req.method === 'PATCH' && (match = /^\/billingDisputes\/([^/]+)\/review$/.exec(path))) {
    return reviewDispute(db, req, res, match[1]);
  }
  if (req.method === 'PATCH' && (match = /^\/billingDisputes\/([^/]+)\/resolve$/.exec(path))) {
    return resolveDispute(db, req, res, match[1]);
  }
  if (req.method === 'GET' && (match = /^\/billingDisputes\/([^/]+)$/.exec(path))) {
    const dispute = db
      .get('billingDisputes')
      .find((d) => sameId(d.id, match[1]))
      .value();
    return dispute ? res.json(dispute) : fail(res, 404, 'not_found');
  }

  return next();
};
