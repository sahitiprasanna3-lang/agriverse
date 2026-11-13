import neemBioPesticideImg from '../assets/images/neem_bio_pesticide_1793299990457.jpg';
import fungicidePowderPouchImg from '../assets/images/fungicide_powder_pouch_1793299991262.jpg';
import insecticideSprayBottleImg from '../assets/images/insecticide_spray_bottle_1793299993973.jpg';
import systemicFungicideEcImg from '../assets/images/systemic_fungicide_ec_1793299996286.jpg';
import foliarNutrientPackImg from '../assets/images/foliar_nutrient_pack_1793299995557.jpg';

export interface ProductVisualMeta {
  imageUrl: string;
  packTypeLabel: string;
}

export function getPesticideVisual(product: {
  id?: string;
  activeIngredient?: string;
  productCategory?: string;
}): ProductVisualMeta {
  const key = `${product.id || ''} ${product.activeIngredient || ''} ${product.productCategory || ''}`.toLowerCase();

  if (
    key.includes('azadirachtin') ||
    key.includes('neem') ||
    key.includes('botanical') ||
    key.includes('spinosad') ||
    key.includes('biological')
  ) {
    return {
      imageUrl: neemBioPesticideImg,
      packTypeLabel: 'Liquid Bio-Concentrate (EC / SC)',
    };
  }

  if (
    key.includes('copper') ||
    key.includes('mancozeb') ||
    key.includes('tricyclazole') ||
    key.includes('metalaxyl') ||
    key.includes('wp')
  ) {
    return {
      imageUrl: fungicidePowderPouchImg,
      packTypeLabel: 'Wettable Powder Pouch (WP)',
    };
  }

  if (
    key.includes('propiconazole') ||
    key.includes('sulphur') ||
    key.includes('wdg') ||
    key.includes('miticide') ||
    key.includes('triazole')
  ) {
    return {
      imageUrl: systemicFungicideEcImg,
      packTypeLabel: 'Systemic Fungicide / Miticide (EC / WDG)',
    };
  }

  if (
    key.includes('emamectin') ||
    key.includes('flonicamid') ||
    key.includes('insecticide') ||
    key.includes('sg') ||
    key.includes('wg')
  ) {
    return {
      imageUrl: insecticideSprayBottleImg,
      packTypeLabel: 'Soluble Granule Insecticide (SG / WG)',
    };
  }

  return {
    imageUrl: fungicidePowderPouchImg,
    packTypeLabel: 'CIB&RC Approved Formulation',
  };
}

export function getNutrientVisual(nutrient?: {
  id?: string;
  nutrientName?: string;
  category?: string;
}): ProductVisualMeta {
  const name = (nutrient?.nutrientName || '').toLowerCase();
  const packTypeLabel = name.includes('boron') || name.includes('zinc')
    ? 'Chelated Micronutrient Foliar Grade'
    : '100% Water-Soluble Foliar Grade';

  return {
    imageUrl: foliarNutrientPackImg,
    packTypeLabel,
  };
}

/**
 * Generates a realistic synthetic "photo of a mobile phone screen displaying a crop"
 * on an HTML5 canvas (with phone bezel, speaker notch, status bar, moiré scanlines, and glass glare)
 * so farmers/testers can verify mobile-screen spoofing rejection in 1 click.
 */
export function buildMobileScreenSpoofSampleDataUrl(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 540;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Desk background
  const deskGrad = ctx.createLinearGradient(0, 0, 720, 540);
  deskGrad.addColorStop(0, '#cbd5e1');
  deskGrad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = deskGrad;
  ctx.fillRect(0, 0, 720, 540);

  // Smartphone outer body / bezel
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(195, 28, 330, 484, 34);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#334155';
  ctx.stroke();

  // Smartphone screen area
  ctx.fillStyle = '#14532d';
  ctx.beginPath();
  ctx.roundRect(210, 54, 300, 430, 18);
  ctx.fill();

  // Simulated crop leaf inside phone screen
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.ellipse(360, 275, 95, 135, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#854d0e';
  ctx.beginPath();
  ctx.arc(340, 250, 14, 0, Math.PI * 2);
  ctx.arc(385, 295, 18, 0, Math.PI * 2);
  ctx.fill();

  // Top mobile status bar & punch-hole camera notch
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(210, 54, 300, 28);
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.arc(360, 68, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('11:42  5G', 224, 72);
  ctx.fillText('94%', 468, 72);

  // Bottom Android/iOS navigation bar & gallery icons
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(210, 438, 300, 46);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(320, 472, 80, 4);
  ctx.font = '11px sans-serif';
  ctx.fillText('< Gallery  •  crop_photo.jpg  •  Share', 252, 458);

  // Screen RGB scanlines / moiré grid + diagonal glass reflection glare
  ctx.strokeStyle = 'rgba(255,255,255,0.09)';
  ctx.lineWidth = 1;
  for (let y = 84; y < 438; y += 4) {
    ctx.beginPath();
    ctx.moveTo(210, y);
    ctx.lineTo(510, y);
    ctx.stroke();
  }

  const glare = ctx.createLinearGradient(210, 60, 490, 420);
  glare.addColorStop(0, 'rgba(255,255,255,0.34)');
  glare.addColorStop(0.35, 'rgba(255,255,255,0.06)');
  glare.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glare;
  ctx.fillRect(210, 54, 300, 430);

  return canvas.toDataURL('image/jpeg', 0.9);
}
