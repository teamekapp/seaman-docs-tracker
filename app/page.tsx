
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

// Zmieniłem przykładowe daty, aby od razu było widać poprawne sortowanie w podglądzie
const INITIAL_DOCUMENTS = [
  {
    id: '1',
    name: "Paszport",
    docNumber: 'PAS-789101',
    issuingAuthority: 'MSWiA',
    issueDate: '2018-01-01',
    expiryDate: '2028-01-01', // Dłuższa data - poleci na dół
    reminderDays: 90,
    imageUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: "Książeczka Żeglarska (Seaman's Book)",
    docNumber: 'POL-123456',
    issuingAuthority: 'Urząd Morski w Gdyni',
    issueDate: '2021-12-31',
    expiryDate: '2026-12-31', // Średnia data - będzie pośrodku
    reminderDays: 180,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Świadectwo Zdrowia (Medical Certificate)',
    docNumber: 'MED-5544-A',
    issuingAuthority: 'Lekarz Uprawniony MSWiA',
    issueDate: '2024-05-10',
    expiryDate: '2026-05-10', // Najwcześniejsza data ważności - wskoczy na samą górę!
    reminderDays: 30,
    imageUrl: null, 
    createdAt: new Date().toISOString(),
  },
];

interface DocumentType {
  id: string;
  name: string;
  docNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  reminderDays: number;
  imageUrl: string | null;
  createdAt: string;
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<DocumentType[]>(INITIAL_DOCUMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentType | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docToDeleteId, setDocToDeleteId] = useState<string | null>(null);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState(PREDEFINED_DOCUMENTS[0]);
  const [customName, setCustomName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [reminderDays, setReminderDays] = useState(90);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Funkcja pomocnicza sortująca dokumenty od najkrótszej daty ważności
  const getSortedDocuments = () => {
    return [...documents].sort((a, b) => {
      return getDaysLeft(a.expiryDate) - getDaysLeft(b.expiryDate);
    });
  };

  const openAddModal = () => {
    setEditingDoc(null);
    setSelectedType(PREDEFINED_DOCUMENTS[0]);
    setCustomName('');
    setDocNumber('');
    setIssuingAuthority('');
    setIssueDate('');
    setExpiryDate('');
    setReminderDays(90);
    setPhotoPreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (doc: DocumentType) => {
    setEditingDoc(doc);
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
    setExpiryDate(doc.expiryDate);
    setReminderDays(doc.reminderDays);
    setPhotoPreview(doc.imageUrl);
    setIsModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoPreview(URL.createObjectURL(file)); 
    }
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = selectedType === "Inny (Wpisz własną nazwę)..." ? customName : selectedType;
    if (!finalName || !expiryDate) return;

    if (editingDoc) {
      setDocuments(documents.map(doc => doc.id === editingDoc.id ? {
        ...doc,
        name: finalName,
        docNumber,
        issuingAuthority,
        issueDate,
        expiryDate,
        reminderDays: Number(reminderDays),
        imageUrl: photoPreview,
      } : doc));
    } else {
      const newDoc: DocumentType = {
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

  // Pobieramy posortowaną listę do renderowania interfejsu
  const sortedDocs = getSortedDocuments();

  return (
    <div className="min-h-screen bg-[#0B132B] text-[#E2E8F0] pb-36 relative">
      
      <header className="bg-[#1C2541] border-b border-[#3A506B] shadow-md p-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => alert('Menu boczne zostanie podłączone w Dniu 3!')} className="text-2xl text-[#4EA8DE] hover:text-[#5FA8D3] p-1 transition-colors">
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
          
          <div className="flex justify-between items-center border-b border-[#3A506B]/40 pb-3">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-[#A9BCD0]">
                Twoje dokumenty ({documents.length})
              </h2>
              <p className="text-[11px] text-[#4EA8DE] flex items-center gap-1 font-medium">
                ⏱️ Posortowane od najkrótszej walidacji
              </p>
            </div>
            
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

          {sortedDocs.length === 0 ? (
            <div className="bg-[#1C2541] p-12 rounded-xl border border-dashed border-[#3A506B] text-center text-[#A9BCD0]">
              Brak dokumentów. Kliknij „+”, aby dodać pierwszy certyfikat.
            </div>
          ) : viewMode === 'grid' ? (
            
 /* ================= WIDOK: KAFELKI (POSORTOWANY) ================= */
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {sortedDocs.map((doc) => {
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
         <button onClick={() => openEditModal(doc)} className="text-[#4EA8DE] hover:text-[#5FA8D3] p-1.5 bg-[#0B132B] rounded-lg border border-[#3A506B] transition" title="Edytuj dokument">✏️</button>
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

/* ================= WIDOK: PASKI (POSORTOWANY) ================= */
<div className="space-y-3">
 {sortedDocs.map((doc) => {
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
         <button onClick={() => openEditModal(doc)} className="text-[#4EA8DE] hover:text-[#5FA8D3] p-1.5 bg-[#0B132B] rounded-lg border border-[#3A506B] transition">✏️ Edytuj</button>
       </div>
     </div>
   );
 })}
</div>
)}
</div>
</main>

{/* 🔘 PRZYCISK DODAWANIA (+) */}
<div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
<button 
onClick={openAddModal} 
className="pointer-events-auto w-16 h-16 bg-[#4EA8DE] hover:bg-[#5FA8D3] text-[#0B132B] rounded-full flex items-center justify-center text-4xl font-bold shadow-[0_10px_30px_rgba(78,168,222,0.6)] transition-all transform hover:scale-110 active:scale-95"
>
+
</button>
</div>

{/* 📋 MODAL (DODAWANIE / EDYCJA) */}
{isModalOpen && (
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
<div className="bg-[#1C2541] w-full max-w-md rounded-2xl border border-[#3A506B] shadow-2xl overflow-hidden my-auto">

<div className="bg-[#151D33] p-4 border-b border-[#3A506B] flex justify-between items-center">
 <h2 className="text-lg font-bold text-[#4EA8DE]">
   {editingDoc ? '✏️ Edytuj dokument' : '⚓ Dodaj dokument'}
 </h2>
 <button onClick={() => setIsModalOpen(false)} className="text-[#A9BCD0] hover:text-white text-xl p-1">✕</button>
</div>

<form onSubmit={handleSaveDocument} className="p-6 space-y-4">
 <div>
   <label className="block text-xs font-medium text-[#A9BCD0] mb-1">Rodzaj dokumentu *</label>
   <select className="w-full p-2.5 bg-[#0B132B] border border-[#3A506B] rounded-lg text-white text-sm" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
     {PREDEFINED_DOCUMENTS.map((item, index) => <option key={index} value={item}>{item}</option>)}
   </select>
 </div>

 {selectedType === "Inny (Wpisz własną nazwę)..." && (
   <div>
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

 <div className="border-t border-[#3A506B]/40 pt-4">
   <label className="block text-xs font-medium text-[#A9BCD0] mb-2">Zdjęcie / Skan dokumentu</label>
   <div className="flex items-center gap-4">
     <label className="flex-1 flex flex-col items-center justify-center p-3 bg-[#0B132B] border border-dashed border-[#3A506B] hover:border-[#4EA8DE] rounded-xl cursor-pointer text-center text-xs text-[#A9BCD0] transition">
       <span className="text-xl mb-1">📸</span>
       <span>Zmień lub dodaj skan</span>
       <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
     </label>

     {photoPreview && (
       <div 
         onClick={() => setFullscreenPhoto(photoPreview)}
         className="w-16 h-16 bg-black border border-[#4EA8DE] rounded-xl overflow-hidden relative flex-shrink-0 cursor-zoom-in group"
         title="Kliknij, aby powiększyć zdjęcie"
       >
         <img src={photoPreview} alt="Podgląd" className="w-full h-full object-cover group-hover:opacity-80 transition" />
         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition">🔍</div>
       </div>
     )}
   </div>
 </div>

 <div className="flex flex-col gap-2 pt-2 border-t border-[#3A506B]/20">
   <div className="flex gap-3">
     <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/3 bg-transparent border border-[#3A506B] text-[#A9BCD0] text-sm py-2.5 rounded-lg">Anuluj</button>
     <button type="submit" className="w-2/3 bg-[#4EA8DE] hover:bg-[#5FA8D3] text-[#0B132B] text-sm font-bold py-2.5 rounded-lg transition shadow-md">
       {editingDoc ? 'Zapisz zmiany' : 'Zapisz dokument'}
     </button>
   </div>
   
   {editingDoc && (
     <button 
       type="button" 
       onClick={triggerDelete}
       className="w-full bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60 text-xs py-2 rounded-lg mt-1 transition font-medium"
     >
       🗑️ Usuń ten dokument z bazy
     </button>
   )}
 </div>
</form>
</div>
</div>
)}

{/* 🚨 MODAL POTWIERDZENIA USUNIĘCIA */}
{showDeleteConfirm && (
<div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
<div className="bg-[#1C2541] border border-rose-500/30 w-full max-w-sm rounded-xl p-6 text-center shadow-2xl">
<div className="text-3xl mb-2 text-rose-400">⚠️</div>
<h3 className="text-base font-bold text-white mb-2">Czy na pewno chcesz usunąć?</h3>
<p className="text-xs text-[#A9BCD0] mb-5 leading-relaxed">
 Usuwasz dokument: <br/><span className="text-white font-semibold font-mono text-[13px]">{documents.find(d => d.id === docToDeleteId)?.name}</span>.<br/> 
 Ta operacja jest całkowicie nieodwracalna.
</p>
<div className="flex gap-3">
 <button 
   onClick={() => setShowDeleteConfirm(false)} 
   className="w-1/2 bg-[#0B132B] border border-[#3A506B] text-[#A9BCD0] text-xs py-2.5 rounded-lg font-semibold"
 >
   Anuluj
 </button>
 <button 
   onClick={confirmDelete} 
   className="w-1/2 bg-rose-600 hover:bg-rose-500 text-white text-xs py-2.5 rounded-lg font-bold shadow-md shadow-rose-900/40"
 >
   Tak, usuń bezpowrotnie
 </button>
</div>
</div>
</div>
)}

{/* 🖼️ PEŁNOEKRANOWY PODGLĄD CAŁEGO ZDJĘCIA */}
{fullscreenPhoto && (
<div 
className="fixed inset-0 bg-black/95 flex flex-col justify-center items-center p-4 z-50 cursor-zoom-out"
onClick={() => setFullscreenPhoto(null)}
>
<div className="absolute top-4 right-4 bg-[#1C2541] border border-[#3A506B] text-white rounded-full p-2.5 w-10 h-10 flex items-center justify-center font-bold text-sm shadow-lg">
✕
</div>
<img 
src={fullscreenPhoto} 
alt="Pełny skan dokumentu" 
className="max-w-full max-h-[85vh] object-contain rounded-lg border border-[#3A506B]/40 shadow-2xl"
/>
<p className="text-xs text-[#A9BCD0] mt-3 bg-[#1C2541]/80 px-4 py-1.5 rounded-full border border-[#3A506B]/30 font-sans">
Kliknij w dowolnym miejscu, aby zamknąć podgląd skanu
</p>
</div>
)}

</div>
);
}