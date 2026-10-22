/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  CheckCircle2, 
  X, 
  ExternalLink, 
  HelpCircle, 
  Sparkles, 
  Trash2, 
  AlertCircle, 
  Flame,
  Check,
  RefreshCw,
  Upload,
  FileCode,
  FileText,
  FileCheck,
  FolderOpen
} from 'lucide-react';
import { FirebaseConfig } from '../types';
import { 
  getStoredFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig, 
  testFirebaseConnection,
  parseFirebaseSnippet,
  getPreferredDatabaseType,
  setPreferredDatabaseType,
  DatabaseType
} from '../services/firebase';

interface FirebaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange: (connected: boolean, config: FirebaseConfig | null) => void;
}

export default function FirebaseConnectModal({ 
  isOpen, 
  onClose, 
  onConnectionChange 
}: FirebaseConnectModalProps) {
  const [dbType, setDbType] = useState<DatabaseType>('firestore');
  const [importMode, setImportMode] = useState<'file' | 'snippet' | 'manual'>('file');
  const [snippetInput, setSnippetInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<FirebaseConfig>({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    databaseURL: ''
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredFirebaseConfig();
      const currentType = getPreferredDatabaseType();
      setDbType(currentType);
      if (stored) {
        setFormData({
          apiKey: stored.apiKey || '',
          authDomain: stored.authDomain || '',
          projectId: stored.projectId || '',
          storageBucket: stored.storageBucket || '',
          messagingSenderId: stored.messagingSenderId || '',
          appId: stored.appId || '',
          databaseURL: stored.databaseURL || ''
        });
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
      setTestResult(null);
      setUploadedFile(null);
    }
  }, [isOpen]);

  // Handle file reading from user's system
  const processFileContent = (content: string, fileName: string, fileSize: number) => {
    const parsed = parseFirebaseSnippet(content);
    if (parsed && (parsed.apiKey || parsed.projectId || parsed.databaseURL)) {
      setFormData(prev => ({
        ...prev,
        ...parsed
      }));
      setUploadedFile({ name: fileName, size: fileSize });
      setTestResult({
        success: true,
        message: `Successfully loaded credentials from "${fileName}"!`
      });
    } else {
      setTestResult({
        success: false,
        message: `Could not find valid Firebase credentials in "${fileName}". Supported formats include Firebase JSON, google-services.json, .env, or JS/TS snippets.`
      });
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        processFileContent(text, file.name, file.size);
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be re-selected if edited
    e.target.value = '';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        processFileContent(text, file.name, file.size);
      }
    };
    reader.readAsText(file);
  };

  // Load from local project .env or firebase.config.ts
  const handleLoadFromProjectFiles = () => {
    const config = getStoredFirebaseConfig();
    if (config && (config.apiKey || config.projectId)) {
      setFormData(config);
      setUploadedFile({ name: 'Project .env / firebase.config.ts', size: 0 });
      setTestResult({
        success: true,
        message: 'Successfully loaded credentials from local project configuration file!'
      });
    } else {
      setTestResult({
        success: false,
        message: 'No credentials found in local .env or src/firebase.config.ts. Fill in the .env file or upload a file above.'
      });
    }
  };

  const handleSnippetParse = () => {
    if (!snippetInput.trim()) return;
    const parsed = parseFirebaseSnippet(snippetInput);
    if (parsed) {
      setFormData(prev => ({
        ...prev,
        ...parsed
      }));
      setSnippetInput('');
      setTestResult({
        success: true,
        message: 'Successfully extracted Firebase configuration fields!'
      });
    } else {
      setTestResult({
        success: false,
        message: 'Could not auto-detect fields. Please verify JSON or JavaScript config snippet format.'
      });
    }
  };

  const handleTestConnection = async () => {
    if (!formData.apiKey || (!formData.projectId && !formData.databaseURL)) {
      setTestResult({
        success: false,
        message: 'Please provide at least an API Key and Project ID or Database URL.'
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    setPreferredDatabaseType(dbType);

    const result = await testFirebaseConnection(formData);
    setTesting(false);
    setTestResult(result);
  };

  const handleSave = () => {
    if (!formData.apiKey) {
      setTestResult({
        success: false,
        message: 'Please provide your Firebase API Key.'
      });
      return;
    }

    setPreferredDatabaseType(dbType);
    saveFirebaseConfig(formData);
    setIsConnected(true);
    onConnectionChange(true, formData);
    onClose();
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect Firebase database and revert to local storage?')) {
      clearFirebaseConfig();
      setFormData({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
        databaseURL: ''
      });
      setIsConnected(false);
      setTestResult(null);
      setUploadedFile(null);
      onConnectionChange(false, null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white/95 backdrop-blur-xl border border-white/80 rounded-[28px] shadow-2xl shadow-slate-900/10 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-200/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-display font-semibold text-slate-800">
                  Firebase Database Connection
                </h3>
                {isConnected ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-sans">
                Store and synchronize incoming portfolio contact messages directly in your Firebase database.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)] text-sm">
          {/* Database Target Selector */}
          <div>
            <label className="text-[10px] font-mono tracking-wider uppercase text-slate-500 block mb-2 font-medium">
              Database Service Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDbType('firestore')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  dbType === 'firestore'
                    ? 'border-sky-500/50 bg-sky-50/60 shadow-xs ring-2 ring-sky-500/20'
                    : 'border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800 text-xs">Cloud Firestore</span>
                  {dbType === 'firestore' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Modern document store (Collection: <code className="text-sky-700 font-mono">messages</code>). Recommended.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDbType('realtime')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  dbType === 'realtime'
                    ? 'border-sky-500/50 bg-sky-50/60 shadow-xs ring-2 ring-sky-500/20'
                    : 'border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800 text-xs">Realtime Database</span>
                  {dbType === 'realtime' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Classic JSON database (Node: <code className="text-sky-700 font-mono">/messages</code>).
                </p>
              </button>
            </div>
          </div>

          {/* Connection Method Tabs: Connect via File / Paste Snippet / Manual */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-mono tracking-wider uppercase text-slate-500 font-medium">
                Connection Method
              </label>

              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] font-mono text-sky-600 hover:text-sky-800 flex items-center gap-1 underline cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Where to get keys?</span>
              </button>
            </div>

            <div className="flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 gap-1 mb-4">
              <button
                type="button"
                onClick={() => setImportMode('file')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  importMode === 'file'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Connect via File</span>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('snippet')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  importMode === 'snippet'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Paste Code/JSON</span>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('manual')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  importMode === 'manual'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Manual Fields</span>
              </button>
            </div>

            {/* TAB 1: File Upload / Drag & Drop */}
            {importMode === 'file' && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.env,.js,.ts,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-sky-500 bg-sky-50/70 scale-[1.01]'
                      : uploadedFile
                      ? 'border-emerald-500/50 bg-emerald-50/30 hover:bg-emerald-50/50'
                      : 'border-slate-300 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30'
                  }`}
                >
                  {uploadedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 font-mono">{uploadedFile.name}</p>
                        <p className="text-[11px] text-slate-500">File credentials loaded. Click to choose a different file.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Click to browse or drag & drop your Firebase config file
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Supports <code className="font-mono text-slate-700 font-medium">.json</code> (Firebase Web / <code className="font-mono text-slate-700">google-services.json</code>), <code className="font-mono text-slate-700">.env</code>, or <code className="font-mono text-slate-700">.js/.ts</code>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick button to reload from project .env or firebase.config.ts */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-700 font-sans">
                      Have credentials saved in your project's <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded border border-slate-200">.env</code> file?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadFromProjectFiles}
                    className="px-2.5 py-1 text-xs font-mono font-medium text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Load from .env
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Quick Paste Snippet */}
            {importMode === 'snippet' && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Paste Config Snippet or JSON</span>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={snippetInput}
                  onChange={(e) => setSnippetInput(e.target.value)}
                  placeholder='Paste `const firebaseConfig = { ... }` or raw JSON from Firebase Console...'
                  className="w-full p-2.5 text-xs font-mono bg-white/90 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none mb-2"
                />

                <button
                  type="button"
                  onClick={handleSnippetParse}
                  disabled={!snippetInput.trim()}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-mono font-medium rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Auto-Detect & Fill Fields
                </button>
              </div>
            )}
          </div>

          {/* Collapsible Help Guide */}
          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2 font-sans overflow-hidden"
              >
                <p className="font-semibold text-slate-800">How to get your Firebase configuration file or keys:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-2.5 h-2.5" /></a> and select your project.</li>
                  <li>Click the Gear Icon ⚙️ next to Project Overview &gt; <strong>Project settings</strong>.</li>
                  <li>In the <strong>General</strong> tab, scroll down to <strong>Your apps</strong> and select your Web App (or click <code>&lt;/&gt;</code> to create one).</li>
                  <li>Under <strong>Firebase SDK snippet</strong>, select <strong>Config</strong>, copy the object, or download/save as file and drop it above.</li>
                  <li>Ensure your Firestore or Realtime Database rules allow message writes (refer to <code className="font-mono text-slate-700">firestore.rules</code> at project root).</li>
                </ol>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Fields (Always visible or under manual tab) */}
          <div className="space-y-3 pt-2 border-t border-slate-200/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-medium">
                Detected / Configured Parameters
              </span>
              {formData.apiKey && formData.projectId && (
                <span className="text-[10px] font-mono text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready to connect
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                  Project ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value.trim() })}
                  placeholder="e.g. my-portfolio-app"
                  className="w-full p-2.5 text-xs font-mono bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                  API Key *
                </label>
                <input
                  type="text"
                  required
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value.trim() })}
                  placeholder="AIzaSy..."
                  className="w-full p-2.5 text-xs font-mono bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                  Auth Domain
                </label>
                <input
                  type="text"
                  value={formData.authDomain || ''}
                  onChange={(e) => setFormData({ ...formData, authDomain: e.target.value.trim() })}
                  placeholder="my-portfolio-app.firebaseapp.com"
                  className="w-full p-2.5 text-xs font-mono bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                  App ID
                </label>
                <input
                  type="text"
                  value={formData.appId || ''}
                  onChange={(e) => setFormData({ ...formData, appId: e.target.value.trim() })}
                  placeholder="1:123456789:web:abcdef..."
                  className="w-full p-2.5 text-xs font-mono bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            {dbType === 'realtime' && (
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                  Realtime Database URL
                </label>
                <input
                  type="text"
                  value={formData.databaseURL || ''}
                  onChange={(e) => setFormData({ ...formData, databaseURL: e.target.value.trim() })}
                  placeholder="https://my-app-default-rtdb.firebaseio.com"
                  className="w-full p-2.5 text-xs font-mono bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            )}
          </div>

          {/* Test Result Message */}
          <AnimatePresence>
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 font-sans">{testResult.message}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-slate-200/50 bg-slate-50/50 flex items-center justify-between flex-wrap gap-3">
          <div>
            {isConnected && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !formData.apiKey}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-mono font-medium rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-sky-600" />
                  <span>Test Connection</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!formData.apiKey}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-mono font-medium rounded-xl transition-all shadow-md shadow-sky-600/20 cursor-pointer"
            >
              Save & Connect
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
