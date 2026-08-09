import {
  Building,
  Building2,
  CarFront,
  DoorOpen,
  Flame,
  Fence,
  Layers3,
  LayoutDashboard,
  Palette,
  Plus,
  Ruler,
  Square,
  Sun,
  Trash2,
  TreePine,
  Trees,
  UtensilsCrossed,
  Warehouse,
  Waves,
} from "lucide-react";

import {
  ARCHITECTURE_LIMITS,
  MAX_FLOORS,
  formatMoney,
  metricsOf,
  priceBreakdown,
  roomTypeOf,
} from "../lib/design";
import {
  DOOR_STYLES,
  MATERIALS,
  ROOF_STYLES,
  WINDOW_FRAMES,
  WINDOW_STYLES,
} from "../data/materials";
import { ROOM_CATEGORIES, ROOM_TYPES } from "../data/roomTypes";
import { layoutFloor } from "../lib/layout";

import {
  ColorField,
  OptionGrid,
  Panel,
  SectionTitle,
  Segmented,
  Slider,
  Stepper,
  SwatchGrid,
  Toggle,
} from "./ui";

const FLOOR_LABELS = ["Ground", "Level 2", "Level 3", "Level 4", "Level 5"];

export function floorLabel(index) {
  return FLOOR_LABELS[index] || `Level ${index + 1}`;
}

export function ArchitecturePanel({ design, change, setFloors }) {
  const a = design.architecture;

  return (
    <Panel title="Architecture" description="Massing, storeys and roof form.">
      <SectionTitle icon={Ruler} title="Footprint" hint={`${(a.width * a.length).toFixed(0)} m²`} />

      <Slider
        label="Width"
        value={a.width}
        {...ARCHITECTURE_LIMITS.width}
        suffix=" m"
        onChange={(value) => change("width", value)}
      />

      <Slider
        label="Length"
        value={a.length}
        {...ARCHITECTURE_LIMITS.length}
        suffix=" m"
        onChange={(value) => change("length", value)}
      />

      <Slider
        label="Floor to floor"
        value={a.floorHeight}
        {...ARCHITECTURE_LIMITS.floorHeight}
        suffix=" m"
        onChange={(value) => change("floorHeight", value)}
      />

      <SectionTitle icon={Building} title="Storeys" />

      <Segmented
        ariaLabel="Number of storeys"
        value={a.floors}
        onChange={setFloors}
        options={Array.from({ length: MAX_FLOORS }, (_, index) => ({
          value: index + 1,
          label: index + 1,
          hint: index === 0 ? "Single" : `${index + 1} levels`,
        }))}
      />

      <SectionTitle icon={Building2} title="Massing" />

      <Slider
        label="Upper level setback"
        value={a.upperSetback}
        {...ARCHITECTURE_LIMITS.upperSetback}
        suffix=" m"
        hint="Steps the upper storeys back from the ground floor."
        onChange={(value) => change("upperSetback", value)}
      />

      <Toggle
        label="Raised plinth"
        hint="Lifts the building on a stone base"
        active={a.plinth}
        onClick={() => change("plinth", !a.plinth)}
      />

      <SectionTitle icon={Layers3} title="Roof" />

      <OptionGrid
        options={ROOF_STYLES}
        value={a.roofStyle}
        onChange={(value) => change("roofStyle", value)}
      />

      {a.roofStyle !== "flat" && (
        <Slider
          label="Roof pitch"
          value={a.roofPitch}
          {...ARCHITECTURE_LIMITS.roofPitch}
          suffix="°"
          onChange={(value) => change("roofPitch", value)}
        />
      )}

      <Slider
        label="Eaves overhang"
        value={a.roofOverhang}
        {...ARCHITECTURE_LIMITS.roofOverhang}
        suffix=" m"
        onChange={(value) => change("roofOverhang", value)}
      />
    </Panel>
  );
}

export function MaterialsPanel({ design, change }) {
  const a = design.architecture;

  return (
    <Panel title="Materials" description="Facade finish and colour palette.">
      <SectionTitle icon={Palette} title="Facade" />

      <SwatchGrid
        options={MATERIALS}
        value={a.facadeMaterial}
        onChange={(material) => {
          change("facadeMaterial", material.id);
          change("facadeColor", material.color);
        }}
      />

      <ColorField
        label="Facade colour"
        value={a.facadeColor}
        onChange={(value) => change("facadeColor", value)}
      />

      <ColorField label="Roof colour" value={a.roofColor} onChange={(value) => change("roofColor", value)} />

      <ColorField label="Door colour" value={a.doorColor} onChange={(value) => change("doorColor", value)} />
    </Panel>
  );
}

export function OpeningsPanel({ design, change }) {
  const a = design.architecture;

  return (
    <Panel title="Openings" description="Glazing, frames and the front entry.">
      <SectionTitle icon={Square} title="Window style" />

      <OptionGrid options={WINDOW_STYLES} value={a.windowStyle} onChange={(value) => change("windowStyle", value)} />

      <Slider
        label="Glazing ratio"
        value={a.windowRatio}
        {...ARCHITECTURE_LIMITS.windowRatio}
        onChange={(value) => change("windowRatio", value)}
        hint="How much of each structural bay is glass."
      />

      <SwatchGrid
        options={WINDOW_FRAMES}
        value={a.windowFrame}
        onChange={(frame) => change("windowFrame", frame.id)}
      />

      <ColorField label="Glass tint" value={a.windowColor} onChange={(value) => change("windowColor", value)} />

      <SectionTitle icon={DoorOpen} title="Front door" />

      <OptionGrid options={DOOR_STYLES} value={a.doorStyle} onChange={(value) => change("doorStyle", value)} />
    </Panel>
  );
}

export function FeaturesPanel({ design, change }) {
  const features = design.features;

  return (
    <Panel title="Features" description="Everything outside the main envelope.">
      <SectionTitle icon={CarFront} title="Vehicles" />

      <Stepper
        icon={CarFront}
        label="Garage bays"
        value={features.garages}
        min={0}
        max={4}
        onChange={(value) => change("garages", value)}
      />

      <Toggle
        icon={Warehouse}
        label="Driveway"
        active={features.driveway}
        onClick={() => change("driveway", !features.driveway)}
      />

      <SectionTitle icon={Building2} title="Outdoor rooms" />

      <Stepper
        icon={Building2}
        label="Balconies"
        hint={design.architecture.floors < 2 ? "Needs 2+ storeys" : undefined}
        value={features.balcony}
        min={0}
        max={4}
        onChange={(value) => change("balcony", value)}
      />

      <Toggle
        icon={Square}
        label="Rear terrace"
        active={features.terrace}
        onClick={() => change("terrace", !features.terrace)}
      />

      <Toggle
        icon={Trees}
        label="Pergola"
        hint="Shade structure over the terrace"
        active={features.pergola}
        onClick={() => change("pergola", !features.pergola)}
      />

      <Toggle
        icon={Warehouse}
        label="Entry porch"
        active={features.porch}
        onClick={() => change("porch", !features.porch)}
      />

      <Toggle
        icon={UtensilsCrossed}
        label="Outdoor kitchen"
        active={features.outdoorKitchen}
        onClick={() => change("outdoorKitchen", !features.outdoorKitchen)}
      />

      <SectionTitle icon={TreePine} title="Landscape" />

      <Toggle
        icon={Waves}
        label="Swimming pool"
        active={features.pool}
        onClick={() => change("pool", !features.pool)}
      />

      <Toggle
        icon={TreePine}
        label="Planting & trees"
        active={features.garden}
        onClick={() => change("garden", !features.garden)}
      />

      <Toggle
        icon={Fence}
        label="Boundary fence"
        active={features.fence}
        onClick={() => change("fence", !features.fence)}
      />

      <SectionTitle icon={Flame} title="Building services" />

      <Toggle
        icon={Flame}
        label="Chimney & fireplace"
        active={features.chimney}
        onClick={() => change("chimney", !features.chimney)}
      />

      <Toggle
        icon={Sun}
        label="Solar array"
        hint="Flat roofs only"
        active={features.solar}
        onClick={() => change("solar", !features.solar)}
      />
    </Panel>
  );
}

export function RoomsPanel({
  design,
  addRoom,
  removeRoom,
  changeRoom,
  selectedFloor,
  setSelectedFloor,
  selectedRoomId,
  setSelectedRoomId,
}) {
  const rooms = design.rooms.filter((room) => room.floor === selectedFloor);
  const layout = layoutFloor(design, selectedFloor);
  const plate = layout.inner.width * layout.inner.length;
  const requested = rooms.reduce((total, room) => total + room.width * room.length, 0);

  return (
    <Panel title="Rooms" description="Rooms are packed into the floor plate automatically.">
      <SectionTitle icon={LayoutDashboard} title="Level" />

      <Segmented
        ariaLabel="Selected level"
        value={selectedFloor}
        onChange={setSelectedFloor}
        options={Array.from({ length: design.architecture.floors }, (_, index) => ({
          value: index,
          label: floorLabel(index),
        }))}
      />

      <div className={`plate-usage${requested > plate ? " over" : ""}`}>
        <div>
          <span>Requested area</span>
          <strong>{requested.toFixed(1)} m²</strong>
        </div>

        <div>
          <span>Available plate</span>
          <strong>{plate.toFixed(1)} m²</strong>
        </div>

        <p>
          {requested > plate
            ? "Rooms exceed the floor plate — they are scaled down to fit. Enlarge the footprint for true sizes."
            : "All rooms fit within this level."}
        </p>
      </div>

      <SectionTitle icon={Plus} title="Add a room" />

      {ROOM_CATEGORIES.map((category) => (
        <div className="room-category" key={category}>
          <h4>{category}</h4>

          <div className="room-add-grid">
            {ROOM_TYPES.filter((type) => type.category === category).map((type) => (
              <button key={type.id} type="button" onClick={() => addRoom(type.id)}>
                <type.icon size={14} aria-hidden />
                {type.name}
              </button>
            ))}
          </div>
        </div>
      ))}

      <SectionTitle icon={LayoutDashboard} title={`${floorLabel(selectedFloor)} · ${rooms.length} rooms`} />

      {rooms.length === 0 && <p className="empty-room">Nothing here yet. Add a room above.</p>}

      {rooms.map((room) => {
        const type = roomTypeOf(room.type);

        return (
          <article
            key={room.id}
            className={`room-editor${selectedRoomId === room.id ? " selected" : ""}`}
            onFocus={() => setSelectedRoomId(room.id)}
            onMouseEnter={() => setSelectedRoomId(room.id)}
          >
            <header>
              <type.icon size={15} aria-hidden />

              <input
                value={room.name}
                aria-label="Room name"
                onChange={(event) => changeRoom(room.id, "name", event.target.value)}
              />

              <button type="button" aria-label={`Remove ${room.name}`} onClick={() => removeRoom(room.id)}>
                <Trash2 size={14} />
              </button>
            </header>

            <Slider
              label="Width"
              value={room.width}
              min={type.minWidth}
              max={type.maxWidth}
              step={0.5}
              suffix=" m"
              onChange={(value) => changeRoom(room.id, "width", value)}
            />

            <Slider
              label="Length"
              value={room.length}
              min={type.minLength}
              max={type.maxLength}
              step={0.5}
              suffix=" m"
              onChange={(value) => changeRoom(room.id, "length", value)}
            />

            <label className="room-floor">
              Level
              <select
                value={room.floor}
                onChange={(event) => changeRoom(room.id, "floor", Number(event.target.value))}
              >
                {Array.from({ length: design.architecture.floors }, (_, index) => (
                  <option key={index} value={index}>
                    {floorLabel(index)}
                  </option>
                ))}
              </select>
            </label>
          </article>
        );
      })}
    </Panel>
  );
}

export function CostPanel({ design }) {
  const { items, total } = priceBreakdown(design);
  const metrics = metricsOf(design);

  return (
    <Panel title="Cost estimate" description="Indicative build cost from the current configuration.">
      <div className="cost-total">
        <span>Estimated build</span>
        <strong>{formatMoney(total)}</strong>
        <small>{formatMoney(total / metrics.floorArea)} per m² over {metrics.floorArea.toFixed(0)} m²</small>
      </div>

      <ul className="cost-list">
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.label}</span>
            <strong>{formatMoney(item.amount)}</strong>
          </li>
        ))}
      </ul>

      <p className="cost-note">
        Estimates are indicative only and exclude land, site works, permits and finishes selections.
      </p>
    </Panel>
  );
}
