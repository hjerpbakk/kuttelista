// Samme liste som casesiden i Produktforum 6. Endres her, så følger storskjerm og mobil med.
window.FEATURES = [
 {id:"kart",grp:"Finne",name:"Kart med alle prøvene",desc:"Prøvepunkter i kartet, farget etter berggrunn, løsmasse, vann, andre og ukjent.",hand:"Et statisk kart som pdf, laget én gang fra databasen."},
 {id:"liste",grp:"Finne",name:"Listevisning",desc:"Prøvekort med NGU-ID, beskrivelse, analyser, prosjekt og koordinater.",hand:"Et regneark med én rad per prøve."},
 {id:"sok",grp:"Finne",name:"Fritekstsøk",desc:"Søk etter prøvenummer, bergart eller sted.",hand:"Ctrl+F i regnearket."},
 {id:"f-prove",grp:"Filtrere",name:"Filter på prøvemedium",desc:"Bare berggrunn, bare løsmasse, bare vann.",hand:"Filter i regnearket."},
 {id:"f-analyse",grp:"Filtrere",name:"Filter på analysetype",desc:"XRF, ICP-MS, LA-ICP-MS-REE, petrofysikk og resten.",hand:"Filter i regnearket."},
 {id:"f-verdi",grp:"Filtrere",name:"Filter på analyseverdi",desc:"For eksempel alle prøver med over 500 ppm kobber.",hand:"Laben kjører spørringen når noen spør."},
 {id:"f-prosjekt",grp:"Filtrere",name:"Filter på prosjekt",desc:"Alle prøver fra MINN Vesterålen eller BaMM.",hand:"Filter i regnearket."},
 {id:"f-lokasjon",grp:"Filtrere",name:"Filter på område i kartet",desc:"Tegn et område og få prøvene innenfor.",hand:"En GIS-kollega tar ut prøvene for et område på forespørsel."},
 {id:"detalj",grp:"Se på én prøve",name:"Prøveside",desc:"NGU-ID, prøvemedium, beskrivelse, lokasjon og andre referanser.",hand:"Raden i regnearket."},
 {id:"slip",grp:"Se på én prøve",name:"Bilder av slip",desc:"Tynnslipbilder koblet til prøven.",hand:"Mappe på fellesområdet med prøvenummer i filnavnet."},
 {id:"eksport",grp:"Ta med seg data",name:"Eksport i flere filformater",desc:"Last ned utvalget som CSV, Excel eller GIS-format.",hand:"Teamet sender CSV på e-post."},
 {id:"bestillinger",grp:"Samlinger",name:"Bestillinger fra NGU Laboratorier",desc:"Analysekontrakter med prøvelister og analyserapporter.",hand:"Laben legger rapportene i en delt mappe."},
 {id:"prosjekter",grp:"Samlinger",name:"Prøver samlet per prosjekt",desc:"En egen side per NGU-prosjekt.",hand:"Filter på prosjekt i regnearket."},
 {id:"geokjemi",grp:"Data inn",name:"Gamle data fra Geokjemidatabasen",desc:"Analysedata fra den tidligere geokjemiseksjonen.",hand:"Lenke til den gamle databasen så lenge den lever."},
 {id:"historisk",grp:"Data inn",name:"Historiske prøver uten metadata",desc:"Prøver med ukjent medium, uten prosjekt eller uten koordinater.",hand:"Ligger igjen der de er, til noen spør etter dem."},
 {id:"login",grp:"Drift",name:"Innlogging med NGU-konto",desc:"Tilgangsstyring for interne data.",hand:"Løsningen ligger på intranettet."},
 {id:"kartlag",grp:"Pynt og komfort",name:"Valg av kartlag",desc:"Bytt mellom standardkart, flyfoto og geologi.",hand:"Standardkartet holder."},
 {id:"tema",grp:"Pynt og komfort",name:"Mørkt fargetema",desc:"Lyst og mørkt tema.",hand:"Lyst tema holder."},
 {id:"feedback",grp:"Pynt og komfort",name:"Knapp for tilbakemelding",desc:"Brukerne sier fra rett i løsningen.",hand:"En e-postadresse på forsiden."},
 {id:"info",grp:"Pynt og komfort",name:"Infosider om datasett og eksport",desc:"Forklaring av datafelter og filformater.",hand:"Teamet svarer på spørsmål når de kommer."}
];
window.LABEL = {need:"Trengs",hand:"For hånd",wait:"Kan vente"};
