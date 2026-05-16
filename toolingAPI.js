const API_VERSION = "v59.0";

const sfFetch = async (instanceUrl, accessToken, path, options = {}) => {
  const url = `${instanceUrl}/services/data/${API_VERSION}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (res.status === 204) return null;
  const data = await res.json();

  if (!res.ok) {
    const msg = Array.isArray(data)
      ? data[0]?.message
      : data.message || "Salesforce API error";
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data;
};

// ── Tooling API ──────────────────────────────────────────────────────────────

export const fetchValidationRules = async (instanceUrl, accessToken) => {
  const query = encodeURIComponent(
    `SELECT Id, ValidationName, Active, Description, ErrorMessage, ErrorDisplayField
     FROM ValidationRule
     WHERE EntityDefinition.QualifiedApiName = 'Account'`
  );
  const data = await sfFetch(
    instanceUrl,
    accessToken,
    `/tooling/query/?q=${query}`
  );
  return data?.records || [];
};

export const fetchRuleMetadata = async (instanceUrl, accessToken, ruleId) => {
  const data = await sfFetch(
    instanceUrl,
    accessToken,
    `/tooling/sobjects/ValidationRule/${ruleId}`
  );
  return data;
};

export const toggleValidationRule = async (
  instanceUrl,
  accessToken,
  ruleId,
  currentActive
) => {
  // Need full Metadata to PATCH
  const fullRule = await fetchRuleMetadata(instanceUrl, accessToken, ruleId);
  const metadata = fullRule.Metadata;

  await sfFetch(
    instanceUrl,
    accessToken,
    `/tooling/sobjects/ValidationRule/${ruleId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        Metadata: { ...metadata, active: !currentActive },
      }),
    }
  );
  return !currentActive;
};

export const toggleAllRules = async (
  instanceUrl,
  accessToken,
  rules,
  targetState
) => {
  const results = await Promise.allSettled(
    rules.map(async (rule) => {
      if (rule.Active === targetState) return rule;
      const fullRule = await fetchRuleMetadata(instanceUrl, accessToken, rule.Id);
      await sfFetch(
        instanceUrl,
        accessToken,
        `/tooling/sobjects/ValidationRule/${rule.Id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            Metadata: { ...fullRule.Metadata, active: targetState },
          }),
        }
      );
      return { ...rule, Active: targetState };
    })
  );

  return results.map((r, i) =>
    r.status === "fulfilled" ? r.value : rules[i]
  );
};

// Deploy uses Metadata API (SOAP) — here we use REST Metadata API
export const deployRuleChanges = async (
  instanceUrl,
  accessToken,
  pendingChanges // { [ruleId]: boolean }
) => {
  const entries = Object.entries(pendingChanges);
  const results = await Promise.allSettled(
    entries.map(async ([ruleId, active]) => {
      const fullRule = await fetchRuleMetadata(instanceUrl, accessToken, ruleId);
      await sfFetch(
        instanceUrl,
        accessToken,
        `/tooling/sobjects/ValidationRule/${ruleId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            Metadata: { ...fullRule.Metadata, active },
          }),
        }
      );
      return ruleId;
    })
  );

  const succeeded = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
  const failed = results
    .filter((r) => r.status === "rejected")
    .map((r, i) => entries[i][0]);

  return { succeeded, failed };
};
