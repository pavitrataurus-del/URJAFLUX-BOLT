const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');

const newRender = `
  // If not logged in, render the login card terminal
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const topNavLinks = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "clients", label: "Clients", icon: Users },
    { id: "workspace", label: "Architecture & Vastu Studio", icon: Compass },
    { id: "analysis", label: "Analysis Hub", icon: Brain },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "documents", label: "Documents", icon: Database },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const allowedNavLinks = topNavLinks.filter(link => {
    if (activeUserRole === "Visitor" || activeUserRole === "Report Customer") {
      return ["dashboard", "settings"].includes(link.id);
    }
    if (activeUserRole === "Premium Member") {
      return ["dashboard", "reports", "settings"].includes(link.id);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-600 selection:text-white flex flex-col">
      {/* Premium Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-tight text-slate-900 font-mono leading-none">URJAFLUX AI OS</h1>
                  <span className="text-[9px] font-mono text-emerald-600 font-bold tracking-widest mt-0.5 inline-block">COMMERCIAL EDITION</span>
                </div>
              </div>
              
              {/* Desktop Nav */}
              <nav className="hidden md:flex space-x-1">
                {allowedNavLinks.map(link => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.id}
                      onClick={() => setActiveView(link.id)}
                      className={\`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 \${
                        activeView === link.id
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }\`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN BODY WORKSPACE CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 overflow-y-auto">
        {/* 1. DASHBOARD VIEW */}
        {activeView === "dashboard" && (
          <DashboardPage
            clients={clients}
            properties={properties}
            reports={reports}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onNavigate={(view) => {
              if (view === "add_client") {
                setStartWithAddClient(true);
                setActiveView("clients");
              } else if (view === "add_property") {
                setActiveView("properties");
              } else {
                setActiveView(view);
              }
            }}
            activeUserRole={activeUserRole}
          />
        )}

        {/* 2. CLIENTS DIRECTORY VIEW */}
        {activeView === "clients" && (
          <ClientsPage
            clients={clients}
            properties={properties}
            reports={reports}
            onClientsChange={setClients}
            onPropertiesChange={setProperties}
            onReportsChange={setReports}
            onNavigateToReports={(reportId) => {
              setActiveView("reports");
            }}
            startWithAddClient={startWithAddClient}
            clearStartWithAddClient={() => setStartWithAddClient(false)}
          />
        )}

        {/* 3. PROPERTIES VIEW */}
        {activeView === "properties" && (
          <PropertiesPage
            properties={properties}
            clients={clients}
            onAddProperty={handleAddProperty}
            onEditProperty={handleEditProperty}
            onDeleteProperty={handleDeleteProperty}
            onSelectPropertyToCalibrate={handleSelectPropertyToCalibrate}
          />
        )}

        {/* PROJECTS ENGINE VIEW */}
        {activeView === "projects" && (
          <ProjectsPage
            projects={projects}
            setProjects={setProjects}
            clients={clients}
            properties={properties}
            onNavigateToWorkspace={(prop) => {
              setActiveProperty(prop);
              setActiveView("workspace");
            }}
          />
        )}

        {/* 4. WORKSPACE / SRE VIEW (Architecture & Vastu Studio) */}
        {activeView === "workspace" && (
          <WorkspacePage
            properties={properties}
            clients={clients}
            activeProperty={activeProperty}
            onSetActiveProperty={setActiveProperty}
            onUpdatePropertyOffset={handleUpdatePropertyOffset}
          />
        )}

        {/* ANALYSIS HUB VIEW */}
        {activeView === "analysis" && (
          <AnalysisHubPage clients={clients} />
        )}

        {/* DOCUMENTS VIEW */}
        {activeView === "documents" && (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Documents Repository</h2>
            <p className="text-slate-500">Centralized document management coming soon.</p>
          </div>
        )}

        {/* 6. REPORTS PREVIEW VIEW */}
        {activeView === "reports" && (
          <ReportsPage
            reports={reports}
            properties={properties}
            clients={clients}
            onAddReport={handleAddReport}
            onDeleteReport={handleDeleteReport}
            onUpdateReportStatus={handleUpdateReportStatus}
          />
        )}

        {/* 7. SETTINGS CONFIG VIEW */}
        {activeView === "settings" && (
          <SettingsPage />
        )}
      </main>
    </div>
  );
}
`;

const splitIdx = content.indexOf('  // If not logged in, render the login card terminal');
if (splitIdx !== -1) {
  const newContent = content.substring(0, splitIdx) + newRender;
  fs.writeFileSync('src/App.tsx', newContent);
  console.log('App.tsx layout replaced successfully.');
} else {
  console.log('Could not find split index.');
}
