'use client';

import { useState } from 'react';
import { getDaysLeft, getDocumentStatus } from '@/utils/dateHelpers';

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
    name: "Książeczka Żeglarska (Seaman's Book)",
    docNumber: 'POL-123456',
    issuingAuthority: 'Urząd Morski w Gdyni',
    issueDate: '2021-12-31',
    expiryDate: '2026-12-31',
    reminderDays: 180,
    imageUrl: 'has_photo', 
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
    imageUrl: null, 
    createdAt: new Date().toISOString(),
  },
];

export default function Dashboard() {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Stan zdjęć
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Stan formularza
  const [selectedType, setSelectedType] = useState(PREDEFINED_DOCUMENTS[0]);
  const [customName, setCustomName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [reminderDays, setReminderDays] = useState(90);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file)); 
    }
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = selectedType === "Inny (Wpisz własną nazwę)..." ? customName : selectedType;
    if (!finalName || !expiryDate) return;

    const newDoc = {
      id: crypto.randomUUID(),
      name: finalName,
      docNumber,
      issuingAuthority,
      issueDate,
      expiryDate,
      reminderDays: Number(reminderDays),
      imageUrl: photoPreview,
      createdAt: new Date().toISOString(),
    };

    setDocuments([newDoc, ...documents]);
    
    // Reset formularza
    setSelectedType(PREDEFINED_DOCUMENTS[0]);
    setCustomName('');
    setDocNumber('');
    setIssuingAuthority('');
    setIssueDate('');
    setExpiryDate('');
    setReminderDays(90);
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-[#E2E8F0] pb-36 relative">
      
      {/* HEADER Z MENU ☰ */}
      <header className="bg-[#1C2541] border-b border-[#3A506B] shadow-md p-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => alert('Menu boczne (karty) zostanie podłączone wkrótce!')} className="text-2xl text-[#4EA8DE] hover:text-[#5FA8D3] p-1 transition-colors">
            ☰
          </button>
          <h1 className="text-lg md:text-xl font-bold tracking-wide flex-1 text-[#4EA8DE]">
            ⚓ Śledzenie Dokumentów
          </h1>
          <span className="text-xs bg-[#3A506B] px-3 py-1 rounded-full text-[#90E0EF]">Morski Nocny</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="space-y-6">
          
          {/* PRZEŁĄCZNIK WIDOKU */}
          <div className="flex justify-between items-center border-b border-[#3A506B]/40 pb-3">
            <h2 className="text-base font-semibold text-[#A9BCD0]">
              Twoje dokumenty ({documents.length})
            </h2>
            
            <div className="bg-[#1C2541] p-1 rounded-lg border border-[#3A506B] flex items-center gap-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded-md text-xs transition ${viewMode === 'list' ? 'bg-[#4EA8DE] text-[#0B132B] font-bold' : 'text-[#A9BCD0] hover:text-white'}`}
              >
                ☰ Paski
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-md text-xs transition ${viewMode === 'grid' ? 'bg-[#4EA8DE] text-[#0B132B] font-bold' : 'text-[#A9BCD0] hover:text-white'}`}
              >
                ⚃ Kafelki
              </button>
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="bg-[#1C2541] p-12 rounded-xl border border-dashed border-[#3A506B] text-center text-[#A9BCD0]">
              Brak dokumentów. Kliknij „+”, aby dodać pierwszy certyfikat.
            </div>
          ) : viewMode === 'grid' ? (
            
            /* ================= WIDOK: KAFELKI ================= */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => {
                const daysLeft = getDaysLeft(doc.expiryDate);
                const isExpired = daysLeft < 0;

                return (
                  <div key={doc.id} className="bg-[#1C2541] border border-[#3A506B] rounded-2xl p-5 flex flex-col justify-between shadow-lg relative group hover:border-[#4EA8DE] transition duration-200 min-h-[220px]">
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl p-2 bg-[#0B132B] rounded-xl border border-[#3A506B]/60 text-[#4EA8DE]">🪪</div>
                        {doc.imageUrl && (
                          <span className="text-[10px] bg-[#4EA8DE]/20 text-[#4EA8DE] border border-[#4EA8DE]/40 px-1.5 py-0.5 rounded-md font-medium">FOTO ✔</span>
                        )}
                      </div>
                      <button onClick={() => handleDelete(doc.id)} className="text-slate-500 hover:text-rose-400 p-1 transition opacity-60 group-hover:opacity-100">🗑️</button>
                    </div>

                    <div className="space-y-2 flex-1">
                      <h3 className="font-bold text-white text-base leading-tight line-clamp-2">{doc.name}</h3>
                      <div className="text-xs space-y-0.5 text-[#A9BCD0] font-mono bg-[#0B132B]/50 p-2 rounded-lg border border-[#3A506B]/30">
                        {doc.docNumber && <p className="text-white font-semibold"><span className="text-slate-500 font-normal">Nr:</span> {doc.docNumber}</p>}
                        {doc.issuingAuthority && <p className="truncate"><span className="text-slate-500 font-normal">Wydawca:</span> {doc.issuingAuthority}</p>}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#3A506B]/40 space-y-2">
                      <div className="flex justify-between text-[11px] text-[#A9BCD0]">
                        <span>Wydany: {doc.issueDate || '—'}</span>
                        <span className="font-medium text-white">Do: {doc.expiryDate}</span>
                      </div>
                      <div className={`w-full text-center py-1.5 rounded-lg text-xs font-semibold border ${isExpired ? 'bg-rose-950/40 text-rose-400 border-rose-800' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800'}`}>
                        {isExpired ? `Wygasł (${Math.abs(daysLeft)} dni)` : `Zostało dni: ${daysLeft}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            
            /* ================= WIDOK: PASKI ================= */
            <div className="space-y-3">
              {documents.map((doc) => {
                const daysLeft = getDaysLeft(doc.expiryDate);
                const isExpired = daysLeft < 0;

                return (
                  <div key={doc.id} className="bg-[#1C2541] p-4 rounded-xl border border-[#3A506B] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#4EA8DE] transition shadow-md">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="text-xl p-2 bg-[#0B132B] rounded-lg border border-[#3A506B]/60 text-[#4EA8DE]">📄</div>
                      <div className="space-y-0.5">
                        <h3 className="font-semibold text-white text-sm sm:text-base">{doc.name}</h3>
                        <p className="text-xs text-[#90E0EF] font-mono">Nr: {doc.docNumber || '—'} | Do: {doc.expiryDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#3A506B]/30 pt-2 sm:pt-0">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${isExpired ? 'bg-rose-950/50 text-rose-400 border-rose-800' : 'bg-emerald-950/50 text-emerald-400 border-emerald-800'}`}>
                        {isExpired ? `Wygasł` : `Zostało ${daysLeft} dni`} {doc.imageUrl && '📷'}
                      </div>
                      <button onClick={() => handleDelete(doc.id)} className="text-slate-400 hover:text-rose-400 p-1">🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 🔘 PRZYWRÓCONY I WYSTRZELONY W GÓRĘ PRZYCISK DODAWANIA (+) */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="pointer-events-auto w-16 h-16 bg-[#4EA8DE] hover:bg-[#5FA8D3] text-[#0B132B] rounded-full flex items-center justify-center text-4xl font-bold shadow-[0_10px_30px_rgba(78,168,222,0.6)] transition-all transform hover:scale-110 active:scale-95"
          title="Dodaj nowy dokument"
        >
          +
        </button>
      </div>

      {/* 📋 POP-UP MODALNY Z SEKCJĄ FOTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#1C2541] w-full max-w-md rounded-2xl border border-[#3A506B] shadow-2xl overflow-hidden my-auto">
            
            <div className="bg-[#151D33] p-4 border-b border-[#3A506B] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#4EA8DE]">⚓ Dodaj dokument</h2>
              <button onClick={() => { setIsModalOpen(false); setPhotoPreview(null); }} className="text-[#A9BCD0] hover:text-white text-xl p-1">✕</button>
            </div>

            <form onSubmit={handleAddDocument} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A9BCD0] mb-1">Rodzaj dokumentu *</label>
                <select className="w-full p-2.5 bg-[#0B132B] border border-[#3A506B] rounded-lg text-white text-sm" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  {PREDEFINED_DOCUMENTS.map((item, index) => <option key={index} value={item}>{item}</option>)}
                </select>
              </div>

              {selectedType === "Inny (Wpisz własną nazwę)..." && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-medium text-amber-400 mb-1">Wpisz własną nazwę dokumentu *</label>
                  <input type="text" required placeholder="np. Specjalistyczny kurs offshore" className="w-full p-2.5 bg-[#0B132B] border border-amber-500/50 rounded-lg text-white text-sm" value={customName} onChange={(e) => setCustomName(e.target.value)} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#A9BCD0] mb-1">Numer dokumentu</label>
                  <input type="text" placeholder="np. ABC-123" className="w-full p-2.5 bg-[#0B132B] border border-[#3A506B] rounded-lg text-white text-sm" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A9BCD0] mb-1">Urząd wydający</label>
                  <input type="text" placeholder="np. UM Gdynia" className="w-full p-2.5 bg-[#0B132B] border border-[#3A506B] rounded-lg text-white text-sm" value={issuingAuthority} onChange={(e) => setIssuingAuthority(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#A9BCD0] mb-1">Data wydania</label>
                  <input type="date" className="w-full p-2.5 bg-[#0B132B] border border-[#3A506B] rounded-lg text-white text-sm color-scheme-dark" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A9BCD0] mb-1">Data ważności *</label>
                  <input type="date" required className="w-full p-2.5 bg-[#0B132B] border border-[#3A506B] rounded-lg text-white text-sm color-scheme-dark" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A9BCD0] mb-1">Czas przypomnienia *</label>
                <select className="w-full p-2.5 bg-[#0B132B] border border-[#3A506B] rounded-lg text-white text-sm" value={reminderDays} onChange={(e) => setReminderDays(Number(e.target.value))}>
                  <option value={180}>6 miesięcy przed końcem</option>
                  <option value={90}>3 miesiące przed końcem</option>
                  <option value={30}>30 dni przed końcem</option>
                  <option value={7}>7 dni przed końcem</option>
                </select>
              </div>

              {/* STREFA APARATU / ZDJĘĆ */}
              <div className="border-t border-[#3A506B]/40 pt-4">
                <label className="block text-xs font-medium text-[#A9BCD0] mb-2">Zdjęcie / Skan dokumentu</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex flex-col items-center justify-center p-3 bg-[#0B132B] border border-dashed border-[#3A506B] hover:border-[#4EA8DE] rounded-xl cursor-pointer text-center text-xs text-[#A9BCD0] transition">
                    <span className="text-xl mb-1">📸</span>
                    <span>Zrób zdjęcie lub wybierz plik</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>

                  {photoPreview && (
                    <div className="w-16 h-16 bg-black border border-[#3A506B] rounded-xl overflow-hidden relative flex-shrink-0">
                      <img src={photoPreview} alt="Podgląd" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setSelectedPhoto(null); setPhotoPreview(null); }} className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs hover:text-rose-400">✕</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setIsModalOpen(false); setPhotoPreview(null); }} className="w-1/3 bg-transparent border border-[#3A506B] text-[#A9BCD0] text-sm py-2.5 rounded-lg">Anuluj</button>
                <button type="submit" className="w-2/3 bg-[#4EA8DE] hover:bg-[#5FA8D3] text-[#0B132B] text-sm font-bold py-2.5 rounded-lg transition shadow-md">Zapisz dokument</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}