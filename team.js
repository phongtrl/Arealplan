// Veiledende bemanning for planarbeid. Personintervaller er ikke årsverk.
window.recommendTeam = function(plan, selections, actor) {
  const selected = new Set(selections);
  const has = ids => ids.some(id => selected.has(id));
  const base = {
    endring: [2, 3, 'En avgrenset planendring kan ofte løses av et lite team. Vesentlige virkninger kan kreve samme bredde som en ny plan.'],
    detalj: [3, 4, 'Et lite tverrfaglig kjerneteam følger prosjektet fra oppstart til vedtak.'],
    omr: [4, 6, 'Områderegulering trenger mer koordinering mellom fag, grunneiere og delprosjekter.'],
    kpa: [4, 7, 'Kommuneplanarbeid trenger bred planfaglig kapasitet og tett kobling til kommunens sektorer.']
  }[plan.id];
  const core = [
    {name:'Prosjektleder / oppdragsleder', count:'1', when:'Hele løpet', task:'Styrer mandat, budsjett, fremdrift, risiko, beslutninger og grensesnitt mellom fag.'},
    {name:'Arealplanlegger / planfaglig ansvarlig', count:plan.id === 'kpa' || plan.id === 'omr' ? '1–2' : '1', when:'Oppstart til vedtak', task:'Leder planfaglige vurderinger og utarbeider planbeskrivelse, bestemmelser og svar på innspill.'},
    {name:'GIS / plankart', count:'1', when:'Kartlegging, planforslag og revisjoner', task:'Forvalter kartgrunnlag, analyser, plankart og digitale leveranser.'},
    {name:'Kvalitetssikrer / senior planfaglig støtte', count:'1 ved milepæler', when:'Før oppstart, høring og sluttbehandling', task:'Kontrollerer sammenheng mellom utredninger, plankart og bestemmelser. Sett av en annen person enn den som har utarbeidet leveransen.'}
  ];
  const specialists = [];
  function add(ids, name, count, when, task) {
    const triggers = ids.filter(id => selected.has(id));
    if (triggers.length) specialists.push({name,count,when,task,triggers});
  }
  add(['bolig','fortetting','strand'], 'Arkitekt / landskapsarkitekt', '1–2', 'Tidlig konsept og planforslag', 'Vurderer bebyggelse, stedstilpasning, landskap, utearealer og tilgjengelighet.');
  add(['naering','samferdsel','offentlig'], 'Trafikk- og mobilitetsrådgiver', '1', 'Tidlig avklaring og planforslag', 'Utreder adkomst, trafikksikkerhet, kapasitet, parkering og mobilitet.');
  add(['vann','fritid','flom'], 'VA- og overvannsrådgiver', '1', 'Før arealbruk og høyder låses', 'Avklarer vannforsyning, avløp, overvannsløsninger og nødvendig areal til teknisk infrastruktur.');
  add(['flom'], 'Hydrolog / flomfaglig rådgiver', '1', 'Tidlig fareavklaring', 'Vurderer flomfare og flomveier. Avklar om VA-rådgiver har tilstrekkelig kompetanse, eller om egen spesialist trengs.');
  add(['kvikk'], 'Geotekniker', '1–2', 'Tidlig, før løsning låses', 'Vurderer grunnforhold og områdestabilitet og behov for undersøkelser og kontroll.');
  add(['skred'], 'Skredfaglig rådgiver', '1–2', 'Tidlig fareavklaring', 'Kartlegger aktuelle skredtyper og vurderer faresoner og sikring. Velg kompetanse etter skredtype.');
  add(['natur'], 'Naturforvalter / biolog', '1–2', 'Tidlig; bestill før relevant feltsesong', 'Kartlegger naturverdier, vurderer virkninger og gir grunnlag for tilpasninger og tiltak.');
  add(['kultur'], 'Kulturmiljørådgiver / arkeolog', '1', 'Tidlig avklaring med kulturmiljømyndighet', 'Vurderer kulturmiljø og behov for registreringer. Avklar hvem som kan utføre eventuelle lovpålagte undersøkelser.');
  add(['stoy'], 'Akustiker', '1', 'Konsept og planforslag', 'Utreder støy, tester løsninger og foreslår tiltak og krav.');
  add(['jord'], 'Landbruks- / jordvernfaglig rådgiver', '1', 'Alternativvurdering tidlig i prosessen', 'Vurderer jordressurser, driftsvirkninger, alternativer og avbøtende tiltak.');
  add(['offentlig'], 'Tjeneste- og kapasitetsplanlegger', '1', 'Behovs- og lokaliseringsavklaring', 'Avklarer tjenestebehov, kapasitet og krav sammen med aktuell kommunal sektor.');
  if (plan.ku || has(['samferdsel'])) specialists.unshift({name:'KU-koordinator',count:'1',when:'Avklaring av KU-plikt til ferdig planforslag',task:'Avklarer utredningsbehov og samordner fagutredninger og alternativer. Rollen kan ivaretas av planfaglig ansvarlig.',triggers:[]});
  return {min:base[0],max:base[1],explanation:base[2],core,specialists,actor};
};
