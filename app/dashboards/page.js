"use client";

import { useState, useEffect } from "react";
import {
  EyeIcon,
  ClipboardIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { supabase } from '../supabaseClient'; // adjust path as needed

const navLinks = [
  { name: "Overview", icon: "home" },
  { name: "Research Assistant", icon: "sparkles" },
  { name: "Research Reports", icon: "document" },
  { name: "API Playground", icon: "code" },
  { name: "Invoices", icon: "receipt" },
  { name: "Documentation", icon: "external-link" },
];

const mockUser = {
  name: "Eden Marco",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
};

export default function Dashboard() {
  const [apiKeys, setApiKeys] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", permissions: [] });
  const [showKeyId, setShowKeyId] = useState(null);
  const [copyModalKey, setCopyModalKey] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const fetchApiKeys = async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        // handle error (show toast, etc)
        return;
      }
      setApiKeys(data);
    };
    fetchApiKeys();
  }, []);

  const handleCreateKey = async () => {
    const { name, limit } = formData;
    const { data, error } = await supabase
      .from('api_keys')
      .insert([
        {
          name,
          limit: parseInt(limit, 10),
          usage: 0,
          key: `tvly-${Math.random().toString(36).substr(2, 16)}`,
        },
      ])
      .select();
    if (error) {
      // handle error
      return;
    }
    setApiKeys([data[0], ...apiKeys]);
    setIsCreateModalOpen(false);
    setFormData({ name: '', limit: '' });
  };

  const handleEditKey = async () => {
    const { name, limit } = formData;
    const { data, error } = await supabase
      .from('api_keys')
      .update({ name, limit: parseInt(limit, 10) })
      .eq('id', editingKey.id)
      .select();
    if (error) {
      // handle error
      return;
    }
    setApiKeys(apiKeys.map(key => key.id === editingKey.id ? data[0] : key));
    setIsEditModalOpen(false);
    setEditingKey(null);
    setFormData({ name: '', limit: '' });
  };

  const handleDeleteKey = async (id) => {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);
    if (error) {
      // handle error
      return;
    }
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  const openEditModal = (key) => {
    setEditingKey(key);
    setFormData({ name: key.name, description: key.description, permissions: key.permissions });
    setIsEditModalOpen(true);
  };

  const togglePermission = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const maskKey = (key, show) => {
    if (show) return key;
    return key.slice(0, 4) + "-" + "*".repeat(key.length - 8) + key.slice(-4);
  };

  const openCopyModal = (key) => {
    setCopyModalKey(key);
    setCopySuccess(false);
  };

  const handleCopyKey = () => {
    if (copyModalKey) {
      navigator.clipboard.writeText(copyModalKey.key);
      setCopySuccess(true);
    }
  };

  const handleCopyToClipboard = (key) => {
    navigator.clipboard.writeText(key);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`z-40 top-0 left-0 h-full bg-white border-r flex flex-col justify-between min-h-screen transition-all duration-200 ease-in-out
        ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div>
          <div className={`flex items-center gap-2 px-4 py-6 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <span className={`text-black text-2xl font-bold transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Tavily</span>
            <span className={`text-gray-400 text-2xl font-bold transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>AI</span>
          </div>
          <nav className="mt-6">
            <ul className="space-y-1">
              {navLinks.map((link, idx) => (
                <li key={link.name}>
                  <a
                    href="#"
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg gap-3 ${idx === 0 ? "font-semibold bg-gray-100" : ""}`}
                  >
                    <span className="w-5 h-5 inline-block bg-gray-200 rounded-full" />
                    <span className={`transition-all duration-200 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className={`px-4 py-4 flex items-center gap-3 border-t transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <img src={mockUser.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
          <span className={`text-gray-700 font-medium transition-all duration-200 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>{mockUser.name}</span>
        </div>
      </aside>
      {/* Sidebar Toggle Button (always visible) */}
      <button
        className="fixed z-50 top-8 left-0 bg-white border border-gray-200 rounded-r-lg p-2 shadow transition-all"
        style={{ transform: sidebarCollapsed ? 'translateX(0)' : 'translateX(208px)' }}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? <ChevronRightIcon className="w-6 h-6 text-gray-700" /> : <ChevronLeftIcon className="w-6 h-6 text-gray-700" />}
      </button>
      {/* Main Content */}
      <main className={`flex-1 px-8 py-8 transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header Card */}
        <div className="rounded-2xl mb-8 p-8 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 text-white shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="uppercase text-xs font-semibold tracking-widest mb-2 opacity-80">Current Plan</div>
              <div className="text-3xl font-bold mb-2">Researcher</div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <span>API Limit</span>
                <span className="relative group cursor-pointer">
                  <span className="ml-1 text-white/70">&#9432;</span>
                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-40 bg-black text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">API requests per month</span>
                </span>
              </div>
              <div className="w-full h-2 bg-white/30 rounded mt-2 mb-1">
                <div className="h-2 bg-white rounded" style={{ width: "2.4%" }} />
              </div>
              <div className="text-xs opacity-90">24 / 1,000 Requests</div>
            </div>
            <button className="bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-lg shadow transition-colors self-start md:self-auto">Manage Plan</button>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
              <p className="text-sm text-gray-500 mt-1">The key is used to authenticate your requests to the Research API. To learn more, see the <a href="#" className="underline">documentation</a> page.</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-2 rounded-lg shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              New Key
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="px-4 py-2 text-left font-semibold">Name</th>
                  <th className="px-4 py-2 text-left font-semibold">Usage</th>
                  <th className="px-4 py-2 text-left font-semibold">Key</th>
                  <th className="px-4 py-2 text-left font-semibold">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{key.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{key.usage}</td>
                    <td className="px-4 py-3 text-sm font-mono">
                      <span className="inline-flex items-center gap-2">
                        <span>{maskKey(key.key, showKeyId === key.id)}</span>
                        <button
                          className={`text-gray-400 hover:text-blue-600 ${showKeyId === key.id ? 'text-blue-600' : ''}`}
                          onClick={() => setShowKeyId(showKeyId === key.id ? null : key.id)}
                          title={showKeyId === key.id ? "Hide Key" : "Show Key"}
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          className="text-gray-400 hover:text-gray-700"
                          onClick={() => handleCopyToClipboard(key.key)}
                          title="Copy Key"
                        >
                          <ClipboardIcon className="w-5 h-5" />
                        </button>
                        <button
                          className="text-gray-400 hover:text-blue-600"
                          onClick={() => openEditModal(key)}
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          className="text-gray-400 hover:text-red-600"
                          onClick={() => handleDeleteKey(key.id)}
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">
              <h2 className="text-xl font-bold mb-2">Create a new API key</h2>
              <p className="text-gray-700 mb-6">Enter a name and limit for the new API key.</p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Key Name <span className="font-normal text-gray-500">— A unique name to identify this key</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Key Name"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Limit monthly usage<span className="text-blue-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.limit || ''}
                  onChange={e => setFormData({ ...formData, limit: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="1000"
                />
              </div>
              <div className="text-xs text-gray-500 mb-6">
                * If the combined usage of all your keys exceeds your plan's limit, all requests will be rejected.
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">
              <h2 className="text-xl font-bold mb-2">Edit API key</h2>
              <p className="text-gray-700 mb-6">Update the name and limit for this API key.</p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Key Name <span className="font-normal text-gray-500">— A unique name to identify this key</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Key Name"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Limit monthly usage<span className="text-blue-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.limit || ''}
                  onChange={e => setFormData({ ...formData, limit: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="1000"
                />
              </div>
              <div className="text-xs text-gray-500 mb-6">
                * If the combined usage of all your keys exceeds your plan's limit, all requests will be rejected.
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditKey}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Toast Notification */}
        {toastVisible && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity">
            API key copied to clipboard!
          </div>
        )}
      </main>
    </div>
  );
}