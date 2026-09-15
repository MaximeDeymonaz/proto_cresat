// Calque d'ambiance (fond relief) : voile uniforme + vignettage.
// Purement décoratif — sans interaction.
export function Atmosphere() {
  return (
    <div className="map-atmosphere" aria-hidden="true">
      <div className="atmo-tint" />
      <div className="atmo-vignette" />
    </div>
  );
}
