'use client';

import { useState } from 'react';
import { getDaysLeft } from '@/utils/dateHelpers';

const PREDEFINED_DOCUMENTS = [
  "Książeczka Żeglarska (Seaman's Book)",
  "Paszport",
  "Świadectwo Zdrowia (Medical Certificate)",
  "Certyfikat STCW - Wyższa Przeżywalność (PSCRB)",
  "Certyfikat STCW - Indywidualne Techniki Ratunkowe (ITR)",
  "Certyfikat STCW - Niezintegrowany (Basic Safety)",
  "Świadectwo Przeszkolenia GMDSS",
  "Dyplom Oficera / Kapitana",
  "Wiza USA (C1/D)",
  "Inny (Wpisz własną nazwę)..."
];

const INITIAL_DOCUMENTS = [
  {
    id: '1',
    name: "Paszport",
    docNumber: 'PAS-789101-2026-LONG-NUMBER-X12345',
    issuingAuthority: 'MSWiA Warszawa',
    issueDate: '2018-01-01',
    expiryDate: '2028-01-01',
    reminderDays: 90,
    imageUrls: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Świadectwo Zdrowia (Medical Certificate)',
    docNumber: 'MED-5544-A',
    issuingAuthority: 'Lekarz Uprawniony MSWiA',
    issueDate: '2024-05-10',
    expiryDate: '2026-05-10',
    reminderDays: 30,
    imageUrls: [], 
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Certyfikat STCW - Niezintegrowany (Basic Safety)',
    docNumber: 'STCW-9988-X',
    issuingAuthority: 'Ośrodek Szkolenia Morskiego',
    issueDate: '2020-02-15',
    expiryDate: 'unlimited',
    reminderDays: 0,
    imageUrls: [],
    createdAt: new Date().toISOString(),
  }
];

interface DocumentType {
  id: string;
  name: string;
  docNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  reminderDays: number;
  imageUrls: string[];
  createdAt: string;
}

export default function Dashboard() {
  // Stan nawigacji i motywu
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'seatime' | 'info'>('documents');
  const [isNightMode, setIsNightMode] = useState(true);

  // Stan bazy dokumentów
  const [documents, setDocuments] = useState<DocumentType[]>(INITIAL_DOCUMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false); 
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docToDeleteId, setDocToDeleteId] = useState<string | null>(null);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);

  // Stan formularza kontaktowego
  const [contactTitle, setContactTitle] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Stan formularza dokumentów
  const [selectedType, setSelectedType] = useState(PREDEFINED_DOCUMENTS[0]);
  const [customName, setCustomName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [reminderDays, setReminderDays] = useState(90);
  const [photosList, setPhotosList] = useState<string[]>([]); 

  const getSortedDocuments = () => {
    return [...documents].sort((a, b) => {
      if (a.expiryDate === 'unlimited' && b.expiryDate === 'unlimited') return 0;
      if (a.expiryDate === 'unlimited') return 1;
      if (b.expiryDate === 'unlimited') return -1;
      return getDaysLeft(a.expiryDate) - getDaysLeft(b.expiryDate);
    });
  };

  const openAddModal = () => {
    setEditingDoc(null);
    setIsEditMode(true); 
    setSelectedType(PREDEFINED_DOCUMENTS[0]);
    setCustomName('');
    setDocNumber('');
    setIssuingAuthority('');
    setIssueDate('');
    setExpiryDate('');
    setIsUnlimited(false);
    setReminderDays(90);
    setPhotosList([]);
    setIsModalOpen(true);
  };

  const openPreviewModal = (doc: DocumentType) => {
    setEditingDoc(doc);
    setIsEditMode(false); 
    if (PREDEFINED_DOCUMENTS.includes(doc.name)) {
      setSelectedType(doc.name);
      setCustomName('');
    } else {
      setSelectedType("Inny (Wpisz własną nazwę)...");
      setCustomName(doc.name);
    }
    setDocNumber(doc.docNumber);
    setIssuingAuthority(doc.issuingAuthority);
    setIssueDate(doc.issueDate);
    
    if (doc.expiryDate === 'unlimited') {
      setIsUnlimited(true);
      setExpiryDate('');
    } else {
      setIsUnlimited(false);
      setExpiryDate(doc.expiryDate);
    }

    setReminderDays(doc.reminderDays);
    setPhotosList(doc.imageUrls || []);
    setIsModalOpen(true);
  };

  const handleMultiplePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newUrls = filesArray.map(file => URL.createObjectURL(file));
      setPhotosList([...photosList, ...newUrls]);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    if (!isEditMode) return;
    setPhotosList(photosList.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditMode) return; 

    const finalName = selectedType === "Inny (Wpisz własną nazwę)..." ? customName : selectedType;
    const finalExpiryDate = isUnlimited ? 'unlimited' : expiryDate;
    
    if (!finalName || (!isUnlimited && !expiryDate)) return;

    const documentData = {
      name: finalName,
      docNumber,
      issuingAuthority,
      issueDate,
      expiryDate: finalExpiryDate,
      reminderDays: isUnlimited ? 0 : Number(reminderDays),
      imageUrls: photosList,
    };

    if (editingDoc) {
      setDocuments(documents.map(doc => doc.id === editingDoc.id ? { ...doc, ...documentData } : doc));
    } else {
      const newDoc: DocumentType = {
        id: crypto.randomUUID(),
        ...documentData,
        createdAt: new Date().toISOString(),
      };
      setDocuments([newDoc, ...documents]);
    }

    setIsModalOpen(false);
  };

  const triggerDelete = () => {
    if (editingDoc) {
      setDocToDeleteId(editingDoc.id);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (docToDeleteId) {
      setDocuments(documents.filter(doc => doc.id !== docToDeleteId));
      setShowDeleteConfirm(false);
      setDocToDeleteId(null);
      setIsModalOpen(false);
    }
  };

  // Obsługa wysyłki formularza kontaktowego przez mailto
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetEmail = "teamekapp@gmail.com";
    const subject = encodeURIComponent(contactTitle || "Wiadomość z aplikacji Crew App");
    
    const bodyContent = `Tytuł: ${contactTitle || '—'}
Treść:
${contactMessage || '—'}

---
Dane kontaktowe nadawcy:
Email: ${contactEmail || '—'}
Tel: ${contactPhone || '—'}
`;
    
    const body = encodeURIComponent(bodyContent);
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
  };

  const sortedDocs = getSortedDocuments();

  // Style motywów
  const themeBg = isNightMode ? 'bg-[#0B132B] text-[#E2E8F0]' : 'bg-[#F4F6F9] text-[#1E293B]';
  const themeHeader = isNightMode ? 'bg-[#1C2541] border-[#3A506B]' : 'bg-white border-slate-200 shadow-sm';
  const themeCard = isNightMode ? 'bg-[#1C2541] border-[#3A506B]' : 'bg-white border-slate-200 shadow-sm';
  const themeInnerBox = isNightMode ? 'bg-[#0B132B]/50 border-[#3A506B]/30' : 'bg-slate-50 border-slate-100';
  const themeTextMuted = isNightMode ? 'text-[#A9BCD0]' : 'text-slate-500';
  const themeTextTitle = isNightMode ? 'text-white' : 'text-slate-800';
  const themeSidebar = isNightMode ? 'bg-[#151D33] border-[#3A506B]' : 'bg-white border-slate-200';
  const themeInput = isNightMode ? 'bg-[#0B132B] border-[#3A506B] text-white focus:border-[#4EA8DE]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#4EA8DE]';

  return (
    <div className={`min-h-screen pb-36 relative transition-colors duration-300 ${themeBg}`}>
      
      {/* 🧭 SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 w-72 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out border-r shadow-2xl flex flex-col justify-between ${themeSidebar}`}>
        <div>
          <div className={`p-6 border-b flex items-center gap-4 ${isNightMode ? 'bg-[#1C2541]/50 border-[#3A506B]' : 'bg-slate-50 border-slate-100'}`}>
            <div className="w-12 h-12 bg-[#4EA8DE] text-[#0B132B] rounded-full flex items-center justify-center font-bold text-xl shadow-inner">KŃ</div>
            <div className="min-w-0">
              <h4 className={`font-bold truncate text-sm ${themeTextTitle}`}>Kpt. Wojtuś</h4>
              <p className="text-xs text-[#4EA8DE] font-medium">Master Mariner / Kapitan</p>
              <span className="inline-block text-[9px] bg-emerald-500/20 text-emerald-500 font-bold px-1.5 py-0.2 rounded mt-0.5 border border-emerald-500/30">✓ Profil Zweryfikowany</span>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            <button onClick={() => { setActiveTab('documents'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'documents' ? 'bg-[#4EA8DE] text-[#0B132B]' : `${themeTextMuted} hover:bg-slate-500/10`}`}>
              <span className="text-base">🪪</span> Moje Dokumenty (My Documents)
            </button>
            <button onClick={() => { setActiveTab('seatime'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'seatime' ? 'bg-[#4EA8DE] text-[#0B132B]' : `${themeTextMuted} hover:bg-slate-500/10`}`}>
              <span className="text-base">⚓</span> Dni na Morzu (Seatime)
            </button>
            <button onClick={() => { setActiveTab('info'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'info' ? 'bg-[#4EA8DE] text-[#0B132B]' : `${themeTextMuted} hover:bg-slate-500/10`}`}>
              <span className="text-base">ℹ️</span> Informacje (Info)
            </button>
          </nav>
        </div>

        <div className={`p-4 border-t flex flex-col gap-3 ${isNightMode ? 'border-[#3A506B]' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-slate-500/10">
            <span className="text-xs font-bold tracking-wide flex items-center gap-1.5">{isNightMode ? '🌙 Tryb Nocny' : '☀️ Tryb Dzienny'}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isNightMode} onChange={(e) => setIsNightMode(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4EA8DE]"></div>
            </label>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className={`w-full py-2 bg-transparent border rounded-xl text-xs font-semibold ${isNightMode ? 'border-[#3A506B] text-[#A9BCD0]' : 'border-slate-200 text-slate-500'}`}>✕ Zamknij menu</button>
        </div>
      </div>

      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40" />}

      {/* HEADER */}
      <header className={`border-b p-4 sticky top-0 z-30 transition-colors ${themeHeader}`}>
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="text-2xl text-[#4EA8DE] hover:scale-105 p-1 transition-transform">☰</button>
          <h1 className="text-lg md:text-xl font-bold tracking-wide flex-1 text-[#4EA8DE]">
            {activeTab === 'documents' && '⚓ My documents'}
            {activeTab === 'seatime' && '⚓ Seatime'}
            {activeTab === 'info' && '⚓ System Info & Kontakt'}
          </h1>
          
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* TAB 1: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-500/20 pb-3">
              <div className="space-y-1">
                <h2 className={`text-base font-semibold ${themeTextMuted}`}>Twoje dokumenty ({documents.length})</h2>
                <p className="text-[11px] text-[#4EA8DE] flex items-center gap-1 font-medium">⏱️ Posortowane od najkrótszej walidacji</p>
              </div>
              <div className={`p-1 rounded-lg border flex items-center gap-1 ${isNightMode ? 'bg-[#1C2541] border-[#3A506B]' : 'bg-white border-slate-200'}`}>
                <button onClick={() => setViewMode('list')} className={`px-2.5 py-1 rounded-md text-xs transition ${viewMode === 'list' ? 'bg-[#4EA8DE] text-[#0B132B] font-bold' : `${themeTextMuted} hover:text-sky-400`}`}>☰ Paski</button>
                <button onClick={() => setViewMode('grid')} className={`px-2.5 py-1 rounded-md text-xs transition ${viewMode === 'grid' ? 'bg-[#4EA8DE] text-[#0B132B] font-bold' : `${themeTextMuted} hover:text-sky-400`}`}>⚃ Kafelki</button>
              </div>
            </div>

            {sortedDocs.length === 0 ? (
              <div className="p-12 rounded-xl border border-dashed text-center text-slate-400">Brak dokumentów.</div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedDocs.map((doc) => {
                  const isUnlimitedDoc = doc.expiryDate === 'unlimited';
                  const daysLeft = isUnlimitedDoc ? 999999 : getDaysLeft(doc.expiryDate);
                  const isExpired = !isUnlimitedDoc && daysLeft < 0;

                  return (
                    <div key={doc.id} onClick={() => openPreviewModal(doc)} className={`rounded-2xl p-5 flex flex-col justify-between border relative group hover:border-[#4EA8DE] cursor-pointer transition duration-200 min-h-[220px] ${themeCard}`}>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div className={`text-2xl p-2 rounded-xl border text-[#4EA8DE] ${isNightMode ? 'bg-[#0B132B] border-[#3A506B]/60' : 'bg-slate-100 border-slate-200'}`}>🪪</div>
                        {doc.imageUrls && doc.imageUrls.length > 0 && <span className="text-[10px] bg-[#4EA8DE]/20 text-[#4EA8DE] border border-[#4EA8DE]/40 px-1.5 py-0.5 rounded-md font-medium">📷 Skan ({doc.imageUrls.length})</span>}
                      </div>
                      <div className="space-y-2 flex-1">
                        <h3 className={`font-bold text-base leading-tight line-clamp-2 ${themeTextTitle}`}>{doc.name}</h3>
                        <div className={`text-xs space-y-1 font-mono p-2 rounded-lg border ${themeInnerBox}`}>
                          {doc.docNumber && <p className={themeTextTitle}><span className="text-slate-500 font-normal">Nr:</span> {doc.docNumber}</p>}
                          {doc.issuingAuthority && <p className="truncate"><span className="text-slate-500 font-normal">Wydawca:</span> {doc.issuingAuthority}</p>}
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-500/20 space-y-2">
                        <div className={`flex justify-between text-[11px] ${themeTextMuted}`}>
                          <span>Wydany: {doc.issueDate || '—'}</span>
                          <span className={`font-medium ${themeTextTitle}`}>Do: {isUnlimitedDoc ? '♾️ Bezterminowo' : doc.expiryDate}</span>
                        </div>
                        {isUnlimitedDoc ? (
                          <div className="w-full text-center py-1.5 rounded-lg text-xs font-semibold border bg-sky-950/40 text-[#90E0EF] border-sky-800">♾️ Bezterminowy (Unlimited)</div>
                        ) : (
                          <div className={`w-full text-center py-1.5 rounded-lg text-xs font-semibold border ${isExpired ? 'bg-rose-950/40 text-rose-400 border-rose-800' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800'}`}>
                            {isExpired ? `Wygasł (${Math.abs(daysLeft)} dni)` : `Zostało dni: ${daysLeft}`}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedDocs.map((doc) => {
                  const isUnlimitedDoc = doc.expiryDate === 'unlimited';
                  const daysLeft = isUnlimitedDoc ? 999999 : getDaysLeft(doc.expiryDate);
                  const isExpired = !isUnlimitedDoc && daysLeft < 0;

                  return (
                    <div key={doc.id} onClick={() => openPreviewModal(doc)} className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#4EA8DE] cursor-pointer transition ${themeCard}`}>
                      <div className="flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
                        <div className={`text-xl p-2 rounded-lg border text-[#4EA8DE] ${isNightMode ? 'bg-[#0B132B] border-[#3A506B]/60' : 'bg-slate-100 border-slate-200'}`}>📄</div>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <h3 className={`font-semibold text-sm sm:text-base truncate ${themeTextTitle}`}>{doc.name}</h3>
                          <p className="text-xs text-[#4EA8DE] font-mono break-all line-clamp-1">Nr: {doc.docNumber || '—'} | Do: {isUnlimitedDoc ? 'Bezterminowo' : doc.expiryDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-500/20 pt-2 sm:pt-0">
                        {isUnlimitedDoc ? (
                          <div className="px-3 py-1 rounded-full text-xs font-semibold border bg-sky-950/50 text-[#90E0EF] border-sky-800">♾️ Bezterminowy</div>
                        ) : (
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${isExpired ? 'bg-rose-950/50 text-rose-400 border-rose-800' : 'bg-emerald-950/50 text-emerald-400 border-emerald-800'}`}>
                            {isExpired ? `Wygasł` : `Zostało ${daysLeft} dni`}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SEATIME */}
        {activeTab === 'seatime' && (
          <div className={`p-8 rounded-2xl border text-center space-y-4 ${themeCard}`}>
            <div className="text-5xl">⚓</div>
            <h2 className={`text-xl font-bold ${themeTextTitle}`}>Rejestr Dni na Morzu (Seatime Log)</h2>
            <p className={`text-sm max-w-md mx-auto ${themeTextMuted}`}>Ta sekcja pozwoli na dodawanie kontraktów i wyliczanie dni pływania.</p>
            <div className={`p-4 rounded-xl max-w-xs mx-auto border font-mono text-xs ${themeInnerBox}`}>🚀 Moduł w przygotowaniu</div>
          </div>
        )}

        {/* TAB 3: INFO & FORMULARZ KONTAKTOWY */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Lewa strona: Metadane systemu */}
            <div className={`p-6 rounded-2xl border space-y-4 ${themeCard}`}>
              <h2 className={`text-xl font-bold ${themeTextTitle}`}>O systemie Crew App</h2>
              <p className={`text-sm ${themeTextMuted} leading-relaxed`}>
                Aplikacja stworzona specjalnie dla marynarzy, oficerów oraz kadry offshore, aby zapewnić pełne bezpieczeństwo ważności certyfikatów STCW, książeczek żeglarskich oraz paszportów na całym świecie.
              </p>
              <div className="text-xs space-y-2 font-mono pt-2 text-slate-400 border-t border-slate-500/10">
                <p>📍 Wersja aplikacji: <span className="text-[#4EA8DE]">1.3.0-stable</span></p>
                <p>⚓ Tryb pracy: Local Offline Preview</p>
                <p>🔒 Bezpieczeństwo: Brak zewnętrznych trackerów</p>
              </div>
            </div>

            {/* Prawa strona: Formularz kontaktowy */}
            <div className={`p-6 rounded-2xl border space-y-4 ${themeCard}`}>
              <div>
                <h3 className={`text-base font-bold ${themeTextTitle}`}>✉️ Skontaktuj się z nami</h3>
                <p className={`text-xs ${themeTextMuted} mt-0.5`}>Wszystkie pola są opcjonalne. Kliknięcie wyśle e-mail na teamekapp@gmail.com.</p>
              </div>

              <form onSubmit={handleSendEmail} className="space-y-3">
                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${themeTextMuted}`}>Tytuł wiadomości</label>
                  <input 
                    type="text" 
                    placeholder="np. Sugestia zmian, błąd w aplikacji..." 
                    className={`w-full p-2 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-[#4EA8DE] transition ${themeInput}`}
                    value={contactTitle}
                    onChange={(e) => setContactTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${themeTextMuted}`}>Treść wiadomości</label>
                  <textarea 
                    rows={3}
                    placeholder="Wpisz treść swojej wiadomości tutaj..." 
                    className={`w-full p-2 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-[#4EA8DE] transition resize-none ${themeInput}`}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${themeTextMuted}`}>Twój Email</label>
                    <input 
                      type="email" 
                      placeholder="nazwisko@crew.com" 
                      className={`w-full p-2 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-[#4EA8DE] transition ${themeInput}`}
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${themeTextMuted}`}>Twój Telefon (Tel)</label>
                    <input 
                      type="tel" 
                      placeholder="+48 000 000 000" 
                      className={`w-full p-2 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-[#4EA8DE] transition ${themeInput}`}
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#4EA8DE] hover:bg-[#5FA8D3] text-[#0B132B] font-bold text-xs py-2.5 rounded-lg transition shadow-md mt-2"
                >
                  ✉️ Send (Wyślij wiadomość)
                </button>
              </form>
            </div>

          </div>
        )}

      </main>

      {/* BUTTON ADD (+) */}
      {activeTab === 'documents' && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-30 pointer-events-none">
          <button onClick={openAddModal} className="pointer-events-auto w-16 h-16 bg-[#4EA8DE] hover:bg-[#5FA8D3] text-[#0B132B] rounded-full flex items-center justify-center text-4xl font-bold shadow-lg transition-all transform hover:scale-110 active:scale-95">+</button>
        </div>
      )}

      {/* MODAL PODGLĄDU / EDYCJI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#1C2541] w-full max-w-md rounded-2xl border border-[#3A506B] shadow-2xl overflow-hidden my-auto text-[#E2E8F0]">
            <div className="bg-[#151D33] p-4 border-b border-[#3A506B] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#4EA8DE]">
                {!editingDoc ? '⚓ Nowy dokument' : isEditMode ? '✏️ Edycja danych' : '🪪 Podgląd danych'}
              </h2>
              <div className="flex items-center gap-2">
                {editingDoc && !isEditMode && (
                  <button type="button" onClick={() => setIsEditMode(true)} className="text-[#8892B0] hover:text-white p-2 hover:bg-[#0B132B] rounded-lg border border-[#3A506B] transition text-sm flex items-center gap-1">✏️ Edytuj</button>
                )}
                <button onClick={() => setIsModalOpen(false)} className="text-[#A9BCD0] hover:text-white text-xl p-1">✕</button>
              </div>
            </div>

            <form onSubmit={handleSaveDocument} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A9BCD0] mb-1">Rodzaj dokumentu *</label>
                <select disabled={!isEditMode} className="w-full p-2.5 bg-[#0B132B] border border-[#3A506B] rounded-lg text-white text-sm" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  {PREDEFINED_DOCUMENTS.map((item, index) => <option key={index} value={item}>{item}</option>)}
                </select>
              </div>

              {selectedType === "Inny (Wpisz własną nazwę)..." && (
                <div>
                  <label className="block text-xs font-medium text-amber-400 mb-1">Wpisz własną nazwę dokumentu *</label>
                  <input type="text" required disabled={!isEditMode} placeholder="np. Specjalistyczny kurs offshore" className="w-full p-2.5 bg-[#0B132B] border border-amber-500/50 rounded-lg text-white text-sm" value={customName} onChange={(e) => setCustomName(e.target.value)} />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#A9BCD0] mb-1">Numer dokumentu</label>
                <input type="text" disabled={!isEditMode} placeholder="Wpisz pełny numer certyfikatu..." className="w-full p-2.5 bg-[#0B132B] border border-[#3A506B] rounded-lg text-white text-sm font-mono" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A9BCD0] mb-1">Urząd wydający</label>
                <input type="text" disabled={!isEditMode} placeholder="np. Urząd Morski Gdynia" className="w-full p-2.5 bg-[#0B132B] border border-[#3A506B] rounded-lg text-white text-sm" value={issuingAuthority} onChange={(e) => setIssuingAuthority(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#A9BCD0] mb-1">Data wydania</label>
                  <input type="date" disabled={!isEditMode} className="w-full p-2.5 bg-[#0B132B] border border-[#3A506B] rounded-lg text-white text-sm color-scheme-dark" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-[#A9BCD0]">Data ważności *</label>
                    <label className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4EA8DE] cursor-pointer">
                      <input type="checkbox" disabled={!isEditMode} checked={isUnlimited} onChange={(e) => setIsUnlimited(e.target.checked)} className="rounded bg-[#0B132B] border-[#3A506B] text-[#4EA8DE] focus:ring-0" />
                      ♾️ Unlimited
                    </label>
                  </div>
                  <input type="date" required={!isUnlimited} disabled={!isEditMode || isUnlimited} className="w-full p-2.5 bg-[#0B132B] border border-[#3A506B] rounded-lg text-white text-sm color-scheme-dark disabled:opacity-40" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A9BCD0] mb-1">Czas przypomnienia *</label>
                <select disabled={!isEditMode || isUnlimited} className="w-full p-2.5 bg-[#0B132B] border border-[#3A506B] rounded-lg text-white text-sm disabled:opacity-40" value={isUnlimited ? 0 : reminderDays} onChange={(e) => setReminderDays(Number(e.target.value))}>
                  {isUnlimited ? (
                    <option value={0}>Brak przypomnień (Bezterminowy)</option>
                  ) : (
                    <>
                      <option value={180}>6 miesięcy przed końcem</option>
                      <option value={90}>3 miesiące przed końcem</option>
                      <option value={30}>30 dni przed końcem</option>
                      <option value={7}>7 dni przed końcem</option>
                    </>
                  )}
                </select>
              </div>

              {/* SEKCJA ZDJĘĆ */}
              <div className="border-t border-[#3A506B]/40 pt-4">
                <label className="block text-xs font-medium text-[#A9BCD0] mb-2">Zdjęcia / Skany dokumentu ({photosList.length})</label>
                <div className="space-y-3">
                  {isEditMode && (
                    <label className="w-full flex flex-col items-center justify-center p-3 bg-[#0B132B] border border-dashed border-[#3A506B] hover:border-[#4EA8DE] rounded-xl cursor-pointer text-center text-xs text-[#A9BCD0] transition">
                      <span className="text-xl mb-1">📸 Dodaj kolejne zdjęcie / stronę</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleMultiplePhotosChange} />
                    </label>
                  )}

                  {photosList.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 bg-[#0B132B]/50 p-2 rounded-xl border border-[#3A506B]/30">
                      {photosList.map((url, index) => (
                        <div key={index} className="relative aspect-square bg-black rounded-lg border border-[#3A506B] overflow-hidden group">
                          <img src={url} alt={`Skan ${index + 1}`} onClick={() => setFullscreenPhoto(url)} className="w-full h-full object-cover cursor-zoom-in group-hover:opacity-80 transition" />
                          {isEditMode && (
                            <button type="button" onClick={() => removePhoto(index)} className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold">✕</button>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-slate-400 py-0.5">str. {index + 1}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-[#3A506B]/20">
                {isEditMode ? (
                  <>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => editingDoc ? setIsEditMode(false) : setIsModalOpen(false)} className="w-1/3 bg-transparent border border-[#3A506B] text-[#A9BCD0] text-sm py-2.5 rounded-lg">Anuluj</button>
                      <button type="submit" className="w-2/3 bg-[#4EA8DE] hover:bg-[#5FA8D3] text-[#0B132B] text-sm font-bold py-2.5 rounded-lg transition shadow-md">Zapisz dane</button>
                    </div>
                    {editingDoc && <button type="button" onClick={triggerDelete} className="w-full bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60 text-xs py-2 rounded-lg mt-1 transition font-medium">🗑️ Usuń ten dokument z bazy</button>}
                  </>
                ) : (
                  <button type="button" onClick={() => setIsModalOpen(false)} className="w-full bg-[#3A506B] hover:bg-[#4A6280] text-white text-sm font-semibold py-2.5 rounded-lg transition">Zamknij podgląd</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL POTWIERDZENIA USUNIĘCIA */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#1C2541] border border-rose-500/30 w-full max-w-sm rounded-xl p-6 text-center shadow-2xl text-white">
            <div className="text-3xl mb-2 text-rose-400">⚠️</div>
            <h3 className="text-base font-bold mb-2">Czy na pewno chcesz usunąć?</h3>
            <p className="text-xs text-[#A9BCD0] mb-5 leading-relaxed">Usuwasz dokument: <br/><span className="text-white font-semibold font-mono text-[13px]">{documents.find(d => d.id === docToDeleteId)?.name}</span>.<br/>Ta operacja jest nieodwracalna.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="w-1/2 bg-[#0B132B] border border-[#3A506B] text-[#A9BCD0] text-xs py-2.5 rounded-lg font-semibold">Anuluj</button>
              <button onClick={confirmDelete} className="w-1/2 bg-rose-600 hover:bg-rose-500 text-white text-xs py-2.5 rounded-lg font-bold shadow-md">Tak, usuń bezpowrotnie</button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN PHOTO */}
      {fullscreenPhoto && (
        <div className="fixed inset-0 bg-black/95 flex flex-col justify-center items-center p-4 z-50 cursor-zoom-out" onClick={() => setFullscreenPhoto(null)}>
          <div className="absolute top-4 right-4 bg-[#1C2541] border border-[#3A506B] text-white rounded-full p-2.5 w-10 h-10 flex items-center justify-center font-bold text-sm shadow-lg">✕</div>
          <img src={fullscreenPhoto} alt="Pełny skan dokumentu" className="max-w-full max-h-[85vh] object-contain rounded-lg border border-[#3A506B]/40 shadow-2xl" />
        </div>
      )}

    </div>
  );
}