const U = {
  dsb: 'https://dsb.no/siteassets/rapporter-og-publikasjoner/veileder/samfunnssikkerhet-i-kommunens-arealplanlegging.pdf',
  ros1: 'https://www.tynset.kommune.no/_f/p1/ie1135bc6-fc2c-4949-8ab8-397be01da639/ros-analyse-datert-06082021.pdf',
  ros2: 'https://oyer.kommune.no/_f/p3/i8a6348bf-6a51-4b57-8ec4-78550eeed091/ros-analyse-datert-23112023.pdf',
  ku20: 'https://cms12.regjeringen.no/contentassets/296b832d6e5643fbae3aed0650f60636/no/pdfs/07_ku-veileder-februar-2020-godkjent-av-pol.pdf',
  m1941: 'https://www.miljodirektoratet.no/ansvarsomrader/overvaking-arealplanlegging/arealplanlegging/konsekvensutredninger/',
  kuf: 'https://lovdata.no/forskrift/2017-06-21-854',
  rp22: 'https://cms12.regjeringen.no/contentassets/2804283df64641cea321fdcdcac779f4/reguleringsplan_2022.pdf',
  pb: 'https://www.tonsberg.kommune.no/_f/p1/i97ce0701-8ff1-42a0-a692-89984c2b95b0/planbeskrivelse.pdf',
  best: 'https://trondheim.kommune.no/globalassets/10-bilder-og-filer/10-byutvikling/byplankontoret/1b_off-ettersyn/2017/sentervegen-gnrbnr-315580-r20160015/3_planbestemmelser.pdf',
  krist: 'https://www.kristiansund.kommune.no/_f/p1/i02c6fa23-a7b0-4c50-8956-a8c1e7527a1a/veileder-for-utarbeidelse-av-private-reguleringsplaner-mv-kristiansund-kommune-plan-og-byggesak-rev-02042024.pdf',
  bu: 'https://www.regjeringen.no/no/dokumenter/veileder-om-barn-og-unge-i-plan-og-byggesak/id3118518/'
};

window.GUIDER = [
{
  id: 'ros', navn: 'ROS-analyse', hjemmel: ['pbl § 4-3', 'pbl § 12-6'],
  hva: 'En risiko- og sårbarhetsanalyse kartlegger hva som kan gå galt i og rundt planområdet, hvor sannsynlig det er, og hvor alvorlige følgene blir. Analysen viser om arealet er egnet til formålet og hvilke tiltak som må sikres i plankart og bestemmelser. Den er et kunnskapsgrunnlag, og funnene må faktisk påvirke planen.',
  nar: ['Alle planer for utbygging. Planmyndigheten skal påse at analysen gjennomføres.', 'Ved endring av plan når endringen kan påvirke risikobildet.', 'Områder med fare, risiko eller sårbarhet skal avmerkes som hensynssoner i planen.'],
  innhold: [
    ['Avgrensning og forutsetninger', 'Hva analysen omfatter, hvilket formål den bygger på, hvilke datakilder som er brukt og hvem som har deltatt.'],
    ['Uønskede hendelser', 'Naturfare (flom, skred, overvann, havnivå, vind), virksomhetsrisiko (trafikkulykker, brann, farlig industri, kraftlinjer) og sårbare funksjoner (vann, strøm, adkomst for nødetater). Ta også med hendelser planen selv kan føre til utenfor området.'],
    ['Sannsynlighet og konsekvens', 'Hver hendelse vurderes for sannsynlighet og for konsekvens for liv og helse, stabilitet og materielle verdier. Begrunn vurderingen med kilder, for eksempel NVE-kart, grunnundersøkelser og hendelseslogger.'],
    ['Risikomatrise', 'Sammenstilling som viser hvilke hendelser som krever tiltak. Bruk skalaene i DSB-veilederen slik at vurderingene kan etterprøves.'],
    ['Tiltak', 'Konkrete tiltak per hendelse, og hvor de sikres: hensynssone, bestemmelse, rekkefølgekrav eller plankart. Vis restrisikoen etter tiltak.'],
    ['Konklusjon og oppfølging', 'Om området er egnet, hva som gjenstår og hvem som følger opp i byggesaken.']],
  steg: ['Avklar omfang og kunnskapsgrunnlag i oppstartsmøtet.', 'Kartlegg hendelser med sjekkliste og kartinnsyn (NVE, NGU, Kartverket, kommunens egne data).', 'Vurder sannsynlighet og konsekvens, og sammenstill i en matrise.', 'Foreslå tiltak og legg dem inn i plankart og bestemmelser.', 'Legg analysen ved høringen, og oppdater den etter innspill og endringer.'],
  feil: ['Generisk mal uten tilpasning til stedet.', 'Tiltak som står i analysen, men ikke i bestemmelsene.', 'Klimaendringer og overvann er ikke vurdert.', 'Analysen er ikke oppdatert etter at planen ble endret.', 'Vurderinger uten kilder som ikke kan etterprøves.'],
  l: [['DSB-veileder (PDF)', U.dsb], ['Eksempel: Svelland, Tynset', U.ros1], ['Eksempel: Søre Grønåsen, Øyer', U.ros2]]
},
{
  id: 'ku', navn: 'Konsekvensutredning', hjemmel: ['pbl § 4-2', 'KU-forskriften'],
  hva: 'En konsekvensutredning beskriver virkningene planen kan få for miljø og samfunn, og sammenligner alternativer. Den skal gi beslutningstakere og berørte et godt grunnlag før planen vedtas, og vise hvordan hensynet til miljø og samfunn er ivaretatt. Utredningen kan ligge i planbeskrivelsen eller i et eget dokument.',
  nar: ['Kommuneplanens arealdel, og områderegulering som fastsetter rammer for tiltak i vedlegg I og II i forskriften.', 'Reguleringsplaner for tiltak i vedlegg I, for eksempel store veg- og industritiltak.', 'Reguleringsplaner for tiltak i vedlegg II når tiltaket kan få vesentlige virkninger. Vurderingen gjøres tidlig, helst i oppstartsmøtet.', 'Kunngjøringen av planoppstart må opplyse om at planen behandles etter forskriften.'],
  innhold: [
    ['Planen og alternativene', 'Formål og innhold, utbyggingsprogram og alternative utforminger eller lokaliseringer. Nullalternativet (ingen utbygging) beskrives som sammenligningsgrunnlag.'],
    ['Dagens situasjon og verdier', 'Hvert tema beskrives med verdi: landskap, naturmangfold, kulturmiljø, friluftsliv, jord- og skogbruk, vannmiljø, forurensing, støy, transport, klima og samfunnsforhold.'],
    ['Virkninger', 'Omfanget av endringen vurderes mot verdien, og sammen gir de konsekvensen. Modellen fra Statens vegvesens håndbok V712 er mye brukt. Vurder også samlet belastning og virkninger i anleggsfasen.'],
    ['Avbøtende tiltak', 'Tiltak som reduserer negative virkninger, og hvordan de sikres i plankart og bestemmelser.'],
    ['Samlet vurdering', 'Alternativene sammenlignes og anbefalt løsning begrunnes. Usikkerhet og kunnskapshull oppgis.'],
    ['Metode og oppfølging', 'Kilder og metode, og behov for overvåking eller etterundersøkelser.']],
  steg: ['Vurder KU-plikt i oppstartsmøtet og dokumenter vurderingen.', 'Kunngjør oppstart med opplysning om at planen behandles etter forskriften.', 'Lag planprogram der det kreves, og få det fastsatt.', 'Gjennomfør utredningene for alle alternativer med samme metode.', 'Legg utredningen ut til høring sammen med planforslaget.', 'Vis i planbeskrivelsen hvordan utredningen har påvirket valgt løsning.'],
  feil: ['Utredningen kommer for sent til å påvirke valg av løsning.', 'Bare ett reelt alternativ er utredet.', 'Temaene er behandlet uten vurdering av verdi og omfang.', 'Samlet belastning på området er ikke vurdert.', 'Avbøtende tiltak er nevnt, men ikke sikret i planen.'],
  l: [['KU-veileder (2020, PDF)', U.ku20], ['Miljødirektoratet: konsekvensutredning', U.m1941], ['KU-forskriften på Lovdata', U.kuf]]
},
{
  id: 'planprogram', navn: 'Planprogram', hjemmel: ['pbl § 4-1'],
  hva: 'Planprogrammet er en plan for selve planarbeidet. Det beskriver formål, rammer, alternativer, hvilke tema som skal utredes og hvordan medvirkningen skal skje. Hensikten er å avklare tidlig hva planen skal handle om, slik at utredningene blir målrettede og berørte kan påvirke opplegget.',
  nar: ['Regionale planer og kommuneplaner, og reguleringsplaner som kan få vesentlige virkninger for miljø og samfunn. Sjekk gjeldende ordlyd i § 4-1 og KU-forskriften.', 'Planprogrammet utarbeides som en del av varslingen av planoppstart.'],
  innhold: [
    ['Bakgrunn og formål', 'Hvorfor planen lages og hva den skal oppnå.'],
    ['Planområde og avgrensning', 'Kart og beskrivelse av området, og hva som påvirkes utenfor det.'],
    ['Rammer og føringer', 'Nasjonale, regionale og kommunale føringer som gjelder.'],
    ['Alternativer', 'Hvilke alternativer som skal vurderes, inkludert nullalternativet.'],
    ['Utredningstema og metode', 'Hva som skal utredes, hvor grundig og hvordan.'],
    ['Medvirkning', 'Hvem som involveres, når og hvordan.'],
    ['Framdrift', 'Milepæler fram til vedtak.']],
  steg: ['Utarbeid forslag til planprogram sammen med kommunen.', 'Send forslaget på høring og legg det ut til offentlig ettersyn i minst seks uker.', 'Samle innspillene og kommenter dem.', 'Kommunen fastsetter planprogrammet.', 'Følg planprogrammet i planarbeidet, og begrunn eventuelle avvik.'],
  feil: ['For generelt til å styre utredningene.', 'Alternativer er utelatt.', 'Innspill fra høringen er ikke innarbeidet.', 'Utredningene starter før planprogrammet er fastsatt.'],
  l: [['KU-veileder (2020, PDF)', U.ku20]]
},
{
  id: 'planbeskrivelse', navn: 'Planbeskrivelse', hjemmel: ['pbl § 4-2'],
  hva: 'Planbeskrivelsen forklarer planen. Den beskriver formål, hovedinnhold og virkninger, og forholdet til overordnede planer og retningslinjer. Plankart og bestemmelser er juridisk bindende, mens planbeskrivelsen ikke er det. Den brukes likevel ved tolkning, og er grunnlaget for politisk behandling og høringsuttalelser.',
  nar: ['Alle forslag til planer etter loven.', 'Planer med krav til konsekvensutredning skal redegjøre for virkningene i utvidet form.', 'Beskrivelsen oppdateres ved hver revisjon av kart og bestemmelser.'],
  innhold: [
    ['Sammendrag', 'Kort om hva planen gjør og hvorfor.'],
    ['Bakgrunn og formål', 'Forslagsstiller, hensikt og hva som utløste planarbeidet.'],
    ['Planprosess og medvirkning', 'Varsling, møter, innspill og hvordan de er håndtert.'],
    ['Planstatus og rammer', 'Gjeldende planer og nasjonale, regionale og kommunale føringer.'],
    ['Beskrivelse av planområdet', 'Dagens bruk, landskap, grunnforhold, infrastruktur og naturverdier.'],
    ['Planforslaget', 'Arealformål, bebyggelse, uteareal, trafikk, teknisk infrastruktur og rekkefølge.'],
    ['Virkninger', 'Avvik fra overordnet plan, naturmangfold, ROS, barn og unge, universell utforming, klima og øvrige tema.'],
    ['Innspill og kommentarer', 'Alle innspill oppsummert med forslagsstillers eller kommunens vurdering.'],
    ['Avsluttende vurdering', 'Samlet begrunnelse for at planen bør vedtas.']],
  steg: ['Start planbeskrivelsen i oppstartsfasen og bygg den ut underveis.', 'Samkjør beskrivelse, plankart og bestemmelser løpende.', 'Beskriv virkningene tema for tema, med henvisning til utredningene.', 'Oppsummer og kommenter alle innspill fra varsling og høring.', 'Kontroller datoer og versjoner før innlevering.'],
  feil: ['Beskrivelsen sier noe annet enn bestemmelsene.', 'Virkninger er beskrevet generelt, uten henvisning til utredninger.', 'Innspill er oppsummert, men ikke kommentert.', 'Gammel versjon følger planforslaget.'],
  l: [['Eksempel: Jarlsø nord, Tønsberg', U.pb], ['Veileder: Reguleringsplan (2022)', U.rp22]]
},
{
  id: 'bestemmelser', navn: 'Reguleringsbestemmelser', hjemmel: ['pbl § 12-7'],
  hva: 'Reguleringsbestemmelsene er juridisk bindende regler som utfyller plankartet. De fastsetter hva som tillates innenfor hvert formål, hvordan bebyggelsen skal utformes og hva som må være på plass før tiltak kan realiseres. Gode bestemmelser er klare, målbare og knyttet til formål og felt i plankartet.',
  nar: ['Alle reguleringsplaner skal ha bestemmelser.', 'Hver bestemmelse må ha hjemmel i § 12-7. Loven gir ikke åpning for alle typer krav.', 'Bestemmelsene endres hver gang plankartet endres.'],
  innhold: [
    ['Generelt', 'Planens avgrensning, hvilke dokumenter som gjelder og koblingen til plankartet.'],
    ['Fellesbestemmelser', 'Regler for hele planen: utnytting, byggehøyde, parkering, støy, overvann, kulturminnefunn og uteoppholdsareal.'],
    ['Bebyggelse og anlegg', 'Regler per formål og felt, for eksempel antall boenheter, høyder og utforming.'],
    ['Samferdsel og teknisk infrastruktur', 'Veg, fortau, parkering og tekniske anlegg.'],
    ['Grønnstruktur og natur', 'Bevaring og tilrettelegging.'],
    ['Hensynssoner', 'Bestemmelser knyttet til flom, skred, støy og andre faresoner.'],
    ['Rekkefølgebestemmelser', 'Hva som må være ferdig før byggetillatelse eller brukstillatelse.']],
  steg: ['Bruk kommunens mal eller en standard disposisjon.', 'Knytt hver bestemmelse til formålsnavn eller felt i plankartet.', 'Bruk tall og tydelige vilkår, ikke skjønnsmessige uttrykk.', 'Legg tiltak fra ROS-analysen og utredningene inn som bestemmelser eller rekkefølgekrav.', 'Kontroller at bestemmelsene stemmer med plankart og planbeskrivelse.'],
  feil: ['Skjønnsmessige formuleringer som «god estetikk» uten kriterier.', 'Gjengir lovtekst som allerede gjelder.', 'Feltnavn stemmer ikke med plankartet.', 'Rekkefølgekrav uten tydelig utløsende tiltak.', 'Krav om godkjenning uten kriterier for hva som godkjennes.'],
  l: [['Eksempel: Sentervegen, Trondheim (2017)', U.best], ['Veileder: Reguleringsplan (2022)', U.rp22]]
},
{
  id: 'medvirkning', navn: 'Medvirkning og varsling', hjemmel: ['pbl § 5-1', 'pbl § 12-8', 'pbl § 12-10'],
  hva: 'Medvirkning betyr at berørte får informasjon og en reell mulighet til å påvirke planen tidlig. Kommunen har ansvar for at prosessen er åpen og tilgjengelig, og forslagsstiller utfører ofte selve varslingen. God medvirkning gir bedre planer og færre innsigelser sent i prosessen.',
  nar: ['Alle planer. Planbeskrivelsen skal vise hvordan medvirkning er gjennomført.', 'Varsel om oppstart av planarbeid, og offentlig ettersyn i minst seks uker.', 'Grupper som trenger særlig tilrettelegging, som barn og unge, skal sikres medvirkning.'],
  innhold: [
    ['Varsel om oppstart', 'Kunngjøres i avis og på nett, og sendes til berørte parter: grunneiere, naboer, gjenboere, offentlige myndigheter og interesseorganisasjoner. Oppgi kart, frist for innspill og kontaktinformasjon.'],
    ['Medvirkningsopplegg', 'Hvem som involveres og hvordan, tilpasset planens størrelse: åpne møter, workshop, digitale kartinnspill og møter med kommunale råd.'],
    ['Barn og unge', 'Kommunens barnerepresentant og berørte skoler eller ungdomsråd involveres tidlig.'],
    ['Offentlig ettersyn', 'Planforslaget legges ut i minst seks uker, og de som har gitt innspill får beskjed.'],
    ['Dokumentasjon', 'Innspill oppsummeres og kommenteres i planbeskrivelsen, med vurdering av hvordan de er tatt hensyn til.']],
  steg: ['Kartlegg berørte parter og kommunale råd i oppstartsmøtet.', 'Send varsel om oppstart med kart, tydelig frist og kontaktinformasjon.', 'Gjennomfør medvirkningsopplegget og noter innspillene.', 'Endre planforslaget der innspillene tilsier det.', 'Informer og svar etter offentlig ettersyn.'],
  feil: ['Parter er glemt, og det gir sene innsigelser.', 'Varselet mangler kart eller frist.', 'Innspill samles inn, men ingen får svar.', 'Barn og unge er ikke involvert.'],
  l: [['Veileder: barn og unge i plan', U.bu], ['Veileder for private reguleringsplaner', U.krist]]
}
];
