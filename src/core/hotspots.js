// Fractions of the original image plane, not of the browser viewport.
// Only pictured objects receive an art hotspot; the desk dock can test every model.
const points=items=>items.map(([id,x,y])=>({id,x,y}));
export const HOTSPOTS={
 library:points([['clock',.565,.529],['notebook',.512,.606],['cd',.167,.49],['tea',.635,.574],['tv',.245,.415],['calendar',.297,.239],['lamp',.665,.41],['bin',.897,.807]]),
 cafe:points([['clock',.348,.593],['notebook',.39,.667],['tea',.432,.625],['lamp',.284,.523],['bin',.825,.617]]),
 garden:points([['clock',.557,.585],['notebook',.469,.694],['tea',.639,.667],['lamp',.383,.456],['bin',.047,.829],['calendar',.145,.24],['tv',.102,.439]]),
 beach:points([['clock',.64,.461],['notebook',.547,.562],['tea',.72,.523],['lamp',.741,.309],['bin',.041,.794],['calendar',.798,.555],['tv',.126,.288]]),
 classroom:points([['clock',.345,.637],['notebook',.355,.772],['tea',.459,.688],['lamp',.228,.484],['bin',.78,.68]]),
 living:points([['tv',.905,.399],['lamp',.104,.467],['tea',.668,.597],['notebook',.58,.691],['bin',.977,.826]]),
 colourful:points([['notebook',.255,.806],['lamp',.134,.641],['bin',.93,.805]]),
 rooftop:points([['tv',.818,.599],['lamp',.397,.457],['tea',.353,.565],['notebook',.282,.607],['bin',.689,.785]]),
 park:points([['clock',.602,.555],['notebook',.533,.691],['tea',.687,.623],['lamp',.754,.434],['bin',.148,.828],['calendar',.23,.218],['tv',.144,.301]])
};
