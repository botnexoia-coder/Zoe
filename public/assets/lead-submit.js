// Retries of unchanged fields reuse an ID; changed fields start a new request.
// An in-flight duplicate shares its promise. Server KV dedupe remains best effort.
window.LeadSubmission = function () {
  let previous = '', id = '', inFlight = null;
  return function (data) {
    const payload = JSON.stringify(data);
    if (payload === previous && inFlight) return inFlight;
    if (payload !== previous || !id) { previous = payload; id = crypto.randomUUID(); }
    const requestId = id;
    const operation = (async function () {
      const response = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, requestId }) });
      const result = await response.json();
      if (!response.ok || result?.ok !== true) {
        const error = new Error('lead_not_accepted');
        error.result = result;
        throw error;
      }
      return result;
    })();
    inFlight = operation;
    operation.then(() => { if (inFlight === operation) inFlight = null; }, () => { if (inFlight === operation) inFlight = null; });
    return operation;
  };
};
