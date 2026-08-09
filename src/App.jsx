import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Camera,
  ChevronRight,
  Copy,
  DoorOpen,
  Download,
  Grid3x3,
  Home,
  LayoutDashboard,
  Maximize,
  Moon,
  Palette,
  Plus,
  Receipt,
  Redo2,
  RotateCcw,
  Save,
  Settings2,
  Sun,
  Trash2,
  Undo2,
} from "lucide-react";

import { HOUSE_TEMPLATES } from "./data/houseTemplates";
import {
  MAX_FLOORS,
  clamp,
  clone,
  createDesign,
  designFromTemplate,
  formatMoney,
  makeRoom,
  metricsOf,
  migrateDesign,
  newId,
  priceOf,
} from "./lib/design";
import Scene, { CAMERA_VIEWS } from "./three/Scene";
import FloorPlan from "./components/FloorPlan";
import {
  ArchitecturePanel,
  CostPanel,
  FeaturesPanel,
  MaterialsPanel,
  OpeningsPanel,
  RoomsPanel,
  floorLabel,
} from "./components/panels";

import "./index.css";

const STORAGE_KEY = "buildmyhome.projects.v2";
const DRAFT_KEY = "buildmyhome.draft.v2";

const TOOLS = [
  { id: "architecture", label: "Architecture", icon: Building2 },
  { id: "rooms", label: "Rooms", icon: LayoutDashboard },
  { id: "materials", label: "Materials", icon: Palette },
  { id: "openings", label: "Openings", icon: DoorOpen },
  { id: "features", label: "Features", icon: Settings2 },
  { id: "cost", label: "Cost", icon: Receipt },
];

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — the session still works in memory */
  }
}

export default function App() {
  const [design, setDesign] = useState(() => {
    const draft = readStorage(DRAFT_KEY, null);
    return draft ? migrateDesign(draft) : createDesign();
  });

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const [page, setPage] = useState("explore");
  const [tool, setTool] = useState("architecture");
  const [view, setView] = useState("3d");
  const [camera, setCamera] = useState("perspective");
  const [night, setNight] = useState(false);
  const [grid, setGrid] = useState(false);

  const [selectedFloor, setSelectedFloor] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const [projects, setProjects] = useState(() =>
    readStorage(STORAGE_KEY, []).map((project) => migrateDesign(project))
  );

  const [toast, setToast] = useState(null);
  const viewerRef = useRef(null);

  const price = useMemo(() => priceOf(design), [design]);
  const metrics = useMemo(() => metricsOf(design), [design]);

  useEffect(() => {
    writeStorage(DRAFT_KEY, design);
  }, [design]);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    document.documentElement.dataset.theme = night ? "night" : "day";
  }, [night]);

  const commit = useCallback((next) => {
    setDesign((current) => {
      setHistory((entries) => [...entries.slice(-49), current]);
      setFuture([]);
      return next;
    });
  }, []);

  const changeArchitecture = useCallback(
    (key, value) => {
      commit({ ...design, architecture: { ...design.architecture, [key]: value } });
    },
    [commit, design]
  );

  const changeFeature = useCallback(
    (key, value) => {
      commit({ ...design, features: { ...design.features, [key]: value } });
    },
    [commit, design]
  );

  const setFloors = useCallback(
    (count) => {
      const floors = clamp(count, 1, MAX_FLOORS);

      commit({
        ...design,
        architecture: { ...design.architecture, floors },
        rooms: design.rooms.map((room) => ({ ...room, floor: Math.min(room.floor, floors - 1) })),
      });

      setSelectedFloor((current) => Math.min(current, floors - 1));
    },
    [commit, design]
  );

  const addRoom = useCallback(
    (typeId) => {
      const room = makeRoom(typeId, Math.min(selectedFloor, design.architecture.floors - 1));

      commit({ ...design, rooms: [...design.rooms, room] });
      setSelectedRoomId(room.id);
    },
    [commit, design, selectedFloor]
  );

  const removeRoom = useCallback(
    (id) => {
      commit({ ...design, rooms: design.rooms.filter((room) => room.id !== id) });
    },
    [commit, design]
  );

  const changeRoom = useCallback(
    (id, key, value) => {
      commit({
        ...design,
        rooms: design.rooms.map((room) => (room.id === id ? { ...room, [key]: value } : room)),
      });
    },
    [commit, design]
  );

  const undo = useCallback(() => {
    setHistory((entries) => {
      if (entries.length === 0) return entries;

      const previous = entries[entries.length - 1];

      setDesign((current) => {
        setFuture((items) => [current, ...items]);
        return previous;
      });

      return entries.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((entries) => {
      if (entries.length === 0) return entries;

      const [next, ...rest] = entries;

      setDesign((current) => {
        setHistory((items) => [...items, current]);
        return next;
      });

      return rest;
    });
  }, []);

  const save = useCallback(() => {
    const saved = { ...clone(design), id: newId(), savedAt: new Date().toISOString() };
    const next = [saved, ...projects].slice(0, 40);

    setProjects(next);
    writeStorage(STORAGE_KEY, next);
    setToast(`Saved “${design.name}” to your projects`);
  }, [design, projects]);

  const deleteProject = useCallback(
    (id) => {
      const next = projects.filter((project) => project.id !== id);

      setProjects(next);
      writeStorage(STORAGE_KEY, next);
      setToast("Project deleted");
    },
    [projects]
  );

  const chooseTemplate = useCallback(
    (template) => {
      commit(designFromTemplate(template));
      setPage("designer");
      setTool("architecture");
      setSelectedFloor(0);
      setToast(`Loaded ${template.name} — customise anything`);
    },
    [commit]
  );

  const startBlank = useCallback(() => {
    commit(createDesign({ name: "Untitled Residence", rooms: [] }));
    setPage("designer");
    setTool("architecture");
  }, [commit]);

  const exportProject = useCallback(() => {
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${design.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    setToast("Design exported as JSON");
  }, [design]);

  const snapshot = useCallback(() => {
    const canvas = viewerRef.current?.querySelector("canvas");

    if (!canvas) {
      setToast("Switch to the 3D view to take a snapshot");
      return;
    }

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${design.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.click();

    setToast("Snapshot saved");
  }, [design.name]);

  useEffect(() => {
    function onKeyDown(event) {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        save();
        return;
      }

      if (typing || event.metaKey || event.ctrlKey) return;

      if (event.key.toLowerCase() === "n") setNight((value) => !value);
      if (event.key.toLowerCase() === "g") setGrid((value) => !value);
      if (event.key.toLowerCase() === "p") setView((value) => (value === "3d" ? "plan" : "3d"));
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, save, undo]);

  return (
    <div className={night ? "app night" : "app"}>
      <header className="topbar">
        <button type="button" className="logo" onClick={() => setPage("explore")}>
          <span>
            <Home size={19} />
          </span>
          Build<b>MyHome</b>
        </button>

        <nav aria-label="Main">
          {[
            ["explore", "Explore"],
            ["designer", "Designer"],
            ["projects", "My Projects"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={page === id ? "active" : ""}
              aria-current={page === id ? "page" : undefined}
              onClick={() => setPage(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="top-actions">
          <button
            type="button"
            className="icon-btn"
            aria-label={night ? "Switch to daylight" : "Switch to night"}
            onClick={() => setNight(!night)}
          >
            {night ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button type="button" className="save-btn" onClick={save}>
            <Save size={16} />
            Save
          </button>
        </div>
      </header>

      {page === "explore" && (
        <ExplorePage
          design={design}
          price={price}
          metrics={metrics}
          night={night}
          chooseTemplate={chooseTemplate}
          startBlank={startBlank}
        />
      )}

      {page === "designer" && (
        <DesignerPage
          design={design}
          price={price}
          metrics={metrics}
          tool={tool}
          setTool={setTool}
          view={view}
          setView={setView}
          camera={camera}
          setCamera={setCamera}
          night={night}
          grid={grid}
          setGrid={setGrid}
          viewerRef={viewerRef}
          selectedFloor={selectedFloor}
          setSelectedFloor={setSelectedFloor}
          selectedRoomId={selectedRoomId}
          setSelectedRoomId={setSelectedRoomId}
          canUndo={history.length > 0}
          canRedo={future.length > 0}
          undo={undo}
          redo={redo}
          reset={() => commit(createDesign())}
          save={save}
          rename={(name) => setDesign((current) => ({ ...current, name }))}
          exportProject={exportProject}
          snapshot={snapshot}
          changeArchitecture={changeArchitecture}
          changeFeature={changeFeature}
          setFloors={setFloors}
          addRoom={addRoom}
          removeRoom={removeRoom}
          changeRoom={changeRoom}
        />
      )}

      {page === "projects" && (
        <ProjectsPage
          projects={projects}
          night={night}
          setPage={setPage}
          deleteProject={deleteProject}
          load={(project) => {
            commit(migrateDesign(project));
            setPage("designer");
          }}
          duplicate={(project) => {
            const copy = { ...clone(project), id: newId(), name: `${project.name} copy` };
            const next = [copy, ...projects];

            setProjects(next);
            writeStorage(STORAGE_KEY, next);
            setToast("Project duplicated");
          }}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   EXPLORE
========================================================= */

function ExplorePage({ design, price, metrics, night, chooseTemplate, startBlank }) {
  return (
    <main className="explore-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Architectural home design</span>

          <h1>
            Design a home
            <br />
            <em>that is actually yours.</em>
          </h1>

          <p>
            Start from an architectural concept, then change the massing, storeys, roof form, materials,
            glazing and outdoor rooms. Every change is modelled in real time, priced instantly and drawn
            as a floor plan.
          </p>

          <div className="hero-buttons">
            <button type="button" className="primary" onClick={startBlank}>
              <Plus size={18} />
              Start designing
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}
            >
              Browse architecture
              <ChevronRight size={17} />
            </button>
          </div>

          <dl className="stats">
            <div>
              <dt>{MAX_FLOORS}</dt>
              <dd>storeys</dd>
            </div>
            <div>
              <dt>{HOUSE_TEMPLATES.length}</dt>
              <dd>concepts</dd>
            </div>
            <div>
              <dt>{metrics.floorArea.toFixed(0)} m²</dt>
              <dd>current design</dd>
            </div>
          </dl>
        </div>

        <div className="hero-model">
          <span className="model-label">Live architectural model</span>

          <Scene design={design} night={night} autoRotate interactive={false} view="perspective" />

          <div className="model-price">
            <span>Current estimate</span>
            <strong>{formatMoney(price)}</strong>
          </div>
        </div>
      </section>

      <section id="templates" className="templates">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Architectural library</span>
            <h2>
              Start with something <em>beautiful.</em>
            </h2>
          </div>

          <p>
            These are not images. Each concept is a parametric model you can reshape completely — the
            preview below is the same engine that powers the designer.
          </p>
        </div>

        <div className="template-grid">
          {HOUSE_TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} onChoose={() => chooseTemplate(template)} />
          ))}
        </div>
      </section>
    </main>
  );
}

function TemplateCard({ template, onChoose }) {
  const preview = useMemo(() => designFromTemplate(template), [template]);

  return (
    <article className="template-card">
      <div className="template-preview">
        <Scene design={preview} autoRotate interactive={false} showGround={false} />
        <span>{template.category}</span>
      </div>

      <div className="template-content">
        <h3>{template.name}</h3>
        <p>{template.description}</p>

        <ul className="template-meta">
          <li>{template.floors} storeys</li>
          <li>
            {template.width} × {template.length} m
          </li>
          <li>{template.rooms.length} rooms</li>
        </ul>

        <div className="template-footer">
          <strong>From {formatMoney(priceOf(preview))}</strong>

          <button type="button" onClick={onChoose}>
            Customise
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   DESIGNER
========================================================= */

function DesignerPage(props) {
  const {
    design,
    price,
    metrics,
    tool,
    setTool,
    view,
    setView,
    camera,
    setCamera,
    night,
    grid,
    setGrid,
    viewerRef,
    selectedFloor,
    setSelectedFloor,
    selectedRoomId,
    setSelectedRoomId,
    canUndo,
    canRedo,
    undo,
    redo,
    reset,
    save,
    rename,
    exportProject,
    snapshot,
    changeArchitecture,
    changeFeature,
    setFloors,
    addRoom,
    removeRoom,
    changeRoom,
  } = props;

  return (
    <main className="designer">
      <div className="designer-header">
        <div className="project-name">
          <span>Project</span>

          <input value={design.name} aria-label="Project name" onChange={(event) => rename(event.target.value)} />
        </div>

        <div className="history">
          <button type="button" aria-label="Undo" disabled={!canUndo} onClick={undo}>
            <Undo2 size={16} />
          </button>

          <button type="button" aria-label="Redo" disabled={!canRedo} onClick={redo}>
            <Redo2 size={16} />
          </button>

          <button type="button" aria-label="Reset design" onClick={reset}>
            <RotateCcw size={16} />
          </button>

          <button type="button" onClick={snapshot}>
            <Camera size={16} />
            Snapshot
          </button>

          <button type="button" onClick={exportProject}>
            <Download size={16} />
            Export
          </button>

          <button type="button" className="save-btn" onClick={save}>
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="designer-layout">
        <aside className="tool-sidebar" aria-label="Design tools">
          {TOOLS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tool === item.id ? "tool active" : "tool"}
              aria-pressed={tool === item.id}
              onClick={() => setTool(item.id)}
            >
              <item.icon size={19} aria-hidden />
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <section className="viewer-panel">
          <div className="viewer-toolbar">
            <div className="view-tabs">
              <button type="button" className={view === "3d" ? "active" : ""} onClick={() => setView("3d")}>
                3D model
              </button>

              <button type="button" className={view === "plan" ? "active" : ""} onClick={() => setView("plan")}>
                Floor plan
              </button>
            </div>

            {view === "3d" ? (
              <div className="camera-tabs">
                {Object.entries(CAMERA_VIEWS).map(([id, preset]) => (
                  <button
                    key={id}
                    type="button"
                    className={camera === id ? "active" : ""}
                    onClick={() => setCamera(id)}
                  >
                    {preset.label}
                  </button>
                ))}

                <button
                  type="button"
                  className={grid ? "active" : ""}
                  aria-label="Toggle site grid"
                  onClick={() => setGrid(!grid)}
                >
                  <Grid3x3 size={16} />
                </button>
              </div>
            ) : (
              <div className="camera-tabs">
                {Array.from({ length: design.architecture.floors }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={selectedFloor === index ? "active" : ""}
                    onClick={() => setSelectedFloor(index)}
                  >
                    {floorLabel(index)}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              className="icon-btn"
              aria-label="Fullscreen"
              onClick={() => viewerRef.current?.requestFullscreen?.()}
            >
              <Maximize size={17} />
            </button>
          </div>

          <div className="viewer" ref={viewerRef}>
            {view === "3d" ? (
              <Scene design={design} night={night} view={camera} showGrid={grid} />
            ) : (
              <FloorPlan
                design={design}
                floor={selectedFloor}
                selectedRoomId={selectedRoomId}
                onSelectRoom={setSelectedRoomId}
              />
            )}

            <div className="viewer-info">
              <div>
                <span>Footprint</span>
                <strong>
                  {design.architecture.width} × {design.architecture.length} m
                </strong>
              </div>

              <div>
                <span>Floor area</span>
                <strong>{metrics.floorArea.toFixed(0)} m²</strong>
              </div>

              <div>
                <span>Beds / baths</span>
                <strong>
                  {metrics.bedrooms} / {metrics.bathrooms}
                </strong>
              </div>

              <div>
                <span>Ridge height</span>
                <strong>{metrics.height.toFixed(1)} m</strong>
              </div>

              <div className="estimate">
                <span>Estimated build</span>
                <strong>{formatMoney(price)}</strong>
              </div>
            </div>
          </div>
        </section>

        <aside className="properties" aria-label="Properties">
          {tool === "architecture" && (
            <ArchitecturePanel design={design} change={changeArchitecture} setFloors={setFloors} />
          )}

          {tool === "rooms" && (
            <RoomsPanel
              design={design}
              addRoom={addRoom}
              removeRoom={removeRoom}
              changeRoom={changeRoom}
              selectedFloor={selectedFloor}
              setSelectedFloor={setSelectedFloor}
              selectedRoomId={selectedRoomId}
              setSelectedRoomId={setSelectedRoomId}
            />
          )}

          {tool === "materials" && <MaterialsPanel design={design} change={changeArchitecture} />}
          {tool === "openings" && <OpeningsPanel design={design} change={changeArchitecture} />}
          {tool === "features" && <FeaturesPanel design={design} change={changeFeature} />}
          {tool === "cost" && <CostPanel design={design} />}
        </aside>
      </div>

      <p className="shortcuts">
        Shortcuts: <kbd>N</kbd> night · <kbd>G</kbd> grid · <kbd>P</kbd> plan · <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo ·{" "}
        <kbd>Ctrl</kbd>+<kbd>S</kbd> save
      </p>
    </main>
  );
}

/* =========================================================
   PROJECTS
========================================================= */

function ProjectsPage({ projects, night, load, deleteProject, duplicate, setPage }) {
  return (
    <main className="projects-page">
      <div className="page-title">
        <span className="eyebrow">Project library</span>
        <h1>
          My <em>homes</em>
        </h1>
        <p>Saved concepts live in this browser. Export a design to keep a permanent copy.</p>
      </div>

      {projects.length === 0 ? (
        <div className="empty-projects">
          <Home size={40} />
          <h2>No projects yet</h2>
          <p>Save a design from the designer and it will appear here.</p>

          <button type="button" className="primary" onClick={() => setPage("explore")}>
            Explore concepts
          </button>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-preview">
                <Scene design={project} night={night} autoRotate interactive={false} showGround={false} />
              </div>

              <div className="project-info">
                <h3>{project.name}</h3>

                <p>
                  {project.architecture.floors} storeys · {project.rooms.length} rooms ·{" "}
                  {metricsOf(project).floorArea.toFixed(0)} m²
                </p>

                <strong>{formatMoney(priceOf(project))}</strong>

                <div className="project-actions">
                  <button type="button" onClick={() => load(project)}>
                    Edit
                  </button>

                  <button type="button" aria-label="Duplicate project" onClick={() => duplicate(project)}>
                    <Copy size={15} />
                  </button>

                  <button type="button" aria-label="Delete project" onClick={() => deleteProject(project.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
