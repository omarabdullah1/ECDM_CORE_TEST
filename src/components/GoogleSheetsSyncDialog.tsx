import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dialog } from "./Dialog";
import { AlertCircle, Search, Clock, CheckCircle2, FileSpreadsheet, Upload, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";

interface GoogleSheetsSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  syncType: "marketing-leads" | "campaign-results";
  onSyncComplete: () => void;
}

export function GoogleSheetsSyncDialog({ isOpen, onClose, syncType, onSyncComplete }: GoogleSheetsSyncDialogProps) {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("Marketing Leads!A:H");
  const [serviceAccountKey, setServiceAccountKey] = useState("");
  const [serviceAccountFile, setServiceAccountFile] = useState<File | null>(null);
  const [saveConfig, setSaveConfig] = useState(false);
  const [connectionName, setConnectionName] = useState("");
  const [savedConfigs, setSavedConfigs] = useState<any[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>("new");
  const [loading, setLoading] = useState(false);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [fetchingSheets, setFetchingSheets] = useState(false);
  
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [selectedPreviewIds, setSelectedPreviewIds] = useState<string[]>([]);

  const fetchSyncConfig = async () => {
    try {
      const res = await axios.get(`/api/marketing/sync-config?type=${syncType}`);
      setSavedConfigs(res.data);
    } catch (err) {
      console.error("Failed to fetch sync config", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSyncConfig();
      // Reset state when opened
      setPreviewData(null);
      setSelectedPreviewIds([]);
    }
  }, [isOpen, syncType]);

  const handleConfigChange = (id: string) => {
    setSelectedConfigId(id);
    if (id === "new") {
      setSpreadsheetId("");
      setSheetName("Marketing Leads!A:H");
      setServiceAccountKey("");
      setConnectionName("");
      setSaveConfig(false);
    } else {
      const config = savedConfigs.find(c => c._id === id);
      if (config) {
        setSpreadsheetId(config.spreadsheetId);
        setSheetName(config.sheetName);
        setServiceAccountKey(config.serviceAccountKey);
        setConnectionName(config.name);
        setSaveConfig(true);
      }
    }
  };

  const fetchAvailableSheets = async () => {
    if (!spreadsheetId) {
      toast.error("Please provide a Spreadsheet ID first");
      return;
    }
    setFetchingSheets(true);
    try {
      const formData = new FormData();
      formData.append("spreadsheetId", spreadsheetId);
      if (serviceAccountFile) {
        formData.append("serviceAccountFile", serviceAccountFile);
      } else if (serviceAccountKey) {
        formData.append("serviceAccountKey", serviceAccountKey);
      }
      
      const res = await axios.post("/api/marketing/sheets", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setAvailableSheets(res.data);
      if (res.data.length > 0 && !sheetName) {
        setSheetName(res.data[0]);
      }
      toast.success("Sheets loaded successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to load sheets");
    } finally {
      setFetchingSheets(false);
    }
  };

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("spreadsheetId", spreadsheetId);
      formData.append("sheetName", sheetName);
      formData.append("saveConfig", String(saveConfig));
      formData.append("name", connectionName);
      
      if (serviceAccountFile) {
        formData.append("serviceAccountFile", serviceAccountFile);
      } else if (serviceAccountKey) {
        formData.append("serviceAccountKey", serviceAccountKey);
      }

      const endpoint = syncType === "marketing-leads" 
        ? "/api/marketing/leads/preview-sync" 
        : "/api/marketing/campaign-results/preview-sync";

      const res = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setPreviewData(res.data);
      setSelectedPreviewIds(res.data.map((_: any, i: number) => String(i)));
      toast.success("Preview loaded. Review changes below.");
      
      if (saveConfig) fetchSyncConfig();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to load preview");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!previewData) return;
    setLoading(true);
    try {
      const dataToCommit = previewData.filter((_, i) => selectedPreviewIds.includes(String(i)));
      
      const endpoint = syncType === "marketing-leads" 
        ? "/api/marketing/leads/commit-sync" 
        : "/api/marketing/campaign-results/commit-sync";
        
      const payload = syncType === "marketing-leads" 
        ? { leads: dataToCommit } 
        : { results: dataToCommit };

      const res = await axios.post(endpoint, payload);
      toast.success(res.data.message || "Sync successful");
      onClose();
      setPreviewData(null);
      onSyncComplete();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Commit failed");
    } finally {
      setLoading(false);
    }
  };

  const title = "Google Sheets Sync";
  const description = syncType === "marketing-leads" 
    ? "Sync leads directly to Marketing, Sales, and Customers." 
    : "Sync campaign performance data directly from your spreadsheets.";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      maxWidth="2xl"
    >
      <form onSubmit={handlePreview} className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-bold mb-1">Sheet Structure Required:</p>
            {syncType === "marketing-leads" ? (
              <>
                <p>Column A: ID, B: Name, C: Phone, D: Type, E: Sector, F: Date, G: Notes</p>
                <p className="mt-1 opacity-80">Supports columns A to H (including Date and Notes).</p>
                <p className="mt-2 opacity-80 text-[10px]">Note: ID from sheet is used for tracking; Customer Code is system-generated.</p>
                <p className="mt-1 opacity-80">Data will automatically flow to Sales and Customers.</p>
              </>
            ) : (
              <p>Column A: Campaign Name | Column B: Status | Column C: Impressions | Column D: Conversions | Column E: Revenue | Column F-H: Regions | Column I: Next Steps</p>
            )}
          </div>
        </div>

        {!previewData ? (
          <>
            <div>
              <label className="block text-sm font-bold mb-2">Select Connection</label>
              <select
                value={selectedConfigId}
                onChange={(e) => handleConfigChange(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
              >
                <option value="new">+ Connect New Sheet</option>
                {savedConfigs.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {selectedConfigId === "new" && (
              <div>
                <label className="block text-sm font-bold mb-2">Connection Name</label>
                <input 
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                  placeholder="e.g. Facebook Ads Leads"
                  required={saveConfig}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" 
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold mb-2">Spreadsheet ID</label>
              <div className="relative">
                <FileSpreadsheet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  placeholder="Enter ID from URL"
                  required 
                  className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold">Sheet Name</label>
                  <button 
                    type="button"
                    onClick={fetchAvailableSheets}
                    disabled={fetchingSheets}
                    className="text-[10px] font-bold text-blue-600 hover:underline disabled:opacity-50"
                  >
                    {fetchingSheets ? "Loading..." : "Fetch Sheets"}
                  </button>
                </div>
                {availableSheets.length > 0 ? (
                  <select
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                  >
                    {availableSheets.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="Marketing Leads!A:H"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" 
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Upload JSON Key</label>
                <div className="border-2 border-dashed border-neutral-200 rounded-xl p-4 text-center hover:border-neutral-900 transition-all cursor-pointer relative bg-neutral-50">
                  <input 
                    type="file" 
                    accept=".json"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setServiceAccountFile(e.target.files?.[0] || null)}
                  />
                  <Upload className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-neutral-900 truncate px-2">
                    {serviceAccountFile ? serviceAccountFile.name : "Upload key"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Or Paste Service Account Key (JSON)</label>
              <textarea 
                value={serviceAccountKey}
                onChange={(e) => setServiceAccountKey(e.target.value)}
                placeholder='{"type": "service_account", ...}'
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 text-xs h-24" 
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="saveConfig"
                checked={saveConfig}
                onChange={(e) => setSaveConfig(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <label htmlFor="saveConfig" className="text-sm font-medium text-neutral-700">
                Save this configuration for future use
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-neutral-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Loading Preview...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Generate Preview
                </>
              )}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-neutral-900">Preview Changes ({previewData.length})</h4>
              <button 
                type="button"
                onClick={() => setPreviewData(null)}
                className="text-xs text-neutral-500 hover:text-neutral-900 font-bold"
              >
                Back to Config
              </button>
            </div>
            
            <div className="max-h-60 overflow-y-auto border border-neutral-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-neutral-50 border-b border-neutral-100">
                  <tr>
                    <th className="px-3 py-2 w-10">
                      <input 
                        type="checkbox" 
                        checked={selectedPreviewIds.length === previewData.length && previewData.length > 0}
                        onChange={() => {
                          if (selectedPreviewIds.length === previewData.length) setSelectedPreviewIds([]);
                          else setSelectedPreviewIds(previewData.map((_, i) => String(i)));
                        }}
                      />
                    </th>
                    {syncType === "marketing-leads" ? (
                      <>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Sector</th>
                        <th className="px-3 py-2">Status</th>
                      </>
                    ) : (
                      <>
                        <th className="px-3 py-2">Campaign</th>
                        <th className="px-3 py-2">Impressions</th>
                        <th className="px-3 py-2">Conversions</th>
                        <th className="px-3 py-2">Revenue</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {previewData.map((row, i) => (
                    <tr key={i} className="hover:bg-neutral-50/50">
                      <td className="px-3 py-2">
                        <input 
                          type="checkbox" 
                          checked={selectedPreviewIds.includes(String(i))}
                          onChange={() => {
                            setSelectedPreviewIds(prev => 
                              prev.includes(String(i)) ? prev.filter(p => p !== String(i)) : [...prev, String(i)]
                            );
                          }}
                        />
                      </td>
                      {syncType === "marketing-leads" ? (
                        <>
                          <td className="px-3 py-2 font-medium">{row.name}</td>
                          <td className="px-3 py-2">{row.type}</td>
                          <td className="px-3 py-2">{row.sector}</td>
                          <td className="px-3 py-2">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                              row.status === 'new' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                            )}>
                              {row.status}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-2 font-medium">{row.campaign}</td>
                          <td className="px-3 py-2">{row.impressions?.toLocaleString()}</td>
                          <td className="px-3 py-2">{row.conversions?.toLocaleString()}</td>
                          <td className="px-3 py-2 font-bold">${row.salesRevenue?.toLocaleString()}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              type="button"
              onClick={handleCommit}
              disabled={loading || selectedPreviewIds.length === 0}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-900/10"
            >
              {loading ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Committing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Commit {selectedPreviewIds.length} Changes
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </Dialog>
  );
}
