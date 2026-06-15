"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "@/components/CopyButton";
import { AlertCircle, CheckCircle, Clock, Shield, Key, User, Building } from "lucide-react";

interface JwtParts {
  header: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  signature: string;
  headerRaw: string;
  payloadRaw: string;
  signatureRaw: string;
  isValid: boolean;
  error: string | null;
}

function parseJwt(token: string): JwtParts {
  const trimmed = token.trim();
  if (!trimmed) {
    return {
      header: null,
      payload: null,
      signature: "",
      headerRaw: "",
      payloadRaw: "",
      signatureRaw: "",
      isValid: false,
      error: null,
    };
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return {
      header: null,
      payload: null,
      signature: "",
      headerRaw: "",
      payloadRaw: "",
      signatureRaw: "",
      isValid: false,
      error: "Invalid JWT structure. A JWT must have 3 parts separated by dots.",
    };
  }

  try {
    const headerJson = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
    const payloadJson = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));

    return {
      header: headerJson,
      payload: payloadJson,
      signature: parts[2],
      headerRaw: parts[0],
      payloadRaw: parts[1],
      signatureRaw: parts[2],
      isValid: true,
      error: null,
    };
  } catch {
    return {
      header: null,
      payload: null,
      signature: "",
      headerRaw: parts[0],
      payloadRaw: parts[1],
      signatureRaw: parts[2],
      isValid: false,
      error: "Failed to decode JWT. The token may be malformed or contain invalid Base64.",
    };
  }
}

function formatDate(timestamp: number): string {
  try {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return "Invalid date";
  }
}

function getExpirationStatus(payload: Record<string, unknown>): {
  status: "expired" | "valid" | "no-exp" | "error";
  message: string;
  icon: React.ReactNode;
} {
  const exp = payload.exp;
  if (typeof exp !== "number") {
    return {
      status: "no-exp",
      message: "No expiration claim (exp) found",
      icon: <Clock className="h-4 w-4 text-surface-400" />,
    };
  }

  const now = Math.floor(Date.now() / 1000);

  if (exp < now) {
    const expiredAgo = now - exp;
    const minutes = Math.floor(expiredAgo / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    let timeAgo: string;
    if (days > 0) timeAgo = `${days} day${days > 1 ? "s" : ""} ago`;
    else if (hours > 0) timeAgo = `${hours} hour${hours > 1 ? "s" : ""} ago`;
    else timeAgo = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

    return {
      status: "expired",
      message: `Expired ${timeAgo} (${formatDate(exp)})`,
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
    };
  }

  const expiresIn = exp - now;
  const minutes = Math.floor(expiresIn / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  let timeLeft: string;
  if (days > 0) timeLeft = `${days} day${days > 1 ? "s" : ""}`;
  else if (hours > 0) timeLeft = `${hours} hour${hours > 1 ? "s" : ""}`;
  else timeLeft = `${minutes} minute${minutes > 1 ? "s" : ""}`;

  return {
    status: "valid",
    message: `Valid for ${timeLeft} (expires ${formatDate(exp)})`,
    icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-amber-600 dark:text-amber-400"; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-blue-600 dark:text-blue-400"; // key
        } else {
          cls = "text-emerald-600 dark:text-emerald-400"; // string
        }
      } else if (/true|false/.test(match)) {
        cls = "text-purple-600 dark:text-purple-400"; // boolean
      } else if (/null/.test(match)) {
        cls = "text-surface-400"; // null
      }
      return `<span class="${cls}">${escapeHtml(match)}</span>`;
    }
  );
}

const KNOWN_CLAIMS: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expiration Time",
  nbf: "Not Before",
  iat: "Issued At",
  jti: "JWT ID",
  typ: "Type",
  alg: "Algorithm",
  kid: "Key ID",
};

export default function JwtDecoder() {
  const [token, setToken] = useState("");

  const parts = useMemo(() => parseJwt(token), [token]);

  const expStatus = useMemo(() => {
    if (!parts.payload) return null;
    return getExpirationStatus(parts.payload);
  }, [parts.payload]);

  const headerJson = useMemo(() => {
    if (!parts.header) return "";
    return JSON.stringify(parts.header, null, 2);
  }, [parts.header]);

  const payloadJson = useMemo(() => {
    if (!parts.payload) return "";
    return JSON.stringify(parts.payload, null, 2);
  }, [parts.payload]);

  const headerHighlighted = useMemo(
    () => (headerJson ? syntaxHighlight(headerJson) : ""),
    [headerJson]
  );

  const payloadHighlighted = useMemo(
    () => (payloadJson ? syntaxHighlight(payloadJson) : ""),
    [payloadJson]
  );

  const knownClaims = useMemo(() => {
    if (!parts.payload) return [];
    return Object.entries(parts.payload)
      .filter(([key]) => KNOWN_CLAIMS[key])
      .map(([key, value]) => ({
        key,
        name: KNOWN_CLAIMS[key],
        value,
        isDate: ["exp", "iat", "nbf"].includes(key),
      }));
  }, [parts.payload]);

  const sampleJwt =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MDAwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            JWT Token
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setToken(sampleJwt)}
              className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
            >
              Load sample
            </button>
            <button
              onClick={() => setToken("")}
              className="text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT token here..."
          className="input-field min-h-[120px] resize-y font-mono text-sm"
          spellCheck={false}
        />

        {/* Validation status */}
        {token.trim() && (
          <div className="mt-3">
            {parts.error ? (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{parts.error}</p>
              </div>
            ) : parts.isValid ? (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Valid JWT structure detected
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Expiration status */}
      {expStatus && (
        <div
          className={`rounded-lg border p-4 flex items-center gap-3 ${
            expStatus.status === "expired"
              ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
              : expStatus.status === "valid"
              ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20"
              : "border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900"
          }`}
        >
          {expStatus.icon}
          <span
            className={`text-sm font-medium ${
              expStatus.status === "expired"
                ? "text-red-600 dark:text-red-400"
                : expStatus.status === "valid"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-surface-500 dark:text-surface-400"
            }`}
          >
            {expStatus.message}
          </span>
        </div>
      )}

      {/* Decoded sections */}
      {parts.isValid && (
        <>
          {/* Known claims */}
          {knownClaims.length > 0 && (
            <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
              <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Key Claims
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {knownClaims.map((claim) => (
                  <div
                    key={claim.key}
                    className="rounded-md bg-surface-50 dark:bg-surface-800 p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {claim.key === "sub" ? (
                        <User className="h-3.5 w-3.5 text-surface-400" />
                      ) : claim.key === "iss" ? (
                        <Building className="h-3.5 w-3.5 text-surface-400" />
                      ) : claim.key === "alg" || claim.key === "kid" ? (
                        <Key className="h-3.5 w-3.5 text-surface-400" />
                      ) : (
                        <Shield className="h-3.5 w-3.5 text-surface-400" />
                      )}
                      <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
                        {claim.name}
                      </span>
                      <span className="text-xs font-mono text-surface-400 dark:text-surface-500">
                        ({claim.key})
                      </span>
                    </div>
                    <p className="text-sm font-mono text-surface-900 dark:text-surface-100 break-all">
                      {String(claim.value)}
                    </p>
                    {claim.isDate && typeof claim.value === "number" && (
                      <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                        {formatDate(claim.value)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Header - Blue */}
            <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-surface-900 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <h2 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Header
                  </h2>
                </div>
                <CopyButton text={headerJson} />
              </div>
              <div className="rounded-lg bg-surface-50 dark:bg-surface-800 p-4 overflow-x-auto">
                <pre
                  className="text-xs font-mono whitespace-pre-wrap break-all"
                  dangerouslySetInnerHTML={{ __html: headerHighlighted }}
                />
              </div>
              <div className="mt-3">
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">
                  Raw (Base64URL)
                </p>
                <p className="text-xs font-mono text-surface-600 dark:text-surface-300 break-all bg-surface-100 dark:bg-surface-800 rounded-lg p-2">
                  {parts.headerRaw}
                </p>
              </div>
            </div>

            {/* Payload - Green */}
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-surface-900 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h2 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Payload
                  </h2>
                </div>
                <CopyButton text={payloadJson} />
              </div>
              <div className="rounded-lg bg-surface-50 dark:bg-surface-800 p-4 overflow-x-auto">
                <pre
                  className="text-xs font-mono whitespace-pre-wrap break-all"
                  dangerouslySetInnerHTML={{ __html: payloadHighlighted }}
                />
              </div>
              <div className="mt-3">
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">
                  Raw (Base64URL)
                </p>
                <p className="text-xs font-mono text-surface-600 dark:text-surface-300 break-all bg-surface-100 dark:bg-surface-800 rounded-lg p-2">
                  {parts.payloadRaw}
                </p>
              </div>
            </div>

            {/* Signature - Red */}
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-surface-900 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <h2 className="text-sm font-semibold text-red-700 dark:text-red-300">
                    Signature
                  </h2>
                </div>
                <CopyButton text={parts.signature} />
              </div>
              <div className="rounded-lg bg-surface-50 dark:bg-surface-800 p-4">
                <p className="text-xs font-mono text-surface-600 dark:text-surface-300 break-all">
                  {parts.signature}
                </p>
              </div>
              <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>Note:</strong> Signature verification requires the secret key or
                  public key. This tool only decodes the JWT; it does not verify signatures.
                </p>
              </div>
            </div>
          </div>

          {/* Full token breakdown */}
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
              Token Breakdown
            </h2>
            <div className="rounded-lg bg-surface-50 dark:bg-surface-800 p-4 overflow-x-auto">
              <p className="text-xs font-mono break-all leading-relaxed">
                <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1 rounded">
                  {parts.headerRaw}
                </span>
                <span className="text-surface-400">.</span>
                <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1 rounded">
                  {parts.payloadRaw}
                </span>
                <span className="text-surface-400">.</span>
                <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-1 rounded">
                  {parts.signatureRaw}
                </span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
