export const ASSET_BASE = '/assets/';
export function assetUrl(filename, base = ASSET_BASE) {
  return `${base.replace(/\/?$/, '/')}${filename.split('/').map(encodeURIComponent).join('/')}`;
}
// Original filenames are intentionally preserved. Dimensions refer to the bright image;
// the 1 px source-height differences are normalized into this shared image plane.
export const ROOMS = [
  { id:'library', label:'University Library', bright:'university libary.png', sunset:'university libary sunset.png', width:1670, height:941, verified:true },
  { id:'cafe', label:'University Café', bright:'university cafe.png', sunset:'university cafe sunset.png', width:1672, height:941, verified:true },
  { id:'garden', label:'Botanical Garden', bright:'botanical garden.png', sunset:'botanical garden sunset.png', width:1670, height:942, verified:true },
  { id:'beach', label:'Beachside', bright:'Beachside.png', sunset:'beachside sunset.png', width:1670, height:941, verified:true },
  { id:'classroom', label:'University Classroom', bright:'university classroom.png', sunset:'university classroom sunset.png', width:1670, height:941, verified:true },
  { id:'living', label:'Living Room', bright:'Living Room.png', sunset:'living room sunset.png', width:1670, height:942, verified:true },
  { id:'colourful', label:'Colourful Study Room', bright:'Colourful study room.png', sunset:'colorful study room Sunset Light.png', width:1670, height:941, verified:true },
  { id:'rooftop', label:'Rooftop', bright:'rooftop.png', sunset:'rooftop sunset.png', width:1472, height:1068, verified:true },
  { id:'park', label:'Local Park', bright:'local park.png', sunset:'local garden sunset.png', width:1670, height:941, verified:true, notes:'The sunset asset is named local garden sunset.png; visual inspection confirms the same desk, lamp, bridge and pavilion.' },
];
