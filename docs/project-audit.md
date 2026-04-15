Project Audit — Rent a Car
Autor: Arianit Xhafa

1. Përshkrimi i Shkurtër i Projektit
Çka bën sistemi?
DriveX është një aplikacion web për menaxhimin e një flote makinash me qira. Sistemi lejon shfaqjen, shtimin, përditësimin dhe fshirjen e makinave, rezervimin dhe kthimin e tyre, kërkimin dhe filtrimin sipas kritereve të ndryshme, sortimin e listës dhe eksportimin e raporteve.
Kush janë përdoruesit kryesorë?
Punonjësit e një kompanie rent-a-car që menaxhojnë flotën ditore — regjistrojnë makina të reja, shënojnë rezervimet dhe kthimet, dhe gjenerojnë raporte.
Funksionaliteti kryesor:

CRUD i plotë për makinat (Create, Read, Update, Delete)
Rezervim dhe kthim i makinave
Kërkim sipas markës, modelit dhe çmimit
Sortim sipas çmimit, vitit dhe markës
Eksport i raportit financiar në TXT
Statistika të fleet-it në kohë reale


2. Çka Funksionon Mirë?
1. Arkitektura e shtresave është e qartë dhe e ndashme.
Projekti ndjek një strukturë 4-shtresore: UI → Service → Repository → Data. Çdo shtresë ka përgjegjësi të vetën dhe mund të ndryshohet pa prekur të tjerat. Për shembull, FileRepository mund të zëvendësohet me një DatabaseRepository pa ndryshuar CarService.
2. Repository Pattern është implementuar saktë.
IRepository definon kontratën dhe FileRepository e implementon atë. Kjo nënkupton që sistemi është i zgjerueshëm — mund të shtohet lehtë një MongoRepository ose SQLiteRepository në të ardhmen.
3. Error handling ekziston në të gjitha shtresat.
Çdo metode në FileRepository dhe CarService ka try-catch që kapin gabimet, shfaqin mesazhe të qarta dhe nuk lejojnë programin të crashojë. Kjo e bën sistemin të qëndrueshëm në prodhim.
4. Unit testet mbulojnë skenarët kryesorë.
Testet me Jest mbulojnë rastet normale dhe kufitare për searchCars, sortCars, getStatistics, rentCar dhe deleteCar. Kjo siguron që ndryshimet e ardhshme nuk prishin funksionalitetin ekzistues.
5. UI është e pastër dhe responsive.
Ndërfaqja ofron filtrim, kërkim live, sortim dhe eksport pa rimbushur faqen. Animacionet e buta dhe dark mode e bëjnë përdorimin të këndshëm.

3. Dobësitë e Projektit
Dobësia 1: CSV si "databazë" nuk është e sigurt për akses të njëkohshëm
Nëse dy përdorues bëjnë ndryshime njëkohësisht, skedari CSV mund të korruptohet sepse fs.writeFileSync nuk ka lock mekanizëm. Kjo është problem serioz në çdo mjedis me shumë përdorues.
Dobësia 2: ID-të menaxhohen manualisht nga useri
Useri duhet të fusë vetë ID-në e makinës. Nëse fut një ID që ekziston, sistemi hedh gabim. Nuk ka auto-increment ose UUID — kjo krijon mundësi për gabime njerëzore dhe konflikte.
Dobësia 3: Nuk ka autentifikim apo autorizim
Çdokush që ka qasje në URL mund të fshijë, shtojë ose ndryshojë makina. Nuk ka sistem login, role (admin/operator), apo mbrojtje të API endpoints. Kjo është rrezik serioz sigurie.
Dobësia 4: Validimi në server.js është i cekët
server.js kalon direkt parametrat nga req.body te service pa validuar nëse janë string, numër apo null. Nëse useri dërgon { year: "abc" }, kjo shkon deri te Repository pa u kapur.
Dobësia 5: Testet nuk janë të izoluara plotësisht
Testet shkruajnë dhe lexojnë nga skedarë CSV të vërtetë në disk. Kjo do të thotë që testet varen nga sistemi i skedarëve dhe mund të dështojnë nëse nuk ka leje shkrimi. Duhet të përdoren mock objekte.
Dobësia 6: Program.js ka akses direkt te service.repository
Në server.js për eksportin, kodi akseson service.repository.exportToFile() direkt — kjo thyen parimin e enkapsulimit dhe Dependency Inversion. Service duhet të eksponojë vetëm metodat e veta publike.
Dobësia 7: Nuk ka logging i strukturuar
Gabimet shfaqen vetëm me console.log() pa datë, nivel gabimi (ERROR/WARN/INFO) apo kontekst. Në prodhim kjo e bën debugging shumë të vështirë.

4. Tre Përmirësime që do t'i Implementoj
Përmirësimi 1: Auto-increment ID
Problemi:
Useri fut manualisht ID-në e çdo makine. Nëse fut një ID që ekziston tashmë, shfaqet gabim dhe operacioni dështon. Kjo krijon friction të panevojshme dhe gabime njerëzore.
Zgjidhja:
CarService do të gjenerojë automatikisht ID-në duke gjetur maksimalin e ID-ve ekzistuese dhe duke shtuar 1. Useri nuk do të fusë asnjëherë ID manualisht.
javascriptgenerateId() {
    var cars = this.repository.getAll();
    if (cars.length === 0) return '1';
    var maxId = Math.max.apply(null, cars.map(function(c) { 
        return parseInt(c.getId()) || 0; 
    }));
    return String(maxId + 1);
}
Pse ka rëndësi:
Eleminon një kategori të tërë gabimesh njerëzore. Useri fokusohet te të dhënat e makinës, jo te menaxhimi i ID-ve. Sistemi bëhet më i lehtë për t'u përdorur dhe më i qëndrueshëm.

Përmirësimi 2: Validim i centralizuar në Service
Problemi:
Aktualisht validimi është i shpërndarë — pak në UI (JavaScript), pak në Service, dhe asnjë në server.js. Nëse dikush dërgon kërkesë direkt te API me Postman ose curl, validimi i UI anashkalohet plotësisht.
Zgjidhja:
Krijohet një funksion validateCarInput() në CarService që kontrollon të gjitha fushat para çdo operacioni:
javascriptvalidateCarInput(brand, model, year, pricePerDay) {
    if (!brand || brand.trim() === '') 
        return { valid: false, message: 'Marka nuk mund të jetë bosh!' };
    if (!model || model.trim() === '') 
        return { valid: false, message: 'Modeli nuk mund të jetë bosh!' };
    if (isNaN(year) || year < 1900 || year > 2100) 
        return { valid: false, message: 'Viti duhet të jetë ndërmjet 1900 dhe 2100!' };
    if (isNaN(pricePerDay) || pricePerDay <= 0) 
        return { valid: false, message: 'Çmimi duhet të jetë numër pozitiv!' };
    return { valid: true };
}
Pse ka rëndësi:
Validimi i centralizuar në Service garanton që të dhënat e pasakta nuk arrijnë kurrë në Repository, pavarësisht nga ku vjen kërkesa — UI, API, apo teste. Ky është parim themelor i "defense in depth".

Përmirësimi 3: Shtimi i fushës createdAt në modelin Car
Problemi:
Modeli Car nuk ruan datën kur u shtua makina. Kjo do të thotë nuk mund të sortosh sipas datës së shtimit, nuk mund të shohësh historikun, dhe raportet nuk kanë kontekst kohor.
Zgjidhja:
Shtohet fusha createdAt që ruhet automatikisht:
javascriptconstructor(id, brand, model, year, pricePerDay, available, createdAt) {
    this._createdAt = createdAt || new Date().toISOString().split('T')[0];
}
getCreatedAt() { return this._createdAt; }
CSV-ja do të ketë kolonë shtesë dhe raporti do të tregojë datën e shtimit për çdo makinë.
Pse ka rëndësi:
Data e shtimit është e domosdoshme për çdo sistem biznesi real. Lejon gjurmimin e historikut të fleet-it, raporte sipas periudhës, dhe auditim bazik. Pa këtë informacion, sistemi nuk mund të përdoret seriozisht në biznes.

5. Një Pjesë që Ende Nuk e Kuptoj Plotësisht
Menaxhimi i konkurrencës (Concurrency) me skedarë
E kuptoj se skedari CSV lexohet me fs.readFileSync dhe shkruhet me fs.writeFileSync, dhe e kuptoj që kjo funksionon mirë kur ka vetëm një përdorues. Por nuk e kuptoj plotësisht çfarë ndodh kur dy kërkesa HTTP arrijnë njëkohësisht — për shembull, dy përdorues fshijnë makina të ndryshme në të njëjtën sekondë.
Node.js është single-threaded, kështu që operacionet ekzekutohen njëra pas tjetrës. Por me operacionet asinkrone (fs.readFile pa Sync), ekzistojnë "race conditions" ku dy procese mund të lexojnë gjendjen e vjetër, bëjnë ndryshimet e tyre, dhe shkruajnë mbi njëri-tjetrin.
Do të doja të kuptoja më mirë: kur saktësisht ndodhin race conditions në Node.js, si funksionojnë "file locks", dhe pse databazat si SQLite e zgjidhin këtë problem natyrshëm. Kjo do të më ndihmonte të kuptoja pse skedarët CSV janë të mirë për projekte mësimore por jo për prodhim.