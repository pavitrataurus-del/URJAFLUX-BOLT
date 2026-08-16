const fs = require('fs');

const content = fs.readFileSync('src/modules/client/ClientDashboard.tsx', 'utf8');

const newRender = `
  if (viewingUnified) {
    return (
      <UnifiedDashboard
        client={client}
        properties={properties}
        reports={reports}
        onBack={() => setViewingUnified(false)}
      />
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in zoom-in duration-500">
      {/* Back button & Title Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 sticky top-0 bg-slate-50 z-10 pt-4 -mt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <User className="w-6 h-6 text-emerald-600" />
              {client.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              CLIENT ID: {client.id.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
          <span>REPORT LANGUAGE:</span>
          <span className="text-emerald-600 font-bold">{preferredLanguage.toUpperCase()}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <ClientProfile client={client} onUpdate={onUpdateClient} />
        <UniversalBirthRegistry client={client} properties={properties} onUpdateClient={onUpdateClient} />
        <ClientProperties client={client} properties={clientProperties} onAddProperty={onAddProperty} onDeleteProperty={onDeleteProperty} />
        <ClientActivity client={client} onUpdateClient={onUpdateClient} />
        <ClientDocuments client={client} onUpdateClient={onUpdateClient} />
        <ClientNotes client={client} onUpdateClient={onUpdateClient} />
      </div>
    </div>
  );
};
`;

const splitIdx = content.indexOf('  if (viewingUnified) {');
if (splitIdx !== -1) {
  const newContent = content.substring(0, splitIdx) + newRender;
  fs.writeFileSync('src/modules/client/ClientDashboard.tsx', newContent);
  console.log('ClientDashboard.tsx updated.');
} else {
  console.log('Could not find split index.');
}
