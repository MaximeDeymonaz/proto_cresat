import { makeCloudTexture } from './cloudTexture';

// Textures de nuages générées une fois par session (bruit toroïdal → sans couture)
let cloudTextures: { a: string; b: string; c: string } | null = null;
function getCloudTextures() {
  cloudTextures ??= {
    a: makeCloudTexture({ seed: 11, baseCells: 3, octaves: 4 }),
    b: makeCloudTexture({ seed: 37, baseCells: 4, octaves: 3, threshold: 0.55 }),
    c: makeCloudTexture({ seed: 73, baseCells: 2, octaves: 4, color: [199, 217, 230], threshold: 0.50, softness: 0.34 }),
  };
  return cloudTextures;
}

// Calque d'ambiance (fond relief) : nappes de nuages dérivantes, voile froid,
// vignettage. Purement décoratif — sans interaction.
export function Atmosphere() {
  const clouds = getCloudTextures();
  return (
    <div className="map-atmosphere" aria-hidden="true">
      <div className="atmo-cloud atmo-cloud--a" style={{ backgroundImage: `url(${clouds.a})` }} />
      <div className="atmo-cloud atmo-cloud--b" style={{ backgroundImage: `url(${clouds.b})` }} />
      <div className="atmo-cloud atmo-cloud--c" style={{ backgroundImage: `url(${clouds.c})` }} />
      <div className="atmo-tint" />
      <div className="atmo-vignette" />
    </div>
  );
}
